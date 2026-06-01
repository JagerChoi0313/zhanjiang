import {db} from "../../../../database/index"
import {posts} from "../../../../database/schema"
import {eq} from 'drizzle-orm'
import {Comments} from "../../../../database/schema"    //把Comment引进来，往里面插入评论
import { ApiResponse, ErrorCode } from "../../../../lib/api-response.mjs"
import { requireAuth } from "../../../../lib/api-auth.mjs"
import {ensurePostExists, ensureUserExists} from "../../../../lib/referential-integrity.mjs"
import {
    ApiValidationError,
    positiveInt,
    readJsonBody,
    requiredString,
    toApiValidationResponse,
} from "../../../../lib/api-validation.mjs"


//帖子详情以及包含所有评论
export async function GET(request,{params}){
    try{
        //后端也需要await解开params
        const {id:postId} = await params
        const parsedPostId = positiveInt(postId, "帖子ID")
        
        //2.告诉drizzle去posts表里查：拿出id等于postId那行
        //使用db.query 既然再schema中写好了relations，这里就可以直接用with进行嵌套查询

        const result = await db.query.posts
        .findFirst({
            where:eq(posts.id,parsedPostId),
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
                    orderBy:(Comments,{desc})=>[desc(Comments.createAt)]
                }
            }
        })
          


        //防御性判断：如果数据库里没有这个ID，返回404
        if(!result){
            return ApiResponse.error(ErrorCode.NOT_FOUND, "未找到帖子")
        }

        //4,成功找到，返回这条帖子的完整数据对象
        return ApiResponse.success(result)
    }catch(error){
        if(error instanceof ApiValidationError){
            return toApiValidationResponse(error)
        }
        console.error("Fetch post detail error:",error);
        return ApiResponse.error(ErrorCode.INTERNAL_ERROR, "服务器读取数据失败")
    }
}


//2.Post接口，接收前端发来的评论并存入数据库
export async function POST(request,{params}){
    try{
        const {id:postId} = await params
        const parsedPostId = positiveInt(postId, "帖子ID")

        const auth = await requireAuth(request, {
            missingMessage: "未登录，请先登录后再发表评论",
            invalidMessage: "登录失效，请重新登录",
        })
        if(!auth.ok){
            return auth.response
        }

        const userId = auth.userId

        //解析前端发来的JSON数据体
        const body = await readJsonBody(request)
        const content = requiredString(body.content, "评论内容") //坚决不结构前端传来的userId

        const userExists = await ensureUserExists(userId, {
            missingMessage: "登录失效，请重新登录",
        })
        if(!userExists.ok){
            return userExists.response
        }

        const postExists = await ensurePostExists(parsedPostId, {
            missingMessage: "未找到帖子",
        })
        if(!postExists.ok){
            return postExists.response
        }

        //执行插入数据库操作
        await db.insert(Comments).values({
            postId:parsedPostId,
            userId:userId,  //插入正确的Uerid
            content:content
        })

        //插入成功后返回给前端
        return ApiResponse.success(undefined, "评论发表成功")
    }catch(error){
        if(error instanceof ApiValidationError){
            return toApiValidationResponse(error)
        }
        console.error("Submit comment error",error)
        return ApiResponse.error(ErrorCode.INTERNAL_ERROR, "评论发表失败")
    }
}
