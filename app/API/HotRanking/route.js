
//处理Get请求，利用drizzle从MySql中读取数据

import {db} from '../../../database/index'
import {HotRecommend} from '../../../database/schema'
import {desc} from "drizzle-orm"        //这个是用来倒序的
import {NextResponse} from "next/server"

export async function GET(){
    try{
        //从数据库中获取数据，按 rank_score 降序排列
        const data = await db.select()
        .from(HotRecommend)
        .orderBy(desc(HotRecommend.rank_score));

        //返回JSON响应
        return NextResponse.json({
            success:true,
            data:data,
        },
        {status:200})
    }catch(error){
        console.error("API Error:",error);
        return NextResponse.json({
            success:false,
            message:"获取热门推荐内容失败"
        },
            {status:500})
       
    }

}
