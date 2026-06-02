import { fileTypeFromBuffer } from "file-type";
import sharp from "sharp";

import { ApiValidationError, MAX_UPLOAD_BYTES } from "./api-validation.mjs";

export const MAX_IMAGE_DIMENSION = 4096;
export const POST_IMAGE_MAX_EDGE = 1920;
export const AVATAR_SIZE = 512;

const ALLOWED_IMAGE_TYPES = {
  "image/jpeg": {
    extension: "jpg",
    encode: (image) => image.jpeg({ quality: 82, mozjpeg: true }),
  },
  "image/png": {
    extension: "png",
    encode: (image) => image.png({ compressionLevel: 9 }),
  },
  "image/webp": {
    extension: "webp",
    encode: (image) => image.webp({ quality: 82 }),
  },
};

export const normalizeUploadPurpose = (purpose) => {
  if (purpose === undefined || purpose === null || purpose === "") {
    return "post";
  }

  if (typeof purpose !== "string") {
    throw new ApiValidationError("上传用途不正确");
  }

  const normalized = purpose.trim();
  if (normalized !== "post" && normalized !== "avatar") {
    throw new ApiValidationError("上传用途不正确");
  }

  return normalized;
};

const assertProcessableBuffer = (buffer) => {
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    throw new ApiValidationError("文件内容不能为空");
  }

  if (buffer.length > MAX_UPLOAD_BYTES) {
    throw new ApiValidationError("图片大小不能超过5MB");
  }
};

const readImageMetadata = async (buffer) => {
  try {
    const metadata = await sharp(buffer).metadata();
    if (!metadata.width || !metadata.height) {
      throw new ApiValidationError("文件不是有效图片");
    }
    return metadata;
  } catch (error) {
    if (error instanceof ApiValidationError) {
      throw error;
    }
    throw new ApiValidationError("文件不是有效图片");
  }
};

const encodeImage = async (image, encoder, mimeType, extension) => {
  try {
    const { data, info } = await encoder(image).toBuffer({ resolveWithObject: true });
    return {
      buffer: data,
      extension,
      mimeType,
      width: info.width,
      height: info.height,
      size: data.length,
    };
  } catch {
    throw new ApiValidationError("文件不是有效图片");
  }
};

export const processUploadImage = async (buffer, options = {}) => {
  assertProcessableBuffer(buffer);

  const purpose = normalizeUploadPurpose(options.purpose);
  const detected = await fileTypeFromBuffer(buffer);
  if (!detected) {
    throw new ApiValidationError("文件不是有效图片");
  }

  const imageType = ALLOWED_IMAGE_TYPES[detected.mime];
  if (!imageType) {
    throw new ApiValidationError("仅支持上传JPG、PNG或WEBP图片");
  }

  const metadata = await readImageMetadata(buffer);
  if (metadata.width > MAX_IMAGE_DIMENSION || metadata.height > MAX_IMAGE_DIMENSION) {
    throw new ApiValidationError("图片尺寸不能超过4096x4096");
  }

  const baseImage = sharp(buffer).rotate();

  if (purpose === "avatar") {
    return encodeImage(
      baseImage.resize(AVATAR_SIZE, AVATAR_SIZE, { fit: "cover" }),
      (image) => image.webp({ quality: 82 }),
      "image/webp",
      "webp",
    );
  }

  return encodeImage(
    baseImage.resize({
      width: POST_IMAGE_MAX_EDGE,
      height: POST_IMAGE_MAX_EDGE,
      fit: "inside",
      withoutEnlargement: true,
    }),
    imageType.encode,
    detected.mime,
    imageType.extension,
  );
};
