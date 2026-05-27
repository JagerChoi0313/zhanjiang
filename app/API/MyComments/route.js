"use server"

import {db} from '../../../database/index'
import {Comments, posts, Users} from '../../../database/schema'
import {eq, desc, sql, and, like, or} from 'drizzle-orm' 
import {verifyToken} from "../../../lib/jwt" 
import { ApiResponse, ErrorCode } from '../../../lib/api-response.mjs'



export async function GET(request){
    try{
        const token = request.cookies.get('auth_token')?.value
        if(!token){
            return ApiResponse.error(ErrorCode.UNAUTHORIZED, "未登录，请先登录")
        }

        const payload = await verifyToken(token)

        if(!payload){
            return ApiResponse.error(ErrorCode.UNAUTHORIZED, "登录过期，请重新登录")
        }

        const userId = payload.userId;

        const {searchParams} = new URL(request.url);
        const keyword = searchParams.get('q'); 
        const page = parseInt(searchParams.get("page")) || 1;  
        const pageSize = 4;
        const offset = (page-1) * pageSize;

        
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

        return ApiResponse.paginated(
            data,
            {
                totalCount:totalCount,
                pageSize:pageSize,
                totalPages:Math.ceil(totalCount / pageSize),
                currentPage:page
            }
        );
    }catch(error){
        console.error("Fetch Comments Error:",error);
        return ApiResponse.error(ErrorCode.INTERNAL_ERROR, "获取评论信息失败")
    }
}
