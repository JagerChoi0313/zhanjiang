import {db} from '../../../database/index'
import {posts} from '../../../database/schema'
import {desc} from 'drizzle-orm'
import {NextResponse} from 'next/server'

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
        const body = await request.json();
        //模拟当前登录用户
        const MOCK_USER_ID = 20260001;

        //自动生成摘要：取描述的前100字
        const excerpt = body.description ? body.description.substring(0,100) : "";

        const result = await db.insert(posts).values({
            userId:MOCK_USER_ID,
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