import { eq } from "drizzle-orm";

import { db } from "../../../../../database/index.js";
import { posts } from "../../../../../database/schema.js";
import { ApiResponse, ErrorCode } from "../../../../../lib/api-response.mjs";
import { requireSuperAdmin } from "../../../../../lib/admin-auth.mjs";
import { CONTENT_STATUS } from "../../../../../lib/content-status.mjs";
import { requireCsrf } from "../../../../../lib/csrf.mjs";
import {
  ApiValidationError,
  positiveInt,
  toApiValidationResponse,
} from "../../../../../lib/api-validation.mjs";

export const dynamic = "force-dynamic";

export async function DELETE(request, { params }) {
  try {
    const csrf = await requireCsrf(request);
    if (!csrf.ok) {
      return csrf.response;
    }

    const auth = await requireSuperAdmin(request);
    if (!auth.ok) {
      return auth.response;
    }

    const { id } = await params;
    const postId = positiveInt(id, "帖子ID");
    const targetPosts = await db
      .select({
        id: posts.id,
        status: posts.status,
      })
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1);

    const targetPost = targetPosts[0];
    if (!targetPost) {
      return ApiResponse.error(ErrorCode.NOT_FOUND, "未找到帖子");
    }

    if (targetPost.status !== CONTENT_STATUS.ADMIN_DELETED) {
      await db
        .update(posts)
        .set({
          status: CONTENT_STATUS.ADMIN_DELETED,
        })
        .where(eq(posts.id, postId));
    }

    return ApiResponse.success({ postId }, "帖子已删除");
  } catch (error) {
    if (error instanceof ApiValidationError) {
      return toApiValidationResponse(error);
    }
    console.error("Admin post delete error:", error);
    return ApiResponse.error(ErrorCode.DATABASE_ERROR, "删除帖子失败");
  }
}
