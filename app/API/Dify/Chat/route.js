import { ApiResponse, ErrorCode } from "../../../../lib/api-response.mjs";
import { requireAuth } from "../../../../lib/api-auth.mjs";
import { ApiValidationError, MAX_UPLOAD_BYTES, readJsonBody, requiredString, toApiValidationResponse } from "../../../../lib/api-validation.mjs";
import { requireCsrf } from "../../../../lib/csrf.mjs";

import { processUploadImage } from "../../../../lib/upload-image.mjs";

export const dynamic = "force-dynamic";

const DEFAULT_DIFY_API_URL = "https://api.dify.ai/v1";
const DIFY_TIMEOUT_MS = 45_000;
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

const callDifyChat = async ({ query, userId, image }) => {
  const apiKey = (image ? process.env.DIFY_VISION_API_KEY : process.env.DIFY_API_KEY)?.trim();
  if (!apiKey) {
    return {
      ok: false,
      response: ApiResponse.error(ErrorCode.EXTERNAL_SERVICE_ERROR, image ? "拍照识美食服务未配置" : "AI服务未配置", {
        headers: { "Cache-Control": "no-store" },
      }),
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DIFY_TIMEOUT_MS);

  try {
    const user = `zhanjiang_user_${userId}`;
    let files;
    if (image) {
      const form = new FormData();
      form.set("file", new Blob([image.buffer], { type: image.mimeType }), `food.${image.extension}`);
      form.set("user", user);
      const upload = await fetch(`${normalizeDifyApiUrl()}/files/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}` },
        body: form,
        signal: controller.signal,
      });
      if (!upload.ok) throw new Error("Dify image upload failed");
      const { id } = await upload.json();
      if (typeof id !== "string" || !id) throw new Error("Missing Dify file ID");
      files = [{ type: "image", transfer_method: "local_file", upload_file_id: id }];
    }

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
        user,
        ...(files ? { files } : {}),
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
        answer: typeof payload.answer === "string"
          ? payload.answer.replace(/<think>[\s\S]*?(?:<\/think>|$)/gi, "").trim()
          : "",
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
      response: ApiResponse.error(ErrorCode.EXTERNAL_SERVICE_ERROR, error?.name === "AbortError"
        ? "AI回复超时，请稍后再试"
        : "AI服务暂时不可用", {
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

    const multipart = request.headers.get("content-type")?.startsWith("multipart/form-data");
    let photo;
    let query;
    if (multipart) {
      const form = await request.formData().catch(() => {
        throw new ApiValidationError("无法读取图片上传请求");
      });
      const images = form.getAll("image");
      [photo] = images;
      if (images.length !== 1 || !(photo instanceof File) || !photo.size) {
        throw new ApiValidationError("请选择一张美食照片");
      }
      if (photo.size > MAX_UPLOAD_BYTES) {
        throw new ApiValidationError("图片大小不能超过5MB");
      }
      const prompt = form.get("query");
      query = prompt === null || (typeof prompt === "string" && !prompt.trim())
        ? "这是什么？"
        : requiredString(prompt, "问题");
    } else {
      const body = await readJsonBody(request);
      query = requiredString(body.query, "问题");
    }
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
      image: photo ? await processUploadImage(Buffer.from(await photo.arrayBuffer())) : undefined,
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
