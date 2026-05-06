import {db} from '../../../database/index'
import {posts} from '../../../database/schema'
import {eq,desc} from 'drizzle-orm'
import {NextResponse} from 'next/server'

export async function GET(request){
    try{
        // 在实际开发中，这里后续可以改为从 Session/Auth 中获取
        const targetUserId = 20260001;

        // 执行查询逻辑
        const myPosts = await db
        .select()
        .from(posts)
        .where(eq(posts.userId,targetUserId))
        .orderBy(desc(posts.createdAt))

        return NextResponse.json({
            success:true,
            data:myPosts,
            pagination: {
                totalPages: 1, 
                currentPage: 1
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