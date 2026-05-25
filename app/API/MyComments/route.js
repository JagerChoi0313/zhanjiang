"use server"

import {db} from '../../../database/index'
import {Comments, posts, Users} from '../../../database/schema'
import {eq, desc, sql, and, like, or} from 'drizzle-orm' 
import {NextResponse} from 'next/server'
import {verifyToken} from "../../../lib/jwt" 



export async function GET(request){
    try{
        const token = request.cookies.get('auth_token')?.value
        if(!token){
            return NextResponse.json({ success:false, message:"未登录，请先登录" },{status:401})
        }

        const payload = await verifyToken(token)

        if(!payload){
            return NextResponse.json({ success:false, message:"登录过期，请重新登录" },{status:401})
        }

        const userId = payload.userId;

        const {searchParams} = new URL(request.url);
        const keyword = searchParams.get('q'); 
        const page = parseInt(searchParams.get("page")) || 1;  
        const pageSize = 4;
        const offset = (page-1) * pageSize;

        console.log("👉 [我的评论后端] 收到的搜索词是：", keyword); // 监控探头

        // ==========================================
        // ✅ 终极防弹写法：提前组装好统一的 Where 条件
        // ==========================================
        const baseCondition = eq(Comments.userId, userId);
        
        // 如果有关键字，就把 baseCondition 和搜索条件用 AND 绑在一起；否则就只用 baseCondition
        const finalCondition = (keyword && keyword.trim() !== '')
            ? and(
                baseCondition,
                or(
                    like(Comments.content, `%${keyword}%`), // 搜评论内容
                    like(posts.title, `%${keyword}%`)       // 搜原帖标题
                )
            )
            : baseCondition;

        // --- 1. 查总数 (计算分页) ---
        const totalResult = await db
            .select({count: sql`count(*)`})
            .from(Comments)
            // 查总数也必须 join posts 表，因为我们要按原帖标题搜索
            .innerJoin(posts, eq(Comments.postId, posts.id))
            // 👇 统一使用拼装好的终极条件
            .where(finalCondition);
            
        const totalCount = Number(totalResult[0].count)

        // --- 2. 查数据 (获取列表详情) ---
        const data = await db
            .select({
                commentId:Comments.id,
                content:Comments.content,
                createAt:Comments.createAt,
                postId:posts.id,  
                postTitle:posts.title,
                postCover:posts.coverImage,
                postDescription:posts.description,
                username:Users.nickname,
                avatar:Users.avatar,
                favoriteCount:sql`(SELECT COUNT(*) FROM favorites WHERE favorites.post_id = ${posts.id})`.mapWith(Number),
                commentCount:sql`(SELECT COUNT(*) FROM comments WHERE comments.post_id = ${posts.id})`.mapWith(Number)
            })
            .from(Comments)
            .innerJoin(posts,eq(Comments.postId,posts.id))  
            .leftJoin(Users,eq(posts.userId,Users.userId))
            // 👇 统一使用拼装好的终极条件
            .where(finalCondition)
            .orderBy(desc(Comments.createAt))
            .limit(pageSize) 
            .offset(offset); 

        return NextResponse.json({
            success:true,
            data:data,
            pagination:{
                totalCount:totalCount,
                pageSize:pageSize,
                totalPages:Math.ceil(totalCount / pageSize),
                currentPage:page
            }
        },{status:200});
    }catch(error){
        console.error("Fetch Comments Error:",error);
        return NextResponse.json({ success:false, message:"获取评论信息失败" },{status:500})
    }
}