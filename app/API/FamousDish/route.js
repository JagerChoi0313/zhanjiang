"use server"
import {db} from '../../../database/index'
import {ExploreSpots,ExploreCarousel} from '../../../database/schema'
import {eq} from 'drizzle-orm'
import {ApiResponse, ErrorCode} from '../../../lib/api-response.mjs'

export async function GET(){

    try{
        //查询所有的点位
        const spots = await db.select().from(ExploreSpots)

        //为每个点位查询对应的轮播内容
        //这里我们使用Promise.all并行查询，提高效率
        const fullData = await Promise.all(
            spots.map(async(spot)=>{
                const carouselItems = await db
                .select()
                .from(ExploreCarousel)
                .where(eq(ExploreCarousel.spotId,spot.id))
                .orderBy(ExploreCarousel.sortOrder)         //按排序字段排列

                return{
                    ...spot,
                    carousel_data:carouselItems         //将内容组合进点位对象中
                }
            })
        )

        return ApiResponse.success(fullData)

    }catch(error){
        console.error("获取探店数据失败:",error)

        return ApiResponse.error(ErrorCode.DATABASE_ERROR, "服务器内部错误")
    }
}
