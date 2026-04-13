import {db} from "../../../../database/index";
import {Users} from "../../../../database/schema";
import {NextResponse} from "next/server";

export async function POST(request){

    try{
        //1.获取前端传过来的JSON数据
        const {nickname,email}=await request.json();

        //2.执行插入操作
        const result = await db.insert(Users).values({
            nickname:nickname,
            email:email,
        });

        //返回成功响应
        return NextResponse.json({
            success:true,
            message:"注册成功，数据已入库"
        });

    }catch(error){
        console.error("数据库操作失败：",error);
        return NextResponse.json(
            {success:false,error:error.message},
            {status:500}
        );
    }
}



