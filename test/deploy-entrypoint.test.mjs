import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

test('entrypoint exports the vision secret file to the application', () => {
  const dir = mkdtempSync(join(tmpdir(), 'vision-secret-test-'));
  try {
    const file = join(dir, 'vision-key');
    writeFileSync(file, 'test-vision-key\n', { mode: 0o600 });
    const result = spawnSync('sh', ['deploy/app-entrypoint.sh', process.execPath, '-e',
      'if (process.env.DIFY_VISION_API_KEY !== "test-vision-key") process.exit(1)'], {
      env: { PATH: process.env.PATH, DATABASE_URL: 'mysql://test', UPLOAD_DIR: join(dir, 'uploads'), DIFY_VISION_API_KEY_FILE: file },
      encoding: 'utf8',
    });
    assert.equal(result.status, 0, result.stderr);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
