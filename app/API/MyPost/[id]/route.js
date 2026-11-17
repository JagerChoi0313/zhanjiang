import { db } from '../../../../database/index.js';
import { posts } from '../../../../database/schema.js';
import { and, eq } from 'drizzle-orm';
import { requireAuth } from '../../../../lib/api-auth.mjs';
import { requireCsrf } from '../../../../lib/csrf.mjs';
import { ApiResponse, ErrorCode } from '../../../../lib/api-response.mjs';
import { CONTENT_STATUS } from '../../../../lib/content-status.mjs';
import { ApiValidationError, positiveInt, toApiValidationResponse } from '../../../../lib/api-validation.mjs';

export async function DELETE(request, { params }) {
  try {
    const csrf = await requireCsrf(request);
    if (!csrf.ok) return csrf.response;
    const auth = await requireAuth(request);
    if (!auth.ok) return auth.response;
    const id = positiveInt((await params).id, '帖子ID');
    // Ownership and active status are part of the write itself, avoiding a check/write race.
    const [result] = await db.update(posts)
      .set({ status: CONTENT_STATUS.USER_DELETED })
      .where(and(eq(posts.id, id), eq(posts.userId, auth.userId), eq(posts.status, CONTENT_STATUS.ACTIVE)));
    if (!result.affectedRows) {
      return ApiResponse.error(ErrorCode.NOT_FOUND, '帖子不存在、已删除或不属于你');
    }
    return ApiResponse.success({ id }, '帖子已删除');
  } catch (error) {
    if (error instanceof ApiValidationError) return toApiValidationResponse(error);
    console.error('Delete own post error:', error);
    return ApiResponse.error(ErrorCode.INTERNAL_ERROR, '删除失败，请稍后重试');
  }
}
