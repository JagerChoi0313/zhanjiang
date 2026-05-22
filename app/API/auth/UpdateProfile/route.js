import { db } from '../../../../database/index'
import { Users } from '../../../../database/schema'
import { eq } from 'drizzle-orm'
import { NextResponse } from "next/server"
import { verifyToken } from "../../../../lib/jwt"

export async function POST(request) {
    try {
        // 1. 鉴权：查验身份
        const token = request.cookies.get('auth_token')?.value
        if (!token) {
            return NextResponse.json({ success: false, error: "未登录，无法修改资料" }, { status: 401 })
        }

        const payload = await verifyToken(token)
        if (!payload) {
            return NextResponse.json({ success: false, error: "登录已失效，请重新登录" }, { status: 401 })
        }

        const currentUserId = payload.userId

        // 2. 接收前端传来的数据（严格只拿这5个字段）
        const body = await request.json()
        const { nickname, gender, age, phoneNumber, introduction } = body

        if (!nickname || nickname.trim() === "") {
            return NextResponse.json({ success: false, error: "昵称不能为空哦" }, { status: 400 })
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

        return NextResponse.json({
            success: true,
            message: "资料保存成功！"
        }, { status: 200 })

    } catch (error) {
        console.error("更新个人资料失败：", error)
        return NextResponse.json({ success: false, error: "服务器发生未知错误，资料保存失败" }, { status: 500 })
    }
}