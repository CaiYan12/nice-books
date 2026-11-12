// Astro dev 的真实 Swup 页面旅程：确保 updateHead 后公共与新页样式仍生效。
// 运行：先 pnpm dev -- --port 4324，再设置 NICE_BOOKS_BASE_URL 并执行本脚本。
import { chromium } from "playwright";

const base =
	process.env.NICE_BOOKS_BASE_URL ?? "http://127.0.0.1:4324/nice-books/";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
let failures = 0;
page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
page.on("console", (message) => {
	if (message.type() === "error") errors.push(`console: ${message.text()}`);
});

function check(name, ok, detail = "") {
	console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` :: ${detail}` : ""}`);
	if (!ok) failures += 1;
	return Boolean(ok);
}

try {
	const response = await page.goto(base, { waitUntil: "domcontentloaded" });
	await page.waitForSelector("#nb-today-shuffle", { timeout: 10000 });
	const before = await page.evaluate(() => {
		const body = getComputedStyle(document.body);
		const header = getComputedStyle(document.querySelector("header"));
		return {
			backgroundColor: body.backgroundColor,
			backgroundImage: body.backgroundImage,
			fontFamily: body.fontFamily,
			headerBorderStyle: header.borderBottomStyle,
			headerBorderWidth: header.borderBottomWidth,
		};
	});
	check("dev 首页已加载并有 Nice Books 公共样式", response?.status() === 200 &&
		before.backgroundColor !== "rgba(0, 0, 0, 0)" &&
		before.headerBorderStyle === "double" &&
		before.headerBorderWidth === "3px", JSON.stringify({ status: response?.status(), before }));

	await page.click('header a[href="/nice-books/archive/"]');
	await page.waitForURL((url) => url.pathname === "/nice-books/archive/", {
		timeout: 10000,
	});
	await page.waitForFunction(() =>
		document.querySelector("#nb-result-line")?.textContent?.includes("共 "),
	);
	const after = await page.evaluate(() => {
		const body = getComputedStyle(document.body);
		const header = getComputedStyle(document.querySelector("header"));
		const input = document.querySelector("#nb-search-input");
		const button = document.querySelector("#nb-search-btn");
		const searchBox = input?.parentElement;
		return {
			backgroundColor: body.backgroundColor,
			backgroundImage: body.backgroundImage,
			fontFamily: body.fontFamily,
			headerBorderStyle: header.borderBottomStyle,
			headerBorderWidth: header.borderBottomWidth,
			searchBoxBorderRadius: searchBox
				? getComputedStyle(searchBox).borderRadius
				: null,
			searchButtonHeight: button?.getBoundingClientRect().height ?? null,
			currentNav: document.querySelector(
				'nav[aria-label="站内导航"] a[aria-current="page"]',
			)?.getAttribute("data-nb-nav") ?? null,
			title: document.querySelector("main h1")?.textContent?.trim() ?? null,
		};
	});
	const sharedStylesPersisted =
		after.backgroundColor === before.backgroundColor &&
		after.backgroundImage === before.backgroundImage &&
		after.fontFamily === before.fontFamily &&
		after.headerBorderStyle === "double" &&
		after.headerBorderWidth === "3px";
	check(
		"dev Swup 切到书库后公共样式仍生效，新页样式与导航状态已更新",
		sharedStylesPersisted &&
			after.searchBoxBorderRadius === "3px" &&
			after.searchButtonHeight >= 44 &&
			after.currentNav === "archive" &&
			after.title === "书库",
		JSON.stringify({ before, after }),
	);

	await page.goBack();
	await page.waitForURL((url) => url.pathname === "/nice-books/", {
		timeout: 10000,
	});
	await page.waitForSelector("#nb-today-shuffle", { timeout: 10000 });
	const returned = await page.evaluate(() => ({
		backgroundColor: getComputedStyle(document.body).backgroundColor,
		headerBorderStyle: getComputedStyle(document.querySelector("header"))
			.borderBottomStyle,
		currentNav: document.querySelector(
			'nav[aria-label="站内导航"] a[aria-current="page"]',
		)?.getAttribute("data-nb-nav") ?? null,
		homeAction: Boolean(document.querySelector("#nb-today-shuffle")),
	}));
	check(
		"dev Swup 后退恢复首页、公共样式与高亮",
		returned.backgroundColor === before.backgroundColor &&
			returned.headerBorderStyle === "double" &&
			returned.currentNav === "home" &&
			returned.homeAction,
		JSON.stringify(returned),
	);
	check("dev Swup 往返没有浏览器错误", errors.length === 0, errors.join(" | "));
} finally {
	await browser.close();
}

process.exitCode = failures || errors.length ? 1 : 0;
