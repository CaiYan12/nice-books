# Changelog

## 2026-11-12：建立独立项目核心访问链

- 从博客快照 `550c3da9d0808cf3d55f8c2aa53b8b29fc520e19` 搬入 Nice Books 数据、页面、样式、字体依赖、头像、客户端工具、单测与业务 smoke；新项目自行构建。
- 将公开页面和数据端点设为 `/nice-books/` 基路径，并为内部链接、canonical、favicon、数据请求及本地资源统一加上基路径。返回主站指向 `https://caiyan12.github.io/`。
- 保留 Swup 的 main 容器切页、全局实例、页面初始化、导航高亮、浏览器后退与离页清理语义。未更改书目内容、ID、数据字段或页面交互规则。
- 验证：独立冻结安装、类型检查、51 项单测、构建、72 项 headless Chromium 业务 smoke 均通过；另对首页、书库、数据 JSON 与全部 70 个详情 URL 做直接 HTTP 核对。逐项结果见 [`docs/migration-acceptance.md`](docs/migration-acceptance.md)。
- 本条记录仅覆盖 T1 本地实现与验收；未推送或部署。
