import {db} from '../../../database/index'
import {TasteCardTable} from '../../../database/schema'
import {ApiResponse, ErrorCode} from '../../../lib/api-response.mjs'

export async function GET(){

    try{
        //使用drizzle查询食材
        const data = await db.select()
        .from(TasteCardTable)

        //返回JSON数据
        return ApiResponse.success(data);
    }catch(error){
        console.error("读取食材数据库失败：",error)
        return ApiResponse.error(ErrorCode.DATABASE_ERROR, "获取味觉卡片内容失败");
    }
}
