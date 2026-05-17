import {db} from '../../../../database/index'       //你的数据库连接实例
import {Users} from '../../../../database/schema'   //你的数据库的表定义
import {eq,and} from 'drizzle-orm'                  
import {NextResponse} from "next/server"            //Next.js提供的响应式回复工具
import {signToken} from "../../../lib/jwt"          //引入刚刚封装的jwt工具

export async function POST(request){        // 必须叫 POST，对应前端的 method:'POST'

    try{
        const {email,password} = await request.json();

        //在user中同时查找邮箱和密码匹配同时匹配的记录
        const userList = await db.select()      // 我要查询数据
        .from(Users)                            // 从 Users 这张表里查
        .where(                                 // 过滤条件是：
            and(                                // 同时满足以下两点：
                eq(Users.email,email),          // 数据库里的 email 等于 用户输入的 email
                eq(Users.password,password)     // 数据库里的密码 等于 用户输入的密码
            )
        )

        .limit(1);          // 只要找到一个匹配的就停下，提高效率

        if(userList.length>0){

            const user = userList[0];//提取出当前匹配到的用户信息

            //准备塞进Token的数据包（payload）
            const TokenPayload = {
                userId:user.user_id,    //确认为你数据库表里的ID字段名
                nickname:user.nickname,
                avatar:user.avatar
            }

            //生成JWT Token
            const token = await signToken(tokenPayload)

            //构造Next.js的响应对象
            const response = NextResponse.json({
                success:true,
                message:"登录成功",
                user:{
                    nickname:user.nickname,
                    avatar:user.avatar  //把头像也返回，方便前端直接使用
                }
            })

            //4.将Token种入HttpOnly Cookie
            response.cookies.set({
                name:'auth_token',
                value:token,
                httpOnly:true,  //核心安全配置：防止前端js窃取
                secure:process.env.NODE.ENV === "production",   //生产环境开启HTTPs专属
                sameSite:'lax',     //防止跨站请求伪造（CSRF）
                path:'/',       //cookie在全站均有效
                maxAge:7 * 24 * 60 * 60     //过期时间：7天（这里是以秒为单位）
            });

            //5.返回带有Cookies的响应
            return response;

            return NextResponse.json({
                success:true,
                user:{nickname:userList[0].nickname}
            })
        }else{
            return NextResponse.json(
                {success:false,error:"邮箱或密码错误"},
                {status:401}
            )
        }
    }catch(error){
        console.error("登录操作失败:",error)
        return NextResponse.json(
            {success:false,error:"服务器内部错误"},
            {status:500}
        )
    }
}