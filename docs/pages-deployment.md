# GitHub Pages 发布说明

独立站目标地址是 https://caiyan12.github.io/nice-books/。Astro 从 src/config.ts 读取站点地址与 /nice-books 基路径；astro.config.mjs 将它们用于静态页面和 sitemap。

2026-11-13 首次发布的仓库、Actions、部署提交及公开访问证据见 [T4 发布记录](t4-acceptance.md)。独立站 T5 线上验收及结果见 [验收记录](t5-acceptance.md)。后续部署继续按下列流程核对当前状态。

## 工作流

.github/workflows/pages.yml 在 main 的 push、面向 main 的 pull request 和手动触发时运行：

1. 使用锁文件安装依赖，并运行 pnpm check。
2. pnpm build 先跑 Nice Books 单测，再构建静态站点。
3. pnpm verify:pages-artifact 检查首页、书库、书目 JSON、全部详情页、站内链接与资源目标、canonical、Open Graph URL 和 sitemap 是否指向 /nice-books/。
4. 将 dist/ 上传为 Pages artifact。
5. 只有 main 分支的 push 或手动运行会进入部署 job；pull request 与其他分支的手动运行只构建和验证，不发布。

工作流固定使用 Node.js 24.18.0、pnpm 10.26.2，与本项目的实际本地验证版本一致。pnpm、Node setup、artifact 上传与部署动作均固定到已核对的完整提交 SHA。pnpm store 可缓存；Astro 的构建目录不跨运行复用。

本地复核同一产物：

```powershell
pnpm install --frozen-lockfile
pnpm check
pnpm build
pnpm verify:pages-artifact
```

## 站长首次发布清单（由 #157 执行）

T3 只准备本地发布流程。本轮未创建远端仓库、未更改 Pages 设置，也未推送或部署。2026-11-12 的只读 gh repo view CaiYan12/nice-books 查询无法读取该仓库；首次发布结果由 #157 记录。

1. 在 GitHub 的 CaiYan12 账户下建立空仓库 nice-books。不要用 README、license 或 .gitignore 初始化远端，以便与已审阅的本地提交历史直接衔接。
2. 在仓库 Settings → Pages → Build and deployment 将 Source 设为 GitHub Actions。
3. 在已合入 T1、T2、T3 的本地独立项目 D:\pages\nice-books 检查工作区干净，并记录 git log -1 --format=%H 输出的目标提交 SHA。
4. 首次建仓时，若本地仍处于 codex/nice-books-integration 且没有 main 分支或远端，按顺序执行：

   ```powershell
   git switch -c main codex/nice-books-integration
   git remote add origin https://github.com/CaiYan12/nice-books.git
   git push -u origin main
   ```

   如果当前分支、远端或 main 状态与这些前提不同，先检查现有 Git 状态，再按当前状态完成建仓；不要覆盖已有远端内容。

5. 首次 push 会触发构建和部署。后续若要手动重跑，在 Actions → Nice Books Pages → Run workflow 选择 main。
6. 用 gh run list --workflow pages.yml --branch main --limit 5 找到此次运行，再用 gh run view <运行编号> --json conclusion,status,headSha,jobs,url 检查两个 job 均成功，并确认 headSha 与步骤 3 记录的目标 SHA 完全相同。
7. 打开 https://caiyan12.github.io/nice-books/，直接访问 /archive/ 与一条详情地址并刷新。记录仓库地址、目标提交 SHA、Actions 运行编号与结论、实际公开地址，供后续线上验收使用。

#157 负责真实建仓、Pages 配置和首次发布。本地构建或工作流文件存在，都不代表远端发布已经完成。
