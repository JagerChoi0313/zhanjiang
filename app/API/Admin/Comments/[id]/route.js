import { eq } from "drizzle-orm";

import { db } from "../../../../../database/index.js";
import { Comments } from "../../../../../database/schema.js";
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
    const commentId = positiveInt(id, "评论ID");
    const targetComments = await db
      .select({
        id: Comments.id,
        status: Comments.status,
      })
      .from(Comments)
      .where(eq(Comments.id, commentId))
      .limit(1);

    const targetComment = targetComments[0];
    if (!targetComment) {
      return ApiResponse.error(ErrorCode.NOT_FOUND, "未找到评论");
    }

    if (targetComment.status !== CONTENT_STATUS.ADMIN_DELETED) {
      await db
        .update(Comments)
        .set({
          status: CONTENT_STATUS.ADMIN_DELETED,
        })
        .where(eq(Comments.id, commentId));
    }

    return ApiResponse.success({ commentId }, "评论已删除");
  } catch (error) {
    if (error instanceof ApiValidationError) {
      return toApiValidationResponse(error);
    }
    console.error("Admin comment delete error:", error);
    return ApiResponse.error(ErrorCode.DATABASE_ERROR, "删除评论失败");
  }
}
