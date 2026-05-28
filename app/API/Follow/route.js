import {db} from "../../../database/index"
import {Follows} from "../../../database/schema"
import {eq,and} from "drizzle-orm"
import {verifyToken} from  "../../../lib/jwt"
import {ApiResponse, ErrorCode} from "../../../lib/api-response.mjs"
import {
    ApiValidationError,
    positiveInt,
    readJsonBody,
    toApiValidationResponse,
} from "../../../lib/api-validation.mjs"

export async function GET(request){
    try{
        const token = request.cookies.get('auth_token')?.value
        if(!token){
            return ApiResponse.error(ErrorCode.UNAUTHORIZED, "未登录，请登录")
        }

        const payload = await verifyToken(token)

        if(!payload){
            return ApiResponse.error(ErrorCode.UNAUTHORIZED, "登录过期，请重新登录")
        }

        const currentUserId = payload.userId

        const {searchParams} = new URL(request.url)
        const targetUserId = positiveInt(searchParams.get("targetId"), "目标用户id")

        //去数据库查有没有这条记录
        const existingFollow = await db
            .select()
            .from(Follows)
            .where(
                and(
                    eq(Follows.followerId,currentUserId),
                    eq(Follows.followingId,targetUserId)
                )
            )

            return ApiResponse.success({
                isFollowing:existingFollow.length>0
            })

    }catch(error){
            if(error instanceof ApiValidationError){
                return toApiValidationResponse(error)
            }
            console.error("Check follow status error:",error)
            return ApiResponse.error(ErrorCode.INTERNAL_ERROR, "检查状态失败")
    }
}

//post接口：处理“关注”和“取消关注”
export async function POST(request){
    try{
        const token=request.cookies.get('auth_token')?.value
        if(!token){
            return ApiResponse.error(ErrorCode.UNAUTHORIZED, "未登录，请先登录")
        }

        const payload = await verifyToken(token)

        if(!payload){
            return ApiResponse.error(ErrorCode.UNAUTHORIZED, "登录过期，请重新登录")
        }

        const currentUserId = payload.userId
        const body = await readJsonBody(request)
        const targetId = positiveInt(body.targetId, "目标用户ID")

        if(Number(currentUserId) === targetId){
            return ApiResponse.error(ErrorCode.VALIDATION_ERROR, "不能关注自己哦")
        }

        //检查是否已经关注过：
        const existingFollow = await db
            .select()
            .from(Follows)
            .where(
                and(
                    eq(Follows.followerId,currentUserId),
                    eq(Follows.followingId,targetId)
                )
            )


        if (existingFollow.length>0){
            //已经关注过，则取消关注
            await db.delete(Follows)
                .where(eq(Follows.id,existingFollow[0].id))

            return ApiResponse.success({
                isFollowing:false
            }, "已取消关注")
        }else{
            //没有关注过，则添加关注
            await db.insert(Follows).values({
                followerId:currentUserId,
                followingId:targetId
            })

            return ApiResponse.success({
                isFollowing:true
            }, "关注成功")
        }

    }catch(error){
            if(error instanceof ApiValidationError){
                return toApiValidationResponse(error)
            }
            console.error("Follow action error:",error);
            return ApiResponse.error(ErrorCode.INTERNAL_ERROR, "操作失败，请重试")
    }
}
