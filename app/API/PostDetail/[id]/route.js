import {db} from "../../../../database/index"
import {posts} from "../../../../database/schema"
import {eq} from 'drizzle-orm'
import {NextResponse} from "next/server"
import {Comments} from "../../../../database/schema"    //把Comment引进来，往里面插入评论


//帖子详情以及包含所有评论
export async function GET(request,{params}){
    try{
        //后端也需要await解开params
        const {id:postId} = await params
        
        //2.告诉drizzle去posts表里查：拿出id等于postId那行
        //使用db.query 既然再schema中写好了relations，这里就可以直接用with进行嵌套查询

        const result = await db.query.posts
        .findFirst({
            where:eq(posts.id,parseInt(postId)),
            with:{
                //把帖子的作者信息找出来
                author:true,
                //把这条帖子下的所有评论带出来
                comments:{
                    with:{
                        //3,把每一条评论发布者的信息也带出来（展示头像和昵称）
                        author:true
                    },
                    //4,按时间倒序排列，最新的评论在上面
                    orderBy:(Comments,{desc})=>[desc(comments.createAt)]
                }
            }
        })
          


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


//2.Post接口，接收前端发来的评论并存入数据库
export async function POST(request,{params}){
    try{
        const {id:postId} = await params

        //解析前端发来的JSON数据体
        const body = await request.json()
        const {content,userId} = body;

        //基础防御：防空值提交
        if(!content || !content.trim()){
            return NextResponse.json({
                success:false,
                message:"评论内容不能为空"
            },{status:400})
        }

        //执行插入数据库操作
        await db.insert(Comments).values({
            postId:parseInt(postId),
            userId:parseInt(userId),
            content:content.trim()
        })

        //插入成功后返回给前端
        return NextResponse.json({success:true,message:"评论发表成功"})
    }catch(error){
        console.error("Submit comment error",error)
        return NextResponse.json({success:false,message:"评论发表失败"},{status:500})
    }
}