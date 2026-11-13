# Nice Books 迁移交接与上下文初始化

记录日期为 2026-11-13，时区 Asia/Shanghai。GitHub 状态于本轮通过 `gh` 只读回查。本轮交付范围为根目录说明和项目记忆，文档改动保留在工作区。应用验证结果引用已归档测量，本轮只执行文档与证据核对。

## 长期决定与归属

- Nice Books · 每日好书以完整快照独立维护，独立持有源码、书目、资源、字体依赖、配置、锁文件、测试、构建及 Pages 工作流。新仓库从迁移起点记录历史，早期实现回博客仓库查阅。
- 保留现有产品契约，包括 ID 与内容、访问级随机、换一换及共享忙碌状态、整组推荐、六字段搜索与标签叠加、查询深链接、双视图、载入与收起、详情与同架图书、原创 3D 书封、图片失败兜底、响应式、键盘反馈、减少动效及 Swup 生命周期。[迁移规格 #153](https://github.com/CaiYan12/caiyan12.github.io/issues/153)
- 数据单源为 [books.ts](../../src/nice-books/data/books.ts)，SSR 与客户端标记单源为 [render.ts](../../src/nice-books/lib/render.ts)，转义单源为 [escape-markup.ts](../../src/nice-books/lib/escape-markup.ts)。页面初始化及离页清理沿用 [main.ts](../../src/nice-books/scripts/main.ts) 与 [shared.ts](../../src/nice-books/scripts/shared.ts)。
- 首页、书库、详情、数据地址依次为 `/nice-books/`、`/nice-books/archive/`、`/nice-books/<id>/`、`/nice-books/data.json`。站内页面及资源通过 `sitePath()` 适配基路径，配置见 [src/config.ts](../../src/config.ts) 与 [astro.config.mjs](../../astro.config.mjs)。目标首页为 `https://caiyan12.github.io/nice-books/`，返回主站为 `https://caiyan12.github.io/`。
- 设计沿用私人藏书桌，复用本站纸墨色板、字体槽位、组件与原创封面。设计契约见 [nice-books-design.md](../../docs/nice-books-design.md)，样式和映射见 [books.css](../../src/nice-books/styles/books.css)、[tailwind.config.cjs](../../tailwind.config.cjs)。博客资料中的旧路径、Tailwind v3 描述及 Colorful 专属约定，应用前逐项与本项目核对。
- 独立站线上验收通过后，博客才切换桌面与移动导航、sitemap，并启用 `/books/`、`/books/archive/`、`/books/<id>/` 到新地址的逐页过渡跳转，保留查询参数与锚点。同一阶段完成博客原实现及专用依赖的归属清理。旧地址退役由站长后续任务安排。[博客 ADR 0017，固定于说明提交](https://github.com/CaiYan12/caiyan12.github.io/blob/fd89f7e3baf16e1be01374c5da746ba787dc7162/docs/adr/0017-nice-books-separate-deployment.md)

## 基线与来源

| 用途                       | 仓库或位置                                       | 对应 SHA                                   |
| -------------------------- | ------------------------------------------------ | ------------------------------------------ |
| 迁移源码快照               | `D:\pages\myblog`，`CaiYan12/caiyan12.github.io` | `550c3da9d0808cf3d55f8c2aa53b8b29fc520e19` |
| 博客迁移说明提交           | ADR 0017、组件说明及相关维护说明                 | `fd89f7e3baf16e1be01374c5da746ba787dc7162` |
| 新仓库初始空提交           | `D:\pages\nice-books`                            | `4b10b7524e5753bbb64451d12c7bfa3446d68b24` |
| T1 核心迁移                | 独立项目                                         | `8d6ab99a51efed5b9862c9b787cba07d3370a371` |
| T3 发布准备                | 独立项目                                         | `60a748c180060c0c88ae45c1d3255ce5dc70096d` |
| T2/T3 联合验收、初审终点   | 独立项目                                         | `de7104987cd591ca24d988e54f33e26c3c0a18a2` |
| 整改后最终集成、初始化基线 | 独立项目                                         | `e08586e6f83193c997fb8e7c04424778a22a976b` |

源码与 Git 历史为当前实现依据。迁移范围和阶段决定来自 #153–#160、博客 ADR 0017 及 [组件说明的 Nice Books 节](https://github.com/CaiYan12/caiyan12.github.io/blob/fd89f7e3baf16e1be01374c5da746ba787dc7162/docs/agents/components.md)。本项目提交内的验收入口为 [migration-acceptance.md](../../docs/migration-acceptance.md)、[review-acceptance.md](../../docs/review-acceptance.md)、[t3-acceptance.md](../../docs/t3-acceptance.md)，操作入口为 [pages-deployment.md](../../docs/pages-deployment.md)。

## 2026-11-13 状态快照

### 本地与远端核对

- 初始化前分支为 `codex/nice-books-integration`，HEAD 为 `e08586e6f83193c997fb8e7c04424778a22a976b`，工作区干净，`git remote -v` 无输出。仅登记主工作树 `D:/pages/nice-books`，历史工作分支仍保留。
- `D:\pages\nice-books-worktrees` 目录存在且无子项。本轮检查 4322、4323、4324、4331、4334、4335 端口均无监听。
- `gh repo view CaiYan12/nice-books --json nameWithOwner,url,isPrivate,defaultBranchRef` 返回 `Could not resolve to a Repository with the name 'CaiYan12/nice-books'`。该结果只证明当前连接无法读取目标仓库，仓库存在性及 Pages 设置仍待 #157 提供可核对证据。
- 博客当前 HEAD 为 `fd89f7e3baf16e1be01374c5da746ba787dc7162`，分支同为 `codex/nice-books-integration`，工作区干净。原实现仍由博客持有，符合尚待线上验收的迁移阶段。
- `D:\AGENTS.md`、`D:\pages\AGENTS.md` 与项目根 `AGENTS.md` 在初始化前均不存在。已读取用户级 `C:\Users\Einn Tzai\.codex\AGENTS.md`，并核对当前会话技能清单。项目 `.codex/memories/` 本轮新建。
- 与交接快照相比，已核对的提交、分支、工作区、远端读取结果、临时工作树、端口和票册状态一致。原实施交接较早段落中的 `output/nice-books-migration/baseline/` 指针已失效，本机源基线实际保存在 `output/nice-books-migration/source-baseline/`，本记忆使用已核对路径。

### GitHub 原生票册

父规格 [#153](https://github.com/CaiYan12/caiyan12.github.io/issues/153) 为 OPEN。以下七票经原生子 issue 列表及各票 `parent` 字段确认均隶属 #153，阻塞关系经 `blockedBy` / `blocking` 回读。

| 票                                                                   | 本轮状态                | 原生前置   | 未关闭前置数 |
| -------------------------------------------------------------------- | ----------------------- | ---------- | ------------ |
| [T1 #154](https://github.com/CaiYan12/caiyan12.github.io/issues/154) | CLOSED                  | 无         | 0            |
| [T2 #155](https://github.com/CaiYan12/caiyan12.github.io/issues/155) | CLOSED                  | #154       | 0            |
| [T3 #156](https://github.com/CaiYan12/caiyan12.github.io/issues/156) | CLOSED                  | #154       | 0            |
| [T4 #157](https://github.com/CaiYan12/caiyan12.github.io/issues/157) | OPEN，`ready-for-human` | #155、#156 | 0            |
| [T5 #158](https://github.com/CaiYan12/caiyan12.github.io/issues/158) | OPEN，`ready-for-agent` | #157       | 1            |
| [T6 #159](https://github.com/CaiYan12/caiyan12.github.io/issues/159) | OPEN，`ready-for-agent` | #158       | 1            |
| [T7 #160](https://github.com/CaiYan12/caiyan12.github.io/issues/160) | OPEN，`ready-for-agent` | #159       | 1            |

#157 只有“本地完整验收与发布准备结果齐备”已勾选，建仓、Pages 设置、首次发布与公开地址证据仍待完成。REST `issue_dependencies_summary` 显示 `blocked_by=0`、`total_blocked_by=2`，两条已完成依赖继续保留。

## 已归档验证与限制

以下是迁移实施轮次的本地测量。本轮回读验收文档并抽查原始日志，未重新运行整套应用测试。

- 最终集成目录的冻结安装、类型检查、构建及 Pages 产物校验均退出 0，52 项单测通过，构建生成 73 个 HTML，含独立 404。产物检查记录 72 个内容页、70 个详情路由、72 条 sitemap URL、1476 个同源 URL 引用和 107 个 CSS 引用。[最终物理目录日志](../../output/nice-books-migration/integration-review-final/final-state.log)
- 整改后浏览器结果为业务 72/72、设计 67/67、几何 1507/1507、404 25/25。dev Swup 4/4 属于较早 T2 留档证据。Standards 初审三项，最高 P2，已整改并复核。Spec 零发现。[整改验收摘要](../../docs/review-acceptance.md)
- 当前数据共 70 条，`coverUrl` 全为 `null`，日常显示程序化封面。本地图片路径能力及图片失败后的同书 SVG 兜底有独立测试证据。[封面路径与兜底边界](../../docs/migration-acceptance.md)
- 构建存在一条 `INEFFECTIVE_DYNAMIC_IMPORT` 提示，涉及 `cover.ts` 同时被静态与动态导入。最终物理目录 `check.log` 为 0 errors、0 warnings、5 hints，整改工作树摘要曾记录 4 hints。T1/T3 的 51 单测、72 页等旧数字属于较早阶段，后续使用时应注明阶段与日志来源。
- 相同随机源及字体 fixture 的对照中，选定几何、关键样式、目标实际颜色及字体状态一致。部分 PNG 仍有未归因细部差异，截图哈希只能按各次采样条件解读。[整改对照范围](../../docs/review-acceptance.md)
- 自然字体 CSS 在源 `localhost:4331` 一次返回 200，在独立目标 `127.0.0.1:4323` 一次返回 204，原因未确认。受控 fixture 对照只证明该测试条件下的表现。线上自然字体及 GitHub Pages 404 留给 #158 核验。[迁移对照与字体条件](../../docs/migration-acceptance.md)
- 托管工作树工具曾持续无返回，实施轮次改用普通 Git 工作树，过程与清理已留档。后续安全守卫拒绝应按当时适用指令处理，记录实际错误及证据。[实施交接](../../output/nice-books-migration/implementation-handoff.md)

### 本机证据位置

`output/` 被 `.gitignore` 忽略，以下材料已在本机确认存在。其他检出先从提交内验收文档进入。

- [implementation-handoff.md](../../output/nice-books-migration/implementation-handoff.md) 保存实施过程与 2026-11-13 收尾核对。
- [review-summary.md](../../output/nice-books-migration/review-summary.md) 保存双轴审查与整改闭环。
- [integration-review-final](../../output/nice-books-migration/integration-review-final) 保存最终物理目录的 install/check/build/artifact 日志、复制映射和 [SHA-256 账本](../../output/nice-books-migration/integration-review-final/copied-evidence-sha256.tsv)。本轮重新计算账本所列 103 个归档目标文件的 SHA-256，与 `TargetSHA256` 零不匹配。
- [review-fixes](../../output/nice-books-migration/review-fixes)、[review-fixes-qa](../../output/nice-books-migration/review-fixes-qa) 与 [整改设计截图](../../output/nice-books-design-review-fixes) 保存整改证据。原 T2 [设计报告](../../output/nice-books-design) 原地保留。
- [t2](../../output/nice-books-migration/t2) 与 [source-baseline](../../output/nice-books-migration/source-baseline) 保存原迁移对照、字体探针与源截图，较早归档账本位于 [integration-final](../../output/nice-books-migration/integration-final)。

`integration-review-final/final-state.log` 写于工作树清理前，其中“源文件仍在整改工作树”的描述有明确时序。后续清理完成以 implementation-handoff.md 的收尾记录及本轮 `git worktree list`、磁盘检查为依据。

## 阶段授权与下一节点

已确认的 Matt Pocock 阶段序列为信息收集 → GRILLING → 直接实施分支，或规格 → 票册 → 按票实施 → PR/合并/清理 → 复盘。每阶段按明确指令进入，同一回合最多执行两个授权阶段。按票实施使用独立分支、工作树及子代理，完成后双轴审查并汇报。具体技能以当前会话可用清单和站长指令核对。[已读取的博客授权约定](https://github.com/CaiYan12/caiyan12.github.io/blob/fd89f7e3baf16e1be01374c5da746ba787dc7162/AGENTS.md)

2026-11-12 的本地提交与集成授权对应已经完成的实施轮次。本轮仅初始化文档，后续提交、推送及发布按站长的新指令执行。

- 下一节点为站长按 [pages-deployment.md](../../docs/pages-deployment.md) 完成 #157，建立目标仓库、配置 Pages 并首次发布，提供目标 SHA、Actions 运行及实际地址。
- #158 关联实际部署提交、运行与生效产物，验证线上访问、交互、自然字体和独立 404。
- #158 通过后进入 #159，在博客执行入口、兼容跳转及归属清理的本地变更与验收。
- #159 完成且取得博客生产发布明确授权后进入 #160，部署博客并执行联合线上验收。旧地址退役留待后续任务。

## 后续复核入口

命令用途与脚本实现以 [package.json](../../package.json)、[README.md](../../README.md) 及 Pages 工作流为准。当前 Git 与票册可用以下只读命令复核。

```powershell
git status --short --branch
git rev-parse HEAD
git remote -v
git worktree list
gh repo view CaiYan12/nice-books --json nameWithOwner,url,isPrivate,defaultBranchRef
gh issue view 153 --repo CaiYan12/caiyan12.github.io --json number,state,body,subIssues
gh issue view 157 --repo CaiYan12/caiyan12.github.io --json number,state,body,labels,parent,blockedBy,blocking
```

其他子票沿用相同查询字段逐票读取。统计未完成前置时检查依赖的 `state`，同时保留已经完成的原生依赖关系。
