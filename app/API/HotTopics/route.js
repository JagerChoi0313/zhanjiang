import { and, count, desc, inArray, eq, asc } from "drizzle-orm";
import { db } from "../../../database/index";
import { posts } from "../../../database/schema";
import { ApiResponse, ErrorCode } from "../../../lib/api-response.mjs";
import { POST_LOCATIONS } from "../../../lib/community.mjs";
import { CONTENT_STATUS } from "../../../lib/content-status.mjs";

export async function GET() {
  try {
    const postCount = count();
    const data = await db.select({ location: posts.location, postCount })
      .from(posts)
      .where(and(eq(posts.status, CONTENT_STATUS.ACTIVE), inArray(posts.location, POST_LOCATIONS)))
      .groupBy(posts.location)
      .orderBy(desc(postCount), asc(posts.location));
    return ApiResponse.success(data);
  } catch (error) {
    console.error("获取热门话题失败", error);
    return ApiResponse.error(ErrorCode.DATABASE_ERROR, "获取热门话题失败");
  }
}
