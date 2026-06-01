import {db} from "../../../../database/index";
import {Users} from "../../../../database/schema";
import {eq} from "drizzle-orm";
import {ApiResponse, ErrorCode} from "../../../../lib/api-response.mjs"
import {hashPassword} from "../../../../lib/password.mjs";
import {requireCsrf} from "../../../../lib/csrf.mjs"
import {
    ApiValidationError,
    assertAllowedValue,
    isEmail,
    isPhone,
    optionalIntRange,
    optionalString,
    readJsonBody,
    requiredString,
    toApiValidationResponse,
} from "../../../../lib/api-validation.mjs"


export async function POST(request){

    try{
        const csrf = await requireCsrf(request)
        if(!csrf.ok){
            return csrf.response
        }

        //1.获取前端传过来的JSON数据
        // 这一步是把前端传来的“字符串”解构成具体的变量
        const body=await readJsonBody(request);
        const nickname=requiredString(body.nickname,"昵称",{maxLength:255});
        const email=requiredString(body.email,"邮箱");
        if(!isEmail(email)){
            throw new ApiValidationError("邮箱格式不正确");
        }
        const password=requiredString(body.password,"密码");
        if(password.length<6){
            throw new ApiValidationError("密码长度不能少于6位");
        }
        const phoneNumber=optionalString(body.phoneNumber,"手机号");
        if(phoneNumber!==undefined&&!isPhone(phoneNumber)){
            throw new ApiValidationError("手机号格式不正确");
        }
        const gender=assertAllowedValue(body.gender,["male","female","secret"],"性别");
        const age=optionalIntRange(body.age,1,120,"年龄");

        const existingUsers=await db.select({userId:Users.userId})
        .from(Users)
        .where(eq(Users.email,email))
        .limit(1);

        if(existingUsers.length>0){
            return ApiResponse.error(ErrorCode.CONFLICT, "该邮箱已注册");
        }

        const hashedPassword=await hashPassword(password);

        // 2. 执行插入操作（这是 Drizzle ORM 的语法）
        await db.insert(Users).values({
            nickname:nickname,          // 前面是数据库字段，后面是上面解构出来的变量
            email:email,
            password:hashedPassword,
            phoneNumber:phoneNumber ?? null,
            gender:gender ?? null,
            age:age ?? null,
        })

        // 3. 返回成功响应
        // 这里的 success: true 会被前端的 `if(data.success)` 捕获
        return ApiResponse.success(undefined, "注册成功，数据已入库");

    }catch(error){
        if(error instanceof ApiValidationError){
            return toApiValidationResponse(error);
        }
        console.error("数据库操作失败：",error);
        return ApiResponse.error(ErrorCode.DATABASE_ERROR, "注册失败，请稍后重试");
    }
}
