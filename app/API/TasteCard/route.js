import {db} from '../../../database/index'
import {TasteCardTable} from '../../../database/schema'
import {NextResponse} from 'next/server'

export async function GET(){

    try{
        //使用drizzle查询食材
        const data = await db.select()
        .from(TasteCardTable)

        //返回JSON数据
        return NextResponse.json({
            success:true,
            data:data
        },{status:200});
    }catch(error){
        console.error("读取食材数据库失败：",error)
        return NextResponse.json({
            success:false,
            message:"获取味觉卡片内容失败"
        },{status:500}
        );
    }
}