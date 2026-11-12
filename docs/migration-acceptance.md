# T1 迁移验收（#154）

## 范围与状态

源快照为博客仓库 `550c3da9d0808cf3d55f8c2aa53b8b29fc520e19`；本票只交付可独立安装和构建的核心站点，以及现有单测和业务浏览器 smoke 的迁移。

- [x] 独立包、锁文件、Astro/Tailwind/PostCSS 配置、书目、样式、字体依赖、头像和测试工具由新项目持有。
- [x] 首页、书库、70 本详情页与 `data.json` 使用 `/nice-books/` 基路径；内部链接、资源、canonical、Open Graph 与数据请求适配该路径。
- [x] 返回主站地址为 `https://caiyan12.github.io/`。
- [x] 保留 Swup 全局实例、无刷新切页、后退恢复、页眉高亮、重复进入初始化与离页清理。
- [x] 原 Nice Books 单测及业务 smoke 已迁移，既有判据保留。
- [x] README、维护约定、变更记录和本票验证记录已建立。

独立 404 页面及完整视觉、几何验收属于 T2；Pages workflow 属于 T3，本记录不代替两票验收。

## 验证记录

| 验证                             | 结果           | 环境与证据                                                                                                                                              |
| -------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm install --frozen-lockfile` | 通过，退出码 0 | pnpm 10.26.2；锁文件已冻结，直接依赖版本与源快照实际解析版本一致                                                                                        |
| `pnpm check`                     | 通过，退出码 0 | Astro 检查 38 个文件，0 errors；有 2 条非阻断 TypeScript hints                                                                                          |
| `pnpm test:nice-books`           | 通过，51/51    | Node 24.18.0，迁移后的原单测                                                                                                                            |
| `pnpm build`                     | 通过，退出码 0 | 生成 72 个 HTML 页面（首页、书库与 70 个详情路由）、`data.json` 和 sitemap；构建日志无 `SAFE_DELETE_*`                                                  |
| `pnpm smoke:nice-books`          | 通过，72/72    | headless Chromium；`NICE_BOOKS_BASE_URL=http://127.0.0.1:4322/nice-books/`；Swup 访问旅程通过，console/pageerror 为零                                   |
| 直接 HTTP 路由与数据核对         | 通过           | `output/nice-books-migration/t1/route-audit.json`；首页、书库、数据入口均为 200；JSON 与源 `books` 深比较一致；70 个详情 URL 全部 200 且 canonical 正确 |

本机原始探针脚本为 `output/nice-books-migration/t1/route-audit.mjs`。该目录被忽略，不进入提交；上表保留结果摘要。

## 红绿过程与失败修正

- 基路径 smoke 先于路由迁移运行时，首页选择器超时 15 秒；当时 Astro 页面仍位于 `/nice-books/books/`，目标 `/nice-books/` 还没有首页。随后将页面迁到 Astro `base` 根路由并适配内部路径。
- 第一次运行迁移后的 smoke 时，业务 URL 字符串已更新，但 11 处正则仍匹配 `/books/`，导致书目 ID 提取报 `null`。保留原判据并更新正则后，全套 72 项通过。
- 首次 `pnpm check` 报出新增 `SiteFooter.astro` 的 frontmatter 分隔符错误；修正后检查通过。

全部本轮命令输出摘要和路由探针结果保存在本机忽略目录 `output/nice-books-migration/t1/`。本地未推送、未部署。
