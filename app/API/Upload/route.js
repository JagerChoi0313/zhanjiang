//投稿功能中“图片上传”的实现
// 先把文件存到你的服务器 public/uploads 文件夹或者云存储，拿到 URL 后再塞进这个 POST 接口。

import {NextResponse} from "next/server"
import {writeFile} from 'fs/promises'   //专门用于异步写入文件的工具
import {join} from 'path'               //用于智能拼接文件路径（兼容windows和Mac）
import {v4 as uuidv4} from 'uuid'       //生成全球唯一标识符，防止文件名重复

export async function POST(request){
    try{
        const formData = await request.formData();  //解析前端传来的FormData格式数据（包含文件和其他文本）
        const file = formData.get('file');      //从表单中提取key为‘file’的内容

        if(!file){
            return NextResponse.json({
                success:false,
                message:"未找到文件"
            },{status:400})
        }

        //核心步骤：将文件转化为二进制数组缓冲区（ArrayBuffer）
        const bytes = await file.arrayBuffer();

        //进一步转化为Node.js标准的Buffer对象，这样writeFile才能识别
        const buffer  = Buffer.from(bytes);

        //文件名防重名处理
        const originalName = file.name;     //获取原始文件名，如“my——food.jpg”
        const fileExtension = originalName.split('.').pop();    //提取后缀，先按“.”进行分割，再取数组最后一个值，得到“jpg”
        const fileName = `${uuidv4()}.${fileExtension}`;       //拼接新名字：uuidv4()生成一串乱码 + 加上后缀


        //确定存储路径（存储在public/upload）
        // process.cwd() 获取项目根目录
        // join 拼接出物理路径：D:\project\zhanjiang\public\uploads\a1b2.jpg
        const path = join(process.cwd(),'public','upload',fileName)

        //写入文件
        // 真正将二进制数据写入到硬盘里
        await writeFile(path,buffer)

        //返回前端可直接访问的URL
        //因为Next.js默认将public映射到根，所以不需要加“public”
        const fileUrl = `/uploads/${fileName}`;

        console.log(`文件已保存至：${path}`)

        return NextResponse.json({
            success:false,
            url:fileUrl     //前端拿到这个后，再去提交给/API/Post接口
        })


    }catch(error){
        console.error('Upload Error:',error)
        return NextResponse.json({
            success:false,
            message:'服务器上传失败'
        },{status:500})
    }
}


// 形象化理解：图片上传的“仓库流程”
// 收货 (formData)：快递员（浏览器）送来一个包裹。

// 拆包 (arrayBuffer)：仓库管理员（后端）把包裹拆开，把里面的东西取出来。

// 贴标 (uuid)：为了防止仓库里有重名货物，管理员贴上一个新的、唯一的标签。

// 入库 (writeFile)：把货物放到指定的货架（public/uploads）上。

// 给提货单 (fileUrl)：给快递员一张提货单（URL），告诉他：“以后想看这件货，直接搜这个地址就行”。