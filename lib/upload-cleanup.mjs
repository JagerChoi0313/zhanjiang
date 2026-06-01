import { unlink } from "fs/promises";
import { and, eq, gt, lte } from "drizzle-orm";

import { db } from "../database/index.js";
import { UploadAssets, UploadClaims, UploadReferences } from "../database/schema.js";
import { isManagedUploadUrl, publicUploadPath } from "./upload-assets.mjs";

export const DEFAULT_UPLOAD_DELETE_GRACE_MS = 24 * 60 * 60 * 1000;

const hasLiveUploadReference = async (client, assetId, now) => {
  const claims = await client
    .select({ id: UploadClaims.id })
    .from(UploadClaims)
    .where(and(
      eq(UploadClaims.assetId, assetId),
      eq(UploadClaims.status, "temporary"),
      gt(UploadClaims.expiresAt, now),
    ))
    .limit(1);

  if (claims.length > 0) {
    return true;
  }

  const references = await client
    .select({ id: UploadReferences.id })
    .from(UploadReferences)
    .where(eq(UploadReferences.assetId, assetId))
    .limit(1);

  return references.length > 0;
};

export const cleanupUploads = async ({
  now = new Date(),
  graceMs = DEFAULT_UPLOAD_DELETE_GRACE_MS,
  dryRun = true,
  batchSize = 100,
  client = db,
} = {}) => {
  const result = {
    releasedClaims: 0,
    markedForDeletion: 0,
    deleted: 0,
    skipped: 0,
    dryRun,
  };

  if (!dryRun) {
    await client
      .update(UploadClaims)
      .set({ status: "released", updatedAt: now })
      .where(and(
        eq(UploadClaims.status, "temporary"),
        lte(UploadClaims.expiresAt, now),
      ));
  }

  const activeAssets = await client
    .select({ id: UploadAssets.id, publicUrl: UploadAssets.publicUrl })
    .from(UploadAssets)
    .where(eq(UploadAssets.status, "active"))
    .limit(batchSize);

  for (const asset of activeAssets) {
    if (await hasLiveUploadReference(client, asset.id, now)) {
      result.skipped += 1;
      continue;
    }

    result.markedForDeletion += 1;
    if (!dryRun) {
      await client
        .update(UploadAssets)
        .set({
          status: "deleting",
          deleteAfter: new Date(now.getTime() + graceMs),
          updatedAt: now,
        })
        .where(eq(UploadAssets.id, asset.id));
    }
  }

  const dueAssets = await client
    .select({ id: UploadAssets.id, publicUrl: UploadAssets.publicUrl })
    .from(UploadAssets)
    .where(and(
      eq(UploadAssets.status, "deleting"),
      lte(UploadAssets.deleteAfter, now),
    ))
    .limit(batchSize);

  for (const asset of dueAssets) {
    if (!dryRun) {
      await client
        .update(UploadAssets)
        .set({ status: "deleting_locked", updatedAt: now })
        .where(and(
          eq(UploadAssets.id, asset.id),
          eq(UploadAssets.status, "deleting"),
          lte(UploadAssets.deleteAfter, now),
        ));

      const lockedAssets = await client
        .select({ status: UploadAssets.status })
        .from(UploadAssets)
        .where(eq(UploadAssets.id, asset.id))
        .limit(1);

      if (lockedAssets[0]?.status !== "deleting_locked") {
        result.skipped += 1;
        continue;
      }
    }

    if (await hasLiveUploadReference(client, asset.id, now)) {
      if (!dryRun) {
        await client
          .update(UploadAssets)
          .set({ status: "active", deleteAfter: null, updatedAt: now })
          .where(eq(UploadAssets.id, asset.id));
      }
      result.skipped += 1;
      continue;
    }

    if (!isManagedUploadUrl(asset.publicUrl)) {
      result.skipped += 1;
      continue;
    }

    result.deleted += 1;
    if (!dryRun) {
      try {
        await unlink(publicUploadPath(asset.publicUrl));
      } catch (error) {
        if (error?.code !== "ENOENT") {
          throw error;
        }
      }

      await client
        .update(UploadAssets)
        .set({ status: "deleted", updatedAt: now })
        .where(and(
          eq(UploadAssets.id, asset.id),
          eq(UploadAssets.status, "deleting_locked"),
        ));
    }
  }

  return result;
};
