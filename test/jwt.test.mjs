import assert from "node:assert/strict";
import test from "node:test";

import {
  JWT_SECRET_MISSING_MESSAGE,
  getJwtSecretKey,
  signToken,
  verifyToken,
} from "../lib/jwt.js";

test("JWT helpers fail explicitly when JWT_SECRET is missing", async () => {
  const originalSecret = process.env.JWT_SECRET;
  delete process.env.JWT_SECRET;

  try {
    assert.throws(
      () => getJwtSecretKey(),
      new RegExp(JWT_SECRET_MISSING_MESSAGE),
    );
    await assert.rejects(
      () => signToken({ userId: 1 }),
      new RegExp(JWT_SECRET_MISSING_MESSAGE),
    );
    await assert.rejects(
      () => verifyToken("token"),
      new RegExp(JWT_SECRET_MISSING_MESSAGE),
    );
  } finally {
    if (originalSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = originalSecret;
    }
  }
});
