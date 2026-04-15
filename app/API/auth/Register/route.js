import {db} from "../../../../database/index";
import {Users} from "../../../../database/schema";
import {NextResponse} from "next/server";

export async function POST(request){

    try{
        //1.获取前端传过来的JSON数据
        // 这一步是把前端传来的“字符串”解构成具体的变量
        const {nickname,email,password,phoneNumber,gender,age}=await request.json();

        // 2. 执行插入操作（这是 Drizzle ORM 的语法）
        const result = await db.insert(Users).values({
            nickname:nickname,          // 前面是数据库字段，后面是上面解构出来的变量
            email:email,
            password:password,
            phoneNumber:phoneNumber,
            gender:gender,
            age:age
        })

        // 3. 返回成功响应
        // 这里的 success: true 会被前端的 `if(data.success)` 捕获
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



