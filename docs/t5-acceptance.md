# T5 独立站线上验收（#158）

验收日期为 2026-11-13，时区 Asia/Shanghai。目标仓库为 `CaiYan12/nice-books`，线上地址为 <https://caiyan12.github.io/nice-books/>。本记录对应博客规格 #153 的阶段四和线上验收票 #158。

## 结论与部署关联

- [x] Actions 运行与 GitHub Pages 部署对应提交 `10f6a4edf7a482647d116834cfb8185f02b5b7a4`；运行 [43337662882](https://github.com/CaiYan12/nice-books/actions/runs/43337662882) 的 build、deploy 均成功，deployment `7753581159` 的 SHA 相同且状态为 success。
- [x] 线上首页、书库、详情、书目 JSON、头像及 sitemap 与该运行下载的 `github-pages` artifact 对照。抽查页面及数据的 SHA-256 一致，浏览器实际加载的 47 个同源 CSS、JS、字体和图片资源均逐字节匹配 artifact。
- [x] 线上核心访问、资源/元信息、404 和返回博客旅程已用 headless Chromium 实测，并保留结果和截图。
- [x] [#158 最终验收评论](https://github.com/CaiYan12/caiyan12.github.io/issues/158#issuecomment-6849250128)确认四项验收标准已满足并关闭本票；本记录保留测量结果与适用边界。

上线归属核对以 `run.headSha`、deployment SHA 和 artifact 内容为准；本地验收文档提交不会改变已部署目标 SHA。本轮没有修改产品源码、推送或部署。

## 四项线上验收标准

| #158 验收标准                                               | 结论                            | 证据摘要                                                                                                                                                                                                                                                                                                                   |
| ----------------------------------------------------------- | ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 部署运行对应目标提交，线上生效产物可核验                    | 通过                            | run `43337662882`、deployment `7753581159`、head SHA 均对应 `10f6a4edf7a482647d116834cfb8185f02b5b7a4`；抽查页面和 47 个实际加载的同源资源与该运行 artifact 字节一致。                                                                                                                                                     |
| 首页、书库、详情直开/刷新，随机、搜索筛选、无刷新切页与后退 | 通过；原 smoke 保留单项计时失败 | 原业务 smoke 为 71/72：随机变化、双按钮共享忙碌态、搜索与标签、双视图、加载/收起、详情直开/刷新及核心 Swup 往返通过。主书时序读数 `999.8999999999069ms` 高于实际上限 760ms。独立预热点击 `452.7ms`、`430.9ms` 落在脚本的 380–760ms 范围，但上下文不同，不替代原 smoke 结果。同架详情到详情及后退的就绪后无刷新结果见下文。 |
| 项目资源、页面元信息、独立 404 和返回博客入口               | 通过                            | 首页、书库、`/01/` 直接访问及刷新均为 HTTP 200；标题、描述、canonical、Open Graph、robots 与语言正确。sitemap 共 72 条 URL：项目首页、书库和 `/01/` 至 `/70/`。无效书号 `/99/` 与深层无效路径均为真实 HTTP 404，品牌、`noindex,follow` 及两个返回入口正确并已点击；页眉返回博客落在博客首页 HTTP 200。                     |
| 线上浏览器与部署证据满足阶段四记录要求                      | 通过                            | 部署关联、浏览器旅程、实际字体、404 和完整结果边界均有日期、条件与可复核材料记录；[#158 最终验收评论](https://github.com/CaiYan12/caiyan12.github.io/issues/158#issuecomment-6849250128)确认四项 AC 并关闭票据。                                                                                                           |

按 [#158 最终验收评论](https://github.com/CaiYan12/caiyan12.github.io/issues/158#issuecomment-6849250128)，四项线上验收标准均已满足。本记录仍如实保留原业务 smoke 的 71/72：唯一失败读数为 `999.8999999999069ms`，而 `scripts/nice-books-smoke.mjs` 的实际计时判据是 `swapElapsed >= 380 && swapElapsed <= 760`；“约 420ms”只是该判据的测试名称，不是硬性 420ms 上限。独立预热上下文中的 `452.7ms` 与 `430.9ms` 落在源码范围内，但不把原 smoke 改写为 72/72。

## 线上浏览器证据

| 项目               | 观测                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 浏览器             | Windows 上的 headless Chromium，Playwright 1.62.1；未用本地预览或受控字体 fixture 代替线上结果。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 首页、书库、详情   | `https://caiyan12.github.io/nice-books/`、`/archive/`、`/01/` 直接打开和刷新均返回 HTTP 200；页面元信息使用新基路径。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 书目及 sitemap     | `data.json` 含 70 条记录，编号 `01` 为《百年孤独》；sitemap 共 72 条 URL，覆盖首页、书库及全部 70 个编号详情。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 搜索与视图         | 原业务 smoke 的查询、标签 AND 组合、URL 参数恢复、书架/列表切换、加载更多、收起和空结果判据通过。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 随机操作           | 主按钮每次更换书目；两入口共享忙碌状态并恢复。原 smoke 的双阶段时间判据未通过；独立预热测量见下节。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Swup 与后退        | 原业务 smoke 的书库/详情无刷新切换、页眉更新、浏览器后退及再次进入可操作判据通过。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 移动首页           | 390×844 线上视口，HTTP 200；文档及 body 宽度均为 390px，未见横向溢出；书库入口和首页主书区域可见。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 返回博客           | 点击独立站页眉返回入口后到达 `https://caiyan12.github.io/`，HTTP 200，标题为 `WindowsIt's Music Club`。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 同架推荐详情到详情 | 新建 headless Chromium context，线上 `/01/` 首次 document 为 200；明确等待 `window.swup.hooks.on` 可用（主要内容可见后约 7873ms）再点击实际同架链接 `/02/`。document-start UUID 与 `performance.timeOrigin` 保持不变，document response 从 1 保持为 1；Swup 依次触发 `visit:start`、`content:replace`、`page:view`、`visit:end`，最终 URL `/02/`、title `《围城》 · Nice Books 每日好书`、h1 `围城`。随后 `history.back()` 同样通过 Swup 返回 `/01/`、title `《百年孤独》 · Nice Books 每日好书`，document response 仍为 1。`main` 节点被替换是 Swup 容器切换；document identity 未变化。详细响应与事件记录见下方窄探针。 |

### 随机操作计时

`smoke:nice-books` 的线上完整运行输出为 71/72，失败行原样保留：主书双阶段时序为 `999.8999999999069ms`。`scripts/nice-books-smoke.mjs` 实际检查 `swapElapsed >= 380 && swapElapsed <= 760`；“约 420ms”来自测试名称，不是精确目标或 420ms 上限，因此本次读数超出 760ms 上限。另一个全新单页上下文等待 `/_astro/gsap.CQ4Bke8s.js` 响应完成后再点击：脚本 HTTP 200、27,472 bytes，Resource Timing 为 427.4ms；随后点击分别为 452.7ms 与 430.9ms，落在脚本的 380–760ms 范围内，书目均变化、双按钮忙碌状态出现并恢复，动作期间无新增请求。该预热上下文与整套 smoke 不同，保留 71/72，不把它改写为 72/72；两组读数偏差原因未确认，未新设 420ms 门槛。

### 字体实际渲染

字体结论使用线上书籍详情中真实文本节点，并通过 CDP `CSS.getPlatformFontsForNode` 读取实际绘制字体，不以 computed stack 的首项或未渲染的 `body` 节点代替：

- `dl dd` 出版社正文实际绘制为 `Noto Sans SC Thin`，`isCustomFont=true`，6 个 glyph；对应的 Noto 字体面已加载。
- `article h1` 书名实际绘制为 `FZShuSong-Z01S`，`isCustomFont=false`，4 个 glyph；本次 Windows 浏览器命中本机书宋字体。
- `.nb-excerpt-card p` 摘录实际绘制为 `平方时光体`，`isCustomFont=true`，45 个 glyph；另有 1 个 glyph 由 KaiTi 绘制。

CSS 字体栈中的书宋 token 为 `FZShuSong-Z01S`，线上 CDN CSS 注册名为 `FZShuSong-Z01`，两者名称不一致；本次标题的 CDP 结果证明当前 Windows 平台实际命中 token 对应的本机书宋。外部 FZ face 在标题上未应用，其他平台的字体命中未验证。原辅助探针将 `FontFace` 自定义加载状态当作所有文本字体的必要条件，并曾对未渲染的 `body` 取值；该假设已由真实节点 CDP 结果纠正，不是本次验收的阻塞项。

## 探针判据校正与证据限制

- 首轮自编线上汇总探针报告 115/117；两个失败来自字体自定义 face 假设，以及将预期无效地址的通用 404 控制台记录当成全局浏览器错误。后续实际渲染字体证据和带 URL/资源类型的 404 响应记录分别补正了这两项；不把它们描述成线上产品故障。
- 后续辅助探针报告 123/128，新增失败断言未作为通过证据：sitemap 路由正则多匹配一个斜杠，原始 URL 集合实际为 72 条且包含 `/01/`–`/70/`；搜索探针错误地要求查询仅返回一本书，而实际搜索字段允许书名出现在其他书简介中；Noto 字体断言预期 family 为 `Noto Sans SC Variable`，CDP 对实际字重子集返回 `Noto Sans SC Thin`；推荐卡探针只等待 URL，未等 Swup 更新内容就读取标题。另一份早期详情探针记录 document response 1→2，但未核实点击前 Swup 已就绪，因而不作为 ready 后行为的结论；本次全新 context 在 `window.swup.hooks.on` 就绪后复核的结果见“同架推荐详情到详情”。
- 3 条控制台 404 文本均为 `Failed to load resource: the server responded with a status of 404 ()`，时间和 URL 与预期无效地址响应相符。另有 `/99/` 的一次 Swup fetch 404；这是无效书号文档加载后的预期请求，不掩盖其他意外 HTTP 错误。
- 本轮没有展开全站 glyph、所有平台字体、完整设计几何或新的业务门槛；本机截图和完整响应/检查明细保存在忽略目录 `output/nice-books-migration/t5/`，该目录不进入 Git 提交。

## 可复核材料

- `output/nice-books-migration/t5/smoke-online.log`：原线上业务 smoke 的 71/72 结果及唯一失败行。
- `output/nice-books-migration/t5/timing-probe.json`、`timing-probe.mjs`、`timing-probe.log`：预热后随机操作时序、GSAP 资源和动作期间网络记录。
- `output/nice-books-migration/t5/online-acceptance.log`：首轮综合探针原始输出；`online-acceptance-final.log` 与 `online-acceptance.json`：后续辅助探针输出和其未采纳的断言失败。
- `output/nice-books-migration/t5/cdp-font-proof.json`、`cdp-font-proof.mjs`、`cdp-font-proof-final.log`：实际绘制字体、字体 CSS 和相关页面观察。
- `output/nice-books-migration/t5/home.png`、`archive.png`、`book-01-detail.png`、`invalid-book-404.png`、`home-mobile.png`：线上页面截图。
- `output/nice-books-migration/t5/same-shelf-swup-proof.mjs`、`same-shelf-swup-proof.json`、`same-shelf-swup-proof.log`：就绪后同架详情切换、document identity/request 计数、Swup hooks 及后退记录。

验收源头为博客仓库 GitHub issue [#158](https://github.com/CaiYan12/caiyan12.github.io/issues/158)，上游范围为 [#153](https://github.com/CaiYan12/caiyan12.github.io/issues/153)。本记录仅证明 2026-11-13 对上述部署和测量条件的结果；后续部署和其他平台需重新核验。

## 同架推荐详情切换复核

- [x] 全新线上 headless context 已在点击前确认 `window.swup.hooks.on` 可用；从 `/01/` 点同架 `/02/`，document UUID/timeOrigin 不变、document response 1→1，并记录 `visit:start`、`content:replace`、`page:view`、`visit:end` 与正确 URL/title；`history.back()` 同样由 Swup 返回 `/01/` 且无新 document response。记录文件为 `output/nice-books-migration/t5/same-shelf-swup-proof.json`。
