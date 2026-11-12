import assert from 'node:assert/strict';
import { mock, test } from 'node:test';
import { MySqlDialect } from 'drizzle-orm/mysql-core';

let auth = true, csrf = true, writes = 0;
let row;
await mock.module('../lib/api-auth.mjs', { namedExports: {
  requireAuth: async () => auth ? { ok: true, userId: 7 } : { ok: false, response: new Response(null, { status: 401 }) },
} });
await mock.module('../lib/csrf.mjs', { namedExports: {
  requireCsrf: async () => csrf ? { ok: true } : { ok: false, response: new Response(null, { status: 403 }) },
} });
await mock.module('../database/index.js', { namedExports: { db: {
  update() { return { set(values) { return { async where(condition) {
    writes++;
    const query = new MySqlDialect().sqlToQuery(condition);
    assert.match(query.sql, /`posts`\.`user_id` = \?/);
    const [id, userId, status] = query.params;
    const matches = row && row.id === id && row.userId === userId && row.status === status;
    if (matches) row.status = values.status;
    return [{ affectedRows: matches ? 1 : 0 }];
  } }; } }; },
} } });
const { DELETE } = await import('../app/API/MyPost/[id]/route.js');
const remove = (id = '1') => DELETE(new Request('http://localhost/API/MyPost/1', { method: 'DELETE' }), { params: Promise.resolve({ id }) });

test('own post deletion enforces ownership, status, authentication and CSRF', async () => {
  row = { id: 1, userId: 8, status: 1 };
  assert.equal((await remove()).status, 404);
  assert.equal(row.status, 1);
  row.userId = 7;
  assert.equal((await remove()).status, 200);
  assert.equal(row.status, 0);
  assert.equal((await remove()).status, 404);
  row.status = 2;
  assert.equal((await remove()).status, 404);
  assert.equal(row.status, 2);
  const before = writes;
  assert.equal((await remove('bad')).status, 400);
  auth = false;
  assert.equal((await remove()).status, 401);
  auth = true; csrf = false;
  assert.equal((await remove()).status, 403);
  assert.equal(writes, before);
});
