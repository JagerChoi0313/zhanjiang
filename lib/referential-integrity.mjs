import { and, eq } from "drizzle-orm";

import { db } from "../database/index.js";
import { posts, Users } from "../database/schema.js";
import { ApiResponse, ErrorCode } from "./api-response.mjs";
import { CONTENT_STATUS } from "./content-status.mjs";

export const ensureUserExists = async (userId, options = {}) => {
  const missingMessage = options.missingMessage ?? "登录失效，请重新登录";
  const users = await db
    .select({ userId: Users.userId })
    .from(Users)
    .where(eq(Users.userId, userId))
    .limit(1);

  if (users.length === 0) {
    return {
      ok: false,
      response: ApiResponse.error(ErrorCode.UNAUTHORIZED, missingMessage),
    };
  }

  return { ok: true, user: users[0] };
};

export const ensurePostExists = async (postId, options = {}) => {
  const missingMessage = options.missingMessage ?? "帖子不存在";
  const includeDeleted = options.includeDeleted ?? false;
  const targetPosts = await db
    .select({ id: posts.id })
    .from(posts)
    .where(includeDeleted ? eq(posts.id, postId) : and(eq(posts.id, postId), eq(posts.status, CONTENT_STATUS.ACTIVE)))
    .limit(1);

  if (targetPosts.length === 0) {
    return {
      ok: false,
      response: ApiResponse.error(ErrorCode.NOT_FOUND, missingMessage),
    };
  }

  return { ok: true };
};
