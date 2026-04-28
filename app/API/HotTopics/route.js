import {db} from '../../../database/index'
import {hotTopics} from '../../../database/schema'
import {asc} from 'drizzle-orm'     //用来升序排列
import {NextResponse} from 'next/server'

export async function GET(){
    try{
        //按rank序号升序排列
        const data = await db.select()
        .from(hotTopics).
        orderBy(asc(hotTopics.rank))

        return NextResponse.json(data)
    }catch(error){
        console.error("获取热门话题失败：",error);
        return NextResponse.json({error:"Fetch failed"},{status:500})
    }
}