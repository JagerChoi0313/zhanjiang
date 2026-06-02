import { ApiResponse, ErrorCode } from "../../../../lib/api-response.mjs";
import { requireAuth } from "../../../../lib/api-auth.mjs";
import { ApiValidationError, readJsonBody, requiredString, toApiValidationResponse } from "../../../../lib/api-validation.mjs";
import { requireCsrf } from "../../../../lib/csrf.mjs";

export const dynamic = "force-dynamic";

const DEFAULT_DIFY_API_URL = "https://api.dify.ai/v1";
const DIFY_TIMEOUT_MS = 15_000;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 20;

const rateLimitBuckets = new Map();

const withNoStore = (response) => {
  response.headers.set("Cache-Control", "no-store");
  return response;
};

const normalizeDifyApiUrl = () => (
  process.env.DIFY_API_URL || DEFAULT_DIFY_API_URL
).replace(/\/+$/, "");

const checkRateLimit = (userId, now = Date.now()) => {
  const key = String(userId);
  const bucket = rateLimitBuckets.get(key);

  if (!bucket || now - bucket.windowStartedAt >= RATE_LIMIT_WINDOW_MS) {
    rateLimitBuckets.set(key, {
      windowStartedAt: now,
      count: 1,
    });
    return true;
  }

  if (bucket.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  bucket.count += 1;
  return true;
};

const callDifyChat = async ({ query, userId }) => {
  const apiKey = process.env.DIFY_API_KEY?.trim();
  if (!apiKey) {
    return {
      ok: false,
      response: ApiResponse.error(ErrorCode.EXTERNAL_SERVICE_ERROR, "AI服务未配置", {
        headers: { "Cache-Control": "no-store" },
      }),
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DIFY_TIMEOUT_MS);

  try {
    const response = await fetch(`${normalizeDifyApiUrl()}/chat-messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: {},
        query,
        response_mode: "blocking",
        user: `zhanjiang_user_${userId}`,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      console.error("Dify Chat upstream failed", { status: response.status });
      return {
        ok: false,
        response: ApiResponse.error(ErrorCode.EXTERNAL_SERVICE_ERROR, "AI服务暂时不可用", {
          headers: { "Cache-Control": "no-store" },
        }),
      };
    }

    const payload = await response.json();
    return {
      ok: true,
      data: {
        answer: typeof payload.answer === "string" ? payload.answer : "",
        suggestedQuestions: Array.isArray(payload.metadata?.suggested_questions)
          ? payload.metadata.suggested_questions.filter((question) => typeof question === "string")
          : [],
      },
    };
  } catch (error) {
    console.error("Dify Chat request failed", {
      name: error?.name,
      message: error?.name === "AbortError" ? "request timeout" : "request failed",
    });
    return {
      ok: false,
      response: ApiResponse.error(ErrorCode.EXTERNAL_SERVICE_ERROR, "AI服务暂时不可用", {
        headers: { "Cache-Control": "no-store" },
      }),
    };
  } finally {
    clearTimeout(timeout);
  }
};

export async function POST(request) {
  try {
    const csrf = await requireCsrf(request);
    if (!csrf.ok) {
      return withNoStore(csrf.response);
    }

    const auth = await requireAuth(request, {
      missingMessage: "未登录，请先登录",
      invalidMessage: "登录过期，请重新登录",
    });
    if (!auth.ok) {
      return withNoStore(auth.response);
    }

    const body = await readJsonBody(request);
    const query = requiredString(body.query, "问题");
    if (query.length > 500) {
      throw new ApiValidationError("问题长度不能超过500个字符");
    }

    if (!checkRateLimit(auth.userId)) {
      return ApiResponse.error(ErrorCode.RATE_LIMITED, "请求过于频繁，请稍后再试", {
        headers: { "Cache-Control": "no-store" },
      });
    }

    const dify = await callDifyChat({
      query,
      userId: auth.userId,
    });
    if (!dify.ok) {
      return dify.response;
    }

    return ApiResponse.success(dify.data, "AI回复成功", {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (error instanceof ApiValidationError) {
      return withNoStore(toApiValidationResponse(error));
    }

    console.error("Dify Chat route failed", {
      name: error?.name,
      message: "unexpected route error",
    });
    return ApiResponse.error(ErrorCode.INTERNAL_ERROR, "服务器内部错误", {
      headers: { "Cache-Control": "no-store" },
    });
  }
}

export const __resetDifyChatRateLimit = () => {
  rateLimitBuckets.clear();
};
