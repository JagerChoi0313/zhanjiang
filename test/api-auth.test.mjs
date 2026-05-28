import assert from "node:assert/strict";
import { mock, test } from "node:test";

import { ErrorCode } from "../lib/api-response.mjs";

let tokenPayload = null;

await mock.module("../lib/jwt.js", {
  namedExports: {
    verifyToken: async (token) => (token === "valid-token" ? tokenPayload : null),
  },
});

const { requireAuth } = await import("../lib/api-auth.mjs");

const cookies = (token) => ({
  get(name) {
    if (name === "auth_token" && token) {
      return { value: token };
    }
    return undefined;
  },
});

const readAuthError = async (result) => ({
  status: result.response.status,
  body: await result.response.json(),
});

test("requireAuth returns a standard unauthorized response when token is missing", async () => {
  const result = await requireAuth({ cookies: cookies(undefined) });
  const error = await readAuthError(result);

  assert.equal(result.ok, false);
  assert.equal(error.status, 401);
  assert.deepEqual(error.body, {
    success: false,
    code: ErrorCode.UNAUTHORIZED,
    message: "未登录或登录已失效",
  });
});

test("requireAuth supports route-specific unauthorized messages", async () => {
  const result = await requireAuth(
    { cookies: cookies("expired-token") },
    { invalidMessage: "登录过期，请重新登录" },
  );
  const error = await readAuthError(result);

  assert.equal(result.ok, false);
  assert.equal(error.status, 401);
  assert.equal(error.body.message, "登录过期，请重新登录");
  assert.equal(error.body.code, ErrorCode.UNAUTHORIZED);
});

test("requireAuth returns the verified payload and userId when token is valid", async () => {
  tokenPayload = { userId: 42, role: "user" };

  const result = await requireAuth({ cookies: cookies("valid-token") });

  assert.deepEqual(result, {
    ok: true,
    payload: { userId: 42, role: "user" },
    userId: 42,
  });
});
