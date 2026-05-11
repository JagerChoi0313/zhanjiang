import {db} from "../../../../database/index"
import {posts} from "../../../../database/schema"
import {eq} from 'drizzle-orm'
import {NextResponse} from "next/server"

export async function GET(request,{params}){
    try{
        //后端也需要await解开params
        const {id:postId} = await params
        
        //2.告诉drizzle去posts表里查：拿出id等于postId那行
        const result = await db.select()
            .from(posts)
            .where(eq(posts.id,postId))

        //防御性判断：如果数据库里没有这个ID，返回404
        if(result.length===0){
            return NextResponse.json({
                success:false,
                message:"未找到帖子"
            },{status:404})
        }

        //4,成功找到，返回这条帖子的完整数据对象
        return NextResponse.json({
            success:true,
            data:result[0]
        })
    }catch(error){
        console.error("Fetch post detail error:",error);
        return NextResponse.json({
            success:false,
            message:"服务器读取数据失败"
        },{status:500})
    }
}