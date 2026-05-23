import {db} from '../../../database/index'
import {posts} from '../../../database/schema'
import {desc} from 'drizzle-orm'
import {NextResponse} from 'next/server'
import {verifyToken} from '../../../lib/jwt'
import {Comments,Favorites,Users} from "../../../database/schema"
import {eq,sql} from "drizzle-orm"
import {like,or} from "drizzle-orm"     //引入like和or这两个用于搜索功能的模糊匹配神器


// GET请求，获取所有的帖子
export async function GET(){
    try {
        //监听前端传来的搜索关键字
        const {searchParams} = new URL(request.url)
        const keyword = searchParams.get('q');

        //2.构建基础的查询条件
        //如果有关键字，就要求标题（title）或描述(description)里包含这个词，否则就是undefined(查全部)
        const searchCondition = keyword
            ? or(
                like(posts.title,`%${keyword}%`),
                like(posts.description,`%${keyword}%`)
            )
            :undefined;


        const allPosts = await db
        .select({
            id:posts.id,
            title:posts.title,
            description:posts.description,
            coverImage:posts.coverImage,
            location:posts.location,
            category:posts.category,
            createdAt:posts.createdAt,

            //关联出作者头像和昵称
            author:{
                nickname:Users.nickname,
                avatar:Users.avatar
            },

            //利用SQL实时计算每条帖子的收藏总数和评论总数
            //使用distinct确保在高并发时多表join时计数不会出现翻倍错误
            favoriteCount:sql`count(distinct ${Favorites.id})`.mapWith(Number),
            commentCount:sql`count(distinct ${Comments.id})`.mapWith(Number)
        })
        .from(posts)
        //1.关联用户表，拿到发帖人的真实昵称和头像
        .leftJoin(Users,eq(posts.userId,Users.userId))

        //2.关联收藏表,方便count计算
        .leftJoin(Favorites,eq(posts.id,Favorites.postId))

        //3.关联评论表，方便count计算
        .leftJoin(Comments,eq(posts.id,Comments.postId))

        //插入搜索条件
        .where(searchCondition)

        // 关键：只要用了 count() 这类聚合函数，必须按主表 id 进行分组隔离
        .groupBy(posts.id, Users.nickname, Users.avatar)
        //按时间倒序排列
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