import assert from "node:assert/strict";
import { mock, test } from "node:test";

import { ErrorCode } from "../lib/api-response.mjs";
import { MAX_UPLOAD_BYTES } from "../lib/api-validation.mjs";
import { hashPassword, verifyPassword } from "../lib/password.mjs";

const dbState = {
  selectRows: [],
  insertValues: [],
  updateSets: [],
};

const createSelectQuery = () => ({
  from() {
    return this;
  },
  where() {
    return this;
  },
  limit() {
    return Promise.resolve(dbState.selectRows);
  },
  then(resolve, reject) {
    return Promise.resolve(dbState.selectRows).then(resolve, reject);
  },
});

const db = {
  select() {
    return createSelectQuery();
  },
  insert() {
    return {
      values(values) {
        dbState.insertValues.push(values);
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
};

let authPayload = { userId: 7 };

await mock.module("../database/index.js", {
  namedExports: { db },
});

await mock.module("../lib/jwt.js", {
  namedExports: {
    signToken: async () => "mock-token",
    verifyToken: async (token) => (token === "valid-token" ? authPayload : null),
  },
});

const LoginRoute = await import("../app/API/auth/Login/route.js");
const RegisterRoute = await import("../app/API/auth/Register/route.js");
const FollowRoute = await import("../app/API/Follow/route.js");
const MyFavoritesRoute = await import("../app/API/MyFavorites/route.js");
const PostRoute = await import("../app/API/Post/route.js");
const UploadRoute = await import("../app/API/Upload/route.js");

const resetState = () => {
  dbState.selectRows = [];
  dbState.insertValues = [];
  dbState.updateSets = [];
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

const formRequest = (file) => ({
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

test("Post rejects missing required fields and invalid image arrays", async () => {
  resetState();

  await assertApiError(
    await PostRoute.POST(jsonRequest({
      description: "好吃",
      category: "海鲜",
      location: "湛江",
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
      category: "粤菜",
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
      category: "粤菜",
      location: "湛江",
      images: "not-array",
    })),
    {
      status: 400,
      code: ErrorCode.VALIDATION_ERROR,
      message: "图片列表必须是数组",
    },
  );
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
