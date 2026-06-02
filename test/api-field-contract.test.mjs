import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const rg = (pattern, paths) => {
  const result = spawnSync("rg", ["-n", pattern, ...paths], {
    cwd: process.cwd(),
    encoding: "utf8",
  });

  if (result.status === 1) {
    return "";
  }

  if (result.status !== 0) {
    throw new Error(result.stderr || `rg failed with status ${result.status}`);
  }

  return result.stdout.trim();
};

const collectSourceFiles = (dir) => {
  const entries = readdirSync(dir);
  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      return collectSourceFiles(fullPath);
    }
    return /\.(jsx?|tsx?)$/.test(entry) ? [fullPath] : [];
  });
};

test("api routes do not create ad-hoc json responses", () => {
  const matches = rg("NextResponse\\.json|Response\\.json", ["app/API"]);

  assert.equal(matches, "");
});

test("frontend no longer reads legacy api response fields", () => {
  const matches = rg(
    "(^|[^.])\\b(data|result|followData|userData)\\.(error|pagination|url|user|isFollowing|isFavorited)\\b",
    ["app/views", "app/page.tsx"],
  );

  assert.equal(matches, "");
});

test("api error responses do not expose raw exception messages", () => {
  const matches = rg("ApiResponse\\.error\\([^\\n]*error\\.message", ["app/API"]);

  assert.equal(matches, "");
});

test("hardened api routes use shared validation helpers", () => {
  const routes = [
    "app/API/auth/Login/route.js",
    "app/API/auth/Register/route.js",
    "app/API/auth/UpdateProfile/route.js",
    "app/API/Post/route.js",
    "app/API/Follow/route.js",
    "app/API/MyFavorites/route.js",
    "app/API/PostDetail/[id]/route.js",
    "app/API/TasteCard/[id]/route.js",
    "app/API/UserInfo/route.js",
    "app/API/Upload/route.js",
    "app/API/Dify/Chat/route.js",
  ];

  const missingImports = routes.filter((route) => !rg("api-validation\\.mjs", [route]));

  assert.deepEqual(missingImports, []);
});

test("hardened json routes parse request bodies through readJsonBody", () => {
  const matches = rg(
    "request\\.json\\(",
    [
      "app/API/auth/Login/route.js",
      "app/API/auth/Register/route.js",
      "app/API/auth/UpdateProfile/route.js",
      "app/API/Post/route.js",
      "app/API/PostDetail/[id]/route.js",
      "app/API/Follow/route.js",
      "app/API/MyFavorites/route.js",
      "app/API/Dify/Chat/route.js",
    ],
  );

  assert.equal(matches, "");
});

test("paginated api routes reject legacy parseInt page fallbacks", () => {
  const matches = rg(
    "parseInt\\(searchParams\\.get\\(\"page\"\\)\\) \\|\\| 1",
    [
      "app/API/MyComments/route.js",
      "app/API/MyPost/route.js",
      "app/API/MyFavorites/route.js",
    ],
  );

  assert.equal(matches, "");
});

test("dynamic id api routes reject legacy parseInt id parsing", () => {
  const matches = rg(
    "parseInt\\(",
    [
      "app/API/PostDetail/[id]/route.js",
      "app/API/UserInfo/route.js",
      "app/API/TasteCard/[id]/route.js",
    ],
  );

  assert.equal(matches, "");
});

test("authenticated api routes use the shared auth helper", () => {
  const authenticatedRoutes = [
    "app/API/auth/Login/route.js",
    "app/API/auth/UpdateProfile/route.js",
    "app/API/Follow/route.js",
    "app/API/MyFavorites/route.js",
    "app/API/MyComments/route.js",
    "app/API/MyPost/route.js",
    "app/API/Post/route.js",
    "app/API/PostDetail/[id]/route.js",
    "app/API/Upload/route.js",
    "app/API/Dify/Chat/route.js",
  ];

  const matches = rg(
    "cookies\\.get\\(['\"]auth_token['\"]\\)|verifyToken\\(",
    authenticatedRoutes,
  );
  const missingAuth = authenticatedRoutes.filter((route) => !rg("requireAuth\\(", [route]));

  assert.equal(matches, "");
  assert.deepEqual(missingAuth, []);
});

test("admin api routes use the shared super admin guard", () => {
  const adminRoutes = [
    "app/API/Admin/Users/route.js",
    "app/API/Admin/Posts/route.js",
    "app/API/Admin/Posts/[id]/route.js",
    "app/API/Admin/Comments/route.js",
    "app/API/Admin/Comments/[id]/route.js",
  ];

  const missingGuard = adminRoutes.filter((route) => !rg("requireSuperAdmin\\(", [route]));

  assert.deepEqual(missingGuard, []);
});

test("state-changing api routes enforce csrf before mutating", () => {
  const unsafeRoutes = [
    "app/API/auth/Login/route.js",
    "app/API/auth/Logout/route.js",
    "app/API/auth/Register/route.js",
    "app/API/auth/UpdateProfile/route.js",
    "app/API/Follow/route.js",
    "app/API/MyFavorites/route.js",
    "app/API/Post/route.js",
    "app/API/PostDetail/[id]/route.js",
    "app/API/Upload/route.js",
    "app/API/Admin/Posts/[id]/route.js",
    "app/API/Admin/Comments/[id]/route.js",
    "app/API/Dify/Chat/route.js",
  ];

  const missingCsrf = unsafeRoutes.filter((route) => !rg("requireCsrf\\(", [route]));

  assert.deepEqual(missingCsrf, []);
});

test("frontend internal unsafe requests go through csrfFetch", () => {
  const sourceFiles = [
    ...collectSourceFiles("app/views"),
    "app/page.tsx",
  ];
  const bareInternalUnsafeFetches = [];

  for (const file of sourceFiles) {
    const source = readFileSync(file, "utf8");
    const fetchCalls = source.matchAll(/\bfetch\s*\(([\s\S]{0,800}?)\)/g);
    for (const match of fetchCalls) {
      const call = match[0];
      if (
        /method\s*:\s*['"](?:POST|DELETE|PUT|PATCH)['"]/.test(call)
        && /(?:['"`])\/API\//.test(call)
      ) {
        bareInternalUnsafeFetches.push(`${file}:${source.slice(0, match.index).split("\n").length}`);
      }
    }
  }

  assert.deepEqual(bareInternalUnsafeFetches, []);
});

test("Dify proxy keeps secrets server-side", () => {
  assert.equal(
    rg("NEXT_PUBLIC_DIFY_API_KEY|NEXT_PUBLIC_DIFY_API_URL|/chat-messages", ["app/views", "app/page.tsx"]),
    "",
  );

  assert.match(
    rg("DIFY_API_KEY_FILE", ["deploy/docker-compose.yml"]),
    /\d+:      DIFY_API_KEY_FILE: \/run\/secrets\/dify_api_key/,
  );
  assert.match(
    rg("dify_api_key", ["deploy/docker-compose.yml"]),
    /\d+:  dify_api_key:/,
  );
  assert.match(
    rg("read_secret_file DIFY_API_KEY", ["deploy/app-entrypoint.sh"]),
    /\d+:read_secret_file DIFY_API_KEY/,
  );
});

test("relationship toggle tables declare compound uniqueness", () => {
  const schema = readFileSync("database/schema.js", "utf8");

  assert.match(
    schema,
    /uniqueIndex\(["']favorites_user_post_unique["']\)\.on\(table\.userId,\s*table\.postId\)/,
  );
  assert.match(
    schema,
    /uniqueIndex\(["']follows_follower_following_unique["']\)\.on\(table\.followerId,\s*table\.followingId\)/,
  );
});

test("drizzle config points at the runtime schema", () => {
  const config = readFileSync("drizzle.config.js", "utf8");

  assert.match(config, /schema:\s*["']\.\/database\/schema\.js["']/);
});
