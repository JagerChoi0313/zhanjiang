"use server"

import {db} from '../../../database/index'
import {TalkRanking} from '../../../database/schema'
import {desc} from 'drizzle-orm'        //这是用来倒序的
import {ApiResponse, ErrorCode} from '../../../lib/api-response.mjs'

export async function GET(){

    try{
        //从数据库中获取数据,按时间倒序排列
        const data = await db.select()
        .from(TalkRanking)
        .orderBy(desc(TalkRanking.create_at))

        //返回json响应
        return ApiResponse.success(data)

    }catch(error){
        console.error("API error:",error);
        return ApiResponse.error(ErrorCode.DATABASE_ERROR, "获取用户互动榜单内容失败")
    }
}
