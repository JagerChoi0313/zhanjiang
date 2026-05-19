import {db} from '../../../../database/index'       //你的数据库连接实例
import {Users,posts,Comments,Favorites} from '../../../../database/schema'   //你的数据库的表定义
import {eq,and,count} from 'drizzle-orm'            
import {NextResponse} from "next/server"            //Next.js提供的响应式回复工具
import {signToken} from "../../../../lib/jwt"          //引入刚刚封装的jwt工具
import {verifyToken} from "../../../../lib/jwt"     //解析token的工具

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
            const tokenPayload = {
                userId:user.userId,    //确认为你数据库表里的ID字段名
            }

            //生成JWT Token
            const token = await signToken(tokenPayload)

            //构造Next.js的响应对象
            const response = NextResponse.json({
                success:true,
                message:"登录成功",
                user:{
                    userId:user.userId,
                    nickname:user.nickname,
                    avatar:user.avatar , //把头像也返回，方便前端直接使用
                    gender:user.gender,
                    age:user.age,
                    phoneNumber:user.phoneNumber,
                    email:user.email
                }
            })

            //4.将Token种入HttpOnly Cookie
            response.cookies.set({
                name:'auth_token',
                value:token,
                httpOnly:true,  //核心安全配置：防止前端js窃取
                secure:process.env.NODE_ENV === "production",   //生产环境开启HTTPs专属
                sameSite:'lax',     //防止跨站请求伪造（CSRF）
                path:'/',       //cookie在全站均有效
                maxAge:7 * 24 * 60 * 60     //过期时间：7天（这里是以秒为单位）
            });

            //5.返回带有Cookies的响应
            return response;

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

export async function GET(request){
    try{
        //从请求头中提取名为 auth_token的Cookie
        const token = request.cookies.get('auth_token')?.value

        //如果没有token说明没登录
        if(!token){
            return NextResponse.json({
                success:false,
                error:"未登录"
            },{status:401})
        }

        //校验token是否有效或过期
        const payload=await verifyToken(token)

        if(!payload){
            return NextResponse.json({
                success:false,
                error:"登录已失效，请重新登录"
            },{status:401})
        }
        
        //既然token里面有个userId，那就拿着这个userId去数据库里调出完整的资料
        const dbUserList = await db.select()
        .from(Users)
        .where(eq(Users.userId,payload.userId))
        .limit(1)

        if(dbUserList.length === 0){
            return NextResponse.json({
                success:false,
                error:"该食客不存在"
            },{status:404})
        }

        const currentUser = dbUserList[0];

        const [postCountRes,commentCountRes,favoriteCountRes] = await Promise.all([
            db.select({value:count()}).from(posts).where(eq(posts.userId,payload.userId)),
            db.select({value:count()}).from(Comments).where(eq(Comments.userId,payload.userId)),
            db.select({value:count()}).from(Favorites).where(eq(Favorites.userId,payload.userId))

        ])
        //校验通过，返回解析出的用户信息（供前端渲染和个人主页）
        return NextResponse.json({
            success:true,
            user:{
                userId: currentUser.userId,
                nickname: currentUser.nickname,
                avatar: currentUser.avatar,
                gender: currentUser.gender,
                age: currentUser.age,
                phoneNumber: currentUser.phoneNumber,
                email: currentUser.email,
                stats:{
                    posts: postCountRes[0]?.value || 0,
                    comments: commentCountRes[0]?.value ||0,
                    favorites:favoriteCountRes[0]?.value || 0
                }
            }
        })

    }catch(error){
        console.error("获取当前登录状态失败：",error)
        return NextResponse.json({
            success:false,
            error:"服务器内部错误"
        },{status:500})
    }
}