"use server"    //告诉next.js这段代码只能在服务器上跑
import {db} from '../../../database/index'
import {HotRecommend} from '../../../database/schema'
import {eq,desc} from "drizzle-orm"         //eq相当于Mysql里的“=”，用来对比



export async function getRankingData (category = "全部"){

    try{
        let data;

        // category = "全部"：给参数设一个默认值。如果前端没传分类，我们就默认给它展示“全部”。
        if(category==="全部"){
            //如果是全部，则直接按浏览量或权重排序
            data = awaitdb.select()
                .from(HotRecommend)
                .orderBy(desc(HotRecommend.views));     //这里用views排序
        }else{
            //如果有分类，增加一个where过滤
            data = await db.select()
            .from(HotRecommend)
            .where(eq(HotRecommend.category,category))
            .orderBy(desc(HotRecommend.views))
        }
            return {success:true,data};
    }catch(error){
        console.error("获取榜单数据失败:",error);
        return {success:false,error:"Internet Servel Error"};
    }
}


