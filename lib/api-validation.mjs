import { ApiResponse, ErrorCode } from "./api-response.mjs";

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export class ApiValidationError extends Error {
  constructor(message, code = ErrorCode.VALIDATION_ERROR) {
    super(message);
    this.name = "ApiValidationError";
    this.code = code;
  }
}

export const toApiValidationResponse = (error) => {
  if (error instanceof ApiValidationError) {
    return ApiResponse.error(error.code, error.message);
  }

  return ApiResponse.error(ErrorCode.INTERNAL_ERROR, "服务器内部错误");
};

export const readJsonBody = async (request) => {
  try {
    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      throw new ApiValidationError("请求体必须是合法JSON对象");
    }
    return body;
  } catch (error) {
    if (error instanceof ApiValidationError) {
      throw error;
    }
    throw new ApiValidationError("请求体必须是合法JSON");
  }
};

export const requiredString = (value, field, options = {}) => {
  if (typeof value !== "string") {
    throw new ApiValidationError(`${field}不能为空`);
  }

  const trimmed = value.trim();
  if (!trimmed) {
    throw new ApiValidationError(`${field}不能为空`);
  }

  if (options.maxLength && trimmed.length > options.maxLength) {
    throw new ApiValidationError(`${field}不能超过${options.maxLength}个字符`);
  }

  return trimmed;
};

export const optionalString = (value, field, options = {}) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new ApiValidationError(`${field}必须是文本`);
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  if (options.maxLength && trimmed.length > options.maxLength) {
    throw new ApiValidationError(`${field}不能超过${options.maxLength}个字符`);
  }

  return trimmed;
};

export const positiveInt = (value, field) => {
  const text = typeof value === "number" ? String(value) : value;
  if (typeof text !== "string" || !/^[1-9]\d*$/.test(text.trim())) {
    throw new ApiValidationError(`${field}必须是正整数`);
  }

  const parsed = Number(text);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    throw new ApiValidationError(`${field}必须是正整数`);
  }

  return parsed;
};

export const digitString = (value, field) => {
  if (typeof value !== "string" || !/^\d+$/.test(value.trim())) {
    throw new ApiValidationError(`${field}必须是数字`);
  }

  return value.trim();
};

export const optionalIntRange = (value, min, max, field) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const text = typeof value === "number" ? String(value) : value;
  if (typeof text !== "string" || !/^-?\d+$/.test(text.trim())) {
    throw new ApiValidationError(`${field}必须是整数`);
  }

  const parsed = Number(text);
  if (parsed < min || parsed > max) {
    throw new ApiValidationError(`${field}必须在${min}到${max}之间`);
  }

  return parsed;
};

export const isEmail = (value) => (
  typeof value === "string"
  && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
);

export const isPhone = (value) => (
  typeof value === "string"
  && /^1[3-9]\d{9}$/.test(value.trim())
);

export const assertAllowedValue = (value, allowedValues, field) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (!allowedValues.includes(value)) {
    throw new ApiValidationError(`${field}不正确`);
  }

  return value;
};

export const validateUploadFile = (file) => {
  if (!file) {
    throw new ApiValidationError("未找到文件");
  }

  if (typeof file.size !== "number" || file.size <= 0) {
    throw new ApiValidationError("文件内容不能为空");
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    throw new ApiValidationError("图片大小不能超过5MB");
  }

  return undefined;
};

export const optionalAvatarUrl = (value) => {
  if (value === undefined) {
    return undefined;
  }

  if (value === null || value === "") {
    return null;
  }

  const avatar = optionalString(value, "头像地址");
  if (avatar === undefined) {
    return null;
  }

  if (!/^\/upload\/blob\/[a-f0-9]{64}\.webp$/.test(avatar)) {
    throw new ApiValidationError("头像地址不正确");
  }

  return avatar;
};
