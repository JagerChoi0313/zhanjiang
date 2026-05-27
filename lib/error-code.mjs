export const ErrorCode = Object.freeze({
  SUCCESS: "SUCCESS",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  DATABASE_ERROR: "DATABASE_ERROR",
  UPLOAD_ERROR: "UPLOAD_ERROR",
  EXTERNAL_SERVICE_ERROR: "EXTERNAL_SERVICE_ERROR",
  INTERNAL_ERROR: "INTERNAL_ERROR",
});

export const ErrorCodeMeta = Object.freeze({
  [ErrorCode.SUCCESS]: {
    status: 200,
    message: "操作成功",
  },
  [ErrorCode.VALIDATION_ERROR]: {
    status: 400,
    message: "请求参数不正确",
  },
  [ErrorCode.UNAUTHORIZED]: {
    status: 401,
    message: "未登录或登录已失效",
  },
  [ErrorCode.FORBIDDEN]: {
    status: 403,
    message: "没有权限执行该操作",
  },
  [ErrorCode.NOT_FOUND]: {
    status: 404,
    message: "资源不存在",
  },
  [ErrorCode.CONFLICT]: {
    status: 409,
    message: "资源状态冲突",
  },
  [ErrorCode.DATABASE_ERROR]: {
    status: 500,
    message: "数据库操作失败",
  },
  [ErrorCode.UPLOAD_ERROR]: {
    status: 500,
    message: "文件上传失败",
  },
  [ErrorCode.EXTERNAL_SERVICE_ERROR]: {
    status: 502,
    message: "外部服务调用失败",
  },
  [ErrorCode.INTERNAL_ERROR]: {
    status: 500,
    message: "服务器内部错误",
  },
});
