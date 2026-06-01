import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { mock, test } from "node:test";

import { ErrorCode } from "../lib/api-response.mjs";
import { CONTENT_STATUS } from "../lib/content-status.mjs";

const dbState = {
  selectQueue: [],
  insertValues: [],
  updateSets: [],
  updateTables: [],
};

const tableName = (table) => table?.[Symbol.for("drizzle:Name")] ?? "unknown";

const createSelectQuery = () => ({
  from(table) {
    this.table = tableName(table);
    return this;
  },
  innerJoin() {
    return this;
  },
  leftJoin() {
    return this;
  },
  where() {
    return this;
  },
  orderBy() {
    return this;
  },
  limit() {
    return this;
  },
  offset() {
    return this;
  },
  then(resolve, reject) {
    return Promise.resolve(dbState.selectQueue.shift() ?? []).then(resolve, reject);
  },
});

const db = {
  select() {
    return createSelectQuery();
  },
  insert(table) {
    return {
      values(values) {
        dbState.insertValues.push({ table: tableName(table), values });
        return Promise.resolve();
      },
    };
  },
  update(table) {
    dbState.updateTables.push(tableName(table));
    return {
      set(values) {
        dbState.updateSets.push(values);
        return {
          where() {
            return Promise.resolve();
          },
        };
      },
    };
  },
};

let authPayload = { userId: 7, userRole: "super_admin" };
const CSRF_TEST_SECRET = "csrf-test-secret";

const csrfToken = () => {
  const timestamp = String(Date.now());
  const nonce = "test-nonce";
  const signature = createHmac("sha256", Buffer.from(CSRF_TEST_SECRET))
    .update(`${timestamp}.${nonce}`)
    .digest("base64url");
  return `${timestamp}.${nonce}.${signature}`;
};

await mock.module("../database/index.js", {
  namedExports: { db },
});

await mock.module("../lib/jwt.js", {
  namedExports: {
    getJwtSecretKey: () => new TextEncoder().encode(CSRF_TEST_SECRET),
    signToken: async () => "mock-token",
    verifyToken: async (token) => (token === "valid-token" ? authPayload : null),
  },
});

const { requireSuperAdmin } = await import("../lib/admin-auth.mjs");
const { seedSuperAdmin } = await import("../lib/admin-seed.mjs");
const AdminUsersRoute = await import("../app/API/Admin/Users/route.js");
const AdminPostsRoute = await import("../app/API/Admin/Posts/route.js");
const AdminPostDeleteRoute = await import("../app/API/Admin/Posts/[id]/route.js");
const AdminCommentsRoute = await import("../app/API/Admin/Comments/route.js");
const AdminCommentDeleteRoute = await import("../app/API/Admin/Comments/[id]/route.js");

const resetState = () => {
  dbState.selectQueue = [];
  dbState.insertValues = [];
  dbState.updateSets = [];
  dbState.updateTables = [];
  authPayload = { userId: 7, userRole: "super_admin" };
};

const cookies = (token = "valid-token", csrf = csrfToken()) => ({
  get(name) {
    if (name === "auth_token" && token) {
      return { value: token };
    }
    if (name === "csrf_token" && csrf) {
      return { value: csrf };
    }
    return undefined;
  },
});

const headers = (csrf) => ({
  get(name) {
    if (name.toLowerCase() === "x-csrf-token") {
      return csrf;
    }
    return null;
  },
});

const request = (url, token = "valid-token", csrf = csrfToken()) => ({
  url,
  cookies: cookies(token, csrf),
  headers: headers(csrf),
});

const params = (id) => ({ params: Promise.resolve({ id }) });

const readBody = async (response) => ({
  status: response.status,
  body: await response.json(),
});

test("requireSuperAdmin rejects missing auth, ordinary users, and disabled users", async () => {
  resetState();
  let result = await requireSuperAdmin(request("http://localhost/API/Admin/Users", null));
  assert.equal(result.ok, false);
  assert.equal(result.response.status, 401);

  dbState.selectQueue = [[{ userId: 7, userRole: "user", userStatus: "active" }]];
  result = await requireSuperAdmin(request("http://localhost/API/Admin/Users"));
  assert.equal(result.ok, false);
  assert.equal(result.response.status, 403);
  assert.equal((await result.response.json()).code, ErrorCode.FORBIDDEN);

  dbState.selectQueue = [[{ userId: 7, userRole: "super_admin", userStatus: "disabled" }]];
  result = await requireSuperAdmin(request("http://localhost/API/Admin/Users"));
  assert.equal(result.ok, false);
  assert.equal(result.response.status, 403);
});

test("requireSuperAdmin trusts database role instead of JWT role claims", async () => {
  resetState();
  authPayload = { userId: 7, userRole: "super_admin" };
  dbState.selectQueue = [[{ userId: 7, userRole: "user", userStatus: "active" }]];

  const result = await requireSuperAdmin(request("http://localhost/API/Admin/Users"));

  assert.equal(result.ok, false);
  assert.equal(result.response.status, 403);
});

test("seedSuperAdmin creates a BCrypt super admin and blocks implicit privilege escalation", async () => {
  resetState();
  dbState.selectQueue = [[]];

  const created = await seedSuperAdmin({
    env: {
      ADMIN_EMAIL: "admin@example.com",
      ADMIN_PASSWORD: "strong-password",
      ADMIN_NICKNAME: "系统管理员",
    },
  });

  assert.deepEqual(created, { action: "created", email: "admin@example.com" });
  assert.equal(dbState.insertValues[0].table, "users");
  assert.equal(dbState.insertValues[0].values.userRole, "super_admin");
  assert.equal(dbState.insertValues[0].values.userStatus, "active");
  assert.match(dbState.insertValues[0].values.password, /^\$2[aby]\$10\$/);

  resetState();
  dbState.selectQueue = [[{ userId: 1, userRole: "user" }]];
  await assert.rejects(
    seedSuperAdmin({
      env: {
        ADMIN_EMAIL: "admin@example.com",
        ADMIN_PASSWORD: "strong-password",
        ADMIN_NICKNAME: "系统管理员",
      },
    }),
    /ADMIN_UPSERT=true/,
  );
  assert.equal(dbState.updateSets.length, 0);
});

test("admin list routes require super admin and return paginated envelopes", async () => {
  resetState();
  dbState.selectQueue = [
    [{ userId: 7, userRole: "super_admin", userStatus: "active" }],
    [{ count: 1 }],
    [{ userId: 1, nickname: "食客", email: "u@example.com", userRole: "user", userStatus: "active" }],
  ];

  const users = await readBody(await AdminUsersRoute.GET(request("http://localhost/API/Admin/Users?page=1&pageSize=10")));

  assert.equal(users.status, 200);
  assert.equal(users.body.success, true);
  assert.equal(users.body.code, ErrorCode.SUCCESS);
  assert.equal(users.body.meta.pagination.totalCount, 1);

  resetState();
  dbState.selectQueue = [[{ userId: 7, userRole: "user", userStatus: "active" }]];
  const denied = await readBody(await AdminPostsRoute.GET(request("http://localhost/API/Admin/Posts")));
  assert.equal(denied.status, 403);
  assert.equal(denied.body.code, ErrorCode.FORBIDDEN);
});

test("admin content routes validate status filters and set admin delete status to 2", async () => {
  resetState();
  dbState.selectQueue = [[{ userId: 7, userRole: "super_admin", userStatus: "active" }]];
  const invalid = await readBody(await AdminCommentsRoute.GET(request("http://localhost/API/Admin/Comments?status=bad")));
  assert.equal(invalid.status, 400);
  assert.equal(invalid.body.code, ErrorCode.VALIDATION_ERROR);

  resetState();
  dbState.selectQueue = [
    [{ userId: 7, userRole: "super_admin", userStatus: "active" }],
    [{ id: 3, status: CONTENT_STATUS.ACTIVE }],
  ];
  const deletedPost = await readBody(await AdminPostDeleteRoute.DELETE(
    request("http://localhost/API/Admin/Posts/3"),
    params("3"),
  ));
  assert.equal(deletedPost.status, 200);
  assert.equal(dbState.updateTables[0], "posts");
  assert.deepEqual(dbState.updateSets[0], { status: CONTENT_STATUS.ADMIN_DELETED });

  resetState();
  dbState.selectQueue = [
    [{ userId: 7, userRole: "super_admin", userStatus: "active" }],
    [{ id: 4, status: CONTENT_STATUS.ACTIVE }],
  ];
  const deletedComment = await readBody(await AdminCommentDeleteRoute.DELETE(
    request("http://localhost/API/Admin/Comments/4"),
    params("4"),
  ));
  assert.equal(deletedComment.status, 200);
  assert.equal(dbState.updateTables[0], "comments");
  assert.deepEqual(dbState.updateSets[0], { status: CONTENT_STATUS.ADMIN_DELETED });
});

test("admin delete upgrades user-deleted content to admin-deleted and remains idempotent", async () => {
  resetState();
  dbState.selectQueue = [
    [{ userId: 7, userRole: "super_admin", userStatus: "active" }],
    [{ id: 3, status: CONTENT_STATUS.USER_DELETED }],
  ];
  const deletedPost = await readBody(await AdminPostDeleteRoute.DELETE(
    request("http://localhost/API/Admin/Posts/3"),
    params("3"),
  ));
  assert.equal(deletedPost.status, 200);
  assert.deepEqual(dbState.updateSets[0], { status: CONTENT_STATUS.ADMIN_DELETED });

  resetState();
  dbState.selectQueue = [
    [{ userId: 7, userRole: "super_admin", userStatus: "active" }],
    [{ id: 4, status: CONTENT_STATUS.ADMIN_DELETED }],
  ];
  const repeatedDelete = await readBody(await AdminCommentDeleteRoute.DELETE(
    request("http://localhost/API/Admin/Comments/4"),
    params("4"),
  ));
  assert.equal(repeatedDelete.status, 200);
  assert.equal(dbState.updateSets.length, 0);
});
