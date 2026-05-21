import {db} from "../../../database/index"
import {Follows} from "../../../database/schema"
import {eq,and} from "drizzle-orm"
import {NextResponse} from "next/server"
import {verifyToken} from  "../../../lib/jwt"

export async function GET(request){
    try{
        const token = request.cookies.get('auth_token')?.value
        if(!token){
            return NextResponse.json({
                success:false,
                message:"未登录，请登录"
            },{status:401})
        }

        const payload = await verifyToken(token)

        if(!payload){
            return NextResponse.json({
                success:false,
                message:"登录过期，请重新登录"
            },{status:401})
        }

        const currentUserId = payload.userId

        const {searchParams} = new URL(request.url)
        const targetUserId = searchParams.get("targetId")

        if(!targetUserId){
            return NextResponse.json({
                success:false,
                message:"缺少目标用户id"
            },{status:401})
        }

        //去数据库查有没有这条记录
        const existingFollow = await db
            .select()
            .from(Follows)
            .where(
                and(
                    eq(Follows.followerId,currentUserId),
                    eq(Follows.followingId,parseInt(targetUserId))
                )
            )

            return NextResponse.json({
                success:true,
                isFollowing:existingFollow.length>0
            },{status:200})

    }catch(error){
            console.error("Check follow status error:",error)
            return NextResponse.json({
                success:false,
                message:"检查状态失败"
            },{status:402})
    }
}

//post接口：处理“关注”和“取消关注”
export async function POST(request){
    try{
        const token=request.cookies.get('auth_token')?.value
        if(!token){
            return NextResponse.json({
                success:false,
                message:"未登录，请先登录"
            },{status:401})
        }

        const payload = await verifyToken(token)

        if(!payload){
            return NextResponse.json({
                success:false,
                message:"登录过期，请重新登录"
            },{status:401})
        }

        const currentUserId = payload.userId
        const body = await request.json()
        const {targetId} = body

        if(!targetId){
            return NextResponse.json({
                success:false,
                message:"缺少目标用户ID"
            },{status:401})
        }

        if(currentUserId === parseInt(targetId)){
            return NextResponse.json({
                success:false,
                message:"不能关注自己哦"
            },{status:401})
        }

        //检查是否已经关注过：
        const existingFollow = await db
            .select()
            .from(Follows)
            .where(
                and(
                    eq(Follows.followerId,currentUserId),
                    eq(Follows.followingId,parseInt(targetId))
                )
            )


        if (existingFollow.length>0){
            //已经关注过，则取消关注
            await db.delete(Follows)
                .where(eq(Follows.id,existingFollow[0].id))

            return NextResponse.json({
                success:true,
                message:"已取消关注",
                isFollowing:false
            })
        }else{
            //没有关注过，则添加关注
            await db.insert(Follows).values({
                followerId:currentUserId,
                followingId:parseInt(targetId)
            })

            return NextResponse.json({
                success:true,
                message:"关注成功",
                isFollowing:true
            },{status:200})
        }

    }catch(error){
            console.error("Follow action error:",error);
            return NextResponse.json({
                success:false,
                message:"操作失败，请重试"
            },{status:402})
    }
}