import { createHash } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import { dirname, join } from "path";
import { and, eq, gt, inArray, sql } from "drizzle-orm";

import { db } from "../database/index.js";
import { UploadAssets, UploadClaims, UploadReferences } from "../database/schema.js";
import { ApiValidationError } from "./api-validation.mjs";

export const UPLOAD_CLAIM_TTL_MS = 24 * 60 * 60 * 1000;
export const MANAGED_UPLOAD_URL_PATTERN = /^\/upload\/blob\/[a-f0-9]{64}\.(jpg|png|webp)$/;

export const computeContentHash = (buffer) => (
  createHash("sha256").update(buffer).digest("hex")
);

export const buildManagedUploadUrl = (contentHash, extension) => (
  `/upload/blob/${contentHash}.${extension}`
);

export const isManagedUploadUrl = (url) => (
  typeof url === "string" && MANAGED_UPLOAD_URL_PATTERN.test(url)
);

export const publicUploadPath = (publicUrl) => {
  if (!isManagedUploadUrl(publicUrl)) {
    throw new ApiValidationError("图片地址不正确");
  }

  return join(process.cwd(), "public", ...publicUrl.split("/").filter(Boolean));
};

export const ensureBlobFile = async (publicUrl, buffer) => {
  const path = publicUploadPath(publicUrl);
  await mkdir(dirname(path), { recursive: true });

  try {
    await writeFile(path, buffer, { flag: "wx" });
    return { created: true, path };
  } catch (error) {
    if (error?.code === "EEXIST") {
      return { created: false, path };
    }
    throw error;
  }
};

const runWithClient = async (client, callback) => {
  if (client?.transaction) {
    return client.transaction(callback);
  }

  return callback(client ?? db);
};

const claimExpiresAt = (now) => new Date(now.getTime() + UPLOAD_CLAIM_TTL_MS);

export const createUploadClaimForProcessedImage = async ({
  userId,
  purpose,
  processedImage,
  now = new Date(),
  client = db,
}) => {
  const contentHash = computeContentHash(processedImage.buffer);
  const publicUrl = buildManagedUploadUrl(contentHash, processedImage.extension);

  return runWithClient(client, async (tx) => {
    await tx
      .insert(UploadAssets)
      .values({
        contentHash,
        publicUrl,
        mimeType: processedImage.mimeType,
        extension: processedImage.extension,
        size: processedImage.size,
        width: processedImage.width,
        height: processedImage.height,
        status: "active",
        deleteAfter: null,
        updatedAt: now,
      })
      .onDuplicateKeyUpdate({
        set: {
          status: sql`case when ${UploadAssets.status} = 'deleting_locked' then ${UploadAssets.status} else 'active' end`,
          deleteAfter: sql`case when ${UploadAssets.status} = 'deleting_locked' then ${UploadAssets.deleteAfter} else null end`,
          updatedAt: now,
        },
      });

    const assets = await tx
      .select({ id: UploadAssets.id, status: UploadAssets.status })
      .from(UploadAssets)
      .where(eq(UploadAssets.contentHash, contentHash))
      .limit(1);

    if (assets.length === 0) {
      throw new ApiValidationError("上传资产保存失败");
    }

    if (assets[0].status === "deleting_locked") {
      throw new ApiValidationError("文件正在清理，请稍后重试");
    }

    await ensureBlobFile(publicUrl, processedImage.buffer);

    await tx.insert(UploadClaims).values({
      assetId: assets[0].id,
      userId,
      purpose,
      status: "temporary",
      expiresAt: claimExpiresAt(now),
      updatedAt: now,
    });

    return {
      url: publicUrl,
      mimeType: processedImage.mimeType,
      width: processedImage.width,
      height: processedImage.height,
      size: processedImage.size,
    };
  });
};

export const findCurrentUploadClaim = async ({
  userId,
  purpose,
  url,
  now = new Date(),
  client = db,
}) => {
  if (!isManagedUploadUrl(url)) {
    throw new ApiValidationError("上传凭证无效或已过期");
  }

  const claims = await client
    .select({
      id: UploadClaims.id,
      assetId: UploadClaims.assetId,
    })
    .from(UploadClaims)
    .innerJoin(UploadAssets, eq(UploadClaims.assetId, UploadAssets.id))
    .where(and(
      eq(UploadAssets.publicUrl, url),
      eq(UploadClaims.userId, userId),
      eq(UploadClaims.purpose, purpose),
      eq(UploadClaims.status, "temporary"),
      gt(UploadClaims.expiresAt, now),
    ))
    .limit(1);

  if (claims.length === 0) {
    throw new ApiValidationError("上传凭证无效或已过期");
  }

  return {
    claimId: claims[0].id,
    assetId: claims[0].assetId,
    url,
  };
};

export const findCurrentUploadClaims = async ({
  userId,
  purpose,
  urls,
  now = new Date(),
  client = db,
}) => {
  const uniqueUrls = [...new Set(urls.filter(Boolean))];
  const claims = new Map();

  for (const url of uniqueUrls) {
    claims.set(url, await findCurrentUploadClaim({
      userId,
      purpose,
      url,
      now,
      client,
    }));
  }

  return claims;
};

const markClaimsAttached = async (client, claimIds, now) => {
  const uniqueClaimIds = [...new Set(claimIds)];
  if (uniqueClaimIds.length === 0) {
    return;
  }

  await client
    .update(UploadClaims)
    .set({ status: "attached", updatedAt: now })
    .where(inArray(UploadClaims.id, uniqueClaimIds));
};

export const attachPostUploadReferences = async ({
  userId,
  postId,
  coverImage,
  images,
  claims,
  now = new Date(),
  client = db,
}) => {
  const references = [];
  if (coverImage) {
    references.push({ url: coverImage, entityType: "post_cover" });
  }
  for (const image of images) {
    if (image) {
      references.push({ url: image, entityType: "post_image" });
    }
  }

  const claimIds = [];
  for (const reference of references) {
    const claim = claims.get(reference.url);
    if (!claim) {
      throw new ApiValidationError("上传凭证无效或已过期");
    }

    claimIds.push(claim.claimId);
    await client
      .insert(UploadReferences)
      .values({
        assetId: claim.assetId,
        userId,
        entityType: reference.entityType,
        entityId: postId,
      })
      .onDuplicateKeyUpdate({ set: { id: sql`id` } });
  }

  await markClaimsAttached(client, claimIds, now);
};

export const replaceAvatarUploadReference = async ({
  userId,
  avatarUrl,
  previousAvatarUrl,
  claim,
  now = new Date(),
  client = db,
}) => {
  if (previousAvatarUrl === avatarUrl && avatarUrl) {
    return;
  }

  await client
    .delete(UploadReferences)
    .where(and(
      eq(UploadReferences.userId, userId),
      eq(UploadReferences.entityType, "user_avatar"),
      eq(UploadReferences.entityId, userId),
    ));

  if (!avatarUrl) {
    return;
  }

  if (!claim) {
    throw new ApiValidationError("上传凭证无效或已过期");
  }

  await client
    .insert(UploadReferences)
    .values({
      assetId: claim.assetId,
      userId,
      entityType: "user_avatar",
      entityId: userId,
    })
    .onDuplicateKeyUpdate({ set: { id: sql`id` } });

  await markClaimsAttached(client, [claim.claimId], now);
};
