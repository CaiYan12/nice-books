# Changelog

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
