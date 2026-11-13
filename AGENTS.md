# Nice Books 项目约定

## 开始工作

- 本项目独立维护 Nice Books · 每日好书，采用博客迁移快照起步。源码、资源、字体依赖、配置、锁文件、测试、构建及 Pages 工作流由本项目持有。
- 先读 [README.md](README.md)、[package.json](package.json)、[站点配置](src/config.ts)、[Astro 配置](astro.config.mjs) 和[项目记忆索引](.codex/memories/index.md)，再按任务读取下列入口。
- 修改前运行 `git status --short --branch`、`git rev-parse HEAD`、`git remote -v`、`git worktree list`，保护现有改动。分支、远端、票册与部署状态均需当次复核。

## 源码与设计

- 书目唯一来源为 [books.ts](src/nice-books/data/books.ts)，领域结构见 [types.ts](src/nice-books/types.ts)。保留既有 ID 和数据校验，更新时同步核对文件头说明、详情路由及数据导出。
- SSR 与客户端重绘共用 [render.ts](src/nice-books/lib/render.ts)，Astro 页面通过同一构造器输出书卡、便签、标签和列表行。共享转义由 [escape-markup.ts](src/nice-books/lib/escape-markup.ts) 持有，保留 `render.esc` 的调用契约。
- 路由入口在 [src/pages](src/pages)。内部导航、数据请求和公共资源使用 `src/config.ts` 的 `sitePath()`，发布基路径由 `siteConfig.basePath` 统一传入 Astro。公开路由与返回主站地址见 README。
- 客户端入口为 [main.ts](src/nice-books/scripts/main.ts)，首次直接初始化，随后响应 `astro:page-load`。页面函数先查目标元素，再设置 `main.dataset.nbInit` 守卫。document 级监听通过既有守卫仅绑定一次。
- 页面资源通过 [shared.ts](src/nice-books/scripts/shared.ts) 的 `registerPageCleanup()` 登记，在 `astro:before-swap` 取消请求、计时器及动画，结束未完成的操作并释放初始化守卫。维护时覆盖中途离页、后退、重复进入和失败重试。减少动效复用 [prefersReducedMotion()](src/utils/runtime/reduced-motion.ts)，按每次调用即时查询。
- 视觉遵循[私人藏书桌设计](docs/nice-books-design.md)，优先复用本站 [components](src/nice-books/components)、[books.css](src/nice-books/styles/books.css) 和现有标记。暖纸、墨色、印章红及链接蓝均取自 `--nb-*` token，utility 映射见 [tailwind.config.cjs](tailwind.config.cjs)。
- 书体几何、封面家族分别由 [book-geometry.ts](src/nice-books/lib/book-geometry.ts)、[display.ts](src/nice-books/lib/display.ts) 持有。保留图片失败后的同书 SVG 兜底、`[hidden]` 语义、焦点层叠和减少动效行为。新增视觉细节沿用本站纸墨资产，具体尺寸与交互边界先查设计文档。

## 命令与验证

- 命令名与实现以 `package.json` 的 `scripts` 为真源，包管理器及版本从该文件读取，解析结果以 `pnpm-lock.yaml` 为准。运行条件、预览方式及 `NICE_BOOKS_BASE_URL` 的完整目录地址见 README。
- 代码改动按影响运行 `pnpm check`、`pnpm build`、`pnpm verify:pages-artifact`，其中 build 包含单测。客户端、视觉或生命周期改动再选用 README 对应的 smoke、设计、几何、404 或 dev Swup 浏览器检查。
- 纯文档改动检查 UTF-8、格式、路径、链接及 `git diff --check`。报告明确区分本轮执行与历史记录，书目数、用例数、页面数和依赖版本通过实际文件与命令输出复核。
- 本地迁移与浏览器证据入口为 [migration-acceptance.md](docs/migration-acceptance.md)，整改记录为 [review-acceptance.md](docs/review-acceptance.md)。本机 `output/` 被忽略，跨检出查证先用提交内摘要，再按需读取原始日志与账本。
- 发布相关工作先读 [pages-deployment.md](docs/pages-deployment.md)、[t3-acceptance.md](docs/t3-acceptance.md) 和实际 [pages.yml](.github/workflows/pages.yml)。线上验收关联目标 SHA、部署运行和生效产物，记录自然字体及 Pages 404 的实际结果。

## 文档与阶段边界

- 行为、路径、设计或发布契约变更时，同步对应 README、设计或验收文档。使用中文 UTF-8，以文件路径、函数或选择器定位约束。历史实测保留日期和提交，当前状态写入有日期的项目记忆，并更新索引。
- 迁移规格及票册仍在博客 GitHub Issues，用 `gh` 读取原文、原生子票和阻塞关系。入口为[规格 #153](https://github.com/CaiYan12/caiyan12.github.io/issues/153)，当前人工节点与后续依赖从项目记忆及实时票册复核。
- 遵守已确认的 Matt Pocock 阶段授权，按站长点名阶段推进。提交、集成、推送及生产发布使用对应轮次和仓库的明确授权。此前完成轮次的授权只用于追溯。
- 独立站首次发布、独立站线上验收、博客本地切换、博客生产切换依次推进。博客生产发布另需站长明确授权，旧地址退役由后续任务安排。完整迁移决定、授权来源和跨项目边界见[迁移交接记忆](.codex/memories/2026-11-13-migration-handoff.md)。
