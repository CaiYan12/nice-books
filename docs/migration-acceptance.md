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

## T2 独立 404 与完整体验验收（#155）

### 范围与结果

- [x] `/nice-books/__t2-invalid-path__/` 与 `/nice-books/99/` 都返回独立 404；页面复用 Nice Books 页眉、页脚与样式，不高亮错误导航，提供返回“今日好书”和“书库”的入口。
- [x] 原设计 QA 迁移后 67/67 通过；Book3D 几何 QA 1507/1507 通过；业务 smoke 72/72 通过；Nice Books 单测 51/51 通过。
- [x] 设计 QA 覆盖桌面/移动断点、200% 页面缩放、键盘焦点、触摸尺寸、减少动态效果、失败封面兜底、字体失败与书库重试、Swup 切页中断清理。另用真实 Playwright 触摸输入验证 404 两个返回入口。
- [x] 固定随机源、字体响应与浏览器环境完成源站/独立项目对照，保留初始采样及动画完成后的稳定复采、源站重复采样噪声基线、DOM rect 与计算样式证据。
- [x] Astro dev 下的 Swup 往返确认公共背景、纹理、字体槽位及双线页眉切页后仍保留；源配置 `updateHead: true` 保留。

### 404 与运行时验证

| 验证 | 结果 | 环境与证据 |
| --- | --- | --- |
| `pnpm qa:nice-books-404` | 通过，25/25 | 本地静态预览 `http://127.0.0.1:4323/nice-books/`；无效路径与编号的 HTTP 状态均为 404；390×844 与 1440×900 检查无横向溢出、入口高度均为 44px；键盘焦点和移动触摸旅程通过。 |
| `pnpm qa:nice-books-design` | 通过，67/67 | 继承的设计断言完整保留，基路径适配为 `/nice-books/`；覆盖响应式、键盘/触摸、减少动态效果、故障恢复和切页清理。 |
| `pnpm qa:nice-books-geometry` | 通过，1507/1507 | Chromium；保留源几何检查并对独立项目重新测量。 |
| `pnpm smoke:nice-books` | 通过，72/72 | 本地静态预览；包含真实 cover 图片加载失败后的同书确定性 SVG、书库失败重试、减少动态效果、忙碌/中断清理与 Swup 返回旅程。 |
| `pnpm qa:nice-books-dev-swup` | 通过，4/4 | Astro dev `http://localhost:4324/nice-books/`；首页→书库→浏览器后退；页面背景/纹理/字体及页眉双线样式均持续生效，浏览器错误为 0。 |
| `pnpm test:nice-books` / `pnpm check` | 通过，51/51；0 errors、0 warnings | Node 24.18.0；`astro check` 检查 50 个文件，有 4 条非阻断 hints。 |

原设计 QA 中“博客根页不加载 Nice Books 资源”是博客归属边界，不要求独立项目启动源博客或依赖其磁盘路径；该边界转交 #159。独立项目仍检查实际 Nice Books 页面自身的资源与站内链接使用 `/nice-books/`，并检查页眉和页脚的“返回主站”均指向 `https://caiyan12.github.io/`。

### 封面路径与兜底边界

当前迁移书目共 70 条，`coverUrl` 全部为 `null`，因此本轮没有把“当前数据加载了真实本地书封”作为结论。数据 schema 支持以 `/` 开头的本地封面路径；单测验证 `/covers/01.jpg` 会经 `sitePath()` 生成为 `/nice-books/covers/01.jpg`。浏览器验收分别覆盖现有程序化 SVG 书封、合成的图片加载失败后为同一本书生成带书名的 SVG，以及 smoke 中的确定性错误替换；并未借用博客图片资源或声称当前数据包含实体封面。

### 源站与独立项目 A/B

源站基线来自只读博客仓库提交 `550c3da9d0808cf3d55f8c2aa53b8b29fc520e19`，源 preview 为 `http://localhost:4331/books/`；独立项目静态 preview 为 `http://127.0.0.1:4323/nice-books/`。同一 Chromium、LCG 随机种子 `0x00c0ffee`、70 条相同书目（SHA-256 `b30537e2c3c553741153d52416ed0053eea2ae7ada6ca95389390a72539e470b`）及 1440×900 / 390×844 视口用于六个首页、书库和详情页配对。首页 SSR 兜底 ID 两边均为 `01`，客户端稳定随机主书两边均为 `13`，随机调用数相等。

早期采样中，首页在不同 `nb-card-in` 动画时点截图，桌面与手机最大 rect 差分别为 2.520px 与 0.820px；书库、详情四组 rect 完全一致且截图 SHA 相同。此初始结果保留于 `output/nice-books-migration/t2/ab-comparison.md`。随后按相同成功的源站手写字体 CSS/WOFF 响应建立仅用于 A/B 的 fixture，并等待首页 intro/级联动画结束和多帧 rect 稳定后复采。稳定复采中两边随机状态相同，首页关键 rect 全部相同；桌面关键计算样式 12 项无差异，字体状态、正文/标题字体加载均相同。首页截图仍有有限像素差异：桌面 22,094/1,296,000 像素不同（最大通道差 55，平均 0.215729），手机 4,894/329,160 像素不同（最大通道差 75，平均 0.332844）。同构建源站在相同条件下重复采样自身也有 10,164/1,296,000 像素不同（最大通道差 13，平均 0.030779）；差异集中于主书文字栅格区域。故结论限于稳定几何、计算样式和字体加载状态一致，截图肉眼观感等效，不宣称 PNG 字节或像素相同。

字体服务在自然请求中有环境波动：源站探针取得 ZeoSeven CSS HTTP 200（55,340 bytes，SHA-256 `5c5c289ae7e3938ecfc756be59db5e7b6edef070ee9f9b6d8a9116bd9f7e424c`）及 11 个 WOFF2 响应；独立目标相同 CSS 地址一次返回 HTTP 204，未注册手写字体面。为公平对照，已将源站成功响应仅在本机 A/B fixture 中重放给双方，产品 URL 与字体实现未改。fixture 详情、响应摘要、截图、几何及计算样式明细均在本地忽略目录 `output/nice-books-migration/t2/`，包括 `font-network-probe.log`、`home-stable-ab.log`、`home-style-ab.log`、`home-source-repeat.log` 与 PNG；它们不随仓库提交。

设计 QA 的原博客根页隔离检查转交 #159；GitHub Pages 线上 404 行为由发布票后续验证。本节证明范围为本地独立构建与浏览器验收。

### 失败修正记录

- 迁移后的第一次设计 QA 有 4 条旧正则仍要求 `/books/`，与新项目的 `/nice-books/` 基路径不符。将这些路径模式适配到项目基路径后，相关原设计断言继续通过，没有删除或放宽检查。
- 最初的精确指针 hover 探针只观察书卡容器本身，因此没检测到源站与目标都发生在 `.nb-book3d-object` / `.nb-front-board` 上的书本倾斜和阴影变化。对两边同一交互做现场 A/B 后，QA 改为检查实际变化的后代元素；原位移限值未放宽。
- 独立项目验收不启动博客、不依赖博客磁盘路径。博客根页隔离原规则由 #159 守护；本站判据验证 Nice Books 页面自身本地资源/站内链接的基路径和返回主站链接。

## 红绿过程与失败修正

- 基路径 smoke 先于路由迁移运行时，首页选择器超时 15 秒；当时 Astro 页面仍位于 `/nice-books/books/`，目标 `/nice-books/` 还没有首页。随后将页面迁到 Astro `base` 根路由并适配内部路径。
- 第一次运行迁移后的 smoke 时，业务 URL 字符串已更新，但 11 处正则仍匹配 `/books/`，导致书目 ID 提取报 `null`。保留原判据并更新正则后，全套 72 项通过。
- 首次 `pnpm check` 报出新增 `SiteFooter.astro` 的 frontmatter 分隔符错误；修正后检查通过。

全部本轮命令输出摘要和路由探针结果保存在本机忽略目录 `output/nice-books-migration/t1/`。本地未推送、未部署。
