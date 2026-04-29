"use server"

import {db} from '../../../database/index'
import {Comments,posts} from '../../../database/schema'
import {eq,desc} from 'drizzle-orm'
import {NextResponse} from 'next/server'

export async function GET(request){
    try{
        //获取当前用户id（暂时硬编码为1进行测试，后续对接Auth）
        const userId = 1;

        //执行多表联查
        //从Comments开始查，关联posts表来获取标题和封面图
        const data = await db
            .select({
                commentId:Comments.id,
                content:Comments.content,
                createAt:Comments.createAt,
                //抓取关联的帖子信息
                postTitle:posts.title,
                postCover:posts.coverImage,
                postDescription:posts.description,//显示原帖摘要
            })

            .from(Comments)
            .innerJoin(posts,eq(Comments.postId,posts.id))  //核心关联逻辑
            .where(eq(Comments.userId,userId))
            .orderBy(desc(Comments.createAt))

        return NextResponse.json({
            success:true,
            data:data
        },{status:200});
    }catch(error){
        console.error("Fetch Comments Error:",error);
        return NextResponse.json({
            success:false,
            message:"获取评论信息失败"
        },{status:500})

    }
}