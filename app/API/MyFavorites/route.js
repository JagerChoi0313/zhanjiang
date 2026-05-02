"use server"

import {db} from '../../../database/index'
import {Favorites,posts} from  '../../../database/schema'
import {eq,desc,sql} from 'drizzle-orm'
import {NextResponse} from 'next/server'

export async function GET(request){
    try{
        const userId = 1;
        //获取分页参数
        const {searchParams} = new URL(request.url);
        const page = paraseINT(searchParams.get("page")) || 1;
        const pageSize=4;
        const offset = (page-1)*pageSize;

        //查询收藏总条数
        const totalResult = await db
            .select({count:sql`count(*)`})
            .from(Favorites)
            .where(eq(Favorites.userId,userId))
        const totalCount = Number(totalResult[0].count);

        //执行多表联查
        //从Favorites开始查，通过postId 关联 posts表获取美食详情
        const data = await db
            .select({
                favoriteId:Favorites.id,
                facoriteAt:Favorites.createdAt,
                //抓取美食帖子信息
                postId:posts.id,
                postTitle:posts.title,
                postCover:posts.coverImage,
                postDescription:posts.description,

            })

            .from(Favorites)
            .innerJoin(posts,eq(Favorites.postId,posts.id))     //核心关联逻辑
            .where(eq(Favorites.userId,userId))
            .orderBy(desc(Favorites.createAt))
            .limit(pageSize)
            .offset(offset)

        //返回标准响应式结构
        return NextResponse.json({
            success:true,
            data:data,
            pagination:{
                totalCount:totalCount,
                pageSize:pageSize,
                totalPage:Math.ceil(totalCount/pageSize),
                currentPage:page
            }
        },{status:200})

    }catch(error){
        console.error("Fetch Favorites Error:",error)
        return NextResponse.json({
            success:false,
            message:"获取收藏列表失败",
        },{status:500})
    }
}