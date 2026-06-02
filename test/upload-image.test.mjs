import assert from "node:assert/strict";
import test from "node:test";

import sharp from "sharp";

import { ApiValidationError, MAX_UPLOAD_BYTES } from "../lib/api-validation.mjs";
import { processUploadImage } from "../lib/upload-image.mjs";

const createImageBuffer = (width, height, format = "png") => (
  sharp({
    create: {
      width,
      height,
      channels: 3,
      background: "#b84a2f",
    },
  })
    .toFormat(format)
    .toBuffer()
);

test("processUploadImage converts avatars to sanitized 512px webp images", async () => {
  const input = await createImageBuffer(900, 600, "jpeg");
  const result = await processUploadImage(input, { purpose: "avatar" });
  const metadata = await sharp(result.buffer).metadata();

  assert.equal(result.extension, "webp");
  assert.equal(result.mimeType, "image/webp");
  assert.equal(result.width, 512);
  assert.equal(result.height, 512);
  assert.equal(metadata.format, "webp");
  assert.equal(metadata.width, 512);
  assert.equal(metadata.height, 512);
  assert.equal(metadata.exif, undefined);
});

test("processUploadImage preserves post image type and limits long edges", async () => {
  const input = await createImageBuffer(2600, 1300, "png");
  const result = await processUploadImage(input, { purpose: "post" });
  const metadata = await sharp(result.buffer).metadata();

  assert.equal(result.extension, "png");
  assert.equal(result.mimeType, "image/png");
  assert.equal(result.width, 1920);
  assert.equal(result.height, 960);
  assert.equal(metadata.format, "png");
  assert.equal(metadata.exif, undefined);
});

test("processUploadImage rejects invalid image bytes unsupported formats and huge dimensions", async () => {
  await assert.rejects(
    () => processUploadImage(Buffer.from("not-an-image"), { purpose: "post" }),
    (error) => error instanceof ApiValidationError && error.message === "文件不是有效图片",
  );

  const gifBytes = Uint8Array.from([
    0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00,
    0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0xff, 0x2c, 0x00, 0x00, 0x00, 0x00,
    0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02, 0x44, 0x01, 0x00, 0x3b,
  ]);
  await assert.rejects(
    () => processUploadImage(Buffer.from(gifBytes), { purpose: "post" }),
    (error) => error instanceof ApiValidationError && error.message === "仅支持上传JPG、PNG或WEBP图片",
  );

  const tooLargeDimensions = await createImageBuffer(4097, 10, "png");
  await assert.rejects(
    () => processUploadImage(tooLargeDimensions, { purpose: "post" }),
    (error) => error instanceof ApiValidationError && error.message === "图片尺寸不能超过4096x4096",
  );

  await assert.rejects(
    () => processUploadImage(Buffer.alloc(MAX_UPLOAD_BYTES + 1), { purpose: "post" }),
    (error) => error instanceof ApiValidationError && error.message === "图片大小不能超过5MB",
  );
});
