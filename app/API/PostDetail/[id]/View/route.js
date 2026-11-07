import { createHash, randomUUID } from "node:crypto";
import { and, eq, sql, count } from "drizzle-orm";
import { db } from "../../../../../database/index";
import { posts, PostViews } from "../../../../../database/schema";
import { ApiResponse, ErrorCode } from "../../../../../lib/api-response.mjs";
import { requireCsrf } from "../../../../../lib/csrf.mjs";
import { CONTENT_STATUS } from "../../../../../lib/content-status.mjs";
import { ApiValidationError, positiveInt, toApiValidationResponse } from "../../../../../lib/api-validation.mjs";

export async function POST(request, { params }) {
  try {
    const csrf = await requireCsrf(request);
    if (!csrf.ok) return csrf.response;
    const postId = positiveInt((await params).id, "帖子ID");
    const existing = request.cookies.get("food_visitor")?.value;
    const visitor = /^[a-f0-9-]{36}$/.test(existing ?? "") ? existing : randomUUID();
    const visitorHash = createHash("sha256").update(visitor).digest("hex");
    const visitDay = new Date(Date.now() + 8 * 3600000).toISOString().slice(0, 10);

    // INSERT ... SELECT only records publicly visible posts. A unique key handles concurrent visits.
    await db.execute(sql`
      INSERT IGNORE INTO post_views (post_id, visitor_hash, visit_day)
      SELECT ${posts.id}, ${visitorHash}, ${visitDay} FROM ${posts}
      WHERE ${posts.id} = ${postId} AND ${posts.status} = ${CONTENT_STATUS.ACTIVE}
    `);
    const visible = await db.select({ id: posts.id }).from(posts)
      .where(and(eq(posts.id, postId), eq(posts.status, CONTENT_STATUS.ACTIVE))).limit(1);
    if (!visible.length) return ApiResponse.error(ErrorCode.NOT_FOUND, "未找到帖子");
    const [result] = await db.select({ value: count() }).from(PostViews).where(eq(PostViews.postId, postId));
    const response = ApiResponse.success({ viewCount: result.value }, "浏览已记录", {
      headers: { "Cache-Control": "no-store" },
    });
    response.cookies.set("food_visitor", visitor, {
      httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production",
      path: "/", maxAge: 365 * 24 * 3600,
    });
    return response;
  } catch (error) {
    if (error instanceof ApiValidationError) return toApiValidationResponse(error);
    console.error("记录浏览失败", { name: error?.name });
    return ApiResponse.error(ErrorCode.INTERNAL_ERROR, "暂时无法记录浏览");
  }
}
