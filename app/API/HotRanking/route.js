"use server"
//处理Get请求，利用drizzle从MySql中读取数据

import {db} from '../../../database/index'
import {HotRecommend} from '../../../database/schema'
import {desc} from "drizzle-orm"        //这个是用来倒序的
import {ApiResponse, ErrorCode} from "../../../lib/api-response.mjs"

export async function GET(){
    try{
        //从数据库中获取数据，按 rank_score 降序排列
        const data = await db.select()
        .from(HotRecommend)
        .orderBy(desc(HotRecommend.rank_score));

        //返回JSON响应
        return ApiResponse.success(data)
    }catch(error){
        console.error("API Error:",error);
        return ApiResponse.error(ErrorCode.DATABASE_ERROR, "获取热门推荐内容失败")
       
    }

}
