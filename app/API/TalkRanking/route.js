"use server"

import {db} from '../../../database/index'
import {TalkRanking} from '../../../database/schema'
import {desc} from 'drizzle-orm'        //这是用来倒序的
import {NextResponse} from 'next/server'

export async function GET(){

    try{
        //从数据库中获取数据,按时间倒序排列
        const data = await db.select()
        .from(TalkRanking)
        .orderBy(desc(TalkRanking.create_at))

        //返回json响应
        return NextResponse.json({
            success:true,
            data:data
        },{status:200})

    }catch(error){
        console.error("API error:",error);
        return NextResponse.json({
            success:false,
            message:"获取用户互动榜单内容失败"
        },{status:500})
    }
}