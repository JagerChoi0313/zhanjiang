import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
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
    "app/API/Upload/route.js",
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
      "app/API/Follow/route.js",
      "app/API/MyFavorites/route.js",
    ],
  );

  assert.equal(matches, "");
});
