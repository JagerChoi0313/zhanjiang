"use server"
import {db} from '../../../database/index'
import {Favorites,posts,Users} from  '../../../database/schema'
import {eq,desc,sql,and} from 'drizzle-orm'
import {like,or} from 'drizzle-orm'
import { ApiResponse, ErrorCode } from '../../../lib/api-response.mjs'
import {requireAuth} from '../../../lib/api-auth.mjs'
import {requireCsrf} from '../../../lib/csrf.mjs'
import {isDuplicateKeyError} from '../../../lib/db-errors.mjs'
import {ensurePostExists, ensureUserExists} from '../../../lib/referential-integrity.mjs'
import {CONTENT_STATUS} from '../../../lib/content-status.mjs'
import {
    ApiValidationError,
    positiveInt,
    readJsonBody,
    toApiValidationResponse,
} from '../../../lib/api-validation.mjs'


//如果前端传了postId进来，我们就只查询单篇帖子的收藏状态
export async function GET(request){
    try{
        const auth = await requireAuth(request, {
            missingMessage: "未登录，请先登录",
            invalidMessage: "登录已经失效，请重新登录",
        })
        if(!auth.ok){
            return auth.response
        }

        const userId = auth.userId   //获取真实的用户Id

        // 解析 URL 里的参数，比如 /api/my-favorites?page=2
        const {searchParams} = new URL(request.url);  
        
        //判断是不是单篇帖子来查岗
        const checkPostId = searchParams.get("postId")
        if(searchParams.has("postId")){
            const postId = positiveInt(checkPostId, "帖子ID")
            //如果传了PostId，就去查这个人有没有收藏过这篇帖子
            const existingFavorite = await db
            .select()
            .from(Favorites)
            .innerJoin(posts, eq(Favorites.postId, posts.id))
            .where(
                and(
                    eq(Favorites.postId,postId),
                    eq(Favorites.userId,userId),
                    eq(posts.status, CONTENT_STATUS.ACTIVE)
                )
            );
            //查到了就是true，没查到就是false
            return ApiResponse.success({isFavorited:existingFavorite.length>0})
        }

        //抓取关键词
        const keyword = searchParams.get('q')

        const pageParam = searchParams.get("page")
        const page = pageParam === null ? 1 : positiveInt(pageParam, "页码");  // 如果没传 page，默认就是第 1 页
        const pageSize=4;   // 每页只显示 4 条
        const offset = (page-1)*pageSize;       // 计算跳过多少条。比如第2页，就跳过前4条。

        //动态拼装查询条件
        const baseCondition = and(eq(Favorites.userId,userId), eq(posts.status, CONTENT_STATUS.ACTIVE))
        const searchCondition = keyword
            ?and(
                baseCondition,
                or(
                    like(posts.title,`%${keyword}%`),
                    like(posts.description,`%${keyword}%`)
                )
            )
            :baseCondition

        //查询收藏总条数
        // 这一步是为了告诉前端：用户一共收藏了多少个美食，好让前端算出“总页数”
        const totalResult = await db
            .select({count:sql`count(*)`})  // 使用原生 SQL 语法进行计数
            .from(Favorites)
            .innerJoin(posts,eq(Favorites.postId,posts.id))
            .where(searchCondition)     // 只数当前这个用户可见的收藏
        const totalCount = Number(totalResult[0].count);    // 把查到的结果转成纯数字

        //执行多表联查
        //从Favorites开始查，通过postId 关联 posts表获取美食详情
        const data = await db
            .select({
                favoriteId:Favorites.id,    //收藏记录本本身id
                facoriteAt:Favorites.createdAt,
                //抓取美食帖子信息
                postId:posts.id,
                postTitle:posts.title,
                postCover:posts.coverImage,
                postDescription:posts.description,

                //补全原帖作者信息和互动数据
                username:Users.nickname,
                avatar:Users.avatar,
                favoriteCount:sql`(SELECT COUNT(*) FROM favorites WHERE favorites.post_id= ${posts.id})`.mapWith(Number),
                commentCount:sql`(SELECT COUNT(*) FROM comments WHERE comments.post_id = ${posts.id} AND comments.status = ${CONTENT_STATUS.ACTIVE})`.mapWith(Number)
            })

            .from(Favorites)
            .innerJoin(posts,eq(Favorites.postId,posts.id))     // 【关键】：把收藏表里的 postId 对应到 posts 表的 id
            //核心关联区：关联上Users表，确保查出是谁发的这篇帖子
            .leftJoin(Users,eq(posts.userId,Users.userId))
            .where(searchCondition)
            .orderBy(desc(Favorites.createdAt))
            .limit(pageSize)
            .offset(offset)

        //返回标准响应式结构
        return ApiResponse.paginated(
            data,
            {
                totalCount:totalCount,
                pageSize:pageSize,
                totalPages:Math.ceil(totalCount/pageSize),
                currentPage:page
            }
        )

    }catch(error){
        if(error instanceof ApiValidationError){
            return toApiValidationResponse(error)
        }
        console.error("Fetch Favorites Error:",error)
        return ApiResponse.error(ErrorCode.INTERNAL_ERROR, "获取收藏列表失败")
    }
}


//POST接口：处理帖子的“收藏/取消收藏”的功能
export async function POST(request){
    try{
        const csrf = await requireCsrf(request)
        if(!csrf.ok){
            return csrf.response
        }

        const auth = await requireAuth(request, {
            missingMessage: "未登录，请先登录",
            invalidMessage: "登录已失效，请重新登录",
        })
        if(!auth.ok){
            return auth.response
        }

        const userId = auth.userId;//提取真实ID


        
        const body = await readJsonBody(request);
        const postId = positiveInt(body.postId, "帖子ID")      //千万不要相信前端传过来userid

        const userExists = await ensureUserExists(userId, {
            missingMessage: "登录失效，请重新登录",
        })
        if(!userExists.ok){
            return userExists.response
        }

        const postExists = await ensurePostExists(postId, {
            missingMessage: "帖子不存在",
        })
        if(!postExists.ok){
            return postExists.response
        }

        //去数据库里查一下看看有没有这个帖子
        //使用and（）必须同时满足：帖子Id匹配且用户Id匹配
        const existingFavorite = await db
            .select()
            .from(Favorites)
            .where(
                and(
                    eq(Favorites.postId,postId),
                    eq(Favorites.userId,userId)
                )
            )

            if(existingFavorite.length>0){
                //2.如果查到了数据（说明已经收藏过了），这次点击就是取消收藏；按关系键删除历史重复记录
                await db.delete(Favorites)
                        .where(
                            and(
                                eq(Favorites.postId,postId),
                                eq(Favorites.userId,userId)
                            )
                        )
                return ApiResponse.success({isFavorited:false}, "已取消收藏")
            }else{
                //如果还没查到数据（说明还没收藏），这次点击就是添加收藏
                try{
                    await db.insert(Favorites).values({
                        postId:postId,
                        userId:userId   //直接解析后端传进来的真实ID
                    });
                }catch(error){
                    if(!isDuplicateKeyError(error)){
                        throw error
                    }
                }

                return ApiResponse.success({isFavorited:true}, "收藏成功")
            }
    }catch(error){
                if(error instanceof ApiValidationError){
                    return toApiValidationResponse(error)
                }
                console.error("Favorite action error:",error)
                return ApiResponse.error(ErrorCode.INTERNAL_ERROR, "收藏操作失败")
    }
}
