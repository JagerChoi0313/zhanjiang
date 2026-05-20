"use server"

import {db} from '../../../database/index'
import {Comments,posts,Users} from '../../../database/schema'
import {eq,desc,sql} from 'drizzle-orm'     //额外引入sql用来计数
import {NextResponse} from 'next/server'
import {verifyToken} from "../../../lib/jwt"    //引入Token解密工具



export async function GET(request){
    try{
        //获取当前用户id（暂时硬编码为1进行测试，后续对接Auth）
        const token = request.cookies.get('auth_token')?.value
        if(!token){
            return NextResponse.json({
                success:false,
                message:"未登录，请先登录"
            },{status:401})
        }

        const payload = await verifyToken(token)

        if(!payload){
            return NextResponse.json({
                success:false,
                message:"登录过期，请重新登录"
            },{status:401})
        }

        //获取用户真实ID
        const userId = payload.userId;


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
                postId:posts.id,    //补上postId，方便前端做路由跳转
                postTitle:posts.title,
                postCover:posts.coverImage,
                postDescription:posts.description,//显示原帖摘要

                //扁平化输出原作者的昵称和头像
                username:Users.nickname,
                avatar:Users.avatar,

                //核心：使用独立的内联子查询实时数出该帖子的收藏总数和评论总数
                //既保准了计数的绝对精准，又完美避开了groupBy的严格格式错误
                favoriteCount:sql`(SELECT COUNT(*) FROM favorites WHERE favorites.post_id = ${posts.id})`.mapWith(Number),
                commentCount:sql`(SELECT COUNT(*) FROM comments WHERE comments.post_id = ${posts.id})`.mapWith(Number)
                
            })

            .from(Comments)
            //核心链条：我的评论 =>对应的帖子 =>帖子的发布作者
            .innerJoin(posts,eq(Comments.postId,posts.id))  //核心关联逻辑
            .leftJoin(Users,eq(posts.userId,Users.userId))
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