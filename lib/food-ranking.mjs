"use server";

import { db } from "../database/index";
import { HotRecommend } from "../database/schema";
import { desc, eq } from "drizzle-orm";

export async function getRankingData(category = "全部") {
  try {
    let data;

    if (category === "全部") {
      data = await db
        .select()
        .from(HotRecommend)
        .orderBy(desc(HotRecommend.views));
    } else {
      data = await db
        .select()
        .from(HotRecommend)
        .where(eq(HotRecommend.category, category))
        .orderBy(desc(HotRecommend.views));
    }

    return { success: true, data };
  } catch (error) {
    console.error("获取榜单数据失败:", error);
    return { success: false, message: "获取榜单数据失败" };
  }
}
