"use server"

import {db} from '../../../database/index'
import {Favorites,posts} from  '../../../database/schema'
import {eq,desc,sql} from 'drizzle-orm'
import {NextResponse} from 'next/server'

export async function GET(request){
    try{
        const userId = 1;     //这里的硬编码是目前的测试逻辑，代表“我在看谁的收藏”

        // 解析 URL 里的参数，比如 /api/my-favorites?page=2
        const {searchParams} = new URL(request.url);    
        const page = parseInt(searchParams.get("page")) || 1;  // 如果没传 page，默认就是第 1 页
        const pageSize=4;   // 每页只显示 4 条
        const offset = (page-1)*pageSize;       // 计算跳过多少条。比如第2页，就跳过前4条。

        //查询收藏总条数
        // 这一步是为了告诉前端：用户一共收藏了多少个美食，好让前端算出“总页数”
        const totalResult = await db
            .select({count:sql`count(*)`})  // 使用原生 SQL 语法进行计数
            .from(Favorites)
            .where(eq(Favorites.userId,userId))     // 只数当前这个用户的收藏
        const totalCount = Number(totalResult[0].count);    // 把查到的结果转成纯数字

        //执行多表联查
        //从Favorites开始查，通过postId 关联 posts表获取美食详情
        const data = await db
            .select({
                favoriteId:Favorites.id,    //收藏记录本本身id
                facoriteAt:Favorites.createdAt,
                //抓取美食帖子信息
                postId:posts.id,
                postTitle:posts.title,
                postCover:posts.coverImage,
                postDescription:posts.description,

            })

            .from(Favorites)
            .innerJoin(posts,eq(Favorites.postId,posts.id))     // 【关键】：把收藏表里的 postId 对应到 posts 表的 id
            .where(eq(Favorites.userId,userId))
            .orderBy(desc(Favorites.createdAt))
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