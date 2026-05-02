import {db} from '../../../database/index'
import {posts} from '../../../database/schema'
import {desc} from 'drizzle-orm'
import {NextResponse} from 'next/server'


//GET请求，获取所有的帖子
export async function GET(){
    try{
        const allPosts = await db
        .select()
        .from(posts)
        .orderBy(desc(posts.createAt))
        return NextResponse.json(allPosts);
    }catch(error){
        console.error("Fetch error:",error)
        return NextResponse.json({error:"数据库读取失败"},{status:500})
    }
}


