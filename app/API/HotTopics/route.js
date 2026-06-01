import {db} from '../../../database/index'
import {hotTopics} from '../../../database/schema'
import {asc} from 'drizzle-orm'     //用来升序排列
import {ApiResponse, ErrorCode} from '../../../lib/api-response.mjs'

export async function GET(){
    try{
        //按rank序号升序排列
        const data = await db.select()
        .from(hotTopics).
        orderBy(asc(hotTopics.rank))

        return ApiResponse.success(data)
    }catch(error){
        console.error("获取热门话题失败：",error);
        return ApiResponse.error(ErrorCode.DATABASE_ERROR, "获取热门话题失败")
    }
}
