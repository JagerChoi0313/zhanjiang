"use server"

import {db} from '../../../database/index'
import {TalkRanking} from '../../../database/schema'
import {desc,sql,count} from 'drizzle-orm'
import {NextResponse} from 'next/server'

export async function GET(){
    try{
        const data = await db.select({
            user_name:TalkRanking.user_name,
            avatar:TalkRanking.avatar,
            active_score:count(TalkRanking.id).as('comment_count')
            // 核心：统计这个人的 ID 出现了几次，并给这个统计结果起个外号叫 'comment_count'

        })

        .from(TalkRanking)
        .groupBy(TalkRanking.user_name,TalkRanking.avatar)      // 核心：按照用户名和头像“成组”。
        .orderBy(desc(sql`comment_count`))
        .limit(5)

        return NextResponse.json({
            success:true,
            data:data
        },{status:200})

    }catch(error){
        console.error("获取数据失败：",error)
        return NextReponse.json({
            success:false,
            message:"获取用户榜单失败"
        },{status:500})
    }
}