import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { mock, test } from "node:test";

import sharp from "sharp";

import { ErrorCode } from "../lib/api-response.mjs";
import { MAX_UPLOAD_BYTES } from "../lib/api-validation.mjs";
import { hashPassword, verifyPassword } from "../lib/password.mjs";

const dbState = {
  selectRows: [],
  selectQueue: [],
  queryPost: { id: 1 },
  selectCalls: 0,
  queryPostFinds: 0,
  insertTables: [],
  insertValues: [],
  insertError: null,
  upsertSets: [],
  updateTables: [],
  updateSets: [],
  deleteCalls: [],
  uploadWrites: [],
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
  where() {
    return this;
  },
  limit() {
    return Promise.resolve(dbState.selectQueue.length > 0 ? dbState.selectQueue.shift() : dbState.selectRows);
  },
  then(resolve, reject) {
    return Promise.resolve(dbState.selectQueue.length > 0 ? dbState.selectQueue.shift() : dbState.selectRows).then(resolve, reject);
  },
});

const db = {
  transaction(callback) {
    return callback(db);
  },
  select() {
    dbState.selectCalls += 1;
    return createSelectQuery();
  },
  insert(table) {
    return {
      values(values) {
        dbState.insertTables.push(tableName(table));
        dbState.insertValues.push(values);
        if (dbState.insertError) {
          return Promise.reject(dbState.insertError);
        }
        const promise = Promise.resolve({ insertId: dbState.insertValues.length });
        return {
          onDuplicateKeyUpdate(config) {
            dbState.upsertSets.push(config.set);
            return this;
          },
          $returningId() {
            return Promise.resolve([{ id: dbState.insertValues.length }]);
          },
          then(resolve, reject) {
            return promise.then(resolve, reject);
          },
        };
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
  delete(table) {
    return {
      where(condition) {
        dbState.deleteCalls.push({ table: tableName(table), condition });
        return Promise.resolve();
      },
    };
  },
  query: {
    posts: {
      findFirst() {
        dbState.queryPostFinds += 1;
        return Promise.resolve(dbState.queryPost);
      },
    },
  },
};

let authPayload = { userId: 7 };
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

await mock.module("fs/promises", {
  namedExports: {
    mkdir: async () => {},
    writeFile: async (path, buffer, options) => {
      if (options?.flag === "wx" && dbState.uploadWrites.some((write) => write.path === path)) {
        const error = new Error("File exists");
        error.code = "EEXIST";
        throw error;
      }
      dbState.uploadWrites.push({ path, buffer });
    },
    unlink: async (path) => {
      dbState.deleteCalls.push({ table: "fs", path });
    },
  },
});

await mock.module("../lib/jwt.js", {
  namedExports: {
    getJwtSecretKey: () => new TextEncoder().encode(CSRF_TEST_SECRET),
    signToken: async () => "mock-token",
    verifyToken: async (token) => (token === "valid-token" ? authPayload : null),
  },
});

const LoginRoute = await import("../app/API/auth/Login/route.js");
const LogoutRoute = await import("../app/API/auth/Logout/route.js");
const RegisterRoute = await import("../app/API/auth/Register/route.js");
const UpdateProfileRoute = await import("../app/API/auth/UpdateProfile/route.js");
const FollowRoute = await import("../app/API/Follow/route.js");
const HealthRoute = await import("../app/API/Health/route.js");
const DifyChatRoute = await import("../app/API/Dify/Chat/route.js");
const MyFavoritesRoute = await import("../app/API/MyFavorites/route.js");
const MyCommentsRoute = await import("../app/API/MyComments/route.js");
const MyPostRoute = await import("../app/API/MyPost/route.js");
const PostRoute = await import("../app/API/Post/route.js");
const PostDetailRoute = await import("../app/API/PostDetail/[id]/route.js");
const TasteCardDetailRoute = await import("../app/API/TasteCard/[id]/route.js");
const UploadRoute = await import("../app/API/Upload/route.js");
const UserInfoRoute = await import("../app/API/UserInfo/route.js");

const resetState = () => {
  dbState.selectRows = [];
  dbState.selectQueue = [];
  dbState.queryPost = { id: 1 };
  dbState.selectCalls = 0;
  dbState.queryPostFinds = 0;
  dbState.insertTables = [];
  dbState.insertValues = [];
  dbState.insertError = null;
  dbState.upsertSets = [];
  dbState.updateTables = [];
  dbState.updateSets = [];
  dbState.deleteCalls = [];
  dbState.uploadWrites = [];
  authPayload = { userId: 7 };
  delete process.env.DIFY_API_KEY;
  delete process.env.DIFY_API_URL;
  DifyChatRoute.__resetDifyChatRateLimit?.();
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

const jsonRequest = (body, options = {}) => {
  const csrf = Object.hasOwn(options, "csrfToken") ? options.csrfToken : csrfToken();
  return {
    url: options.url ?? "http://localhost/API/test",
    cookies: cookies(options.token, csrf),
    headers: headers(csrf),
    async json() {
      return body;
    },
  };
};

const formRequest = (file, options = {}) => {
  const csrf = Object.hasOwn(options, "csrfToken") ? options.csrfToken : csrfToken();
  return {
    cookies: cookies(options.token, csrf),
    headers: headers(csrf),
    async formData() {
      const formData = new FormData();
      if (file !== undefined) {
        formData.set("file", file);
      }
      if (options.purpose !== undefined) {
        formData.set("purpose", options.purpose);
      }
      return formData;
    },
  };
};

const imageFile = async ({
  name = "food.png",
  type = "image/png",
  format = "png",
  width = 32,
  height = 24,
} = {}) => {
  const buffer = await sharp({
    create: {
      width,
      height,
      channels: 3,
      background: "#b84a2f",
    },
  }).toFormat(format).toBuffer();

  return new File([buffer], name, { type });
};

const readBody = async (response) => ({
  status: response.status,
  body: await response.json(),
});

const assertApiError = async (response, { status, code, message }) => {
  const result = await readBody(response);

  assert.equal(result.status, status);
  assert.equal(result.body.success, false);
  assert.equal(result.body.code, code);
  assert.equal(result.body.message, message);
  assert.equal("error" in result.body, false);
};

const setCookieHeader = (response) => response.headers.get("set-cookie") ?? "";

test("Health returns a non-cacheable standard success envelope", async () => {
  const response = await HealthRoute.GET();
  const result = await readBody(response);

  assert.equal(result.status, 200);
  assert.equal(result.body.success, true);
  assert.equal(result.body.code, ErrorCode.SUCCESS);
  assert.equal(result.body.message, "服务正常");
  assert.deepEqual(result.body.data, {
    status: "ok",
    service: "zhanjiang",
  });
  assert.equal(response.headers.get("cache-control"), "no-store");
});

test("state-changing routes reject missing csrf before reading request bodies", async () => {
  resetState();

  await assertApiError(
    await LoginRoute.POST({
      ...jsonRequest({}, { csrfToken: null }),
      async json() {
        throw new Error("json should not be read before csrf validation");
      },
    }),
    {
      status: 403,
      code: ErrorCode.FORBIDDEN,
      message: "CSRF校验失败，请刷新页面后重试",
    },
  );

  await assertApiError(
    await UploadRoute.POST({
      ...formRequest(undefined, { csrfToken: null }),
      async formData() {
        throw new Error("formData should not be read before csrf validation");
      },
    }),
    {
      status: 403,
      code: ErrorCode.FORBIDDEN,
      message: "CSRF校验失败，请刷新页面后重试",
    },
  );

  await assertApiError(
    await DifyChatRoute.POST({
      ...jsonRequest({}, { csrfToken: null }),
      async json() {
        throw new Error("json should not be read before csrf validation");
      },
    }),
    {
      status: 403,
      code: ErrorCode.FORBIDDEN,
      message: "CSRF校验失败，请刷新页面后重试",
    },
  );

  assert.equal(dbState.uploadWrites.length, 0);
});

test("Dify Chat requires auth validates query and handles missing configuration", async () => {
  resetState();
  process.env.DIFY_API_KEY = "";
  const fetchMock = mock.method(globalThis, "fetch", async () => {
    throw new Error("Dify should not be called without configuration");
  });

  await assertApiError(
    await DifyChatRoute.POST(jsonRequest({ query: "赤坎老街有什么好吃的？" }, { token: null })),
    {
      status: 401,
      code: ErrorCode.UNAUTHORIZED,
      message: "未登录，请先登录",
    },
  );

  await assertApiError(
    await DifyChatRoute.POST(jsonRequest({ query: "   " })),
    {
      status: 400,
      code: ErrorCode.VALIDATION_ERROR,
      message: "问题不能为空",
    },
  );

  await assertApiError(
    await DifyChatRoute.POST(jsonRequest({ query: "湛".repeat(501) })),
    {
      status: 400,
      code: ErrorCode.VALIDATION_ERROR,
      message: "问题长度不能超过500个字符",
    },
  );

  await assertApiError(
    await DifyChatRoute.POST(jsonRequest({ query: "湛江生蚝哪里好吃？" })),
    {
      status: 502,
      code: ErrorCode.EXTERNAL_SERVICE_ERROR,
      message: "AI服务未配置",
    },
  );

  assert.equal(fetchMock.mock.callCount(), 0);
  fetchMock.mock.restore();
});

test("Dify Chat proxies successful responses without exposing the API key", async () => {
  resetState();
  process.env.DIFY_API_KEY = "dify-secret";
  process.env.DIFY_API_URL = "https://dify.example/v1";
  let outboundBody;

  const fetchMock = mock.method(globalThis, "fetch", async (url, options) => {
    outboundBody = JSON.parse(options.body);

    assert.equal(url, "https://dify.example/v1/chat-messages");
    assert.equal(options.method, "POST");
    assert.equal(options.headers.Authorization, "Bearer dify-secret");
    assert.equal(options.headers["Content-Type"], "application/json");
    assert.equal(outboundBody.query, "赤坎老街有什么好吃的？");
    assert.equal(outboundBody.response_mode, "blocking");
    assert.equal(outboundBody.user, "zhanjiang_user_7");
    assert.deepEqual(outboundBody.inputs, {});

    return new Response(JSON.stringify({
      answer: "可以试试赤坎老街的本地小吃。",
      metadata: {
        suggested_questions: ["附近还有什么甜品？"],
      },
    }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  });

  const response = await DifyChatRoute.POST(jsonRequest({ query: "赤坎老街有什么好吃的？" }));
  const result = await readBody(response);

  assert.equal(result.status, 200);
  assert.equal(result.body.success, true);
  assert.equal(result.body.code, ErrorCode.SUCCESS);
  assert.deepEqual(result.body.data, {
    answer: "可以试试赤坎老街的本地小吃。",
    suggestedQuestions: ["附近还有什么甜品？"],
  });
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(JSON.stringify(result.body).includes("dify-secret"), false);
  assert.equal(JSON.stringify(outboundBody).includes("食客"), false);
  assert.equal(fetchMock.mock.callCount(), 1);
  fetchMock.mock.restore();
});

test("Dify Chat hides upstream failures and rate limits per user", async () => {
  resetState();
  process.env.DIFY_API_KEY = "dify-secret";
  const fetchMock = mock.method(globalThis, "fetch", async () => new Response(JSON.stringify({
    message: "upstream secret details",
  }), {
    status: 500,
    headers: { "content-type": "application/json" },
  }));

  await assertApiError(
    await DifyChatRoute.POST(jsonRequest({ query: "推荐湛江早餐" })),
    {
      status: 502,
      code: ErrorCode.EXTERNAL_SERVICE_ERROR,
      message: "AI服务暂时不可用",
    },
  );
  assert.equal(fetchMock.mock.callCount(), 1);
  fetchMock.mock.restore();

  DifyChatRoute.__resetDifyChatRateLimit?.();
  const successFetchMock = mock.method(globalThis, "fetch", async () => new Response(JSON.stringify({
    answer: "可以安排海鲜路线。",
    metadata: {},
  }), {
    status: 200,
    headers: { "content-type": "application/json" },
  }));

  for (let index = 0; index < 20; index += 1) {
    const response = await DifyChatRoute.POST(jsonRequest({ query: `第${index}个问题` }));
    assert.equal(response.status, 200);
  }

  await assertApiError(
    await DifyChatRoute.POST(jsonRequest({ query: "第21个问题" })),
    {
      status: 429,
      code: ErrorCode.RATE_LIMITED,
      message: "请求过于频繁，请稍后再试",
    },
  );
  assert.equal(successFetchMock.mock.callCount(), 20);
  successFetchMock.mock.restore();
});

test("Register stores a BCrypt password hash instead of plaintext", async () => {
  resetState();

  const response = await RegisterRoute.POST(jsonRequest({
    nickname: "食客",
    email: "new-user@example.com",
    password: "123456",
    gender: "secret",
    avatar: "data:image/png;base64,legacy-avatar",
  }));
  const result = await readBody(response);

  assert.equal(result.status, 200);
  assert.equal(result.body.success, true);
  assert.equal(dbState.insertValues.length, 1);
  assert.equal("avatar" in dbState.insertValues[0], false);
  assert.notEqual(dbState.insertValues[0].password, "123456");
  assert.match(dbState.insertValues[0].password, /^\$2[aby]\$10\$/);
  assert.deepEqual(await verifyPassword("123456", dbState.insertValues[0].password), {
    matches: true,
    needsMigration: false,
  });
});

test("Login accepts BCrypt passwords and does not migrate them again", async () => {
  resetState();
  const passwordHash = await hashPassword("123456");
  dbState.selectRows = [{
    userId: 1,
    nickname: "食客",
    avatar: null,
    gender: "secret",
    age: null,
    phoneNumber: null,
    email: "hashed@example.com",
    password: passwordHash,
  }];

  const response = await LoginRoute.POST(jsonRequest({
    email: "hashed@example.com",
    password: "123456",
  }));
  const result = await readBody(response);

  assert.equal(result.status, 200);
  assert.equal(result.body.success, true);
  assert.equal(result.body.data.user.userId, 1);
  assert.deepEqual(dbState.updateSets, []);
});

test("Login sets the standard auth cookie options", async () => {
  resetState();
  dbState.selectRows = [{
    userId: 1,
    nickname: "食客",
    avatar: null,
    gender: "secret",
    age: null,
    phoneNumber: null,
    email: "cookie@example.com",
    password: await hashPassword("123456"),
  }];

  const response = await LoginRoute.POST(jsonRequest({
    email: "cookie@example.com",
    password: "123456",
  }));
  const result = await readBody(response);
  const cookie = setCookieHeader(response);

  assert.equal(result.status, 200);
  assert.match(cookie, /auth_token=mock-token/);
  assert.match(cookie, /HttpOnly/i);
  assert.match(cookie, /SameSite=Lax/i);
  assert.match(cookie, /Path=\//i);
  assert.match(cookie, /Max-Age=604800/i);
});

test("Logout clears the auth cookie with the same session scope", async () => {
  const response = await LogoutRoute.POST(jsonRequest({}));
  const result = await readBody(response);
  const cookie = setCookieHeader(response);

  assert.equal(result.status, 200);
  assert.match(cookie, /auth_token=/);
  assert.match(cookie, /HttpOnly/i);
  assert.match(cookie, /SameSite=Lax/i);
  assert.match(cookie, /Path=\//i);
  assert.match(cookie, /Max-Age=0/i);
});

test("Register does not create an auth session cookie", async () => {
  resetState();

  const response = await RegisterRoute.POST(jsonRequest({
    nickname: "食客",
    email: "register-cookie@example.com",
    password: "123456",
    gender: "secret",
  }));
  const result = await readBody(response);

  assert.equal(result.status, 200);
  assert.equal(setCookieHeader(response), "");
});

test("Login migrates matching legacy plaintext passwords to BCrypt", async () => {
  resetState();
  dbState.selectRows = [{
    userId: 2,
    nickname: "老食客",
    avatar: null,
    gender: "secret",
    age: null,
    phoneNumber: null,
    email: "legacy@example.com",
    password: "123456",
  }];

  const response = await LoginRoute.POST(jsonRequest({
    email: "legacy@example.com",
    password: "123456",
  }));
  const result = await readBody(response);

  assert.equal(result.status, 200);
  assert.equal(result.body.success, true);
  assert.equal(dbState.updateSets.length, 1);
  assert.notEqual(dbState.updateSets[0].password, "123456");
  assert.match(dbState.updateSets[0].password, /^\$2[aby]\$10\$/);
  assert.deepEqual(await verifyPassword("123456", dbState.updateSets[0].password), {
    matches: true,
    needsMigration: false,
  });
});

test("Login rejects wrong passwords against stored BCrypt hashes", async () => {
  resetState();
  dbState.selectRows = [{
    userId: 3,
    nickname: "食客",
    email: "wrong@example.com",
    password: await hashPassword("123456"),
  }];

  await assertApiError(
    await LoginRoute.POST(jsonRequest({
      email: "wrong@example.com",
      password: "wrong-password",
    })),
    {
      status: 401,
      code: ErrorCode.UNAUTHORIZED,
      message: "邮箱或密码错误",
    },
  );
});

test("Login rejects missing and malformed email before database lookup", async () => {
  resetState();

  await assertApiError(
    await LoginRoute.POST(jsonRequest({ password: "123456" })),
    {
      status: 400,
      code: ErrorCode.VALIDATION_ERROR,
      message: "邮箱不能为空",
    },
  );

  await assertApiError(
    await LoginRoute.POST(jsonRequest({ email: "bad-email", password: "123456" })),
    {
      status: 400,
      code: ErrorCode.VALIDATION_ERROR,
      message: "邮箱格式不正确",
    },
  );
});

test("Register rejects short passwords and duplicate emails with stable codes", async () => {
  resetState();

  await assertApiError(
    await RegisterRoute.POST(jsonRequest({
      nickname: "食客",
      email: "test@example.com",
      password: "12345",
    })),
    {
      status: 400,
      code: ErrorCode.VALIDATION_ERROR,
      message: "密码长度不能少于6位",
    },
  );

  dbState.selectRows = [{ userId: 1 }];

  await assertApiError(
    await RegisterRoute.POST(jsonRequest({
      nickname: "食客",
      email: "test@example.com",
      password: "123456",
      gender: "secret",
    })),
    {
      status: 409,
      code: ErrorCode.CONFLICT,
      message: "该邮箱已注册",
    },
  );
});

test("UpdateProfile rejects stale auth users before updating profile data", async () => {
  resetState();
  dbState.selectRows = [];

  await assertApiError(
    await UpdateProfileRoute.POST(jsonRequest({
      nickname: "食客",
      gender: "secret",
    })),
    {
      status: 401,
      code: ErrorCode.UNAUTHORIZED,
      message: "登录失效，请重新登录",
    },
  );

  assert.equal(dbState.updateSets.length, 0);
});

test("UpdateProfile validates and stores avatar upload URLs", async () => {
  resetState();
  dbState.selectQueue = [[{ userId: 7, avatar: null }], []];

  await assertApiError(
    await UpdateProfileRoute.POST(jsonRequest({
      nickname: "食客",
      gender: "secret",
      avatar: "https://example.com/avatar.webp",
    })),
    {
      status: 400,
      code: ErrorCode.VALIDATION_ERROR,
      message: "头像地址不正确",
    },
  );
  assert.equal(dbState.updateSets.length, 0);

  const avatarUrl = `/upload/blob/${"a".repeat(64)}.webp`;
  dbState.selectQueue = [
    [{ userId: 7, avatar: null }],
    [{ id: 31, assetId: 41 }],
    [],
  ];
  const response = await UpdateProfileRoute.POST(jsonRequest({
    nickname: "食客",
    gender: "secret",
    avatar: avatarUrl,
  }));
  const result = await readBody(response);

  assert.equal(result.status, 200);
  assert.equal(result.body.success, true);
  assert.equal(dbState.updateSets.some((values) => values.avatar === avatarUrl), true);
  assert.equal(dbState.insertTables.includes("upload_references"), true);
  assert.equal(dbState.updateTables.includes("upload_claims"), true);
});

test("UpdateProfile rejects managed avatar URLs without a current user claim", async () => {
  resetState();
  dbState.selectQueue = [[{ userId: 7, avatar: null }], []];

  await assertApiError(
    await UpdateProfileRoute.POST(jsonRequest({
      nickname: "食客",
      gender: "secret",
      avatar: `/upload/blob/${"b".repeat(64)}.webp`,
    })),
    {
      status: 400,
      code: ErrorCode.VALIDATION_ERROR,
      message: "上传凭证无效或已过期",
    },
  );

  assert.equal(dbState.updateSets.length, 0);
});

test("Follow rejects invalid target ids and self-follow requests", async () => {
  resetState();

  await assertApiError(
    await FollowRoute.GET(jsonRequest(undefined, {
      url: "http://localhost/API/Follow?targetId=abc",
    })),
    {
      status: 400,
      code: ErrorCode.VALIDATION_ERROR,
      message: "目标用户id必须是正整数",
    },
  );

  await assertApiError(
    await FollowRoute.POST(jsonRequest({ targetId: 7 })),
    {
      status: 400,
      code: ErrorCode.VALIDATION_ERROR,
      message: "不能关注自己哦",
    },
  );
});

test("Follow removes all duplicate follow rows when toggling off", async () => {
  resetState();
  dbState.selectRows = [{ id: 11 }, { id: 12 }];

  const response = await FollowRoute.POST(jsonRequest({ targetId: 8 }));
  const result = await readBody(response);

  assert.equal(result.status, 200);
  assert.equal(result.body.success, true);
  assert.deepEqual(result.body.data, { isFollowing: false });
  assert.equal(result.body.message, "已取消关注");
  assert.equal(dbState.deleteCalls.length, 1);
  assert.equal(dbState.insertValues.length, 0);
});

test("Follow rejects missing target users before writing relationships", async () => {
  resetState();
  dbState.selectQueue = [[{ userId: 7 }], []];

  await assertApiError(
    await FollowRoute.POST(jsonRequest({ targetId: 8 })),
    {
      status: 404,
      code: ErrorCode.NOT_FOUND,
      message: "目标用户不存在",
    },
  );

  assert.equal(dbState.insertValues.length, 0);
  assert.equal(dbState.deleteCalls.length, 0);
});

test("Follow treats duplicate relation insert races as already followed", async () => {
  resetState();
  dbState.selectQueue = [[{ userId: 7 }], [{ userId: 8 }], []];
  dbState.insertError = { code: "ER_DUP_ENTRY" };

  const response = await FollowRoute.POST(jsonRequest({ targetId: 8 }));
  const result = await readBody(response);

  assert.equal(result.status, 200);
  assert.equal(result.body.success, true);
  assert.deepEqual(result.body.data, { isFollowing: true });
  assert.equal(result.body.message, "关注成功");
});

test("MyFavorites rejects invalid postId and page parameters", async () => {
  resetState();

  await assertApiError(
    await MyFavoritesRoute.GET(jsonRequest(undefined, {
      url: "http://localhost/API/MyFavorites?postId=0",
    })),
    {
      status: 400,
      code: ErrorCode.VALIDATION_ERROR,
      message: "帖子ID必须是正整数",
    },
  );

  await assertApiError(
    await MyFavoritesRoute.GET(jsonRequest(undefined, {
      url: "http://localhost/API/MyFavorites?page=-1",
    })),
    {
      status: 400,
      code: ErrorCode.VALIDATION_ERROR,
      message: "页码必须是正整数",
    },
  );

  await assertApiError(
    await MyFavoritesRoute.POST(jsonRequest({ postId: "abc" })),
    {
      status: 400,
      code: ErrorCode.VALIDATION_ERROR,
      message: "帖子ID必须是正整数",
    },
  );
});

test("MyFavorites removes all duplicate favorite rows when toggling off", async () => {
  resetState();
  dbState.selectRows = [{ id: 21 }, { id: 22 }];

  const response = await MyFavoritesRoute.POST(jsonRequest({ postId: 9 }));
  const result = await readBody(response);

  assert.equal(result.status, 200);
  assert.equal(result.body.success, true);
  assert.deepEqual(result.body.data, { isFavorited: false });
  assert.equal(result.body.message, "已取消收藏");
  assert.equal(dbState.deleteCalls.length, 1);
  assert.equal(dbState.insertValues.length, 0);
});

test("MyFavorites rejects missing posts before writing relationships", async () => {
  resetState();
  dbState.selectQueue = [[{ userId: 7 }], []];

  await assertApiError(
    await MyFavoritesRoute.POST(jsonRequest({ postId: 9 })),
    {
      status: 404,
      code: ErrorCode.NOT_FOUND,
      message: "帖子不存在",
    },
  );

  assert.equal(dbState.insertValues.length, 0);
  assert.equal(dbState.deleteCalls.length, 0);
});

test("MyFavorites treats duplicate relation insert races as already favorited", async () => {
  resetState();
  dbState.selectQueue = [[{ userId: 7 }], [{ id: 9 }], []];
  dbState.insertError = { errno: 1062 };

  const response = await MyFavoritesRoute.POST(jsonRequest({ postId: 9 }));
  const result = await readBody(response);

  assert.equal(result.status, 200);
  assert.equal(result.body.success, true);
  assert.deepEqual(result.body.data, { isFavorited: true });
  assert.equal(result.body.message, "收藏成功");
});

test("MyComments and MyPost reject invalid page parameters", async () => {
  resetState();

  await assertApiError(
    await MyCommentsRoute.GET(jsonRequest(undefined, {
      url: "http://localhost/API/MyComments?page=abc",
    })),
    {
      status: 400,
      code: ErrorCode.VALIDATION_ERROR,
      message: "页码必须是正整数",
    },
  );

  await assertApiError(
    await MyPostRoute.GET(jsonRequest(undefined, {
      url: "http://localhost/API/MyPost?page=0",
    })),
    {
      status: 400,
      code: ErrorCode.VALIDATION_ERROR,
      message: "页码必须是正整数",
    },
  );
});

test("PostDetail comments reject invalid post ids and blank content", async () => {
  resetState();

  await assertApiError(
    await PostDetailRoute.POST(
      jsonRequest({ content: "好吃" }),
      { params: Promise.resolve({ id: "abc" }) },
    ),
    {
      status: 400,
      code: ErrorCode.VALIDATION_ERROR,
      message: "帖子ID必须是正整数",
    },
  );

  await assertApiError(
    await PostDetailRoute.POST(
      jsonRequest({ content: "   " }),
      { params: Promise.resolve({ id: "1" }) },
    ),
    {
      status: 400,
      code: ErrorCode.VALIDATION_ERROR,
      message: "评论内容不能为空",
    },
  );
});

test("PostDetail comments reject comments for missing posts", async () => {
  resetState();
  dbState.selectQueue = [[{ userId: 7 }], []];

  await assertApiError(
    await PostDetailRoute.POST(
      jsonRequest({ content: "好吃" }),
      { params: Promise.resolve({ id: "1" }) },
    ),
    {
      status: 404,
      code: ErrorCode.NOT_FOUND,
      message: "未找到帖子",
    },
  );

  assert.equal(dbState.insertValues.length, 0);
});

test("dynamic id routes reject invalid ids before database access", async () => {
  resetState();

  await assertApiError(
    await PostDetailRoute.GET(
      jsonRequest(undefined),
      { params: Promise.resolve({ id: "abc" }) },
    ),
    {
      status: 400,
      code: ErrorCode.VALIDATION_ERROR,
      message: "帖子ID必须是正整数",
    },
  );
  assert.equal(dbState.queryPostFinds, 0);

  await assertApiError(
    await TasteCardDetailRoute.GET(
      jsonRequest(undefined),
      { params: Promise.resolve({ id: "abc" }) },
    ),
    {
      status: 400,
      code: ErrorCode.VALIDATION_ERROR,
      message: "味觉卡片ID必须是数字",
    },
  );
  assert.equal(dbState.selectCalls, 0);

  await assertApiError(
    await UserInfoRoute.GET(jsonRequest(undefined, {
      url: "http://localhost/API/UserInfo?id=abc",
    })),
    {
      status: 400,
      code: ErrorCode.VALIDATION_ERROR,
      message: "用户ID必须是正整数",
    },
  );
  assert.equal(dbState.selectCalls, 0);
});

test("Post rejects missing required fields and invalid image arrays", async () => {
  resetState();

  await assertApiError(
    await PostRoute.POST(jsonRequest({
      description: "好吃",
      category: "菜谱",
      location: "赤坎区",
      images: [],
    })),
    {
      status: 400,
      code: ErrorCode.VALIDATION_ERROR,
      message: "标题不能为空",
    },
  );

  await assertApiError(
    await PostRoute.POST(jsonRequest({
      title: "白切鸡",
      description: "好吃",
      category: "菜谱",
      images: [],
    })),
    {
      status: 400,
      code: ErrorCode.VALIDATION_ERROR,
      message: "地点不能为空",
    },
  );

  await assertApiError(
    await PostRoute.POST(jsonRequest({
      title: "白切鸡",
      description: "好吃",
      category: "菜谱",
      location: "赤坎区",
      images: "not-array",
    })),
    {
      status: 400,
      code: ErrorCode.VALIDATION_ERROR,
      message: "图片列表必须是数组",
    },
  );
});

test("Post rejects category and location values outside the publishing options", async () => {
  resetState();

  await assertApiError(
    await PostRoute.POST(jsonRequest({
      title: "白切鸡",
      description: "好吃",
      category: "粤菜",
      location: "赤坎区",
      images: [],
    })),
    {
      status: 400,
      code: ErrorCode.VALIDATION_ERROR,
      message: "分类不正确",
    },
  );

  await assertApiError(
    await PostRoute.POST(jsonRequest({
      title: "白切鸡",
      description: "好吃",
      category: "菜谱",
      location: "湛江",
      images: [],
    })),
    {
      status: 400,
      code: ErrorCode.VALIDATION_ERROR,
      message: "地点不正确",
    },
  );
});

test("Post stores uploaded image URLs as a JSON array value", async () => {
  resetState();
  const coverImage = `/upload/blob/${"c".repeat(64)}.png`;
  const bodyImage = `/upload/blob/${"d".repeat(64)}.webp`;
  dbState.selectQueue = [
    [{ userId: 7 }],
    [{ id: 51, assetId: 61 }],
    [{ id: 52, assetId: 62 }],
  ];

  const response = await PostRoute.POST(jsonRequest({
    title: "白切鸡",
    description: "好吃",
    category: "菜谱",
    location: "赤坎区",
    coverImage,
    images: [` ${bodyImage} `],
  }));
  const result = await readBody(response);

  assert.equal(result.status, 201);
  assert.equal(result.body.success, true);
  const postInsert = dbState.insertValues.find((values, index) => dbState.insertTables[index] === "posts");
  assert.deepEqual(postInsert.images, [bodyImage]);
  assert.equal(postInsert.coverImage, coverImage);
  assert.notEqual(typeof postInsert.images, "string");
  assert.equal(dbState.insertTables.filter((name) => name === "upload_references").length, 2);
});

test("Post rejects managed upload URLs without a current user claim", async () => {
  resetState();
  dbState.selectQueue = [[{ userId: 7 }], []];

  await assertApiError(
    await PostRoute.POST(jsonRequest({
      title: "白切鸡",
      description: "好吃",
      category: "菜谱",
      location: "赤坎区",
      images: [`/upload/blob/${"e".repeat(64)}.png`],
    })),
    {
      status: 400,
      code: ErrorCode.VALIDATION_ERROR,
      message: "上传凭证无效或已过期",
    },
  );

  assert.equal(dbState.insertTables.includes("posts"), false);
});

test("write routes reject stale auth users before creating dependent records", async () => {
  resetState();
  dbState.selectRows = [];

  await assertApiError(
    await PostRoute.POST(jsonRequest({
      title: "白切鸡",
      description: "好吃",
      category: "菜谱",
      location: "赤坎区",
      images: [],
    })),
    {
      status: 401,
      code: ErrorCode.UNAUTHORIZED,
      message: "登录失效，请重新登录",
    },
  );
  assert.equal(dbState.insertValues.length, 0);

  resetState();
  dbState.selectRows = [];

  await assertApiError(
    await PostDetailRoute.POST(
      jsonRequest({ content: "好吃" }),
      { params: Promise.resolve({ id: "1" }) },
    ),
    {
      status: 401,
      code: ErrorCode.UNAUTHORIZED,
      message: "登录失效，请重新登录",
    },
  );
  assert.equal(dbState.insertValues.length, 0);

  resetState();
  dbState.selectRows = [];

  await assertApiError(
    await MyFavoritesRoute.POST(jsonRequest({ postId: 9 })),
    {
      status: 401,
      code: ErrorCode.UNAUTHORIZED,
      message: "登录失效，请重新登录",
    },
  );
  assert.equal(dbState.insertValues.length, 0);

  resetState();
  dbState.selectRows = [];

  await assertApiError(
    await FollowRoute.POST(jsonRequest({ targetId: 8 })),
    {
      status: 401,
      code: ErrorCode.UNAUTHORIZED,
      message: "登录失效，请重新登录",
    },
  );
  assert.equal(dbState.insertValues.length, 0);
});

test("Upload rejects missing files invalid MIME oversized files and invalid extensions", async () => {
  resetState();

  await assertApiError(
    await UploadRoute.POST(formRequest(undefined)),
    {
      status: 400,
      code: ErrorCode.VALIDATION_ERROR,
      message: "未找到文件",
    },
  );

  await assertApiError(
    await UploadRoute.POST(formRequest(new File(["x"], "food.txt", { type: "text/plain" }))),
    {
      status: 400,
      code: ErrorCode.VALIDATION_ERROR,
      message: "文件不是有效图片",
    },
  );

  await assertApiError(
    await UploadRoute.POST(formRequest(new File([new Uint8Array(MAX_UPLOAD_BYTES + 1)], "food.jpg", {
      type: "image/jpeg",
    }))),
    {
      status: 400,
      code: ErrorCode.VALIDATION_ERROR,
      message: "图片大小不能超过5MB",
    },
  );

  await assertApiError(
    await UploadRoute.POST(formRequest(new File(["x"], "food.gif", { type: "image/png" }))),
    {
      status: 400,
      code: ErrorCode.VALIDATION_ERROR,
      message: "文件不是有效图片",
    },
  );

  await assertApiError(
    await UploadRoute.POST(formRequest(await imageFile(), { purpose: "cover" })),
    {
      status: 400,
      code: ErrorCode.VALIDATION_ERROR,
      message: "上传用途不正确",
    },
  );
});

test("Upload requires auth before reading multipart bodies", async () => {
  resetState();

  await assertApiError(
    await UploadRoute.POST({
      ...formRequest(undefined, { token: null }),
      async formData() {
        throw new Error("formData should not be read before auth");
      },
    }),
    {
      status: 401,
      code: ErrorCode.UNAUTHORIZED,
      message: "未登录，请先登录",
    },
  );

  assert.equal(dbState.uploadWrites.length, 0);
});

test("Upload returns data.url for authenticated image uploads", async () => {
  resetState();
  dbState.selectQueue = [
    [{ id: 71 }],
  ];

  const response = await UploadRoute.POST(formRequest(await imageFile({
    name: "food.png",
    type: "image/png",
    format: "png",
    width: 32,
    height: 24,
  })));
  const result = await readBody(response);

  assert.equal(result.status, 200);
  assert.equal(result.body.success, true);
  assert.match(result.body.data?.url, /^\/upload\/blob\/[a-f0-9]{64}\.png$/);
  assert.equal(result.body.data?.mimeType, "image/png");
  assert.equal(result.body.data?.width, 32);
  assert.equal(result.body.data?.height, 24);
  assert.equal(dbState.uploadWrites.length, 1);
  assert.equal(dbState.insertTables.includes("upload_assets"), true);
  assert.equal(dbState.insertTables.includes("upload_claims"), true);
});

test("Upload returns webp metadata for avatar uploads", async () => {
  resetState();
  dbState.selectQueue = [
    [{ id: 81 }],
  ];

  const response = await UploadRoute.POST(formRequest(await imageFile({
    name: "avatar.jpg",
    type: "image/jpeg",
    format: "jpeg",
    width: 900,
    height: 600,
  }), { purpose: "avatar" }));
  const result = await readBody(response);
  const storedImage = await sharp(dbState.uploadWrites[0].buffer).metadata();

  assert.equal(result.status, 200);
  assert.equal(result.body.success, true);
  assert.match(result.body.data?.url, /^\/upload\/blob\/[a-f0-9]{64}\.webp$/);
  assert.equal(result.body.data?.mimeType, "image/webp");
  assert.equal(result.body.data?.width, 512);
  assert.equal(result.body.data?.height, 512);
  assert.equal(storedImage.format, "webp");
  assert.equal(storedImage.width, 512);
  assert.equal(storedImage.height, 512);
  assert.equal(dbState.uploadWrites.length, 1);
});

test("Upload reuses the same physical asset for identical processed images", async () => {
  resetState();
  dbState.selectQueue = [
    [{ id: 91 }],
    [{ id: 91 }],
  ];
  const file = await imageFile({
    name: "same.png",
    type: "image/png",
    format: "png",
    width: 32,
    height: 24,
  });

  const first = await readBody(await UploadRoute.POST(formRequest(file)));
  const second = await readBody(await UploadRoute.POST(formRequest(file)));

  assert.equal(first.status, 200);
  assert.equal(second.status, 200);
  assert.equal(first.body.data.url, second.body.data.url);
  assert.equal(dbState.uploadWrites.length, 1);
  assert.equal(dbState.insertTables.filter((name) => name === "upload_claims").length, 2);
});

test("Upload restores assets that were marked for deletion during instant upload", async () => {
  resetState();
  dbState.selectQueue = [
    [{ id: 101 }],
  ];

  const response = await UploadRoute.POST(formRequest(await imageFile()));
  const result = await readBody(response);

  assert.equal(result.status, 200);
  assert.equal(result.body.success, true);
  assert.equal(dbState.upsertSets.length > 0, true);
  assert.equal(typeof dbState.upsertSets[0].status, "object");
  assert.equal(typeof dbState.upsertSets[0].deleteAfter, "object");
});

test("Upload refuses to create claims while an asset is locked for physical deletion", async () => {
  resetState();
  dbState.selectQueue = [
    [{ id: 111, status: "deleting_locked" }],
  ];

  await assertApiError(
    await UploadRoute.POST(formRequest(await imageFile())),
    {
      status: 400,
      code: ErrorCode.VALIDATION_ERROR,
      message: "文件正在清理，请稍后重试",
    },
  );

  assert.equal(dbState.insertTables.filter((name) => name === "upload_claims").length, 0);
});
