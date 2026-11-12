// 独立 404 的浏览器验收：真实响应状态、项目外壳、返回旅程与窄屏/键盘触达。
// 运行：pnpm qa:nice-books-404
// NICE_BOOKS_BASE_URL 形态为完整页面目录，如 http://127.0.0.1:4323/nice-books/。
import { makeHarness } from "./lib/smoke-harness.mjs";

const harness = makeHarness({
	envVar: "NICE_BOOKS_BASE_URL",
	defaultBase: "http://127.0.0.1:4323/nice-books/",
	// Chromium reports the intentionally requested page-level 404 as a console
	// resource error. Exempt only those two exact probe routes; other 404s remain visible.
	isNoise: ({ url, text, base }) => {
		if (!text.includes("Failed to load resource") || !text.includes("404"))
			return false;
		try {
			const path = new URL(url, base).pathname;
			return /\/__t2-invalid-path__\/?$/.test(path) || /\/99\/?$/.test(path);
		} catch {
			return false;
		}
	},
	launch: { headless: true },
});
const { base, browser: chromium, attach, check, checkClean } = harness;
const browser = await chromium.launch(harness.launch);
const invalidRoutes = [
	{ name: "无效路径", url: new URL("__t2-invalid-path__/", base).href },
	{ name: "无效书籍编号", url: new URL("99/", base).href },
];

try {
	for (const route of invalidRoutes) {
		const page = await browser.newPage({
			viewport: { width: 1440, height: 900 },
		});
		attach(page);
		const response = await page.goto(route.url, {
			waitUntil: "domcontentloaded",
		});
		const status = response?.status() ?? null;
		check(`${route.name} 返回 HTTP 404`, status === 404, `status=${status}`);

		const shell = await page.evaluate(() => {
			const main = document.querySelector("main#nb-books-main");
			const title = main?.querySelector("h1") ?? null;
			const links = main
				? [...main.querySelectorAll("a[href]")].map((link) => ({
						text: (link.textContent ?? "").trim(),
						href: link.getAttribute("href"),
						height: link.getBoundingClientRect().height,
						visible:
							getComputedStyle(link).display !== "none" &&
							link.getClientRects().length > 0,
					}))
				: [];
			return {
				bodyClass: document.body.className,
				mainCount: document.querySelectorAll("main#nb-books-main").length,
				headerCount: document.querySelectorAll("body > header").length,
				footerCount: document.querySelectorAll("body > footer").length,
				title: title?.textContent?.trim() ?? null,
				titleVisible: Boolean(title && title.getClientRects().length > 0),
				links,
				robots: document.querySelector('meta[name="robots"]')?.content ?? null,
				canonical: document.querySelector('link[rel="canonical"]')?.href ?? null,
				activeNav: document.querySelector(
					'nav[aria-label="站内导航"] a[aria-current="page"]',
				)?.textContent?.trim() ?? null,
			};
		});
		const homeLink = shell.links.find((link) => link.href === "/nice-books/");
		const archiveLink = shell.links.find(
			(link) => link.href === "/nice-books/archive/",
		);
		check(
			`${route.name} 使用独立 Nice Books 页眉、正文与页脚`,
			shell.mainCount === 1 &&
				shell.headerCount === 1 &&
				shell.footerCount === 1 &&
				shell.bodyClass.includes("nb-page") &&
				Boolean(shell.titleVisible),
			JSON.stringify({
				mainCount: shell.mainCount,
				headerCount: shell.headerCount,
				footerCount: shell.footerCount,
				bodyClass: shell.bodyClass,
				title: shell.title,
			}),
		);
		check(
			`${route.name} 提供可见的“今日好书”和“书库”入口`,
			Boolean(homeLink?.visible && archiveLink?.visible),
			JSON.stringify({ homeLink, archiveLink }),
		);
		check(
			`${route.name} 页面标记 noindex 且没有错误 canonical`,
			shell.robots === "noindex,follow" && shell.canonical === null,
			JSON.stringify({ robots: shell.robots, canonical: shell.canonical }),
		);
		check(
			`${route.name} 不把错误路由标成当前导航`,
			shell.headerCount === 1 && shell.activeNav === null,
			`headerCount=${shell.headerCount} activeNav=${shell.activeNav}`,
		);

		for (const width of [390, 1440]) {
			await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
			const layout = await page.evaluate(() => {
				const main = document.querySelector("main#nb-books-main");
				const links = main ? [...main.querySelectorAll("a[href]")] : [];
				return {
					clientWidth: document.documentElement.clientWidth,
					scrollWidth: document.documentElement.scrollWidth,
					mainVisible: Boolean(main && main.getClientRects().length > 0),
					links: links.map((link) => ({
						href: link.getAttribute("href"),
						height: link.getBoundingClientRect().height,
						width: link.getBoundingClientRect().width,
					})),
				};
			});
			check(
				`${route.name}@${width}px 无横向溢出且内容可见`,
				layout.scrollWidth <= layout.clientWidth + 1 &&
				layout.mainVisible,
				JSON.stringify(layout),
			);
			check(
				`${route.name}@${width}px 两个返回入口满足 44px 触摸高度`,
				layout.links.some(
					(link) =>
						link.href === "/nice-books/" && link.height >= 44,
				) &&
					layout.links.some(
						(link) =>
							link.href === "/nice-books/archive/" &&
							link.height >= 44,
					),
				JSON.stringify(layout.links),
			);
		}

		if (route.name === "无效路径") {
			await page.setViewportSize({ width: 390, height: 844 });
			await page.goto(route.url, { waitUntil: "domcontentloaded" });
			for (let index = 0; index < 5; index += 1)
				await page.keyboard.press("Tab");
			const keyboard = await page.evaluate(() => {
				const active = document.activeElement;
				const expected = document.querySelector(
					'main#nb-books-main a[href="/nice-books/"]',
				);
				const style = active ? getComputedStyle(active) : null;
				return {
					matchesExpected: active === expected,
					outlineStyle: style?.outlineStyle ?? null,
					outlineWidth: style?.outlineWidth ?? null,
				};
			});
			check(
				"键盘 Tab 可到达首页入口并显示焦点环",
				keyboard.matchesExpected &&
				keyboard.outlineStyle !== "none" &&
				keyboard.outlineWidth !== "0px",
				JSON.stringify(keyboard),
			);
			const homeEntrance = page.locator(
				'main a[href="/nice-books/"]',
			);
			if (await homeEntrance.count()) {
				await homeEntrance.click();
				await page.waitForURL((url) => url.pathname === "/nice-books/", {
					timeout: 8000,
				});
				await page.waitForSelector("#nb-today-shuffle", {
					timeout: 8000,
				});
			}
			check(
				"今日好书入口返回首页并可操作",
				(await page.locator("#nb-today-shuffle").count()) === 1,
			);
			await page.goto(route.url, { waitUntil: "domcontentloaded" });
			const archiveEntrance = page.locator(
				'main a[href="/nice-books/archive/"]',
			);
			if (await archiveEntrance.count()) {
				await archiveEntrance.click();
				await page.waitForURL(
					(url) => url.pathname === "/nice-books/archive/",
					{ timeout: 8000 },
				);
				await page.waitForFunction(() =>
					document
						.querySelector("#nb-result-line")
						?.textContent?.includes("共 "),
				);
			}
			check(
				"书库入口返回书库并完成数据加载",
				await page.evaluate(() =>
					document
						.querySelector("#nb-result-line")
						?.textContent?.includes("共 "),
				),
			);
		}

		await page.close();
	}

	const touchContext = await browser.newContext({
		viewport: { width: 390, height: 844 },
		deviceScaleFactor: 1,
		isMobile: true,
		hasTouch: true,
	});
	try {
		const touchPage = await touchContext.newPage();
		attach(touchPage);
		const invalidPath = invalidRoutes[0].url;
		const response = await touchPage.goto(invalidPath, {
			waitUntil: "domcontentloaded",
		});
		const touchState = await touchPage.evaluate(() => ({
			maxTouchPoints: navigator.maxTouchPoints,
			coarsePointer: matchMedia("(pointer: coarse)").matches,
		}));
		check(
			"触摸设备进入无效路径仍收到 404 与移动端输入环境",
			response?.status() === 404 &&
				touchState.maxTouchPoints > 0 &&
				touchState.coarsePointer,
			JSON.stringify({
				status: response?.status() ?? null,
				...touchState,
			}),
		);

		const tapLink = async (href) => {
			const link = touchPage.locator(
				'main#nb-books-main a[href="' + href + '"]',
			);
			const rect = await link.boundingBox();
			if (!rect) throw new Error("触摸目标不可见：" + href);
			await touchPage.touchscreen.tap(
				rect.x + rect.width / 2,
				rect.y + rect.height / 2,
			);
		};

		await tapLink("/nice-books/");
		await touchPage.waitForURL(
			(url) => url.pathname === "/nice-books/",
			{ timeout: 8000 },
		);
		await touchPage.waitForSelector("#nb-today-shuffle", {
			timeout: 8000,
		});
		check(
			"触摸“今日好书”入口返回首页并可操作",
			(await touchPage.locator("#nb-today-shuffle").count()) === 1,
		);

		await touchPage.goto(invalidPath, { waitUntil: "domcontentloaded" });
		await tapLink("/nice-books/archive/");
		await touchPage.waitForURL(
			(url) => url.pathname === "/nice-books/archive/",
			{ timeout: 8000 },
		);
		await touchPage.waitForFunction(() =>
			document
				.querySelector("#nb-result-line")
				?.textContent?.includes("共 "),
		);
		check(
			"触摸“书库”入口返回书库并完成数据加载",
			await touchPage.evaluate(() =>
				document
					.querySelector("#nb-result-line")
					?.textContent?.includes("共 "),
			),
		);
		await touchPage.close();
	} finally {
		await touchContext.close();
	}

	checkClean("404 导航旅程");
} finally {
	await browser.close();
}

harness.finish();
