import {db} from '../../../../database/index'       //你的数据库连接实例
import {Users,posts,Comments,Favorites,Follows} from '../../../../database/schema'   //你的数据库的表定义
import {eq,count} from 'drizzle-orm'
import {signToken} from "../../../../lib/jwt"          //引入刚刚封装的jwt工具
import {ApiResponse, ErrorCode} from "../../../../lib/api-response.mjs"
import {requireAuth} from "../../../../lib/api-auth.mjs"
import {setAuthCookie} from "../../../../lib/auth-cookie.mjs"
import {hashPassword, verifyPassword} from "../../../../lib/password.mjs"
import {
    ApiValidationError,
    isEmail,
    readJsonBody,
    requiredString,
    toApiValidationResponse,
} from "../../../../lib/api-validation.mjs"

export async function POST(request){        // 必须叫 POST，对应前端的 method:'POST'

    try{
        const body = await readJsonBody(request)
        const email = requiredString(body.email, "邮箱")
        if (!isEmail(email)) {
            throw new ApiValidationError("邮箱格式不正确")
        }
        const password = requiredString(body.password, "密码")

        //先按邮箱查用户，再用统一密码校验兼容 BCrypt 和旧明文
        const userList = await db.select()      // 我要查询数据
        .from(Users)                            // 从 Users 这张表里查
        .where(eq(Users.email,email))           // 数据库里的 email 等于 用户输入的 email

        .limit(1);          // 只要找到一个匹配的就停下，提高效率

        if(userList.length>0){

            const user = userList[0];//提取出当前匹配到的用户信息
            const passwordCheck = await verifyPassword(password, user.password)

            if(!passwordCheck.matches){
                return ApiResponse.error(ErrorCode.UNAUTHORIZED, "邮箱或密码错误")
            }

            if(passwordCheck.needsMigration){
                await db.update(Users)
                    .set({password:await hashPassword(password)})
                    .where(eq(Users.userId,user.userId))
            }

            //准备塞进Token的数据包（payload）
            const tokenPayload = {
                userId:user.userId,    //确认为你数据库表里的ID字段名
            }

            //生成JWT Token
            const token = await signToken(tokenPayload)

            //构造Next.js的响应对象
            const response = ApiResponse.success({
                user:{
                    userId:user.userId,
                    nickname:user.nickname,
                    avatar:user.avatar , //把头像也返回，方便前端直接使用
                    gender:user.gender,
                    age:user.age,
                    phoneNumber:user.phoneNumber,
                    email:user.email
                }
            }, "登录成功")

            //4.将Token种入HttpOnly Cookie
            setAuthCookie(response, token);

            //5.返回带有Cookies的响应
            return response;

        }else{
            return ApiResponse.error(ErrorCode.UNAUTHORIZED, "邮箱或密码错误")
        }
    }catch(error){
        if (error instanceof ApiValidationError) {
            return toApiValidationResponse(error)
        }
        console.error("登录操作失败:",error)
        return ApiResponse.error(ErrorCode.INTERNAL_ERROR, "服务器内部错误")
    }
}

export async function GET(request){
    try{
        const auth = await requireAuth(request, {
            missingMessage: "未登录",
            invalidMessage: "登录已失效，请重新登录",
        })
        if(!auth.ok){
            return auth.response
        }
        
        //既然token里面有个userId，那就拿着这个userId去数据库里调出完整的资料
        const dbUserList = await db.select()
        .from(Users)
        .where(eq(Users.userId,auth.userId))
        .limit(1)

        if(dbUserList.length === 0){
            return ApiResponse.error(ErrorCode.NOT_FOUND, "该食客不存在")
        }

        const currentUser = dbUserList[0];

        const [postCountRes,commentCountRes,favoriteCountRes,followingCountRes,followerCountRes] = await Promise.all([
            db.select({value:count()}).from(posts).where(eq(posts.userId,auth.userId)),
            db.select({value:count()}).from(Comments).where(eq(Comments.userId,auth.userId)),
            db.select({value:count()}).from(Favorites).where(eq(Favorites.userId,auth.userId)),
            db.select({value:count()}).from(Follows).where(eq(Follows.followerId,auth.userId)), // 计算我关注了多少人
            db.select({value:count()}).from(Follows).where(eq(Follows.followingId,auth.userId))  // 计算有多少人关注了我
        ])
        //校验通过，返回解析出的用户信息（供前端渲染和个人主页）
        return ApiResponse.success({
            user:{
                userId: currentUser.userId,
                nickname: currentUser.nickname,
                avatar: currentUser.avatar,
                gender: currentUser.gender,
                age: currentUser.age,
                phoneNumber: currentUser.phoneNumber,
                email: currentUser.email,
                introduction:currentUser.introduction,
                stats:{
                    posts: postCountRes[0]?.value || 0,
                    comments: commentCountRes[0]?.value ||0,
                    favorites:favoriteCountRes[0]?.value || 0,
                    followingCount: followingCountRes[0]?.value || 0, 
                    followerCount: followerCountRes[0]?.value || 0    
                }
            }
        })

    }catch(error){
        console.error("获取当前登录状态失败：",error)
        return ApiResponse.error(ErrorCode.INTERNAL_ERROR, "服务器内部错误")
    }
}
