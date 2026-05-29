import assert from "node:assert/strict";
import test from "node:test";

import { hashPassword, verifyPassword } from "../lib/password.mjs";

test("hashPassword creates a Spring-compatible BCrypt hash with cost 10", async () => {
  const hash = await hashPassword("secret123");

  assert.match(hash, /^\$2[aby]\$10\$[./A-Za-z0-9]{53}$/);
  assert.notEqual(hash, "secret123");
});

test("verifyPassword matches BCrypt hashes and rejects wrong passwords", async () => {
  const hash = await hashPassword("secret123");

  assert.deepEqual(await verifyPassword("secret123", hash), {
    matches: true,
    needsMigration: false,
  });
  assert.deepEqual(await verifyPassword("wrong-password", hash), {
    matches: false,
    needsMigration: false,
  });
});

test("verifyPassword treats non-BCrypt stored passwords as legacy plaintext", async () => {
  assert.deepEqual(await verifyPassword("secret123", "secret123"), {
    matches: true,
    needsMigration: true,
  });
  assert.deepEqual(await verifyPassword("wrong-password", "secret123"), {
    matches: false,
    needsMigration: false,
  });
});
