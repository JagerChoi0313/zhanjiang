import { db } from '../../../../database/index'
import { Users } from '../../../../database/schema'
import { eq } from 'drizzle-orm'
import { verifyToken } from "../../../../lib/jwt"
import { ApiResponse, ErrorCode } from "../../../../lib/api-response.mjs"

export async function POST(request) {
    try {
        // 1. 鉴权：查验身份
        const token = request.cookies.get('auth_token')?.value
        if (!token) {
            return ApiResponse.error(ErrorCode.UNAUTHORIZED, "未登录，无法修改资料")
        }

        const payload = await verifyToken(token)
        if (!payload) {
            return ApiResponse.error(ErrorCode.UNAUTHORIZED, "登录已失效，请重新登录")
        }

        const currentUserId = payload.userId

        // 2. 接收前端传来的数据（严格只拿这5个字段）
        const body = await request.json()
        const { nickname, gender, age, phoneNumber, introduction } = body

        if (!nickname || nickname.trim() === "") {
            return ApiResponse.error(ErrorCode.VALIDATION_ERROR, "昵称不能为空哦")
        }

        // 3. 写入数据库
        await db.update(Users)
            .set({
                nickname,
                gender,
                age: age ? parseInt(age) : null,
                phoneNumber,
                introduction // ✅ 存入个人简介
            })
            .where(eq(Users.userId, currentUserId))

        return ApiResponse.success(undefined, "资料保存成功！")

    } catch (error) {
        console.error("更新个人资料失败：", error)
        return ApiResponse.error(ErrorCode.INTERNAL_ERROR, "服务器发生未知错误，资料保存失败")
    }
}
