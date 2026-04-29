"use server"

import {db} from '../../../database/index'
import {Comments,posts} from '../../../database/schema'
import {eq,desc,sql} from 'drizzle-orm'     //额外引入sql用来计数
import {NextResponse} from 'next/server'

export async function GET(request){
    try{
        //获取当前用户id（暂时硬编码为1进行测试，后续对接Auth）
        const userId = 1;

        //获取分页参数
        const {searchParams} = new URL(request.url);
        const page = parseInt(searchParams.get("page")) || 1;  //默认第一页
        const pageSize = 4;
        const offset = (page-1) * pageSize;

        //查询总条数（为了给前端Pagination计算总页数）
        const totalResult = await db
            .select({count: sql`count(*)`})
            .from(Comments)
            .where(eq(Comments.userId,userId));
        const totalCount = Number(totalResult[0].count)

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
            .limit(pageSize) // 限制返回数量
            .offset(offset); // 跳过之前的条数

        return NextResponse.json({
            success:true,
            data:data,

            //将分页信息一并返回给前端
            pagination:{
                totalCount:totalCount,
                pageSize:pageSize,
                totalPages:Math.ceil(totalCount / pageSize),
                currentPage:page
            }
        },{status:200});
    }catch(error){
        console.error("Fetch Comments Error:",error);
        return NextResponse.json({
            success:false,
            message:"获取评论信息失败"
        },{status:500})

    }
}