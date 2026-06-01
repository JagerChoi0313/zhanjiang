# API 与路由工程化加固修改记录

## 范围

本文记录 `codex/route-component-cleanup` 分支准备合入 `master` 的主要修改。

本分支聚焦两类工程化工作：

- 清理误暴露的 App Router 子组件路由。
- 加固 API 返回结构、鉴权、参数校验、密码存储、上传鉴权和关系型副作用接口。

整体目标是保持页面视觉和正常功能入口不变，同时让后端接口契约更稳定，减少前后端字段漂移、未鉴权访问、参数脏数据和并发重复写入等问题。

## 提交摘要

- `9074197 refactor: move nested components out of route files`
  - 将嵌套的 `page.jsx` 子组件迁移到就近 `components/` 目录。
  - 保留真实页面路由，移除误暴露的子组件路由。

- `9fae77d chore: add api response helpers and build checks`
  - 新增统一 API 响应 helper。
  - 补充验证、构建相关脚本。

- `c9cd95b refactor: standardize api response envelopes`
  - 将 API 路由迁移到统一 `ApiResponse` 返回结构。
  - 统一成功、失败、创建成功、分页响应格式。
  - 分页信息统一迁移到 `meta.pagination`。

- `3f1cb35 refactor: harden api validation`
  - 新增共享参数校验 helper。
  - 加固必填字段、数字 ID、上传文件和常见表单字段校验。

- `8abcb73 test: cover api validation routes`
  - 增加 route 级行为测试。
  - 测试真实 API handler，仅 mock 数据库、JWT、文件写入等 I/O 边界。

- `64becae refactor: extract api auth helper`
  - 抽取 `requireAuth`，统一 cookie/JWT 鉴权逻辑。
  - 保留各路由原有的未登录、登录过期提示文案。

- `ae66c1b feat: hash passwords with bcrypt`
  - 使用 BCrypt 存储密码，cost 固定为 10。
  - 登录兼容旧明文密码，并在登录成功后迁移为 BCrypt hash。

- `61fc1e6 fix: validate comments and pagination params`
  - 加固评论内容和动态帖子 ID 校验。
  - 个人分页接口统一使用正整数页码校验。

- `a46941f fix: harden auth sessions and api consistency`
  - 统一鉴权 cookie 配置。
  - JWT secret 缺失时改为显式失败，不再静默使用弱默认值。
  - 补充 cookie 行为契约测试。

- `11452bd fix: validate dynamic api ids`
  - 加固动态路由 ID 和查询参数 ID 校验。

- `c37008e fix: require auth for uploads`
  - `Upload POST` 在读取 multipart body 前先完成鉴权。
  - 增加 Upload 鉴权行为测试和静态契约测试。

- `47d994f fix: harden relationship toggles`
  - 加固关注、收藏这类关系型 toggle 接口。
  - 补复合唯一约束、目标资源存在性校验、重复键竞态处理和 Drizzle 配置修正。

## 本次最新提交重点

提交：`47d994f fix: harden relationship toggles`

涉及文件：

- `app/API/Follow/route.js`
- `app/API/MyFavorites/route.js`
- `database/schema.js`
- `drizzle.config.js`
- `lib/db-errors.mjs`
- `test/api-field-contract.test.mjs`
- `test/api-route-validation.test.mjs`
- `docs/api-hardening-change-log.md`

### 关注接口

- `Follow POST` 写入关注关系前，先校验目标用户是否存在。
- 目标用户不存在时返回：
  - HTTP `404`
  - `ErrorCode.NOT_FOUND`
  - message：`目标用户不存在`
- 并发情况下如果插入时遇到重复键错误，按幂等成功处理，返回 `{ isFollowing: true }`。

### 收藏接口

- `MyFavorites POST` 写入收藏关系前，先校验目标帖子是否存在。
- 目标帖子不存在时返回：
  - HTTP `404`
  - `ErrorCode.NOT_FOUND`
  - message：`帖子不存在`
- 并发情况下如果插入时遇到重复键错误，按幂等成功处理，返回 `{ isFavorited: true }`。

### 数据库关系约束

`favorites` 表新增复合唯一约束：

```sql
CONSTRAINT favorites_user_post_unique UNIQUE(user_id, post_id)
```

`follows` 表新增复合唯一约束：

```sql
CONSTRAINT follows_follower_following_unique UNIQUE(follower_id, following_id)
```

这样可以从数据库层阻止同一个用户重复收藏同一篇帖子、重复关注同一个用户。

### Drizzle 配置修正

`drizzle.config.js` 原本指向不存在的 `./db/schema.js`，导致 Drizzle CLI 无法读取运行时真实 schema。

现在已修正为：

```js
schema: "./database/schema.js"
```

本地执行 `pnpm exec drizzle-kit export --config drizzle.config.js` 时，已确认读取的是：

```text
/Users/caixypromise/code/zhanjiang/database/schema.js
```

导出的 SQL 中也包含新增的两个复合唯一约束。

## Review 发现并已处理的问题

本轮整体 review 发现，关注和收藏接口存在相同模式的问题：

- 只校验了 ID 格式，没有校验目标资源是否真的存在。
- 使用 `select -> insert/delete` 的应用层判断，缺少数据库层唯一约束。
- 并发重复点击时，可能产生重复关系数据或依赖数据库外键错误下沉成 500。
- Drizzle CLI 配置没有指向真实 schema，导致 schema 约束无法通过配置化流程导出或应用。

本次没有只修单个接口，而是同时覆盖：

- `/API/Follow`
- `/API/MyFavorites`
- `Favorites` / `Follows` schema
- Drizzle CLI 配置
- route 行为测试和静态契约测试

## 验证记录

本地已完成以下验证：

```bash
pnpm test
pnpm lint
pnpm typecheck
pnpm build
pnpm exec drizzle-kit export --config drizzle.config.js
git diff --check
```

验证结果：

- `pnpm test` 通过。
- `pnpm lint` 通过，仍有既有 warning：0 errors，32 warnings。
- `pnpm typecheck` 通过。
- `pnpm build` 通过。
- `drizzle-kit export` 通过，并确认导出 SQL 包含：
  - `CONSTRAINT favorites_user_post_unique UNIQUE(user_id,post_id)`
  - `CONSTRAINT follows_follower_following_unique UNIQUE(follower_id,following_id)`
- `git diff --check` 通过。

## 上线注意事项

代码和 schema 定义已经准备好进入 review，但真实数据库还需要通过项目的 Drizzle push 或 migration 流程应用新增复合唯一约束。

在对已有数据库添加约束前，需要先检查并清理历史重复数据：

```sql
SELECT user_id, post_id, COUNT(*)
FROM favorites
GROUP BY user_id, post_id
HAVING COUNT(*) > 1;
```

```sql
SELECT follower_id, following_id, COUNT(*)
FROM follows
GROUP BY follower_id, following_id
HAVING COUNT(*) > 1;
```

如果存在重复记录，需要先保留一条、删除多余记录，再添加唯一约束。否则数据库在应用约束时会失败。

## 后续建议

本分支没有继续扩大范围处理所有 review 发现的问题。建议后续拆成独立 PR：

- 移除 `PostDetail` 前端硬编码 `CURRENT_USER_ID` 和提交 `userId` 的旧假设。
- 修复 `MyPost` / `MyFavorites` 搜索分页中 `totalCount` 与列表查询条件不一致的问题。
- 给评论、描述、图片数组等写入字段补长度和数量上限。
- 抽取前端统一 `fetchApi` / envelope 读取 helper，统一 `success/message/data/meta` 处理和错误提示。
