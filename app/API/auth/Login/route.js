import {db} from '../../../../database/index'       //你的数据库连接实例
import {Users} from '../../../../database/schema'   //你的数据库的表定义
import {eq,and} from 'drizzle-orm'                  
import {NextResponse} from "next/server"            //Next.js提供的响应式回复工具

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