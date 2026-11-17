# 寻味湛江

> 一座城市的味道，不只在菜单里，也在每一个愿意分享的人手上。

![Next.js](https://img.shields.io/badge/Next.js-16.2.7-000000?style=flat-square&logo=nextdotjs)
![React](https://img.shields.io/badge/React-19.2.4-149ECA?style=flat-square&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Drizzle](https://img.shields.io/badge/Drizzle%20ORM-0.45.2-C5F74F?style=flat-square)
![MySQL](https://img.shields.io/badge/MySQL-8.x-4479A1?style=flat-square&logo=mysql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.x-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)

**寻味湛江** 是一个围绕湛江本土美食展开的社区型 Web 应用。它不只是一个菜品展示站，而是把「发现美食」「发布探店」「收藏互动」「用户主页」「地区味觉地图」这些体验合在一起，让用户可以从一张风味卡片、一篇帖子、一次收藏或一次关注开始，慢慢进入湛江的城市烟火。

项目基于 **Next.js App Router + React 19 + Drizzle ORM + MySQL** 构建，前端负责沉浸式的美食浏览和社区交互，后端提供统一响应、JWT 登录态、参数校验、上传鉴权、收藏/关注关系维护等能力。

AI 能力通过服务端 HTTP API 接入 **Dify**，包含本地知识检索问答（RAG）和图像识别 Chatflow。当前采用预设工作流编排，**尚未接入 MCP，也未开放模型自主调用外部工具**。

体验地址：[寻味湛江](https://zhanjiang.choiyizzz.cn/)。浏览内容后，可注册并登录体验 AI 提问和社区互动。

## 项目预览

> 下面是首页轮播使用的美食素材，并非完整页面截图。

![首页轮播素材](./public/Image/slider1.png)

## 为什么做它

湛江的美食很有地域层次：赤坎、霞山、麻章、坡头、遂溪、徐闻、雷州、廉江、吴川，每个地方都有自己的味觉记忆。传统的美食网站往往停留在「菜品介绍」或「排行榜」，而 **寻味湛江** 更希望把人、地点、菜品和故事连起来：

- 想了解湛江特色菜，可以从「探店寻味」「味觉卡片」「热门推荐」进入。
- 不知道眼前的小吃叫什么，可以在「寻味路线」上传照片，获取候选菜名与相关地方资料。
- 想找真实体验，可以看社区帖子、评论、收藏和热门话题。
- 想持续关注某位食客，可以进入用户主页并建立关注关系。
- 想自己贡献内容，可以发布图文探店或美食分享。

## 核心功能

### 美食发现

- 首页采用长页分区布局，保留顶部导航，提供轮播图及逐字循环标题动画，并尊重系统减少动态效果设置。
- 热门菜品、热门话题、食客评价等模块化内容展示。
- 湛江区域风味内容，包括赤坎、霞山、麻章、坡头、遂溪、徐闻、雷州、廉江、吴川等区域卡片。
- 味觉卡片系统，支持菜品详情、标签、起源、季节、做法、口味特征、营养与文化信息。
- 「寻味路线」提供文字提问与拍照识菜入口，可根据地点、时段、预算和口味获取初步建议；尚未接入实时地图、天气或商家营业数据。

### AI 问答与拍照识美食

- **RAG 问答**：Dify 文本应用检索本地知识资料后生成回答；资料按主题组织，尽量将正文与来源保存在同一分段，有来源网址时供用户核对。
- **多模态工作流**：视觉节点输出 `status`、`dish_name`、`observations`；仅当状态为 `recognized` 且菜名非空时，才进入知识检索与回答整理，否则返回固定补拍提示。
- **回答边界**：候选菜名与照片特征不等于确定鉴定，条件分支不能保证识别一定正确；相关资料不足时应说明，不能凭照片确认具体产地或店铺。
- **服务端接入**：文本与图片应用使用独立密钥。接口先校验登录和 CSRF，再处理输入，单图不超过 5 MB、问题最多 500 字符；每用户每分钟最多 20 次请求，上传与问答共用 45 秒超时预算。
- **当前限制**：使用 blocking 模式，未传递 `conversation_id`，请求按独立问答处理；限流保存在单进程内存。识图照片会发送至 Dify 及相应模型服务，本站不主动持久化识图原图，第三方留存规则需按实际服务配置确认。

### 美食社区

- 社区首页聚合帖子、热门话题、活跃用户和推荐内容。
- 用户可以发布美食帖子，包含标题、描述、分类、地点、封面图和多图内容。
- 支持帖子详情页、评论、收藏、搜索和分类浏览。
- 支持「我的帖子」「我的收藏」「我的评论」等个人内容管理入口。
- 「我的帖子」支持确认后删除本人帖子，服务端在更新条件中同时检查作者与内容状态，采用软删除，删除后不再公开展示。
- 推荐列表结合收藏、评论和发布时间排序，以对数压缩互动量并加入时间衰减；属于规则排序，尚未实现个性化机器学习推荐。
- 真实浏览量按浏览器访客标识与北京时间日期去重，同一浏览器每天对同一帖子计一次；清除 Cookie 或更换浏览器可能再次计数，不等同于真实人数。
- 发帖使用服务端规则过滤和可配置词表，不代表完整的语义内容审核。

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
- 写入接口使用 CSRF 防护；帖子删除按登录身份检查归属。
- 提供管理员内容管理与上传资源治理能力，区分正常内容、用户删除和管理员删除状态。

## 使用方式

1. **浏览**：从首页进入「探店寻味」查看区县入口，或进入「味觉卡片」了解菜品；通过「热门推荐」「用户互动」继续浏览榜单与帖子。
2. **文字问答**：登录后进入「寻味路线」，输入问题并发送，例如“下午逛赤坎老街，两人预算 100 元，不吃辣，有什么建议？”。等待回复后核对来源，出行前确认营业时间、价格和交通。
3. **拍照识菜**：点击「拍照识美食」，选择一张清晰食物近照，可附上问题后发送。图片不超过 5 MB；识别不清时根据提示重新上传。
4. **社区交流**：按分类或关键词寻找帖子，进入详情查看评论；登录后可发帖、评论、收藏及关注用户。在「我的帖子」中点击「删除」并确认，可删除自己的帖子。
5. **异常处理**：登录失效时重新登录，超时或服务异常时稍后重试，避免连续重复发送。

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
| AI 集成 | Dify 文本应用、知识库与 Chatflow；模型配置在 Dify 侧维护 |
| 部署 | Docker Compose、Nginx、MySQL 8.4 |
| 测试 | Node.js test runner |
| 工程化 | ESLint、TypeScript、Next typegen |

## 目录结构

```text
.
├── app
│   ├── API                         # App Router API routes
│   │   ├── auth                    # 登录、注册、退出、资料更新
│   │   ├── Post                    # 帖子列表、搜索、发布
│   │   ├── PostDetail              # 帖子详情、评论与浏览记录
│   │   ├── Dify/Chat               # 文字问答、图片上传与识别转发
│   │   ├── Admin                   # 管理员内容管理
│   │   ├── MyFavorites             # 收藏列表与收藏 toggle
│   │   ├── MyPost                  # 我的帖子列表与本人删帖
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
├── deploy                          # Docker Compose、Nginx 与容器入口
├── drizzle                         # 数据库版本迁移
├── scripts                         # 部署初始化、管理员初始化、上传清理
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
| `post_views` | 帖子浏览记录，按帖子、访客摘要与日期唯一约束去重 |
| `upload_assets` / `upload_claims` / `upload_references` | 上传文件资产、认领与引用关系 |

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
| `POST /API/PostDetail/[id]` | 发布评论 |
| `POST /API/PostDetail/[id]/View` | 记录去重浏览量 |
| `GET /API/MyPost` | 当前用户帖子列表 |
| `DELETE /API/MyPost/[id]` | 删除本人仍有效的帖子 |
| `GET /API/auth/Csrf` | 获取 CSRF 令牌 |
| `POST /API/Dify/Chat` | 文字问答或单图识别，要求登录与 CSRF |
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

建议使用 Node.js 24（与 Docker 镜像一致）、pnpm 10.24.0 和 MySQL 8.4。从项目根目录运行以下命令。AI 功能还需要单独配置并发布 Dify 应用，数据库迁移不会创建 Dify 知识库。

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

在项目根目录创建 `.env.local`：

```bash
DATABASE_URL="mysql://user:password@localhost:3306/zhanjiang_db"
JWT_SECRET="replace-with-a-long-random-secret"
DIFY_API_URL="https://api.dify.ai/v1"
DIFY_API_KEY="replace-with-text-app-key"
DIFY_VISION_API_KEY="replace-with-vision-chatflow-key"
# 可选：补充发布内容过滤词，多个词用英文逗号分隔
POST_BLOCKED_TERMS=""
```

> 不要把真实的 `.env.local` 提交到 GitHub，也不要给密钥变量加 `NEXT_PUBLIC_` 前缀。`DATABASE_URL` 用于 MySQL + Drizzle 连接，`JWT_SECRET` 用于签发和校验登录态。修改环境变量后需重启开发服务或重新创建部署容器。

如需使用「拍照识美食」，在 Dify 的识图 Chatflow「访问入口」创建应用 API 密钥，在服务端 `.env.local` 设置 `DIFY_VISION_API_KEY`。原有文字助手继续使用 `DIFY_API_KEY`。Docker Compose 部署时，从部署环境提供 `DIFY_VISION_API_KEY` 并重建应用容器。Chatflow 需已发布并启用图片上传。

### 3. 初始化数据库结构

先在 MySQL 中创建连接串对应的数据库。对新数据库执行仓库迁移；已有数据库先备份并核对迁移历史，不要直接覆盖。Drizzle 配置从进程读取 `DATABASE_URL`，以下命令显式加载本地环境文件：

```bash
node --env-file=.env.local node_modules/drizzle-kit/bin.cjs migrate --config drizzle.config.js
```

如果你只想检查 Drizzle 是否能读取 schema：

```bash
node --env-file=.env.local node_modules/drizzle-kit/bin.cjs export --config drizzle.config.js
```

迁移只负责表结构，不会自动导入线上帖子、菜品或知识库内容。需要另行准备有使用权限的业务数据，并在 Dify 中导入地方资料、配置检索和提示词、发布应用。

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
| `pnpm db:generate` | 生成数据库迁移 |
| `pnpm db:migrate` | 应用迁移，运行环境需提供 `DATABASE_URL` |
| `pnpm db:check` | 检查迁移一致性 |
| `pnpm db:export` | 导出 schema SQL |
| `pnpm deploy:init` | 初始化部署配置，运行前阅读脚本提示 |
| `pnpm deploy:mysql` / `pnpm deploy:migrate` | 启动部署数据库 / 执行迁移 |
| `pnpm deploy:up` / `pnpm deploy:up:nginx` | 启动应用 / 连同 Nginx 启动 |

部署配置见 [`deploy/docker-compose.yml`](./deploy/docker-compose.yml) 和 [`deploy/docker-compose.nginx.yml`](./deploy/docker-compose.nginx.yml)。部署前准备所引用的 secrets、持久化目录和证书；Compose 的配置来源与本地 Next.js `.env.local` 不同，不能只复制本地文件就认为部署配置完成。

## 测试覆盖

项目内置测试覆盖了多个关键后端契约：

- API 响应结构。
- API 参数校验。
- 路由级行为校验。
- 鉴权与 Cookie 行为。
- JWT 签发与校验。
- BCrypt 密码验证与迁移。
- 上传、收藏、关注等敏感接口的边界行为。
- 本人删帖的归属校验、重复删除、管理员删除状态保护，以及鉴权和 CSRF 拦截。

测试覆盖不代表所有用例在当前环境均已通过，应以实际命令输出为准。AI 识别和 RAG 还需要结合发布版本做人工验收，不能用单个成功样例代替准确率评测。

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
- **图片连接地方资料**：结构化菜名作为检索输入，结合照片特征与地方知识组织回答。
- **可追溯的知识组织**：将正文与来源同段保存，减少检索命中正文却缺少出处的问题。

## 后续规划

- [ ] 抽取统一前端 `fetchApi` helper，集中处理 `success/message/data/meta`。
- [ ] 增加帖子图片数量、文本长度、评论内容的更细粒度限制。
- [ ] 完善移动端社区页的信息密度与手势体验。
- [ ] 为美食地图接入真实 POI 数据与导航能力。
- [ ] 在现有规则过滤与管理员内容管理基础上，补充举报、申诉和更细致的内容审核。
- [ ] 建立固定 RAG 与识图评测集，记录正确性、引用支持情况、兜底表现和响应耗时。
- [ ] 评估语义检索、流式响应与多轮会话，将多实例限流迁移到共享存储。
- [ ] 按需接入天气、地图等只读数据服务，评估 MCP 标准化封装；当前版本尚未实现。
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

## 团队介绍

「寻味湛江」由 **蔡一志（Choi）、邵宇浛（Lucian）、庞嘉泺（Jerry）** 共同参与建设。三位成员均来自 **广东东软学院国际教育学院软件工程专业**。团队以湛江本地美食为主题，将软件开发、测试运维、视觉设计与内容运营结合起来，希望做出一个既能浏览地方风味，也能提问、交流和分享体验的网站。

### 蔡一志 Choi · 主要软件开发工程师 / 架构师 / 项目经理

蔡一志主要负责项目的软件开发与整体架构，同时承担项目经理职责，将产品想法拆解为可以实现、验证和交付的具体任务。

- **架构与技术选型**：规划前端页面、服务端接口、数据库和 AI 应用之间的职责边界，关注接口约定、数据关系与后续维护成本。
- **核心功能开发**：负责网站主要业务的开发与集成，涵盖美食浏览、社区互动、用户系统，以及 Dify 问答和拍照识别等功能的衔接。
- **工程质量**：关注身份校验、权限控制、输入检查和异常处理，使页面上的交互有对应的后端逻辑支撑。
- **项目推进**：梳理需求优先级、安排迭代任务，协调设计、测试与开发之间的反馈，并整理技术文档和交付说明。

这一角色既需要考虑“功能怎么实现”，也需要判断“当前最值得完成什么”，让技术方案与团队的时间、能力和实际使用需求保持一致。

### 邵宇浛 Lucian · 测试与运维

邵宇浛主要负责测试与运维，关注功能在不同操作路径下是否表现合理，以及网站部署后能否稳定访问。

- **功能测试**：围绕注册登录、发帖、评论、收藏、关注和本人删帖等流程设计检查步骤，核对输入、页面反馈与实际结果。
- **边界与异常验证**：关注未登录操作、无效输入、重复提交、图片限制和服务超时等情况，检查系统能否给出清楚的提示。
- **问题跟踪与回归**：整理问题的复现步骤和运行环境，与开发成员确认处理方案，并在修复后复核相关功能。
- **部署与运行维护**：参与环境配置、服务启动、日志排查和版本更新，关注配置差异、数据持久化及故障恢复准备。
- **AI 场景验证**：协助检查文字问答、食物图片识别和非食物图片兜底，记录结果与预期之间的差异，为后续优化提供依据。

测试与运维的工作重点是把“开发环境里能运行”推进到“用户操作时有明确反馈，出现问题时能够定位”。

### 庞嘉泺 Jerry · 设计与运营

庞嘉泺主要负责设计与运营，关注网站的视觉表达、信息组织，以及地方美食内容如何被用户发现和理解。

- **界面与视觉设计**：参与首页、功能入口和内容卡片的布局设计，协调配色、字体、图片与留白，使不同页面保持一致的视觉风格。
- **交互体验**：从用户视角梳理浏览、提问、上传和分享的操作路径，完善按钮文案、等待提示、空状态与错误提示。
- **内容组织**：参与菜品介绍、区域风味和社区主题的整理，关注表达是否清晰、资料是否有来源，以及图片与文字是否匹配。
- **社区运营**：围绕探店记录、地方吃法和食客交流规划内容方向，收集使用反馈，为功能调整和内容补充提供建议。
- **作品展示**：参与项目介绍、演示内容与展示材料的组织，让观众能够理解网站的使用方式和地方文化特色。

设计与运营共同服务于一个目标：让用户不仅愿意打开网站，也能迅速找到感兴趣的内容，并愿意留下自己的美食体验。

### 团队协作

三位成员以各自的主要职责为基础共同推进项目：设计与运营提出体验和内容需求，开发将其转化为页面与业务逻辑，测试与运维验证实际表现并反馈问题，再由团队共同确定下一轮改进重点。

成员分工并不意味着工作彼此割裂。涉及功能取舍、交互调整、内容准确性和演示准备时，团队共同讨论；涉及具体实现和问题修复时，由相应负责人推进。我们希望把课堂中的软件工程知识落实到一个可以持续改进的真实项目中，也让更多人通过「寻味湛江」认识这座城市的饮食文化。
