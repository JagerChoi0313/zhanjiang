import {mysqlTable,serial,varchar,timestamp,int} from 'drizzle-orm/mysql-core';

export const Users = mysqlTable("users",{
    id:serial("id").primaryKey(),
    nickname:varchar("nickname",{length:255}).notNull(),
    email:varchar("email",{length:255}).notNull().unique(),
    password:varchar("password",{length:255}).notNull(),
    phoneNumber: varchar("phoneNumber", { length: 20 }),
    gender: varchar("gender", { length: 10 }), 
    age: int("age"),
    createdAt:timestamp("createAt").defaultNow(),
})

export const HotRecommend=mysqlTable("hot_recommend",{
    id:serial("id").primaryKey(),   //唯一主键
    title:varchar("title",{length:255}).notNull(),  //美食标题：如“湛江白切鸡”

    //图片路径：存储如“/Image/Hot1.png”的字符串
    cover_image:varchar("cover_image",{length:500}),

    //浏览量和评论量建议用int，方便以后做“由高到低”的数学排序
    views:int("views").default(0),

    //权重分，可以手动设置，也可以根据算法计算，用于决定排名
    rankScore:int("rank_score").default(0),

    //区域字段，如“赤坎区，霞山区”
    district:varchar("district",{length:100}),

    createAt:timestamp("create_at").defaultNow(),
})


// 最激动人心的时刻：把表“推”进数据库
// 现在你的代码里有 Users 表的定义，但 MySQL 数据库里还是空的。
// 我们不需要手动去 DataGrip 里敲 CREATE TABLE，让 Drizzle 帮我们干。

// 在终端运行以下命令：

// npx drizzle-kit push

// 终端应该会显示类似 [✓] Changes applied successfully 的提示。

// 去你的 DataGrip 刷新一下，你会发现 zhanjiang_db 数据库里自动多出了一个叫 users 的表