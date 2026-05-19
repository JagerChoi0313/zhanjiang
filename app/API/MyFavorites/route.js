"use server"

import {db} from '../../../database/index'
import {Favorites,posts} from  '../../../database/schema'
import {eq,desc,sql,and} from 'drizzle-orm'
import {NextResponse} from 'next/server'
import {verifyToken} from '../../../lib/jwt' //引入解密工具


//如果前端传了postId进来，我们就只查询单篇帖子的收藏状态
export async function GET(request){
    try{
        //1.核心鉴权：从Cookies中提取通行证并解密真实的身份
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
                message:"登录已经失效，请重新登录"
            },{status:401})
        }

        const userId = payload.userId   //获取真实的用户Id

        // 解析 URL 里的参数，比如 /api/my-favorites?page=2
        const {searchParams} = new URL(request.url);  
        
        //判断是不是单篇帖子来查岗
        const checkPostId = searchParams.get("postId")
        if(checkPostId){
            //如果传了PostId，就去查这个人有没有收藏过这篇帖子
            const existingFavorite = await db
            .select()
            .from(Favorites)
            .where(
                and(
                    eq(Favorites.postId,parseInt(checkPostId)),//parseInt:把一个字符串转换为一个整数
                    eq(Favorites.userId,userId)
                )
            );
            //查到了就是true，没查到就是false
            return NextResponse.json({isFavorited:existingFavorite.length>0},{status:200})
        }
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


//POST接口：处理帖子的“收藏/取消收藏”的功能
export async function POST(request){
    try{
        //1.核心鉴权：绝对不信任前端传的userId，必须后端亲自解密
        const token = request.cookies.get('auth_token') ?.value
        if(!token){
            return NextResponse.json({
                success:false,
                message:"未登录，请先登录"
            })
        }

        const payload = await verifyToken(token)

        if(!payload){
            return NextResponse.json({
                success:false,
                message:"登录已失效，请重新登录"
            })
        }

        const userId = payload.userId;//提取真实ID


        
        const body = await request.json();
        const {postId} = body;      //千万不要相信前端传过来userid
        
        //基础防御：
        if(!postId){
            return NextResponse.json({
                success:false,
                message:"参数不完整，缺少postid"
            },{status:400})
        }

        //去数据库里查一下看看有没有这个帖子
        //使用and（）必须同时满足：帖子Id匹配且用户Id匹配
        const existingFavorite = await db
            .select()
            .from(Favorites)
            .where(
                and(
                    eq(Favorites.postId,parseInt(postId)),
                    eq(Favorites.userId,userId)
                )
            )

            if(existingFavorite.length>0){
                //2.如果查到了数据（说明已经收藏过了），这次点击就是取消收藏
                await db.delete(Favorites)
                        .where(eq(Favorites.id,existingFavorite[0].id))
                return NextResponse.json({
                    success:true,
                    message:"已取消收藏",
                    isFavorited:false   //告诉前端现在是未收藏状态
                })
            }else{
                //如果还没查到数据（说明还没收藏），这次点击就是添加收藏
                await db.insert(Favorites).values({
                    postId:parseInt(postId),
                    userId:userId   //直接解析后端传进来的真实ID
                });

                return NextResponse.json({
                    success:true,
                    message:"收藏成功",
                    isFavorited:true
                })
            }
    }catch(error){
                console.error("Favorite action error:",error)
                return NextResponse.json({
                    success:false,
                    message:"收藏操作失败"
                },{status:500})
    }
}