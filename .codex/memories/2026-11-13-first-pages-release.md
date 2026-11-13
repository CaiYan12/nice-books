# Nice Books 首次 Pages 发布

2026-11-13，Asia/Shanghai。本记录保存首次成功部署及本轮归档时点的状态，最新收尾状态从 [#157 结果评论](https://github.com/CaiYan12/caiyan12.github.io/issues/157#issuecomment-6840065256) 回读。

## 本轮授权与发布事实

- 站长明确授权执行 #157，包含必要本地提交、创建公开仓库、推送 main、配置 Pages 与触发部署，并要求持续跟进至结果明确。
- 初始化前实现基线为 `e08586e6f83193c997fb8e7c04424778a22a976b`。审核并提交根目录说明及项目记忆后，首次发布提交为 `7c949ca2e00b8d5ff7054066b48f0ac5c0901e5a`。
- 当前项目目录为 `D:\pages\nice-books`，发布分支为 `main`，origin 为 `https://github.com/CaiYan12/nice-books.git`。GitHub 登录账户为 CaiYan12，目标仓库已创建为 public，默认分支为 main。
- Pages 来源为 GitHub Actions，API `build_type=workflow`，启用 HTTPS，公开地址为 `https://caiyan12.github.io/nice-books/`。
- 首次成功运行 [43336984664](https://github.com/CaiYan12/nice-books/actions/runs/43336984664) 的 headSha 等于首次发布提交，build 与 deploy 均 success。github-pages deployment `7753499545` 的 sha 相同且状态 success。
- 本轮归档文档将由后续 main 提交触发再次部署，最终 main SHA、运行和关闭结果保存在上述 #157 评论，后续接管先核对该评论及远端现状。

## 验证与证据

- 本轮重新完成冻结安装、类型检查、52 单测、73 HTML 构建及 Pages 产物校验。
- 真实 Chromium 已直接打开并刷新首页、书库和实际书目 `01`《百年孤独》详情，六次均 HTTP 200，主要资源正常，书库成功取得数据，无请求失败及浏览器错误。
- 指定 Actions artifact 与公开页面及主要资源共 19 个响应 SHA-256 匹配。源码来源、运行和公开产物具有关联证据。
- 提交内入口为 [T4 验收记录](../../docs/t4-acceptance.md)，本机原始材料在 `output/nice-books-migration/t4/`。历史迁移决定仍见 [迁移交接记忆](2026-11-13-migration-handoff.md)。

## 可复用经验与边界

- 读取浏览器响应体时需在所属文档导航前完成，换页后旧响应句柄可能失效。核验发布字节时可独立请求指定 URL，与指定运行下载的 artifact 比对。首轮探针失败及修正过程保留在本轮验收记录。
- 本轮字体 CSS 观察为 200，完整自然字体应用与 Pages 404 留给 #158。既有 PNG 细部差异及构建提示继续按原条件解释。
- 后续按 #158 → #159 → #160 推进，博客生产发布使用其独立授权。此轮范围止于 #157。
