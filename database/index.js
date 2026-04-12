//创建一个实动连接实例，供API接口使用
import {drizzle} from 'drizzle-orm/mysql2';
import mysql from "mysql2/promise";
import * as schema from './schema';

//创建一个数据库连接池（Connection Pool）
//这样网站在高并发下性能才会更好
const connection = mysql.createPool({
    url:process.env.DATABASE_URL,
});

//初始化drizzle实例
export const db = drizzle(connection,{schema,mode:"default"});




