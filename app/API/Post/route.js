import {db} from '../../../database/index'
import {posts} from '../../../database/schema'
import {and, desc} from 'drizzle-orm'
import {Comments,Favorites,Users} from "../../../database/schema"
import {eq,sql} from "drizzle-orm"
import {or} from "drizzle-orm"
import {ApiResponse, ErrorCode} from '../../../lib/api-response.mjs'
import {requireAuth} from '../../../lib/api-auth.mjs'
import {requireCsrf} from '../../../lib/csrf.mjs'
import {ensureUserExists} from '../../../lib/referential-integrity.mjs'
import {attachPostUploadReferences, findCurrentUploadClaims} from '../../../lib/upload-assets.mjs'
import { POST_CATEGORIES, POST_LOCATIONS, COMMUNITY_VIEWS } from "../../../lib/community.mjs";
import { assertPostContent } from "../../../lib/post-moderation.mjs";
import {CONTENT_STATUS} from '../../../lib/content-status.mjs'
import {
    ApiValidationError,
    assertAllowedValue,
    optionalString,
    positiveInt,
    readJsonBody,
    requiredString,
    toApiValidationResponse,
} from '../../../lib/api-validation.mjs'

// GET请求，获取所有的帖子
export async function GET(request){
    try {
        const { searchParams } = new URL(request.url);
        const keyword = searchParams.get("q")?.trim().slice(0, 80);
        const userId = searchParams.has("userId") ? positiveInt(searchParams.get("userId"), "用户ID") : undefined;
        const category = searchParams.get("category");
        const location = searchParams.get("location");
        const view = searchParams.get("view");
        if (category) assertAllowedValue(category, POST_CATEGORIES, "分类");
        if (location) assertAllowedValue(location, POST_LOCATIONS, "地区");
        if (view) assertAllowedValue(view, COMMUNITY_VIEWS, "排序");

        const searchPattern = keyword ? '%' + keyword.replace(/[!%_]/g, char => '!' + char) + '%' : null;
        const searchCondition = and(
            eq(posts.status, CONTENT_STATUS.ACTIVE),
            userId ? eq(posts.userId, userId) : undefined,
            category ? eq(posts.category, category) : undefined,
            location ? eq(posts.location, location) : undefined,
            searchPattern ? or(...[posts.title, posts.description, posts.location, Users.nickname]
                .map(column => sql`${column} LIKE ${searchPattern} ESCAPE '!'`)) : undefined,
        );

        const favorites = sql`count(distinct ${Favorites.id})`;
        const comments = sql`count(distinct ${Comments.id})`;
        const freshness = sql`1 / (1 + greatest(0, coalesce(timestampdiff(hour, ${posts.createdAt}, now()), 720)) / 168)`;
        const score = sql`(1 + ln(1 + 2 * ${favorites} + ${comments})) * ${freshness}`;

        const queryBuilder = db
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
        .leftJoin(Comments,and(eq(posts.id,Comments.postId), eq(Comments.status, CONTENT_STATUS.ACTIVE)))

        //插入搜索条件
        .where(searchCondition)

        // 关键：只要用了 count() 这类聚合函数，必须按主表 id 进行分组隔离
        .groupBy(posts.id, posts.isHot, Users.nickname, Users.avatar)
        .having(view === "featured" ? sql`(${posts.isHot} = true OR ${favorites} >= 2 OR ${comments} >= 3)` : undefined)
        //按时间倒序排列
        .orderBy(...(view === "recommended" ? [desc(score)] : []), desc(posts.createdAt), desc(posts.id))
        
        const allPosts = await queryBuilder

        return ApiResponse.success(allPosts);
    } catch(error) {
        if (error instanceof ApiValidationError) return toApiValidationResponse(error);
        console.error("Fetch error:", error)
        return ApiResponse.error(ErrorCode.DATABASE_ERROR, "数据库读取失败")
    }
}

//Post请求：处理发帖投稿的逻辑

export async function POST(request){
    try{
        const csrf = await requireCsrf(request)
        if(!csrf.ok){
            return csrf.response
        }
        
        const auth = await requireAuth(request, {
            missingMessage: "未登录，请先登录",
            invalidMessage: "登录失效，请重新登录",
        })
        if(!auth.ok){
            return auth.response
        }

        //提取出经过后端校验，绝无可能被前端篡改的用户ID
        const userId = auth.userId;

        const body = await readJsonBody(request);
        const title = requiredString(body.title, "标题", {maxLength:255})
        const description = requiredString(body.description, "描述", {maxLength: 5000})
        assertPostContent(title, description);
        const category = assertAllowedValue(
            requiredString(body.category, "分类", {maxLength:50}),
            POST_CATEGORIES,
            "分类"
        )
        const location = assertAllowedValue(
            requiredString(body.location, "地点", {maxLength:100}),
            POST_LOCATIONS,
            "地点"
        )
        const coverImage = optionalString(body.coverImage, "封面图")
        const images = body.images === undefined
            ? []
            : body.images

        if(!Array.isArray(images)){
            throw new ApiValidationError("图片列表必须是数组")
        }

        if (images.length > 9) throw new ApiValidationError("最多上传9张正文图片");

        const normalizedImages = images.map((image) => {
            if(typeof image !== "string"){
                throw new ApiValidationError("图片地址必须是文本")
            }
            return image.trim()
        })

        const userExists = await ensureUserExists(userId, {
            missingMessage: "登录失效，请重新登录",
        })
        if(!userExists.ok){
            return userExists.response
        }

        const uploadUrls = [
            coverImage,
            ...normalizedImages,
        ].filter(Boolean)
        const uploadClaims = await findCurrentUploadClaims({
            userId,
            purpose: "post",
            urls: uploadUrls,
        })

        //自动生成摘要：取描述的前100字
        const excerpt = description.substring(0,100);

        const result = await db.transaction(async (tx) => {
            const insertedPosts = await tx.insert(posts).values({
                userId:userId,
                title:title,
                description:description,
                excerpt:excerpt,
                coverImage:coverImage,
                images:normalizedImages,
                category:category,
                location:location,
                createdAt:new Date()
            }).$returningId();
            const postId = insertedPosts[0]?.id;

            await attachPostUploadReferences({
                userId,
                postId,
                coverImage,
                images: normalizedImages,
                claims: uploadClaims,
                client: tx,
            })

            return { insertId: postId }
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
