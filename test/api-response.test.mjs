import assert from "node:assert/strict";
import test from "node:test";

import { ApiResponse, ErrorCode } from "../lib/api-response.mjs";

test("ApiResponse.success returns the standard success envelope", async () => {
  const response = ApiResponse.success({ id: 1 }, "读取成功");
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(body, {
    success: true,
    code: ErrorCode.SUCCESS,
    message: "读取成功",
    data: { id: 1 },
  });
});

test("ApiResponse.error returns the standard error envelope", async () => {
  const response = ApiResponse.error(ErrorCode.UNAUTHORIZED);
  const body = await response.json();

  assert.equal(response.status, 401);
  assert.deepEqual(body, {
    success: false,
    code: ErrorCode.UNAUTHORIZED,
    message: "未登录或登录已失效",
  });
});

test("ApiResponse.paginated stores pagination in meta.pagination", async () => {
  const pagination = { totalCount: 8, pageSize: 4, totalPages: 2, currentPage: 1 };
  const response = ApiResponse.paginated([{ id: 1 }], pagination, "读取成功");
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(body, {
    success: true,
    code: ErrorCode.SUCCESS,
    message: "读取成功",
    data: [{ id: 1 }],
    meta: { pagination },
  });
});

test("ApiResponse.created returns a standard 201 success envelope", async () => {
  const response = ApiResponse.created({ id: 1 }, "创建成功");
  const body = await response.json();

  assert.equal(response.status, 201);
  assert.deepEqual(body, {
    success: true,
    code: ErrorCode.SUCCESS,
    message: "创建成功",
    data: { id: 1 },
  });
});

test("ApiResponse.error supports custom messages and metadata", async () => {
  const response = ApiResponse.error(ErrorCode.VALIDATION_ERROR, "缺少 postId", {
    meta: { field: "postId" },
  });
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.deepEqual(body, {
    success: false,
    code: ErrorCode.VALIDATION_ERROR,
    message: "缺少 postId",
    meta: { field: "postId" },
  });
});
