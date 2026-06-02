import assert from "node:assert/strict";
import { mock, test } from "node:test";

const cleanupState = {
  selectQueue: [],
  updateTables: [],
  updateSets: [],
  deletedPaths: [],
};

const tableName = (table) => table?.[Symbol.for("drizzle:Name")] ?? "unknown";

const createSelectQuery = () => ({
  from() {
    return this;
  },
  where() {
    return this;
  },
  limit() {
    return this;
  },
  then(resolve, reject) {
    return Promise.resolve(cleanupState.selectQueue.shift() ?? []).then(resolve, reject);
  },
});

const db = {
  select() {
    return createSelectQuery();
  },
  update(table) {
    cleanupState.updateTables.push(tableName(table));
    return {
      set(values) {
        cleanupState.updateSets.push(values);
        return {
          where() {
            return Promise.resolve();
          },
        };
      },
    };
  },
};

await mock.module("../database/index.js", {
  namedExports: { db },
});

await mock.module("fs/promises", {
  namedExports: {
    mkdir: async () => {},
    writeFile: async () => {},
    unlink: async (path) => {
      cleanupState.deletedPaths.push(path);
    },
  },
});

const { cleanupUploads } = await import("../lib/upload-cleanup.mjs");

const resetCleanupState = () => {
  cleanupState.selectQueue = [];
  cleanupState.updateTables = [];
  cleanupState.updateSets = [];
  cleanupState.deletedPaths = [];
};

test("cleanup marks zero-reference upload assets before physical deletion", async () => {
  resetCleanupState();
  cleanupState.selectQueue = [
    [{ id: 1, publicUrl: `/upload/blob/${"a".repeat(64)}.png` }],
    [],
    [],
    [],
  ];

  const result = await cleanupUploads({
    now: new Date("2026-06-01T00:00:00Z"),
    dryRun: false,
    graceMs: 24 * 60 * 60 * 1000,
  });

  assert.equal(result.markedForDeletion, 1);
  assert.equal(result.deleted, 0);
  assert.equal(cleanupState.updateTables.includes("upload_claims"), true);
  assert.equal(cleanupState.updateTables.includes("upload_assets"), true);
  assert.equal(cleanupState.deletedPaths.length, 0);
});

test("cleanup rechecks references before deleting expired assets", async () => {
  resetCleanupState();
  cleanupState.selectQueue = [
    [],
    [{ id: 2, publicUrl: `/upload/blob/${"b".repeat(64)}.webp` }],
    [{ status: "deleting_locked" }],
    [{ id: 88 }],
  ];

  const result = await cleanupUploads({
    now: new Date("2026-06-01T00:00:00Z"),
    dryRun: false,
    graceMs: 0,
  });

  assert.equal(result.deleted, 0);
  assert.equal(cleanupState.deletedPaths.length, 0);
});

test("cleanup deletes expired assets only after the second zero-reference check", async () => {
  resetCleanupState();
  cleanupState.selectQueue = [
    [],
    [{ id: 3, publicUrl: `/upload/blob/${"c".repeat(64)}.jpg` }],
    [{ status: "deleting_locked" }],
    [],
    [],
  ];

  const result = await cleanupUploads({
    now: new Date("2026-06-01T00:00:00Z"),
    dryRun: false,
    graceMs: 0,
  });

  assert.equal(result.deleted, 1);
  assert.equal(cleanupState.deletedPaths.length, 1);
  assert.match(cleanupState.deletedPaths[0], /public\/upload\/blob\/c{64}\.jpg$/);
  assert.equal(cleanupState.updateSets.some((set) => set.status === "deleted"), true);
});

test("cleanup does not treat attached upload claims as live references", async () => {
  resetCleanupState();
  cleanupState.selectQueue = [
    [{ id: 4, publicUrl: `/upload/blob/${"d".repeat(64)}.webp` }],
    [],
    [],
    [],
  ];

  const result = await cleanupUploads({
    now: new Date("2026-06-01T00:00:00Z"),
    dryRun: false,
    graceMs: 24 * 60 * 60 * 1000,
  });

  assert.equal(result.markedForDeletion, 1);
  assert.equal(cleanupState.updateSets.some((set) => set.status === "deleting"), true);
});
