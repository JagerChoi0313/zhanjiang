import {db} from '../../../database/index'
import {posts} from '../../../database/schema'
import {eq,desc,sql} from 'drizzle-orm'
import {NextResponse} from 'next/server'
import {verifyToken} from "../../../lib/jwt"

export async function GET(request){
    try{
        //1.解密并提取token
        const token = await request.cookies.get('auth_token')?.value
        if(!token){
            return NextResponse({
                success:false,
                message:"未登录，请先登录"
            })
        }

        const payload = await verifyToken(token)

        if(!payload){
            return NextResponse({
                success:false,
                message:"已过期，请重新登录"
            },{status:401})
        }

        const userId = payload.userId;

        //解析分页参数
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page")) || 1;  
        const pageSize = 4; // 严格控制为4条，配合前端的一页无滚动条排版
        const offset = (page - 1) * pageSize;

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
        .where(eq(posts.userId,targetUserId))
        .orderBy(desc(posts.createdAt))
        .limit(pageSize)
        .offset(offset)

        return NextResponse.json({
            success:true,
            data:myPosts,
            pagination: {
                totalCount: totalCount,
                pageSize: pageSize,
                totalPages: Math.ceil(totalCount / pageSize),
                currentPage: page
            }
        },{status:200})

    }catch(error){
        console.error("Fetch MyPosts error:",error)
        return NextResponse.json({
            success:false,
            message:"获取数据失败"
        },{status:500})
    }
}