import { eq } from "drizzle-orm";

import { db } from "../database/index.js";
import { Users } from "../database/schema.js";
import { ApiResponse, ErrorCode } from "./api-response.mjs";
import { requireAuth } from "./api-auth.mjs";

export const USER_ROLES = Object.freeze({
  USER: "user",
  SUPER_ADMIN: "super_admin",
});

export const USER_STATUSES = Object.freeze({
  ACTIVE: "active",
  DISABLED: "disabled",
});

export const requireSuperAdmin = async (request) => {
  const auth = await requireAuth(request, {
    missingMessage: "未登录，请先登录",
    invalidMessage: "登录失效，请重新登录",
  });

  if (!auth.ok) {
    return auth;
  }

  const users = await db
    .select({
      userId: Users.userId,
      userRole: Users.userRole,
      userStatus: Users.userStatus,
    })
    .from(Users)
    .where(eq(Users.userId, auth.userId))
    .limit(1);

  const user = users[0];
  if (!user || user.userStatus !== USER_STATUSES.ACTIVE) {
    return {
      ok: false,
      response: ApiResponse.error(ErrorCode.FORBIDDEN, "账号已被禁用或不存在"),
    };
  }

  if (user.userRole !== USER_ROLES.SUPER_ADMIN) {
    return {
      ok: false,
      response: ApiResponse.error(ErrorCode.FORBIDDEN, "没有权限执行该操作"),
    };
  }

  return {
    ok: true,
    user,
    userId: user.userId,
  };
};
