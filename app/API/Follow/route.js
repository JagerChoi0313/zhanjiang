import {db} from "../../../database/index"
import {Follows, Users} from "../../../database/schema"
import {eq,and} from "drizzle-orm"
import {ApiResponse, ErrorCode} from "../../../lib/api-response.mjs"
import {requireAuth} from "../../../lib/api-auth.mjs"
import {isDuplicateKeyError} from "../../../lib/db-errors.mjs"
import {
    ApiValidationError,
    positiveInt,
    readJsonBody,
    toApiValidationResponse,
} from "../../../lib/api-validation.mjs"

export async function GET(request){
    try{
        const auth = await requireAuth(request, {
            missingMessage: "未登录，请登录",
            invalidMessage: "登录过期，请重新登录",
        })
        if(!auth.ok){
            return auth.response
        }

        const currentUserId = auth.userId

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
        const auth = await requireAuth(request, {
            missingMessage: "未登录，请先登录",
            invalidMessage: "登录过期，请重新登录",
        })
        if(!auth.ok){
            return auth.response
        }

        const currentUserId = auth.userId
        const body = await readJsonBody(request)
        const targetId = positiveInt(body.targetId, "目标用户ID")

        if(Number(currentUserId) === targetId){
            return ApiResponse.error(ErrorCode.VALIDATION_ERROR, "不能关注自己哦")
        }

        const targetUser = await db
            .select({userId: Users.userId})
            .from(Users)
            .where(eq(Users.userId, targetId))
            .limit(1)
        if(targetUser.length === 0){
            return ApiResponse.error(ErrorCode.NOT_FOUND, "目标用户不存在")
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
            //已经关注过，则取消关注；按关系键删除，顺带清掉历史重复记录
            await db.delete(Follows)
                .where(
                    and(
                        eq(Follows.followerId,currentUserId),
                        eq(Follows.followingId,targetId)
                    )
                )

            return ApiResponse.success({
                isFollowing:false
            }, "已取消关注")
        }else{
            //没有关注过，则添加关注
            try{
                await db.insert(Follows).values({
                    followerId:currentUserId,
                    followingId:targetId
                })
            }catch(error){
                if(!isDuplicateKeyError(error)){
                    throw error
                }
            }

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
