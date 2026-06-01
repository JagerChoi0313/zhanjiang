//退出登录接口
//退出登录的逻辑：让后端把浏览器里的那个cookie强行清空

import {ApiResponse} from "../../../../lib/api-response.mjs"
import {clearAuthCookie} from "../../../../lib/auth-cookie.mjs"

export async function POST(){
    const response = ApiResponse.success(undefined, "已成功退出登录")

    //将auth_token的过期时间设置为0，浏览器会自动销毁它
    clearAuthCookie(response)

    return response
}
