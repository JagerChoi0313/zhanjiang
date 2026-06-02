import { and, desc, like, ne, or, sql, eq } from "drizzle-orm";

import { db } from "../../../../database/index.js";
import { posts, Users } from "../../../../database/schema.js";
import { ApiResponse, ErrorCode } from "../../../../lib/api-response.mjs";
import { requireSuperAdmin } from "../../../../lib/admin-auth.mjs";
import { CONTENT_STATUS } from "../../../../lib/content-status.mjs";
import {
  ApiValidationError,
  assertAllowedValue,
  optionalIntRange,
  optionalString,
  positiveInt,
  toApiValidationResponse,
} from "../../../../lib/api-validation.mjs";

export const dynamic = "force-dynamic";

const buildStatusCondition = (status) => {
  if (status === "deleted") {
    return ne(posts.status, CONTENT_STATUS.ACTIVE);
  }
  if (status === "0") {
    return eq(posts.status, CONTENT_STATUS.USER_DELETED);
  }
  if (status === "2") {
    return eq(posts.status, CONTENT_STATUS.ADMIN_DELETED);
  }
  if (status === "all") {
    return undefined;
  }
  return eq(posts.status, CONTENT_STATUS.ACTIVE);
};

export async function GET(request) {
  try {
    const auth = await requireSuperAdmin(request);
    if (!auth.ok) {
      return auth.response;
    }

    const { searchParams } = new URL(request.url);
    const pageParam = searchParams.get("page");
    const page = pageParam === null ? 1 : positiveInt(pageParam, "页码");
    const pageSize = optionalIntRange(searchParams.get("pageSize"), 1, 50, "每页数量") ?? 10;
    const keyword = optionalString(searchParams.get("q"), "搜索关键词", { maxLength: 100 });
    const status = assertAllowedValue(searchParams.get("status") ?? "1", ["1", "0", "2", "active", "deleted", "all"], "状态");
    const conditions = [
      buildStatusCondition(status),
      keyword
        ? or(
            like(posts.title, `%${keyword}%`),
            like(posts.description, `%${keyword}%`),
          )
        : undefined,
    ].filter(Boolean);
    const condition = conditions.length > 0 ? and(...conditions) : undefined;

    const totalResult = await db
      .select({ count: sql`count(*)` })
      .from(posts)
      .where(condition);
    const totalCount = Number(totalResult[0]?.count ?? 0);

    const data = await db
      .select({
        id: posts.id,
        title: posts.title,
        description: posts.description,
        category: posts.category,
        location: posts.location,
        createdAt: posts.createdAt,
        status: posts.status,
        author: {
          userId: Users.userId,
          nickname: Users.nickname,
          email: Users.email,
        },
      })
      .from(posts)
      .leftJoin(Users, eq(posts.userId, Users.userId))
      .where(condition)
      .orderBy(desc(posts.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    return ApiResponse.paginated(data, {
      totalCount,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: page,
    });
  } catch (error) {
    if (error instanceof ApiValidationError) {
      return toApiValidationResponse(error);
    }
    console.error("Admin posts fetch error:", error);
    return ApiResponse.error(ErrorCode.DATABASE_ERROR, "获取帖子列表失败");
  }
}
