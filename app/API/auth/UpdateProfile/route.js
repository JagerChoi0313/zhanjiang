import { db } from '../../../../database/index'
import { Users } from '../../../../database/schema'
import { eq } from 'drizzle-orm'
import { ApiResponse, ErrorCode } from "../../../../lib/api-response.mjs"
import { requireAuth } from "../../../../lib/api-auth.mjs"
import {ensureUserExists} from "../../../../lib/referential-integrity.mjs"
import {
    ApiValidationError,
    assertAllowedValue,
    isPhone,
    optionalIntRange,
    optionalAvatarUrl,
    optionalString,
    readJsonBody,
    requiredString,
    toApiValidationResponse,
} from "../../../../lib/api-validation.mjs"

export async function POST(request) {
    try {
        // 1. 鉴权：查验身份
        const auth = await requireAuth(request, {
            missingMessage: "未登录，无法修改资料",
            invalidMessage: "登录已失效，请重新登录",
        })
        if (!auth.ok) {
            return auth.response
        }

        const currentUserId = auth.userId

        // 2. 接收前端传来的数据（严格只拿这5个字段）
        const body = await readJsonBody(request)
        const nickname = requiredString(body.nickname, "昵称", { maxLength: 255 })
        const gender = assertAllowedValue(body.gender, ["male", "female", "secret"], "性别")
        const age = optionalIntRange(body.age, 1, 120, "年龄")
        const phoneNumber = optionalString(body.phoneNumber, "手机号")
        if (phoneNumber !== undefined && !isPhone(phoneNumber)) {
            throw new ApiValidationError("手机号格式不正确")
        }
        const introduction = optionalString(body.introduction, "个人简介", { maxLength: 500 })
        const hasAvatar = Object.prototype.hasOwnProperty.call(body, "avatar")
        const avatar = hasAvatar ? optionalAvatarUrl(body.avatar) : undefined

        const userExists = await ensureUserExists(currentUserId, {
            missingMessage: "登录失效，请重新登录",
        })
        if (!userExists.ok) {
            return userExists.response
        }

        // 3. 写入数据库
        const updateValues = {
            nickname,
            gender: gender ?? null,
            age: age ?? null,
            phoneNumber: phoneNumber ?? null,
            introduction: introduction ?? null // ✅ 存入个人简介
        }
        if (hasAvatar) {
            updateValues.avatar = avatar
        }

        await db.update(Users)
            .set(updateValues)
            .where(eq(Users.userId, currentUserId))

        return ApiResponse.success(undefined, "资料保存成功！")

    } catch (error) {
        if (error instanceof ApiValidationError) {
            return toApiValidationResponse(error)
        }
        console.error("更新个人资料失败：", error)
        return ApiResponse.error(ErrorCode.INTERNAL_ERROR, "服务器发生未知错误，资料保存失败")
    }
}
