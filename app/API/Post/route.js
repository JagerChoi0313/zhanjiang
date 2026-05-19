import {db} from '../../../database/index'
import {posts} from '../../../database/schema'
import {desc} from 'drizzle-orm'
import {NextResponse} from 'next/server'
import {verifyToken} from '../../../lib/jwt'

// GET请求，获取所有的帖子
export async function GET(){
    try {
        const allPosts = await db
        .select()
        .from(posts)
        // 修正点：将 createAt 修改为 createdAt
        .orderBy(desc(posts.createdAt)) 
        
        return NextResponse.json(allPosts);
    } catch(error) {
        console.error("Fetch error:", error)
        return NextResponse.json({error: "数据库读取失败"}, {status: 500})
    }
}

//Post请求：处理发帖投稿的逻辑

export async function POST(request){
    try{
        
        //从cookies中提取通行证并解密身份
        const token = request.cookies.get('auth_token')?.values
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
                message:"登录失效，请重新登录"
            },{status:401})
        }

        //提取出经过后端校验，绝无可能被前端篡改的用户ID
        const userId = payload.userId;

        const body = await request.json();

        //自动生成摘要：取描述的前100字
        const excerpt = body.description ? body.description.substring(0,100) : "";

        const result = await db.insert(posts).values({
            userId:userId,
            title:body.title,
            description:body.description,
            excerpt:excerpt,
            coverImage:body.coverImage,
            //重点：images是数组，入库前转成JSON字符串
            images:JSON.stringify(body.images || []),
            category:body.category,
            location:body.location,
            createdAt:new Date()
        });

        return NextResponse.json({
            success:true,
            message:"发布成功",
            postId:result.insertId
        })
    }catch(error){
            console.error("Post error:",error);
            return NextResponse.json({
                success:false,
                message:"发布失败"
            },{status:500})
    }
}