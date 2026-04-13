import {mysqlTable,serial,varchar,timestamp} from 'drizzle-orm/mysql-core';

export const Users = mysqlTable("users",{
    id:serial("id").primaryKey(),
    nickname:varchar("nickname",{length:255}).notNull(),
    email:varchar("email",{length:255}).notNull().unique(),
    createdAt:timestamp("createAt"),
})


// 最激动人心的时刻：把表“推”进数据库
// 现在你的代码里有 Users 表的定义，但 MySQL 数据库里还是空的。
// 我们不需要手动去 DataGrip 里敲 CREATE TABLE，让 Drizzle 帮我们干。

// 在终端运行以下命令：

// npx drizzle-kit push

// 终端应该会显示类似 [✓] Changes applied successfully 的提示。

// 去你的 DataGrip 刷新一下，你会发现 zhanjiang_db 数据库里自动多出了一个叫 users 的表