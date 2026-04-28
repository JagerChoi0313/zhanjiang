import {mysqlTable, serial, varchar, timestamp, float, int,text} from 'drizzle-orm/mysql-core';
import {relations} from "drizzle-orm"

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
    rank_score:int("rank_score").default(0),

    //区域字段，如“赤坎区，霞山区”
    district:varchar("district",{length:100}),

    // 升级：为了“更多”页面的杂志感，我们增加这两个字段
    slogan: varchar("slogan", { length: 255 }),         // 简短口号
    category: varchar("category", { length: 100 }).default('全部'), // 分类标签

    createAt:timestamp("create_at").defaultNow(),
})

export const TalkRanking = mysqlTable("talk_ranking",{
    id:serial("id").primaryKey(),
    user_name:varchar("user_name",{length:100}).notNull(),
    comment:varchar("comment",{length:500}).notNull(),
    avatar:varchar("avatar",{length:500}),
    rating:int("rating").default(5),
    create_at:timestamp("create_at").defaultNow(),
})


// 1. 点位位置表 (父表)
export const ExploreSpots = mysqlTable("explore_spots", {
  id: serial("id").primaryKey(),
  
  // 区域标识
  areaSlug: varchar("area_slug", { length: 50 }).notNull(),
  areaName: varchar("area_name", { length: 100 }).notNull(),
  
  // 坐标信息
  dotLeft: float("dot_left").notNull(),
  dotTop: float("dot_top").notNull(),
  cardLeft: float("card_left").notNull(),
  cardTop: float("card_top").notNull(),
  
  // 连接线路径
  svgPath: varchar("svg_path", { length: 500 }),
  
  createdAt: timestamp("create_at").defaultNow(),
});

// 2. 轮播内容表 (子表)
export const ExploreCarousel = mysqlTable("explore_carousel", {
  id: serial("id").primaryKey(),
  
  // 关联 ExploreSpots 表的 id
  spotId: int("spot_id").notNull(),
  
  // 具体图文内容
  imgUrl: varchar("img_url", { length: 500 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: varchar("description", { length: 500 }),
  
  // 排序字段
  sortOrder: int("sort_order").default(0),
});



// 3. 定义表与表之间的关系 (可选，方便 Drizzle 进行 relational 查询)
export const ExploreSpotsRelations = relations(ExploreSpots, ({ many }) => ({
  carouselItems: many(ExploreCarousel),
}));

export const ExploreCarouselRelations = relations(ExploreCarousel, ({ one }) => ({
  spot: one(ExploreSpots, {
    fields: [ExploreCarousel.spotId],
    references: [ExploreSpots.id],
  }),
}));


export const TasteCardTable = mysqlTable("taste_card", {
  id: varchar('id', { length: 10 }).primaryKey(), // 补上了 ()
  name: varchar('name', { length: 255 }).notNull(), // 补上了 ()
  enName: varchar('en_name', { length: 100 }),
  desc: text('desc'),
  bgColor: varchar('bg_color', { length: 7 }),
  imagePath: varchar('image_path', { length: 255 }).default('/images/food/default.png')
});

export const posts = mysqlTable("posts",{
  id:serial('id').primaryKey(),
  username:varchar('username',{length:255}).notNull(),
  avatar:text('avatar'),
  title:varchar('title',{length:255}).notNull(),
  description:text('description'),
  coverImage:text('cover_image'),
  location:varchar('location',{length:100}),
  likes:int('likes').default(0),
  comments:int('comments').default(0),
  createAt:timestamp('createat').defaultNow,

})

// 最激动人心的时刻：把表“推”进数据库
// 现在你的代码里有 Users 表的定义，但 MySQL 数据库里还是空的。
// 我们不需要手动去 DataGrip 里敲 CREATE TABLE，让 Drizzle 帮我们干。

// 在终端运行以下命令：

// npx drizzle-kit push

// 终端应该会显示类似 [✓] Changes applied successfully 的提示。

// 去你的 DataGrip 刷新一下，你会发现 zhanjiang_db 数据库里自动多出了一个叫 users 的表