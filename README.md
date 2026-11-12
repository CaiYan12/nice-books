# Nice Books · 每日好书

Nice Books 是独立构建的静态 Astro 项目。公开根路径为 `/nice-books/`，博客首页为 `https://caiyan12.github.io/`。

## 路由

| 页面     | 地址                    |
| -------- | ----------------------- |
| 今日好书 | `/nice-books/`          |
| 书库     | `/nice-books/archive/`  |
| 书籍详情 | `/nice-books/<id>/`     |
| 书目数据 | `/nice-books/data.json` |

## 本地运行与验证

本项目锁定 pnpm `10.26.2`；Astro、Swup、Tailwind、字体与测试依赖均从迁移快照的锁文件解析，并在 `package.json` 中固定到对应版本。

```powershell
pnpm install --frozen-lockfile
pnpm check
pnpm test:nice-books
pnpm build
pnpm dev -- --port 4321
```

`pnpm build` 会先运行全部 Nice Books 单测，再生成静态页面与 sitemap。构建产物可用 `pnpm preview -- --port 4322` 预览。

业务浏览器 smoke 默认访问 `http://localhost:4321/nice-books/`。对预览服务器运行时，把 `NICE_BOOKS_BASE_URL` 设为完整的页面目录地址：

```powershell
$env:NICE_BOOKS_BASE_URL = 'http://localhost:4322/nice-books/'
pnpm smoke:nice-books
```

## 维护约定

- 书目数据的单一来源是 `src/nice-books/data/books.ts`。沿用现有两位数字 ID、字段结构和数据校验；更新书目后运行 `pnpm test:nice-books`。
- `src/nice-books/lib/render.ts` 同时生成服务端页面和客户端重绘的标记；不要在 Astro 页面中再维护第二套书卡 HTML。
- 发布基路径由 `src/config.ts` 的 `siteConfig.basePath` 提供。内部页面、数据请求和公共资源路径使用 `sitePath()`，并与 `astro.config.mjs` 的 `base` 保持一致。
- `src/nice-books/scripts/main.ts` 负责三页共享初始化；页面进入时响应 `astro:page-load`，离页时由共享清理器响应 `astro:before-swap`，保持 Swup 切页、后退和请求/动画清理行为。
- `src/nice-books/styles/books.css` 与 `tailwind.config.cjs` 独立维护 Nice Books 样式。设计 token 和页面约定见 [`docs/nice-books-design.md`](docs/nice-books-design.md)。
- 头像图标由 `public/images/avatar.webp` 提供；思源黑体与 JetBrains Mono 由项目依赖提供。书宋和摘抄手写字体沿用页面中的现有字体服务地址。

迁移验收进度和 T1 证据见 [`docs/migration-acceptance.md`](docs/migration-acceptance.md)。

Pages 发布配置、建仓与首次部署操作见 [docs/pages-deployment.md](docs/pages-deployment.md)；T3 验收记录见 [docs/t3-acceptance.md](docs/t3-acceptance.md)。
