import { db } from '../../../database/index'
import { TasteCardTable } from '../../../database/schema'
import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm' // 需要引入 eq 来做条件查询

export async function GET(request, { params }) {
    try {
        // 1. 获取 URL 中传入的动态 id (比如 /api/tastecard/01 里的 01)
        const { id } = await params;

        // 2. 使用 drizzle 加入 where 条件查询单条数据
        const data = await db.select()
            .from(TasteCardTable)
            .where(eq(TasteCardTable.id, id));

        // 3. 如果没查到数据，返回 404
        if (data.length === 0) {
            return NextResponse.json({
                success: false,
                message: "未找到该美食档案"
            }, { status: 404 });
        }

        // 4. 获取唯一的那条数据
        const foodData = data[0];

        // 5. 防御性处理：确保 JSON 字段被正确解析（防止部分驱动将其识别为字符串）
        const parsedData = {
            ...foodData,
            tags: typeof foodData.tags === 'string' ? JSON.parse(foodData.tags) : foodData.tags,
            features: typeof foodData.features === 'string' ? JSON.parse(foodData.features) : foodData.features,
            nutrition: typeof foodData.nutrition === 'string' ? JSON.parse(foodData.nutrition) : foodData.nutrition,
            culture: typeof foodData.culture === 'string' ? JSON.parse(foodData.culture) : foodData.culture,
            recipes: typeof foodData.recipes === 'string' ? JSON.parse(foodData.recipes) : foodData.recipes,
        };

        // 6. 返回成功及数据
        return NextResponse.json({
            success: true,
            data: parsedData
        }, { status: 200 });

    } catch (error) {
        console.error("读取单条食材数据库失败：", error)
        return NextResponse.json({
            success: false,
            message: "获取味觉卡片详情失败"
        }, { status: 500 });
    }
}