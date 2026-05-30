import {db} from "../../../database/index"
import {Users,posts,Comments,Favorites,Follows} from "../../../database/schema"
import {eq,count} from "drizzle-orm"
import {ApiResponse, ErrorCode} from "../../../lib/api-response.mjs"
import {
    ApiValidationError,
    positiveInt,
    toApiValidationResponse,
} from "../../../lib/api-validation.mjs"


export async function GET(request){
    try{
        //这段代码的作用是从当前请求的链接（URL）中，提取名为 id 的查询参数值。        
        // request.url：代表用户当前请求的完整网址字符串。
        // new URL(...)：将这个普通的字符串转换成一个标准的 URL 对象，方便 JavaScript 解析它的各个部分（域名、路径、参数等）。
        // { searchParams }：使用了 ES6 的“解构赋值”语法。它从刚刚生成的 URL 对象中，单独把专门管理查询参数（也就是链接里 ? 后面的部分）的 searchParams 属性提取出来。
        const {searchParams} = new URL(request.url)
        const targetId = searchParams.get('id')

        if(!targetId){
            return ApiResponse.error(ErrorCode.VALIDATION_ERROR, "缺少请求参数")
        }

        const parseId = positiveInt(targetId, "用户ID")

        //1.查询用户基本公开信息：
        const userBaseInfo = await db 
        .select({
            userId:Users.userId,
            nickname:Users.nickname,
            avatar:Users.avatar,
            gender:Users.gender,
            createAt:Users.createdAt,
            introduction: Users.introduction
        })
        .from(Users)
        .where(eq(Users.userId,parseId))
        .limit(1)

        if(userBaseInfo.length===0){
            return ApiResponse.error(ErrorCode.NOT_FOUND, "未找到该食客")
        } 

        //2.高阶性能优化：使用Promise.all并发执行5个统计查询
        //如果我们使用await一个一个查会很慢。Promise.all可以让他们同时起跑，瞬间完成
        const [
            postsCount,
            commentsCount,
            favoritesCount,
            followerCount,
            followingCount
        ] = await Promise.all([
            db.select({value:count()}).from(posts).where(eq(posts.userId,parseId)),
            db.select({value:count()}).from(Comments).where(eq(Comments.userId,parseId)),
            db.select({value:count()}).from(Favorites).where(eq(Favorites.userId,parseId)),
            db.select({value:count()}).from(Follows).where(eq(Follows.followingId,parseId)),
            db.select({value:count()}).from(Follows).where(eq(Follows.followerId,parseId))
        ])

        //将所有零散数据拼装成一个干净的JSON对象返回给前端
        const PublicUserData ={
            ...userBaseInfo[0],
            stats:{
                posts:postsCount[0].value,
                comments:commentsCount[0].value,
                favorites:favoritesCount[0].value,
                followerCount:followerCount[0].value,
                followingCount:followingCount[0].value
            }
        };

        return ApiResponse.success(PublicUserData)
    }catch(error){
        if(error instanceof ApiValidationError){
            return toApiValidationResponse(error)
        }
        console.error("Fetch public user info error:",error)
        return ApiResponse.error(ErrorCode.INTERNAL_ERROR, "获取信息失败，请稍后重试")
    }
}
