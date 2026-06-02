# 寻味湛江

> 一座城市的味道，不只在菜单里，也在每一个愿意分享的人手上。

![Next.js](https://img.shields.io/badge/Next.js-16.2.2-000000?style=flat-square&logo=nextdotjs)
![React](https://img.shields.io/badge/React-19.2.4-149ECA?style=flat-square&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Drizzle](https://img.shields.io/badge/Drizzle%20ORM-0.45.2-C5F74F?style=flat-square)
![MySQL](https://img.shields.io/badge/MySQL-8.x-4479A1?style=flat-square&logo=mysql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.x-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)

**寻味湛江** 是一个围绕湛江本土美食展开的社区型 Web 应用。它不只是一个菜品展示站，而是把「发现美食」「发布探店」「收藏互动」「用户主页」「地区味觉地图」这些体验合在一起，让用户可以从一张风味卡片、一篇帖子、一次收藏或一次关注开始，慢慢进入湛江的城市烟火。

项目基于 **Next.js App Router + React 19 + Drizzle ORM + MySQL** 构建，前端负责沉浸式的美食浏览和社区交互，后端提供统一响应、JWT 登录态、参数校验、上传鉴权、收藏/关注关系维护等能力。

## 项目预览

> 下面的图片来自项目内置静态资源，可作为 GitHub README 的视觉首屏。

![寻味湛江首页预览](./public/Image/slider1.png)

## 为什么做它

湛江的美食很有地域层次：赤坎、霞山、麻章、坡头、遂溪、徐闻、雷州、廉江、吴川，每个地方都有自己的味觉记忆。传统的美食网站往往停留在「菜品介绍」或「排行榜」，而 **寻味湛江** 更希望把人、地点、菜品和故事连起来：

- 想了解湛江特色菜，可以从「经典名菜」「味觉卡片」「热门推荐」进入。
- 想找真实体验，可以看社区帖子、评论、收藏和热门话题。
- 想持续关注某位食客，可以进入用户主页并建立关注关系。
- 想自己贡献内容，可以发布图文探店或美食分享。

## 核心功能

### 美食发现

- 首页轮播与推荐内容，适合快速进入热门美食场景。
- 热门菜品、热门话题、食客评价等模块化内容展示。
- 湛江区域风味内容，包括赤坎、霞山、麻章、坡头、遂溪、徐闻、雷州、廉江、吴川等区域卡片。
- 味觉卡片系统，支持菜品详情、标签、起源、季节、做法、口味特征、营养与文化信息。
- 美食地图 / AI Agent 风格交互页面，用更轻松的方式探索地点和推荐。

### 美食社区

- 社区首页聚合帖子、热门话题、活跃用户和推荐内容。
- 用户可以发布美食帖子，包含标题、描述、分类、地点、封面图和多图内容。
- 支持帖子详情页、评论、收藏、搜索和分类浏览。
- 支持「我的帖子」「我的收藏」「我的评论」等个人内容管理入口。

### 用户系统

- 邮箱注册与登录。
- JWT + HttpOnly Cookie 登录态。
- BCrypt 密码哈希存储，并兼容旧明文密码的登录后迁移。
- 当前用户信息接口，返回基础资料与帖子数、评论数、收藏数、关注数、粉丝数等统计。
- 用户主页、资料更新、头像上传、关注/取消关注。

### 后端与安全治理

- 统一 API 响应结构：`success`、`code`、`message`、`data`、`meta`。
- 统一分页响应，分页信息收敛在 `meta.pagination`。
- API 参数校验，覆盖必填字段、邮箱格式、数字 ID、分页参数、枚举值、上传文件等场景。
- 上传接口先鉴权再读取 multipart body，减少未授权上传风险。
- 收藏与关注使用数据库唯一约束防止重复关系。
- 关系型 toggle 接口处理并发重复写入，尽量保持幂等。

## 技术栈

| 分类 | 技术 |
| --- | --- |
| 框架 | Next.js 16 App Router |
| UI | React 19、Ant Design 6、Lucide React、Ant Design Icons |
| 样式 | Tailwind CSS 4、DaisyUI、CSS Modules |
| 数据库 | MySQL、mysql2 |
| ORM | Drizzle ORM、Drizzle Kit |
| 鉴权 | JWT、Jose、HttpOnly Cookie |
| 密码 | BCryptJS |
| 测试 | Node.js test runner |
| 工程化 | ESLint、TypeScript、Next typegen |

## 目录结构

```text
.
├── app
│   ├── API                         # App Router API routes
│   │   ├── auth                    # 登录、注册、退出、资料更新
│   │   ├── Post                    # 帖子列表、搜索、发布
│   │   ├── PostDetail              # 帖子详情与评论
│   │   ├── MyFavorites             # 收藏列表与收藏 toggle
│   │   ├── MyPost                  # 我的帖子
│   │   ├── MyComments              # 我的评论
│   │   ├── Follow                  # 关注关系
│   │   └── Upload                  # 图片上传
│   ├── views
│   │   ├── discover                # 美食发现、地图、名菜、味觉卡片
│   │   ├── FoodCommunity           # 社区首页、收藏、评论、帖子管理
│   │   ├── FoodRanking             # 美食排行
│   │   ├── Login / Register        # 登录注册
│   │   ├── PostDetail              # 帖子详情页
│   │   ├── PostFunction            # 发帖编辑页
│   │   ├── Profile                 # 个人资料
│   │   └── User                    # 用户主页
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── database
│   ├── index.js                    # MySQL connection pool + Drizzle instance
│   └── schema.js                   # 用户、帖子、评论、收藏、关注、味觉卡片等表结构
├── lib
│   ├── api-auth.mjs                # API 鉴权 helper
│   ├── api-response.mjs            # 统一 API 响应
│   ├── api-validation.mjs          # 参数校验
│   ├── auth-cookie.mjs             # 登录态 Cookie 配置
│   ├── jwt.js                      # JWT 签发与校验
│   └── password.mjs                # 密码哈希与验证
├── public
│   ├── Image                       # 页面静态图、美食图、头像资源
│   └── upload                      # 上传图片目录
├── test                            # API、鉴权、响应契约、密码等测试
├── docs                            # 工程化加固记录
├── drizzle.config.js
└── package.json
```

## 数据模型

项目的核心数据表包括：

| 表 | 说明 |
| --- | --- |
| `users` | 用户资料、邮箱、密码、头像、简介等 |
| `posts` | 美食帖子，包含标题、描述、封面、图片、分类、地点、热度信息 |
| `comments` | 帖子评论，与用户和帖子关联 |
| `favorites` | 用户收藏帖子关系，带复合唯一约束 |
| `follows` | 用户关注关系，带复合唯一约束 |
| `hot_recommend` | 热门推荐菜品 |
| `hot_topics` | 社区热门话题 |
| `talk_ranking` | 用户评价 / 口碑排行 |
| `taste_card` | 味觉卡片详情数据 |
| `explore_spots` | 美食地图点位 |
| `explore_carousel` | 地图点位关联轮播内容 |

## API 设计

所有主要 API 都使用统一响应格式：

```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "操作成功",
  "data": {},
  "meta": {}
}
```

分页接口会把分页信息放入：

```json
{
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 100
    }
  }
}
```

常见接口能力：

| 路由 | 能力 |
| --- | --- |
| `POST /API/auth/Register` | 用户注册 |
| `POST /API/auth/Login` | 用户登录并写入 HttpOnly Cookie |
| `GET /API/auth/Login` | 获取当前登录用户信息与统计 |
| `POST /API/auth/Logout` | 退出登录 |
| `POST /API/Post` | 发布帖子 |
| `GET /API/Post` | 帖子列表与关键词搜索 |
| `GET /API/PostDetail/[id]` | 帖子详情 |
| `POST /API/MyFavorites` | 收藏 / 取消收藏 |
| `GET /API/MyFavorites` | 我的收藏 |
| `POST /API/Follow` | 关注 / 取消关注 |
| `POST /API/Upload` | 鉴权后上传图片 |
| `GET /API/TasteCard` | 味觉卡片列表 |
| `GET /API/TasteCard/[id]` | 味觉卡片详情 |
| `GET /API/HotTopics` | 热门话题 |
| `GET /API/HotRanking` | 热门排行 |
| `GET /API/ActiveUser` | 活跃用户 |

## 本地运行

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

在项目根目录创建 `.env.local`：

```bash
DATABASE_URL="mysql://user:password@localhost:3306/zhanjiang_db"
JWT_SECRET="replace-with-a-long-random-secret"
```

> 不要把真实的 `.env.local` 提交到 GitHub。`DATABASE_URL` 用于 MySQL + Drizzle 连接，`JWT_SECRET` 用于签发和校验登录态。

### 3. 初始化数据库结构

```bash
pnpm exec drizzle-kit push
```

如果你只想检查 Drizzle 是否能读取 schema：

```bash
pnpm exec drizzle-kit export --config drizzle.config.js
```

### 4. 启动开发环境

```bash
pnpm dev
```

浏览器打开：

```text
http://localhost:3000
```

## 可用脚本

| 命令 | 说明 |
| --- | --- |
| `pnpm dev` | 启动本地开发服务器 |
| `pnpm build` | 构建生产版本 |
| `pnpm start` | 启动生产服务 |
| `pnpm lint` | 运行 ESLint |
| `pnpm typecheck` | 生成 Next 类型并执行 TypeScript 检查 |
| `pnpm test` | 运行 Node.js 测试 |

## 测试覆盖

项目内置测试覆盖了多个关键后端契约：

- API 响应结构。
- API 参数校验。
- 路由级行为校验。
- 鉴权与 Cookie 行为。
- JWT 签发与校验。
- BCrypt 密码验证与迁移。
- 上传、收藏、关注等敏感接口的边界行为。

运行：

```bash
pnpm test
```

## 项目亮点

- **不是纯展示页**：有真实社区能力，包含发帖、评论、收藏、关注和用户主页。
- **地域内容完整**：围绕湛江各区县做了美食发现和区域风味入口。
- **接口契约统一**：前后端可以围绕统一响应结构协作，减少字段漂移。
- **登录态更安全**：使用 HttpOnly Cookie 保存 JWT，减少前端脚本直接读取 token 的风险。
- **密码存储可靠**：使用 BCrypt 哈希，并支持旧密码格式迁移。
- **关系操作更稳**：收藏和关注通过唯一约束与幂等逻辑降低重复写入问题。
- **工程化意识明确**：有 lint、typecheck、test、Drizzle schema 与工程化加固记录。

## 后续规划

- [ ] 抽取统一前端 `fetchApi` helper，集中处理 `success/message/data/meta`。
- [ ] 增加帖子图片数量、文本长度、评论内容的更细粒度限制。
- [ ] 完善移动端社区页的信息密度与手势体验。
- [ ] 为美食地图接入真实 POI 数据与导航能力。
- [ ] 增加帖子点赞、举报、审核与内容安全能力。
- [ ] 增加更多湛江本地菜品数据和图文故事。
- [ ] 补充端到端测试，覆盖注册、登录、发帖、收藏完整流程。

## 贡献指南

欢迎为 **寻味湛江** 补充功能、修复问题或完善本地美食数据。

建议流程：

1. Fork 本仓库。
2. 新建功能分支。
3. 提交前运行 `pnpm lint`、`pnpm typecheck`、`pnpm test`。
4. 提交 Pull Request，并说明改动内容、测试结果和可能影响的页面或接口。

## 致谢

献给湛江的海风、白切鸡、海鲜、糖水、街头小吃，以及每一个愿意认真记录一顿饭的人。

如果这个项目让你想起某一家店、某一道菜、某个老城区的傍晚，欢迎点一个 Star，让更多人一起寻味湛江。
