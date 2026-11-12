# T3 Pages 发布准备验收

日期：2026-11-12

## 范围与状态

本票在独立 Nice Books 工作树完成本地发布准备。起点为 T1 集成提交 8d6ab99a51efed5b9862c9b787cba07d3370a371；将 codex/nice-books-integration 合入本票分支时结果为 Already up to date。

本票没有改 src/config.ts、astro.config.mjs 或任何依赖版本。T2 的独立 404 与浏览器几何验收不属于本票前置；校验器不要求 404 存在，若 dist/404.html 存在，则检查它的站内资源路径及返回 Nice Books 的入口，不要求 404 具备 canonical 或出现在 sitemap。全部分支集成后的联合验收仍需由集成负责人执行。

## 配置核对

- src/config.ts 中 siteURL 为 https://caiyan12.github.io，basePath 为 /nice-books；astro.config.mjs 将这两个值传给 Astro 与 sitemap。
- package.json 固定 packageManager 为 pnpm@10.26.2。本地实际 Node.js 为 v24.18.0、pnpm 为 10.26.2；已安装 Astro 7.4.4 声明 Node.js >=22.23.4，本地与工作流使用的 Node 版本满足该要求。
- 2026-11-12 通过 GitHub 官方仓库只读核对动作版本与完整 SHA；对应 pin 记录在 .github/workflows/pages.yml：checkout v7.0.1、pnpm/action-setup v6.1.1、setup-node v7.1.0、upload-pages-artifact v5.0.0、deploy-pages v5.0.1。
- .github/workflows/pages.yml 已通过 Prettier YAML 解析与格式检查。GitHub 上尚未运行该工作流，本地配置检查不代表远端 Actions 成功。
- 当前本地 Git 没有配置 remote。只读 gh repo view CaiYan12/nice-books 返回 GraphQL 无法解析该仓库；本轮没有创建远端仓库、配置真实 Pages 或部署。

## 本地验证记录

环境：Windows PowerShell，Node.js v24.18.0，pnpm 10.26.2。验证时工作树基于 T1 提交，尚未合入 T2。

| 检查                            | 结果                                                                                                                                                                                           |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| pnpm install --frozen-lockfile  | 通过；锁文件无需更新。pnpm 提示 esbuild@0.27.7 构建脚本被忽略，后续检查与构建仍通过。                                                                                                          |
| pnpm check                      | 0 errors、0 warnings、2 hints。提示分别是 scripts/nice-books-smoke.mjs:473 的未使用参数 w，以及 src/nice-books/scripts/home.ts:42 可转为 async 的提示。                                        |
| pnpm build                      | 51 项单测全部通过；静态构建 72 页并生成 sitemap。Vite 输出一条既有的 cover.ts ineffective dynamic import warning。                                                                             |
| pnpm verify:pages-artifact      | 通过：72 个内容页、70 个详情路由、72 条 sitemap URL、1465 个同源 URL 引用、107 个 CSS url()。canonical 与 Open Graph URL 均与发布地址一致。                                                    |
| pnpm smoke:nice-books (preview) | NICE_BOOKS_BASE_URL 指向 http://localhost:4322/nice-books/，72/72 业务冒烟通过；包含搜索/标签、页面切换、直接详情及无效 ID 的 404 响应。                                                       |
| 校验器变异验证                  | 实际 stylesheet href 改为同源站点根 https://caiyan12.github.io/ 后 exit 1；canonical/og:url 改到 /books/ 后 exit 1；恢复构建产物后 exit 0。数据正文含 https://example.com/books/ 时仍 exit 0。 |
| 格式与差异                      | 使用现有 Prettier 3.9.8 检查本票新增/修改文件，并运行 git diff --check。                                                                                                                       |

以上 T3 构建包含首页、书库和全部 70 个详情页，不包含 T2 后续新增的 404。pnpm verify:pages-artifact 按构建产物本身核对有效页面、数据、站内资源引用、URL 元信息与 sitemap；实际无效路径返回 404 由 T2 的验收负责。

## 待站长执行

真实仓库、Pages 设置、首次 push、Actions 运行、公开 URL 与目标提交 SHA 的核对步骤见 [pages-deployment.md](pages-deployment.md)，由 #157 执行。本地构建通过不代表线上发布成功。
