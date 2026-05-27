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
