import {db} from '../../../database/index'
import {posts} from '../../../database/schema'
import {eq,desc,sql} from 'drizzle-orm'
import {verifyToken} from "../../../lib/jwt"
import {and,like,or} from "drizzle-orm"
import { ApiResponse, ErrorCode } from '../../../lib/api-response.mjs'

export async function GET(request){
    try{
        //1.解密并提取token
        const token = await request.cookies.get('auth_token')?.value
        if(!token){
            return ApiResponse.error(ErrorCode.UNAUTHORIZED, "未登录，请先登录")
        }

        const payload = await verifyToken(token)

        if(!payload){
            return ApiResponse.error(ErrorCode.UNAUTHORIZED, "已过期，请重新登录")
        }

        const userId = payload.userId;

        //解析分页参数
        const { searchParams } = new URL(request.url);
        const keyword = searchParams.get('q');//抓取关键字
        const page = parseInt(searchParams.get("page")) || 1;  
        const pageSize = 4; // 严格控制为4条，配合前端的一页无滚动条排版
        const offset = (page - 1) * pageSize;

        const baseCondition = eq(posts.userId, userId);
        
        // 帖子表里搜：标题或描述
        const finalCondition = (keyword && keyword.trim() !== '')
            ? and(
                baseCondition,
                or(
                    like(posts.title, `%${keyword}%`),
                    like(posts.description, `%${keyword}%`)
                )
            )
            : baseCondition;

        // 3. 查询总条数（用于给前端计算总页数）
        const totalResult = await db
            .select({ count: sql`count(*)` })
            .from(posts)
            .where(eq(posts.userId, userId));
        const totalCount = Number(totalResult[0].count);


        // 执行查询逻辑
        const myPosts = await db
        .select()
        .from(posts)
        .where(finalCondition)
        .orderBy(desc(posts.createdAt))
        .limit(pageSize)
        .offset(offset)

        return ApiResponse.paginated(
            myPosts,
            {
                totalCount: totalCount,
                pageSize: pageSize,
                totalPages: Math.ceil(totalCount / pageSize),
                currentPage: page
            }
        )

    }catch(error){
        console.error("Fetch MyPosts error:",error)
        return ApiResponse.error(ErrorCode.INTERNAL_ERROR, "获取数据失败")
    }
}
