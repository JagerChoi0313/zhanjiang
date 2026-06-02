#!/usr/bin/env node
const args = new Set(process.argv.slice(2));

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required to run upload cleanup.");
  process.exit(1);
}

const dryRun = !args.has("--apply");
const graceArg = process.argv.find((arg) => arg.startsWith("--grace-hours="));
const graceHours = graceArg ? Number(graceArg.split("=")[1]) : 24;
const { cleanupUploads, DEFAULT_UPLOAD_DELETE_GRACE_MS } = await import("../lib/upload-cleanup.mjs");
const graceMs = Number.isFinite(graceHours)
  ? graceHours * 60 * 60 * 1000
  : DEFAULT_UPLOAD_DELETE_GRACE_MS;

const result = await cleanupUploads({ dryRun, graceMs });
console.log(JSON.stringify(result, null, 2));
