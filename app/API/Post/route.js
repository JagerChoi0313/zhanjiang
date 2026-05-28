import {db} from '../../../database/index'
import {posts} from '../../../database/schema'
import {desc} from 'drizzle-orm'
import {verifyToken} from '../../../lib/jwt'
import {Comments,Favorites,Users} from "../../../database/schema"
import {eq,sql} from "drizzle-orm"
import {like,or} from "drizzle-orm"     //引入like和or这两个用于搜索功能的模糊匹配神器
import {ApiResponse, ErrorCode} from '../../../lib/api-response.mjs'
import {
    ApiValidationError,
    optionalString,
    readJsonBody,
    requiredString,
    toApiValidationResponse,
} from '../../../lib/api-validation.mjs'


// GET请求，获取所有的帖子
export async function GET(request){
    try {
        //监听前端传来的搜索关键字
        const {searchParams} = new URL(request.url)
        const keyword = searchParams.get('q');

        //2.构建基础的查询条件
        //如果有关键字，就要求标题（title）或描述(description)里包含这个词，否则就是undefined(查全部)
        const searchCondition = keyword
            ? or(
                like(posts.title,`%${keyword}%`),
                like(posts.description,`%${keyword}%`)
            )
            :undefined;

        
        //构建不需要where的基础连接车厢
        let queryBuilder = db
        .select({
            id:posts.id,
            title:posts.title,
            description:posts.description,
            coverImage:posts.coverImage,
            location:posts.location,
            category:posts.category,
            createdAt:posts.createdAt,

            //关联出作者头像和昵称
            author:{
                nickname:Users.nickname,
                avatar:Users.avatar
            },

            //利用SQL实时计算每条帖子的收藏总数和评论总数
            //使用distinct确保在高并发时多表join时计数不会出现翻倍错误
            favoriteCount:sql`count(distinct ${Favorites.id})`.mapWith(Number),
            commentCount:sql`count(distinct ${Comments.id})`.mapWith(Number)
        })

        
        .from(posts)
        //1.关联用户表，拿到发帖人的真实昵称和头像
        .leftJoin(Users,eq(posts.userId,Users.userId))

        //2.关联收藏表,方便count计算
        .leftJoin(Favorites,eq(posts.id,Favorites.postId))

        //3.关联评论表，方便count计算
        .leftJoin(Comments,eq(posts.id,Comments.postId))

        //插入搜索条件
        .where(searchCondition)

        // 关键：只要用了 count() 这类聚合函数，必须按主表 id 进行分组隔离
        .groupBy(posts.id, Users.nickname, Users.avatar)
        //按时间倒序排列
        .orderBy(desc(posts.createdAt)) 
        
        //动态判断，只有前端传了搜索词，才挂上where过滤条件
        if(keyword){
            queryBuilder = queryBuilder.where(
                or(
                    like(posts.title,`%${keyword}%`),
                    like(posts.description,`%${keyword}%`)
                )
            )
        }

        const allPosts = await queryBuilder
            .groupBy(posts.id,Users.nickname,Users.avatar)
            .orderBy(desc(posts.createdAt))

        return ApiResponse.success(allPosts);
    } catch(error) {
        console.error("Fetch error:", error)
        return ApiResponse.error(ErrorCode.DATABASE_ERROR, "数据库读取失败")
    }
}

//Post请求：处理发帖投稿的逻辑

export async function POST(request){
    try{
        
        //从cookies中提取通行证并解密身份
        const token = request.cookies.get('auth_token')?.value
        if(!token){
            return ApiResponse.error(ErrorCode.UNAUTHORIZED, "未登录，请先登录")
        }

        const payload = await verifyToken(token)
        
        if(!payload){
            return ApiResponse.error(ErrorCode.UNAUTHORIZED, "登录失效，请重新登录")
        }

        //提取出经过后端校验，绝无可能被前端篡改的用户ID
        const userId = payload.userId;

        const body = await readJsonBody(request);
        const title = requiredString(body.title, "标题", {maxLength:255})
        const description = requiredString(body.description, "描述")
        const category = requiredString(body.category, "分类", {maxLength:50})
        const location = requiredString(body.location, "地点", {maxLength:100})
        const coverImage = optionalString(body.coverImage, "封面图")
        const images = body.images === undefined
            ? []
            : body.images

        if(!Array.isArray(images)){
            throw new ApiValidationError("图片列表必须是数组")
        }

        const normalizedImages = images.map((image) => {
            if(typeof image !== "string"){
                throw new ApiValidationError("图片地址必须是文本")
            }
            return image.trim()
        })

        //自动生成摘要：取描述的前100字
        const excerpt = description.substring(0,100);

        const result = await db.insert(posts).values({
            userId:userId,
            title:title,
            description:description,
            excerpt:excerpt,
            coverImage:coverImage,
            //重点：images是数组，入库前转成JSON字符串
            images:JSON.stringify(normalizedImages),
            category:category,
            location:location,
            createdAt:new Date()
        });

        return ApiResponse.created({postId:result.insertId}, "发布成功")
    }catch(error){
            if(error instanceof ApiValidationError){
                return toApiValidationResponse(error)
            }
            console.error("Post error:",error);
            return ApiResponse.error(ErrorCode.DATABASE_ERROR, "发布失败")
    }
}
