//创建JWT工具文件
//为了让全栈代码都能方便地调用和校验Token的功能，我们在项目中新建一个专门的工具文件

//引入库与处理钥匙
import {SignJWT,jwtVerify} from 'jose'//jose库里的两个核心工具
//SignJWT用来“造”token  jwtVerify是用来验token

const GetJwtSecretKey=()=>{
    const secret = process.env.JWT_SECRET   //读取env.local里配置的那串长长的密码

    //安全兜底：如果生产环境中忘记配置环境变量，程序会立刻报错停止运行
    if(!secret){
        throw new Error('JWT_SECRET 环境变量未设置')
    }
    return new TextEncoder().encode(secret) 
    //这是jose库特殊且严格的一点，他不接受普通的字符串密码，必须把字符串转换成底层的“字节数组（Uint8Array）”
    //TextEncorder就是用来干这个翻译工作的
    
        
}


//生产token的工厂
//这个函数是当用户输入账号密码正确后，后端用来给用户发通行证的逻辑
export async function signToken(payload){   //payload是要存进token里的数据包（比如用户的userId和nickname）
    const secret = GetJwtSecretKey();       

    const token = await new SignJWT(payload)
        .setProtectedHeader({alg:'HS256'})   //使用HS256算法进行加密
        .setIssueAt()                       //打上时间戳
        .setExpirationTime('7d')            //设置通行证的有效期 7天
        .sign(secret);                      //贴上反伪钢印，防止别人伪造

    return token
}

//校验token的保安
export async function verifyToken(token){
    try{
        const secret = getJwtSecretKey()
        const {payload} = await jwtVerify(token,secret) //保安拿过通行证token，并掏出自己手里的对比样板（secret）
        return payload      //如果一切正常就返回
    }catch(error){
        console.error('Token校验失败：',error.message);
        return null
    }
}