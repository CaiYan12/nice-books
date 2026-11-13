# 2026-11-13 T5 独立站线上验收

## 长期可复用的验收边界

- 浏览器字体判定应取真实文字节点的 CDP platform-font 结果；computed stack 首项、`FontFace` 列表或空的 `body` 节点都不能单独代表已绘制字体。本次 `dl dd` 命中 Noto 子集、书名命中平台书宋、摘录命中 ZeoSeven 手写体。
- GitHub Pages 的独立 404 应核对文档 HTTP 状态、品牌与返回入口；Swup 对无效书号的额外 fetch 404 和对应控制台消息需要关联到精确 URL/资源类型，不应把所有 404 都忽略或全部视为未预期。
- 页面线上生效归属用 Actions `headSha`、Pages deployment SHA 和 artifact 字节核对；仅看当前页面能打开不足以证明目标提交已生效。
- 分开报告既有业务 smoke 总结果与独立时序探针，并以脚本真实判据而非测试名称判定范围。保留不同上下文条件，不用独立读数改写原 smoke 总结果；测量偏差原因未确认时明确记录未确认。
- 线上 Swup 的 detail-to-detail 验收应先等 `window.swup.hooks.on` 可用，再绑定 `visit:start`、`content:replace`、`page:view`、`visit:end`；同时记录 document-start 标记、document 响应、URL 和标题/正文更新，并实际执行后退。只等待 URL 可能读到旧标题；尚未就绪时的整页导航不足以判定就绪后的行为。

## 本次观测快照

- 来源：博客仓库 #158、上游规格 #153；本机摘要见 `docs/t5-acceptance.md`。
- 部署：`CaiYan12/nice-books` run `43337662882`，deployment `7753581159`，均对应提交 `10f6a4edf7a482647d116834cfb8185f02b5b7a4`。[#158 最终验收评论](https://github.com/CaiYan12/caiyan12.github.io/issues/158#issuecomment-6849250128)确认四项 AC 已满足并关闭票据。
- 浏览器：Windows、headless Chromium 151.0.7922.34、Playwright 1.62.1。`smoke:nice-books` 为 71/72，唯一失败时序为 `999.9ms`，超过脚本实际 760ms 上限；“约 420ms”是测试名，不是阈值。独立预热点击 `452.7ms` 与 `430.9ms` 均在源码 380–760ms 区间内，但它们不替代原 smoke，偏差原因未确认。
- 同架推荐就绪后无刷新复核：全新线上 context 在主要内容可见后等待约 7873ms 至 Swup hooks 可用，再从 `/01/` 点 `/02/`，document UUID/timeOrigin 不变、document response 1→1；记录到 `visit:start`、`content:replace`、`page:view`、`visit:end`，URL/title/h1 为《围城》。浏览器后退在同一 document 返回 `/01/`、标题《百年孤独》，未新增 document response。详细数据在 `output/nice-books-migration/t5/same-shelf-swup-proof.json`。
- 真实字体：正文 `Noto Sans SC Thin`，标题本机 `FZShuSong-Z01S`，摘录 `平方时光体`（含 1 glyph KaiTi）。书宋 CSS token `FZShuSong-Z01S` 与 CDN 注册名 `FZShuSong-Z01` 不一致；当前 Windows 结果不代表其他系统。
- 404：`/99/` 和 `/__t5-invalid-path__/deep/` 均是 Pages HTTP 404 且页面品牌/返回入口正确。浏览器 3 条通用 404 控制台记录分别关联到两条文档响应与 `/99/` Swup fetch；未发现 requestfailure、pageerror 或意外 HTTP 错误。
- 探针误判：首轮综合网关中的字体自定义 face 与全局零 console error 假设已用实际字体节点和精确 404 关联校正。后续自编辅助探针 123/128 的 5 项失败包含 sitemap 路由正则错误、错误要求单搜索结果、Noto 子集 family 名预期不符、以及 Swup 内容尚未完成时读到旧标题；详情保存在验收文档与本机输出，不能写成产品全绿。

这是一份截至该日、该提交、该浏览器与本地网络条件下的状态记录。线上更新或跨平台字体验证需重新实测。
