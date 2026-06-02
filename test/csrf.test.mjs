import assert from "node:assert/strict";
import test from "node:test";

import { ErrorCode } from "../lib/api-response.mjs";
import {
  CSRF_COOKIE_NAME,
  CSRF_HEADER_NAME,
  createCsrfToken,
  requireCsrf,
  verifyCsrfToken,
} from "../lib/csrf.mjs";

const originalSecret = process.env.JWT_SECRET;

test.afterEach(() => {
  process.env.JWT_SECRET = originalSecret;
});

const csrfRequest = ({ cookieToken, headerToken } = {}) => ({
  cookies: {
    get(name) {
      if (name === CSRF_COOKIE_NAME && cookieToken) {
        return { value: cookieToken };
      }
      return undefined;
    },
  },
  headers: {
    get(name) {
      if (name.toLowerCase() === CSRF_HEADER_NAME && headerToken) {
        return headerToken;
      }
      return null;
    },
  },
});

const readBody = async (response) => ({
  status: response.status,
  body: await response.json(),
});

test("createCsrfToken returns a signed token that verifies with the same secret", () => {
  process.env.JWT_SECRET = "csrf-test-secret";

  const token = createCsrfToken();

  assert.match(token, /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
  assert.equal(verifyCsrfToken(token), true);
});

test("verifyCsrfToken rejects tampered and expired tokens", () => {
  process.env.JWT_SECRET = "csrf-test-secret";
  const token = createCsrfToken();
  const tampered = `${token.slice(0, -1)}x`;

  assert.equal(verifyCsrfToken(tampered), false);
  assert.equal(verifyCsrfToken(token, { now: Date.now() + (3 * 60 * 60 * 1000) }), false);
});

test("requireCsrf rejects missing mismatched and forged csrf tokens", async () => {
  process.env.JWT_SECRET = "csrf-test-secret";
  const token = createCsrfToken();

  for (const request of [
    csrfRequest(),
    csrfRequest({ cookieToken: token }),
    csrfRequest({ headerToken: token }),
    csrfRequest({ cookieToken: token, headerToken: createCsrfToken() }),
    csrfRequest({ cookieToken: "bad.token.value", headerToken: "bad.token.value" }),
  ]) {
    const result = await requireCsrf(request);
    assert.equal(result.ok, false);
    const response = await readBody(result.response);
    assert.equal(response.status, 403);
    assert.equal(response.body.code, ErrorCode.FORBIDDEN);
  }
});

test("requireCsrf accepts matching signed cookie and header tokens", async () => {
  process.env.JWT_SECRET = "csrf-test-secret";
  const token = createCsrfToken();

  const result = await requireCsrf(csrfRequest({ cookieToken: token, headerToken: token }));

  assert.deepEqual(result, { ok: true });
});
