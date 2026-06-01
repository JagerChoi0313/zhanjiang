import assert from "node:assert/strict";
import { mock, test } from "node:test";

import { ErrorCode } from "../lib/api-response.mjs";
import { MAX_UPLOAD_BYTES } from "../lib/api-validation.mjs";
import { hashPassword, verifyPassword } from "../lib/password.mjs";

const dbState = {
  selectRows: [],
  selectQueue: [],
  queryPost: { id: 1 },
  selectCalls: 0,
  queryPostFinds: 0,
  insertValues: [],
  insertError: null,
  updateSets: [],
  deleteCalls: [],
  uploadWrites: [],
};

const createSelectQuery = () => ({
  from() {
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
  select() {
    dbState.selectCalls += 1;
    return createSelectQuery();
  },
  insert() {
    return {
      values(values) {
        dbState.insertValues.push(values);
        if (dbState.insertError) {
          return Promise.reject(dbState.insertError);
        }
        return Promise.resolve({ insertId: 1 });
      },
    };
  },
  update() {
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
        dbState.deleteCalls.push({ table, condition });
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

await mock.module("../database/index.js", {
  namedExports: { db },
});

await mock.module("fs/promises", {
  namedExports: {
    writeFile: async (path, buffer) => {
      dbState.uploadWrites.push({ path, buffer });
    },
  },
});

await mock.module("../lib/jwt.js", {
  namedExports: {
    signToken: async () => "mock-token",
    verifyToken: async (token) => (token === "valid-token" ? authPayload : null),
  },
});

const LoginRoute = await import("../app/API/auth/Login/route.js");
const LogoutRoute = await import("../app/API/auth/Logout/route.js");
const RegisterRoute = await import("../app/API/auth/Register/route.js");
const UpdateProfileRoute = await import("../app/API/auth/UpdateProfile/route.js");
const FollowRoute = await import("../app/API/Follow/route.js");
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
  dbState.insertValues = [];
  dbState.insertError = null;
  dbState.updateSets = [];
  dbState.deleteCalls = [];
  dbState.uploadWrites = [];
  authPayload = { userId: 7 };
};

const cookies = (token = "valid-token") => ({
  get(name) {
    if (name === "auth_token" && token) {
      return { value: token };
    }
    return undefined;
  },
});

const jsonRequest = (body, options = {}) => ({
  url: options.url ?? "http://localhost/API/test",
  cookies: cookies(options.token),
  async json() {
    return body;
  },
});

const formRequest = (file, options = {}) => ({
  cookies: cookies(options.token),
  async formData() {
    const formData = new FormData();
    if (file !== undefined) {
      formData.set("file", file);
    }
    return formData;
  },
});

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

test("Register stores a BCrypt password hash instead of plaintext", async () => {
  resetState();

  const response = await RegisterRoute.POST(jsonRequest({
    nickname: "食客",
    email: "new-user@example.com",
    password: "123456",
    gender: "secret",
  }));
  const result = await readBody(response);

  assert.equal(result.status, 200);
  assert.equal(result.body.success, true);
  assert.equal(dbState.insertValues.length, 1);
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
  const response = await LogoutRoute.POST();
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
  dbState.selectRows = [{ userId: 7 }];

  const response = await PostRoute.POST(jsonRequest({
    title: "白切鸡",
    description: "好吃",
    category: "菜谱",
    location: "赤坎区",
    images: [" /upload/one.png ", "/upload/two.webp"],
  }));
  const result = await readBody(response);

  assert.equal(result.status, 201);
  assert.equal(result.body.success, true);
  assert.equal(dbState.insertValues.length, 1);
  assert.deepEqual(dbState.insertValues[0].images, ["/upload/one.png", "/upload/two.webp"]);
  assert.notEqual(typeof dbState.insertValues[0].images, "string");
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
      message: "仅支持上传JPG、PNG或WEBP图片",
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
      message: "文件扩展名不正确",
    },
  );
});

test("Upload requires auth before reading multipart bodies", async () => {
  resetState();

  await assertApiError(
    await UploadRoute.POST({
      cookies: cookies(null),
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

  const response = await UploadRoute.POST(formRequest(new File(["image-bytes"], "food.png", {
    type: "image/png",
  })));
  const result = await readBody(response);

  assert.equal(result.status, 200);
  assert.equal(result.body.success, true);
  assert.match(result.body.data?.url, /^\/upload\/.+\.png$/);
  assert.equal(dbState.uploadWrites.length, 1);
});
