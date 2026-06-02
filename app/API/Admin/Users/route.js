import { desc, like, or, sql } from "drizzle-orm";

import { db } from "../../../../database/index.js";
import { Users } from "../../../../database/schema.js";
import { ApiResponse, ErrorCode } from "../../../../lib/api-response.mjs";
import { requireSuperAdmin } from "../../../../lib/admin-auth.mjs";
import {
  ApiValidationError,
  optionalIntRange,
  optionalString,
  positiveInt,
  toApiValidationResponse,
} from "../../../../lib/api-validation.mjs";

export const dynamic = "force-dynamic";

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
    const condition = keyword
      ? or(
          like(Users.email, `%${keyword}%`),
          like(Users.nickname, `%${keyword}%`),
        )
      : undefined;

    const totalResult = await db
      .select({ count: sql`count(*)` })
      .from(Users)
      .where(condition);
    const totalCount = Number(totalResult[0]?.count ?? 0);

    const data = await db
      .select({
        userId: Users.userId,
        nickname: Users.nickname,
        email: Users.email,
        userRole: Users.userRole,
        userStatus: Users.userStatus,
        createdAt: Users.createdAt,
      })
      .from(Users)
      .where(condition)
      .orderBy(desc(Users.createdAt))
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
    console.error("Admin users fetch error:", error);
    return ApiResponse.error(ErrorCode.DATABASE_ERROR, "获取用户列表失败");
  }
}
