import {db} from '../../../database/index'
import {TasteCard} from '../../../database/schema'
import {NextResponse} from 'next/server'

export async function GET(){

    try{
        //使用drizzle查询食材
        const data = await db.select()
        .from(TasteCard)

        //返回JSON数据
        return NextResponse.json(data);
    }catch(error){
        console.error("读取食材数据库失败：",error)
        return NextResponse.json(
            {error:"Internal Server Error"},
            {status:500}
        );
    }
}