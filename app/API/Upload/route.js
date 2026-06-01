import {mkdir, writeFile} from 'fs/promises'
import {join} from 'path'               //用于智能拼接文件路径（兼容windows和Mac）
import {v4 as uuidv4} from 'uuid'       //生成全球唯一标识符，防止文件名重复
import {ApiResponse, ErrorCode} from "../../../lib/api-response.mjs"
import {ApiValidationError, toApiValidationResponse, validateUploadFile} from "../../../lib/api-validation.mjs"
import {requireAuth} from "../../../lib/api-auth.mjs"
import {normalizeUploadPurpose, processUploadImage} from "../../../lib/upload-image.mjs"

export async function POST(request){
    try{
        const auth = await requireAuth(request, {
            missingMessage: "未登录，请先登录",
            invalidMessage: "登录过期，请重新登录",
        })
        if(!auth.ok){
            return auth.response
        }

        const formData = await request.formData();  //解析前端传来的FormData格式数据（包含文件和其他文本）
        const file = formData.get('file');      //从表单中提取key为‘file’的内容

        let purpose;
        try{
            purpose = normalizeUploadPurpose(formData.get('purpose'))
            validateUploadFile(file);
        }catch(validationError){
            if(validationError instanceof ApiValidationError){
                return toApiValidationResponse(validationError)
            }

            throw validationError
        }

        //核心步骤：将文件转化为二进制数组缓冲区（ArrayBuffer）
        const bytes = await file.arrayBuffer();

        const buffer = Buffer.from(bytes);

        let processedImage;
        try {
            processedImage = await processUploadImage(buffer, { purpose })
        } catch (validationError) {
            if (validationError instanceof ApiValidationError) {
                return toApiValidationResponse(validationError)
            }

            throw validationError
        }

        const fileName = `${uuidv4()}.${processedImage.extension}`;

        //确定存储路径（存储在public/upload）
        // process.cwd() 获取项目根目录
        // join 拼接出物理路径：D:\project\zhanjiang\public\uploads\a1b2.jpg
        const uploadDir = join(process.cwd(),'public','upload')
        const path = join(uploadDir,fileName)

        //写入文件
        // 真正将二进制数据写入到硬盘里
        await mkdir(uploadDir, { recursive: true })
        await writeFile(path,processedImage.buffer)

        //返回前端可直接访问的URL
        //因为Next.js默认将public映射到根，所以不需要加“public”
        const fileUrl = `/upload/${fileName}`;

        return ApiResponse.success({
            url:fileUrl,
            mimeType:processedImage.mimeType,
            width:processedImage.width,
            height:processedImage.height,
            size:processedImage.size,
        })


    }catch(error){
        console.error('Upload Error:',error)
        return ApiResponse.error(ErrorCode.UPLOAD_ERROR, '服务器上传失败')
    }
}


// 形象化理解：图片上传的“仓库流程”
// 收货 (formData)：快递员（浏览器）送来一个包裹。

// 拆包 (arrayBuffer)：仓库管理员（后端）把包裹拆开，把里面的东西取出来。

// 贴标 (uuid)：为了防止仓库里有重名货物，管理员贴上一个新的、唯一的标签。

// 入库 (writeFile)：把货物放到指定的货架（public/uploads）上。

// 给提货单 (fileUrl)：给快递员一张提货单（URL），告诉他：“以后想看这件货，直接搜这个地址就行”。
