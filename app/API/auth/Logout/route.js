//退出登录接口
//退出登录的逻辑：让后端把浏览器里的那个cookie强行清空

import {NextResponse} from "next/server"

export async function POST(){
    const response = NextResponse.json({
        success:true,
        message:"已成功退出登录"
    })

    //将auth_token的过期时间设置为0，浏览器会自动销毁它
    response.cookies.set({
        name:'auth_token',
        value:'',
        maxAge:0,
        path:'/',
    })

    return response
}