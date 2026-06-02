import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

import { ApiResponse, ErrorCode } from "./api-response.mjs";
import { getJwtSecretKey } from "./jwt.js";

export const CSRF_COOKIE_NAME = "csrf_token";
export const CSRF_HEADER_NAME = "x-csrf-token";
export const CSRF_MAX_AGE_SECONDS = 2 * 60 * 60;

const sign = (timestamp, nonce) => {
  const secret = Buffer.from(getJwtSecretKey());
  return createHmac("sha256", secret)
    .update(`${timestamp}.${nonce}`)
    .digest("base64url");
};

export const createCsrfToken = (now = Date.now()) => {
  const timestamp = String(now);
  const nonce = randomBytes(24).toString("base64url");
  return `${timestamp}.${nonce}.${sign(timestamp, nonce)}`;
};

export const verifyCsrfToken = (token, options = {}) => {
  if (typeof token !== "string") {
    return false;
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    return false;
  }

  const [timestamp, nonce, signature] = parts;
  const issuedAt = Number(timestamp);
  const now = options.now ?? Date.now();
  if (!Number.isSafeInteger(issuedAt) || issuedAt <= 0) {
    return false;
  }

  if (now - issuedAt > CSRF_MAX_AGE_SECONDS * 1000 || issuedAt - now > 60 * 1000) {
    return false;
  }

  const expected = sign(timestamp, nonce);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (signatureBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(signatureBuffer, expectedBuffer);
};

export const getCsrfCookieOptions = (overrides = {}) => ({
  name: CSRF_COOKIE_NAME,
  value: overrides.value,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/",
  maxAge: CSRF_MAX_AGE_SECONDS,
  ...overrides,
});

export const setCsrfCookie = (response, token) => {
  response.cookies.set(getCsrfCookieOptions({ value: token }));
  return response;
};

export const clearCsrfCookie = (response) => {
  response.cookies.set(getCsrfCookieOptions({
    value: "",
    maxAge: 0,
  }));
  return response;
};

export const requireCsrf = async (request) => {
  const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value;
  const headerToken = request.headers?.get(CSRF_HEADER_NAME);

  if (!cookieToken || !headerToken || cookieToken !== headerToken || !verifyCsrfToken(cookieToken)) {
    return {
      ok: false,
      response: ApiResponse.error(ErrorCode.FORBIDDEN, "CSRF校验失败，请刷新页面后重试"),
    };
  }

  return { ok: true };
};
