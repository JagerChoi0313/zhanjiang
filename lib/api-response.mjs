import { NextResponse } from "next/server.js";

import { ErrorCode, ErrorCodeMeta } from "./error-code.mjs";

const buildBody = ({ success, code, message, data, meta }) => {
  const body = {
    success,
    code,
    message,
  };

  if (data !== undefined) {
    body.data = data;
  }

  if (meta !== undefined) {
    body.meta = meta;
  }

  return body;
};

export class ApiResponse {
  static success(data, message = ErrorCodeMeta[ErrorCode.SUCCESS].message, options = {}) {
    const status = options.status ?? ErrorCodeMeta[ErrorCode.SUCCESS].status;

    return NextResponse.json(
      buildBody({
        success: true,
        code: ErrorCode.SUCCESS,
        message,
        data,
        meta: options.meta,
      }),
      { status, headers: options.headers },
    );
  }

  static created(data, message = "创建成功", options = {}) {
    return ApiResponse.success(data, message, { ...options, status: 201 });
  }

  static paginated(data, pagination, message = ErrorCodeMeta[ErrorCode.SUCCESS].message, options = {}) {
    return ApiResponse.success(data, message, {
      ...options,
      meta: {
        ...(options.meta ?? {}),
        pagination,
      },
    });
  }

  static error(code = ErrorCode.INTERNAL_ERROR, message, options = {}) {
    const meta = ErrorCodeMeta[code] ?? ErrorCodeMeta[ErrorCode.INTERNAL_ERROR];
    const status = options.status ?? meta.status;

    return NextResponse.json(
      buildBody({
        success: false,
        code,
        message: message ?? meta.message,
        data: options.data,
        meta: options.meta,
      }),
      { status, headers: options.headers },
    );
  }
}

export const apiSuccess = ApiResponse.success.bind(ApiResponse);
export const apiCreated = ApiResponse.created.bind(ApiResponse);
export const apiPaginated = ApiResponse.paginated.bind(ApiResponse);
export const apiError = ApiResponse.error.bind(ApiResponse);
export { ErrorCode };
