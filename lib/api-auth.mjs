import { ApiResponse, ErrorCode } from "./api-response.mjs";
import { AUTH_COOKIE_NAME } from "./auth-cookie.mjs";
import { verifyToken } from "./jwt.js";

const DEFAULT_UNAUTHORIZED_MESSAGE = "未登录或登录已失效";

export const requireAuth = async (request, options = {}) => {
  const missingMessage = options.missingMessage ?? DEFAULT_UNAUTHORIZED_MESSAGE;
  const invalidMessage = options.invalidMessage ?? DEFAULT_UNAUTHORIZED_MESSAGE;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return {
      ok: false,
      response: ApiResponse.error(ErrorCode.UNAUTHORIZED, missingMessage),
    };
  }

  const payload = await verifyToken(token);

  if (!payload) {
    return {
      ok: false,
      response: ApiResponse.error(ErrorCode.UNAUTHORIZED, invalidMessage),
    };
  }

  return {
    ok: true,
    payload,
    userId: payload.userId,
  };
};
