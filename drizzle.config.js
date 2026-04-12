// drizzle.config.js:这是给 Drizzle 的“命令行工具”用的，告诉它去哪里找你的表定义。

import {defineConfig} from "drizzle-kit"

export default defineConfig({
    schema:"./db/schema.js",//我们定义的表结构文件
    out:"./drizzle",        //自动生成的迁移文件存放位置
    dialect:"mysql",        //声明我们用的是MySQL
    dbCredentials:{
        url:process.env.DATABASE_URL,   //数据库的钥匙，也是数据库的凭据，告诉drizzle具体的连接地址，用户名和密码
    },
});

