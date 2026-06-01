import { eq } from "drizzle-orm";

import { db } from "../database/index.js";
import { Users } from "../database/schema.js";
import { hashPassword } from "./password.mjs";
import { isEmail, requiredString } from "./api-validation.mjs";
import { USER_ROLES, USER_STATUSES } from "./admin-auth.mjs";

export const seedSuperAdmin = async ({ env = process.env, client = db } = {}) => {
  const email = requiredString(env.ADMIN_EMAIL, "管理员邮箱");
  if (!isEmail(email)) {
    throw new Error("管理员邮箱格式不正确");
  }

  const password = requiredString(env.ADMIN_PASSWORD, "管理员密码");
  if (password.length < 12) {
    throw new Error("管理员密码长度不能少于12位");
  }

  const nickname = requiredString(env.ADMIN_NICKNAME ?? "系统管理员", "管理员昵称", {
    maxLength: 255,
  });
  const allowUpsert = env.ADMIN_UPSERT === "true";

  const existingUsers = await client
    .select({
      userId: Users.userId,
      userRole: Users.userRole,
    })
    .from(Users)
    .where(eq(Users.email, email))
    .limit(1);

  const hashedPassword = await hashPassword(password);
  const existingUser = existingUsers[0];

  if (!existingUser) {
    await client.insert(Users).values({
      nickname,
      email,
      password: hashedPassword,
      userRole: USER_ROLES.SUPER_ADMIN,
      userStatus: USER_STATUSES.ACTIVE,
    });

    return { action: "created", email };
  }

  if (existingUser.userRole !== USER_ROLES.SUPER_ADMIN && !allowUpsert) {
    throw new Error("该邮箱已存在且不是超级管理员；如需提权请显式设置 ADMIN_UPSERT=true");
  }

  await client
    .update(Users)
    .set({
      nickname,
      password: hashedPassword,
      userRole: USER_ROLES.SUPER_ADMIN,
      userStatus: USER_STATUSES.ACTIVE,
    })
    .where(eq(Users.userId, existingUser.userId));

  return { action: "updated", email };
};
