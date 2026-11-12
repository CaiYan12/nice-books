# Changelog

## 2026-11-12：收敛审查发现并复验独立项目

- `src/nice-books/lib/render.ts` 与 `src/nice-books/styles/books.css` 将荐语和摘抄颜色统一到 `--nb-note-label`、`--nb-ink-warm`、`--nb-ink-warm-soft`；实测计算色仍为 `#6f5a35`、`#4a3f2c`、`#655a4a`，未调整布局值。
- 从 `tailwind.config.cjs` 移除未被 `src/` 使用的博客色板、通用 sans/mono 字体覆盖、wrapper/box 样式和 typography 插件；移除直接依赖及其独占锁条目。保留 `nb-*` 字色/字体映射。首个带 `--ignore-scripts` 的 `pnpm remove` 退出非零，重试后虽成功但产生了无关锁解析改写；该结果已舍弃，最终锁 diff 只删 typography 与其独占解析项，保留依赖版本未变。
- 新增 `src/nice-books/lib/escape-markup.ts` 共享字符串转义，`render.ts` 继续导出原 `esc` API；新增一项 XSS/空值兼容断言。独立审查范围与对照证据见 [`docs/review-acceptance.md`](docs/review-acceptance.md)。
- 验证（2026-11-12，Windows，Node.js 24.18.0 / pnpm 10.26.2）：冻结安装、检查、52 项单测、73 页构建与 Pages 产物校验均通过；预览浏览器 smoke 72/72、设计 67/67、几何 1507/1507、404 25/25 全部通过。受控对照 6/6 几何矩形、字体状态和页面错误数一致；archive 两张截图 hash 相同，其余四张 hash 有差异，且重复 after 截图也存在变化，因此不宣称截图逐像素一致。具体日志在本地忽略目录 `output/nice-books-migration/review-fixes/` 与 `review-fixes-qa/`。
- 此次只做本地审查整改，没有 push、PR 或部署。

## 2026-11-12：完成独立 404 与迁移体验验收（T2）

- 新增独立 Nice Books 404 页面；无效路径和无效书籍编号返回 404，页面复用站内页眉、页脚与样式，并提供“今日好书”和“书库”两个入口。404 使用 `noindex,follow`、不输出 canonical，且不高亮任何页面导航。
- 新增 404、设计、几何与开发 Swup 浏览器 QA 命令；保留原设计和几何断言，路径适配为 `/nice-books/`。将博客根页资源隔离边界留给 #159，在独立站检查自身资源/站内链接基路径和返回主站地址。
- 实测 404 25/25、设计 67/67、几何 1507/1507、业务 smoke 72/72、单测 51/51、dev Swup 4/4；合入 T3 后构建 73 页并通过 Pages 产物校验。具体环境、基线、覆盖和字体网络限制见 [`docs/migration-acceptance.md`](docs/migration-acceptance.md)。
- 当前 70 条书目 `coverUrl` 均为 `null`；本轮验证 schema 支持的基路径本地封面生成，以及实际图片失败时同书 SVG 兜底，不将其描述成当前书目已包含真实封面。
- 本地源站/独立项目 A/B 使用固定随机种子及相同成功字体响应 fixture。稳定采样的首页几何与 12 项关键计算样式一致；有限 PNG 像素差异与源站自身重复采样噪声一并保留记录，不宣称图像逐像素相同。

## 2026-11-12：准备 Nice Books 独立 Pages 发布

- 新增 [.github/workflows/pages.yml](.github/workflows/pages.yml)，对 main 的 PR 做冻结安装、类型检查、测试、静态构建和 dist 产物校验；只有 main 的 push 或手动运行可以部署。
- 新增 [scripts/verify-pages-artifact.mjs](scripts/verify-pages-artifact.mjs) 和 package.json 命令，直接核对首页、书库、书目数据、详情页、站内资源引用、canonical、Open Graph URL 与 sitemap 是否适配目标基路径。发布地址已由 src/config.ts 和 astro.config.mjs 决定，因此校验器以生成的 dist 为验收边界。
- 新增 [docs/pages-deployment.md](docs/pages-deployment.md) 与 [docs/t3-acceptance.md](docs/t3-acceptance.md)，记录动作版本 pin、建仓和首次发布步骤、SHA/run 核验方式以及本地证据。真实建仓、Pages 配置与首次发布由 #157 完成。
- 本地证据（2026-11-12，Windows，Node.js 24.18.0 / pnpm 10.26.2）：冻结安装通过；pnpm check 0 errors、0 warnings、2 hints；51 项单测通过并构建 72 页；产物校验核对 70 个详情路由与 72 条 sitemap URL，预览服务器冒烟 72/72 通过。错误的同源站点根 CSS 地址与错误 canonical 均被校验器拒绝，恢复产物后复验通过。
- 该记录是本地发布准备结果；GitHub Actions 尚未运行，线上首次发布待 #157。

## 2026-11-12：建立独立项目核心访问链

- 从博客快照 `550c3da9d0808cf3d55f8c2aa53b8b29fc520e19` 搬入 Nice Books 数据、页面、样式、字体依赖、头像、客户端工具、单测与业务 smoke；新项目自行构建。
- 将公开页面和数据端点设为 `/nice-books/` 基路径，并为内部链接、canonical、favicon、数据请求及本地资源统一加上基路径。返回主站指向 `https://caiyan12.github.io/`。
- 保留 Swup 的 main 容器切页、全局实例、页面初始化、导航高亮、浏览器后退与离页清理语义。未更改书目内容、ID、数据字段或页面交互规则。
- 验证：独立冻结安装、类型检查、51 项单测、构建、72 项 headless Chromium 业务 smoke 均通过；另对首页、书库、数据 JSON 与全部 70 个详情 URL 做直接 HTTP 核对。逐项结果见 [`docs/migration-acceptance.md`](docs/migration-acceptance.md)。
- 本条记录仅覆盖 T1 本地实现与验收；未推送或部署。
