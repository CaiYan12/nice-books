# T4 首次 GitHub Pages 发布记录

日期为 2026-11-13，时区 Asia/Shanghai。站长本轮明确授权本地提交、创建公开仓库、推送 main、配置 Pages 和触发部署。范围对应源博客迁移票 #157。

## 首次成功发布

| 项目           | 实际结果                                                                                  |
| -------------- | ----------------------------------------------------------------------------------------- |
| 仓库           | [CaiYan12/nice-books](https://github.com/CaiYan12/nice-books)，public                     |
| 默认分支       | `main`                                                                                    |
| 实现基线       | `e08586e6f83193c997fb8e7c04424778a22a976b`                                                |
| 首次发布提交   | `7c949ca2e00b8d5ff7054066b48f0ac5c0901e5a`，包含根目录 AGENTS.md 与项目记忆初始化         |
| 工作流         | `.github/workflows/pages.yml`，`Nice Books Pages`                                         |
| 首次运行       | [43336984664](https://github.com/CaiYan12/nice-books/actions/runs/43336984664)，push 触发 |
| 运行 headSha   | `7c949ca2e00b8d5ff7054066b48f0ac5c0901e5a`                                                |
| build / deploy | 两个 job 均为 success，运行于北京时间 08:26:38 完成                                       |
| Pages 来源     | GitHub Actions，API 回读 `build_type=workflow`                                            |
| Pages 地址     | [https://caiyan12.github.io/nice-books/](https://caiyan12.github.io/nice-books/)          |
| 部署关联       | github-pages deployment `7753499545`，sha 与首次发布提交一致，最新状态为 success          |

本记录固定首次成功运行的证据。包含本记录的归档提交也会由 main 推送触发部署，最终 main SHA、运行、访问复核与票状态统一记录于 [#157 结果评论](https://github.com/CaiYan12/caiyan12.github.io/issues/157#issuecomment-6840065256)。

## 本轮验证

- 初始化文档经人工内容核对、UTF-8、格式及 75 处 Markdown 链接检查后提交。
- 本地 `pnpm install --frozen-lockfile`、`pnpm check`、`pnpm build`、`pnpm verify:pages-artifact` 全部退出 0。类型检查为 0 errors、0 warnings、5 hints。单测 52/52，构建生成 73 个 HTML，包含 404；发布产物校验通过。
- headless Chromium 逐页直接打开并刷新以下地址，六次文档响应均为 HTTP 200。核对 h1、canonical、本站纸墨样式、图片、脚本及样式表，书库加载出实际书卡。浏览器记录无 requestfailed、pageerror 或 console error。

| 页面                      | 地址                                                      | 直接访问 | 刷新 |
| ------------------------- | --------------------------------------------------------- | -------- | ---- |
| 今日好书                  | [首页](https://caiyan12.github.io/nice-books/)            | 200      | 200  |
| 书库                      | [archive](https://caiyan12.github.io/nice-books/archive/) | 200      | 200  |
| 实际书目 `01`《百年孤独》 | [详情](https://caiyan12.github.io/nice-books/01/)         | 200      | 200  |

从指定 Actions 运行下载 github-pages artifact，独立请求公开页面及主要资源，19 个响应的 SHA-256 与该 artifact 的对应文件完全一致。浏览器采集到的本站资源响应全部为 200，包含字体请求。该比对将公开内容关联到上述运行及提交。

## 文档与配置依据

发布内容沿用项目现有工作流及锁定版本。配置前通过 Context7 与 GitHub 官方文档核对 Actions 来源、部署权限、build/deploy 依赖与 github-pages 环境，并经 API 回读确认实际设置。操作入口见 [pages-deployment.md](pages-deployment.md)。[GitHub 自定义工作流说明](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)、[GitHub Pages REST 设置](https://docs.github.com/en/rest/pages/pages#create-a-github-pages-site)

## 证据与限制

- 本机忽略目录 `output/nice-books-migration/t4/` 保存分阶段计划、install/check/build/artifact 日志、Actions JSON 和完整日志、部署与 Pages 设置 JSON、下载产物、浏览器 JSON、六张首屏截图及公开内容比对。
- 首次本地安装调用的 PowerShell 数组传参错误已修正，成功复验日志另存。首次浏览器探针在导航后读取已失效的响应体句柄，六个访问本身均为 200；改用独立 HTTP 请求比对公开字节后通过，失败探针记录保留用于追溯。
- 构建保留既有 `INEFFECTIVE_DYNAMIC_IMPORT` 提示，安装保留 esbuild 构建脚本被忽略的提示。
- 本轮观察到书宋及手写字体 CSS 返回 200。完整线上业务、自然字体实际应用、Pages 404 与其他规格判据由 #158 验证，相关历史限制见 [migration-acceptance.md](migration-acceptance.md) 与 [review-acceptance.md](review-acceptance.md)。

## 后续依赖

#157 完成后，#158 具备部署 SHA、Actions 运行、公开地址和生效产物材料。#158 通过后进入 #159 的博客本地切换，#160 的博客生产切换另需站长明确授权。最新票册及授权边界通过源博客 GitHub Issues 回读。
