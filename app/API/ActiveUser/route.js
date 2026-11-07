import { and, asc, count, desc, eq } from "drizzle-orm";
import { db } from "../../../database/index";
import { posts, Users } from "../../../database/schema";
import { ApiResponse, ErrorCode } from "../../../lib/api-response.mjs";
import { CONTENT_STATUS } from "../../../lib/content-status.mjs";

export async function GET() {
  try {
    const postCount = count();
    const data = await db.select({
      userId: Users.userId,
      user_name: Users.nickname,
      avatar: Users.avatar,
      active_score: postCount,
    })
      .from(posts)
      .innerJoin(Users, eq(posts.userId, Users.userId))
      .where(and(eq(posts.status, CONTENT_STATUS.ACTIVE), eq(Users.userStatus, "active")))
      .groupBy(Users.userId, Users.nickname, Users.avatar)
      .orderBy(desc(postCount), asc(Users.userId))
      .limit(5);
    return ApiResponse.success(data);
  } catch (error) {
    console.error("获取活跃作者失败", error);
    return ApiResponse.error(ErrorCode.DATABASE_ERROR, "获取活跃作者失败");
  }
}
