import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const outDir = path.resolve("output/nice-books-migration/t2/ab");
const base = process.env.NICE_BOOKS_BASE_URL ?? "http://localhost:4323/nice-books/";
const origin = new URL(base).origin;
const viewportSet = [
	{ name: "desktop-1440x900", width: 1440, height: 900 },
	{ name: "mobile-390x844", width: 390, height: 844 },
];
const routes = [
	{ name: "home", path: "/nice-books/" },
	{ name: "archive", path: "/nice-books/archive/" },
	{ name: "detail-01", path: "/nice-books/01/" },
];
const selectors = [
	"header",
	"nav[aria-label]",
	"#nb-books-main",
	"h1",
	"#nb-hero",
	"#nb-hero .nb-book3d-hero",
	"#nb-featured-grid",
	"#nb-featured-grid > li",
	"#nb-search-input",
	"#nb-tag-filter",
	"#nb-result-line",
	"#nb-archive-grid",
	"#nb-archive-list",
	"#nb-btn-more",
	".nb-book3d",
	".nb-book3d-hero",
	"#nb-books-main article .nb-book3d-hero",
	"#nb-books-main article .nb-cover",
	".nb-book3d-object",
	".nb-front-board",
	"#nb-excerpts-title",
	"#nb-related-title",
];

const sha256 = (value) =>
	createHash("sha256").update(value).digest("hex");

await mkdir(outDir, { recursive: true });
const dataResponse = await fetch(`${origin}/nice-books/data.json`);
const dataText = await dataResponse.text();
if (!dataResponse.ok) {
	throw new Error(`/nice-books/data.json returned HTTP ${dataResponse.status}`);
}
const books = JSON.parse(dataText);
const bookSummary = books.map((book) => ({
	id: book.id,
	title: book.title,
	author: book.author,
	publisher: book.publisher,
	firstEdition: book.firstEdition,
	tags: book.tags,
	featured: book.featured,
	coverUrl: book.coverUrl,
	descriptionCharacters: (book.description ?? "").length,
	recommendationCharacters: (book.recommendationReason ?? "").length,
	excerptCount: Array.isArray(book.excerpts) ? book.excerpts.length : null,
	contentSha256: sha256(JSON.stringify(book)),
}));

const browser = await chromium.launch({ headless: true });
const captures = [];
try {
	for (const viewport of viewportSet) {
		for (const route of routes) {
			const context = await browser.newContext({
				viewport: { width: viewport.width, height: viewport.height },
				deviceScaleFactor: 1,
				colorScheme: "light",
				reducedMotion: "no-preference",
			});
			await context.addInitScript(() => {
				let state = 0x00c0ffee;
				Object.defineProperty(Math, "random", {
					configurable: true,
					value: () => {
						state = (Math.imul(1664525, state) + 1013904223) >>> 0;
						window.__baselineRandomCalls =
							(window.__baselineRandomCalls ?? 0) + 1;
						return state / 0x100000000;
					},
				});
				window.__baselineRandomSeed = "0x00c0ffee";
			});
			const page = await context.newPage();
			const resources = [];
			const pageErrors = [];
			const consoleErrors = [];
			page.on("response", (response) => {
				const url = response.url();
				if (
					/\/_astro\/|\.css(?:\?|$)|\.m?js(?:\?|$)|\.woff2?(?:\?|$)|\.(?:png|jpe?g|webp|svg)(?:\?|$)|\/books\/data\.json|fontsapi|jsdelivr/i.test(
						url,
					)
				) {
					resources.push({
						kind: "response",
						status: response.status(),
						url,
						contentType:
							response.headers()["content-type"] ?? null,
					});
				}
			});
			page.on("requestfailed", (request) => {
				resources.push({
					kind: "requestfailed",
					url: request.url(),
					failure: request.failure()?.errorText ?? null,
				});
			});
			page.on("pageerror", (error) => pageErrors.push(error.message));
			page.on("console", (message) => {
				if (message.type() === "error") consoleErrors.push(message.text());
			});

			const url = `${origin}${route.path}`;
			let navigation = null;
			try {
				const response = await page.goto(url, {
					waitUntil: "domcontentloaded",
					timeout: 30000,
				});
				navigation = {
					status: response?.status() ?? null,
					url: page.url(),
				};
			} catch (error) {
				navigation = { error: error.message, url: page.url() };
			}
			await page.waitForSelector("#nb-books-main", { timeout: 15000 });

			let archiveDataReady = null;
			if (route.name === "archive") {
				try {
					await page.waitForFunction(
						() => document.querySelector("#nb-result-line")?.textContent?.includes("共 "),
						null,
						{ timeout: 15000 },
					);
					archiveDataReady = true;
				} catch (error) {
					archiveDataReady = error.message;
				}
			}

			const fontWait = await page.evaluate(async () => {
				const waitStarted = performance.now();
				const before = document.fonts.status;
				let timedOut = false;
				await Promise.race([
					document.fonts.ready,
					new Promise((resolve) =>
						setTimeout(() => {
							timedOut = true;
							resolve();
						}, 8000),
					),
				]);
				const faceList = [...document.fonts].map((face) => ({
					family: face.family,
					weight: face.weight,
					style: face.style,
					status: face.status,
				}));
				const families = [
					...new Set(
						[
							getComputedStyle(document.body).fontFamily,
							getComputedStyle(document.querySelector("h1") ?? document.body)
								.fontFamily,
						].flatMap((value) =>
							value.split(",").map((family) => family.trim()),
						),
					),
				];
				return {
					before,
					after: document.fonts.status,
					timedOut,
					elapsedMs: Math.round(performance.now() - waitStarted),
					faces: faceList,
					checks: families.map((family) => ({
						family,
						check: document.fonts.check(`16px ${family}`),
					})),
					bodyFont: getComputedStyle(document.body).fontFamily,
					headingFont: getComputedStyle(
						document.querySelector("h1") ?? document.body,
					).fontFamily,
				};
			});
			await page.evaluate(
				() =>
					new Promise((resolve) =>
						requestAnimationFrame(() =>
							requestAnimationFrame(resolve),
						),
					),
			);
			await page.evaluate(() => window.scrollTo(0, 0));

			const observation = await page.evaluate((selectorList) => {
				const round = (value) => Math.round(value * 100) / 100;
				const rectOf = (el) => {
					const rect = el.getBoundingClientRect();
					return {
						x: round(rect.x),
						y: round(rect.y),
						width: round(rect.width),
						height: round(rect.height),
						top: round(rect.top),
						right: round(rect.right),
						bottom: round(rect.bottom),
						left: round(rect.left),
					};
				};
			const styleOf = (el) => {
				const style = getComputedStyle(el);
				return Object.fromEntries(
					[
						"display",
						"position",
						"color",
						"backgroundColor",
						"fontFamily",
						"fontSize",
						"fontWeight",
						"lineHeight",
						"letterSpacing",
						"gap",
						"padding",
						"margin",
						"borderRadius",
						"boxShadow",
						"transform",
						"opacity",
						"visibility",
						"overflow",
					].map((key) => [key, style[key]]),
				);
			};
			const describe = (el) => ({
				tag: el.tagName.toLowerCase(),
				id: el.id || null,
				className:
					typeof el.className === "string" ? el.className : null,
					text: (el.innerText ?? el.textContent ?? "")
						.replace(/\s+/g, " ")
						.trim()
						.slice(0, 180),
					href: el.getAttribute("href"),
					ariaLabel: el.getAttribute("aria-label"),
					ariaCurrent: el.getAttribute("aria-current"),
					ariaPressed: el.getAttribute("aria-pressed"),
					role: el.getAttribute("role"),
					hidden: el.hidden,
					visible:
						getComputedStyle(el).display !== "none" &&
						getComputedStyle(el).visibility !== "hidden" &&
						el.getClientRects().length > 0,
					rect: rectOf(el),
					style: styleOf(el),
				});
			const elements = {};
			for (const selector of selectorList) {
				const found = [...document.querySelectorAll(selector)];
				elements[selector] = {
					count: found.length,
					samples: found.slice(0, 5).map(describe),
				};
			}
			const links = [...document.querySelectorAll("a[href]")].map((el) => ({
				text: (el.innerText ?? el.textContent ?? "")
					.replace(/\s+/g, " ")
					.trim()
					.slice(0, 100),
				href: el.getAttribute("href"),
				ariaCurrent: el.getAttribute("aria-current"),
			}));
			const controls = [...document.querySelectorAll("button, input, select")].map(
				(el) => ({
					tag: el.tagName.toLowerCase(),
					id: el.id || null,
					type: el.getAttribute("type"),
					text: (el.innerText ?? el.textContent ?? "")
						.replace(/\s+/g, " ")
						.trim()
						.slice(0, 100),
					value: "value" in el ? el.value : null,
					placeholder: el.getAttribute("placeholder"),
					ariaLabel: el.getAttribute("aria-label"),
					ariaPressed: el.getAttribute("aria-pressed"),
					disabled: "disabled" in el ? el.disabled : null,
					visible:
						getComputedStyle(el).display !== "none" &&
						getComputedStyle(el).visibility !== "hidden" &&
						el.getClientRects().length > 0,
				}),
			);
			const images = [...document.images].map((img) => ({
				src: img.currentSrc || img.src,
				alt: img.alt,
				loaded: img.complete,
				naturalWidth: img.naturalWidth,
				naturalHeight: img.naturalHeight,
				loading: img.loading,
			}));
			const main = document.querySelector("#nb-books-main");
			const hero = document.querySelector("#nb-hero");
			const heroLink = hero?.querySelector('a[href*="/nice-books/"]');
			return {
				url: location.href,
				title: document.title,
				meta: {
					description: document.querySelector('meta[name="description"]')?.content ?? null,
					canonical: document.querySelector('link[rel="canonical"]')?.href ?? null,
					viewport: document.querySelector('meta[name="viewport"]')?.content ?? null,
					ogTitle: document.querySelector('meta[property="og:title"]')?.content ?? null,
					ogDescription: document.querySelector('meta[property="og:description"]')?.content ?? null,
					ogUrl: document.querySelector('meta[property="og:url"]')?.content ?? null,
					ogSiteName: document.querySelector('meta[property="og:site_name"]')?.content ?? null,
				},
				lang: document.documentElement.lang,
				viewport: {
					innerWidth: window.innerWidth,
					innerHeight: window.innerHeight,
					clientWidth: document.documentElement.clientWidth,
					documentWidth: document.documentElement.scrollWidth,
					bodyWidth: document.body.scrollWidth,
					documentHeight: document.documentElement.scrollHeight,
					bodyHeight: document.body.scrollHeight,
					devicePixelRatio: window.devicePixelRatio,
				},
				body: describe(document.body),
				main: main ? describe(main) : null,
				headings: [...document.querySelectorAll("h1, h2, h3")].map((el) => ({
					level: el.tagName.toLowerCase(),
					text: (el.innerText ?? "").replace(/\s+/g, " ").trim(),
					id: el.id || null,
					rect: rectOf(el),
					style: styleOf(el),
				})),
				elements,
				links,
				controls,
				images,
				inlineSvgCount: document.querySelectorAll("svg").length,
				bookIdentity: {
					ssrBookId: hero?.getAttribute("data-ssr-book-id") ?? null,
					heroLink: heroLink?.getAttribute("href") ?? null,
					heroTitle: hero?.querySelector("h2")?.textContent?.trim() ?? null,
				},
				archiveState: {
					resultLine: document.querySelector("#nb-result-line")?.textContent?.trim() ?? null,
					gridItems: document.querySelectorAll("#nb-archive-grid > li").length,
					listItems: document.querySelectorAll("#nb-archive-list > li").length,
					searchValue: document.querySelector("#nb-search-input")?.value ?? null,
					query: location.search,
				},
				random: {
					seed: window.__baselineRandomSeed ?? null,
					calls: window.__baselineRandomCalls ?? 0,
				},
				motionPreference: matchMedia("(prefers-reduced-motion: reduce)").matches
					? "reduce"
					: "no-preference",
			};
			}, selectors);

			const animations = await page.evaluate(() =>
				document.getAnimations({ subtree: true }).map((animation) => ({
					playState: animation.playState,
					currentTime: animation.currentTime,
					id: animation.id,
					name:
						animation instanceof CSSAnimation
							? animation.animationName
							: animation instanceof CSSTransition
								? animation.transitionProperty
								: animation.constructor.name,
				})),
			);
			const file = path.join(outDir, `${route.name}-${viewport.name}.png`);
			await page.screenshot({ path: file, fullPage: false });
			captures.push({
				route: route.name,
				viewport: { width: viewport.width, height: viewport.height },
				navigation,
				archiveDataReady,
				fontWait,
				observation,
				animations,
				resources,
				pageErrors,
				consoleErrors,
				screenshot: path.basename(file),
			});
			await context.close();
		}
	}

	const behavior = await captureBehavior(browser, origin);
	const report = {
		capturedAt: new Date().toISOString(),
		base,
		browser: browser.version(),
		viewportSet,
		mathRandom: {
			implementation: "LCG seeded 0x00c0ffee in page init script",
			seed: "0x00c0ffee",
			ssrNote:
				"Math.random is fixed only in browser contexts; static SSR-selected home book remains build-time output and is recorded per capture.",
		},
		books: {
			count: books.length,
			ids: bookSummary.map((book) => book.id),
			dataSha256: sha256(dataText),
			endpointStatus: dataResponse.status,
			summary: bookSummary,
		},
		captures,
		behavior,
	};
	await writeFile(
		path.join(outDir, "baseline.json"),
		`${JSON.stringify(report, null, 2)}\n`,
		"utf8",
	);
	console.log(
		JSON.stringify(
			{
				base,
				browser: report.browser,
				bookCount: books.length,
				dataSha256: report.books.dataSha256,
				captures: captures.map((capture) => ({
					route: capture.route,
					viewport: capture.viewport,
					status: capture.navigation?.status,
					title: capture.observation.title,
					fontStatus: capture.fontWait.after,
					fontTimeout: capture.fontWait.timedOut,
					pageErrors: capture.pageErrors.length,
					consoleErrors: capture.consoleErrors.length,
					screenshot: capture.screenshot,
				})),
				behavior,
			},
			null,
			2,
		),
	);
} finally {
	await browser.close();
}

async function captureBehavior(browser, origin) {
	const context = await browser.newContext({
		viewport: { width: 1440, height: 900 },
		deviceScaleFactor: 1,
		colorScheme: "light",
		reducedMotion: "no-preference",
	});
	await context.addInitScript(() => {
		let state = 0x00c0ffee;
		Object.defineProperty(Math, "random", {
			configurable: true,
			value: () => {
				state = (Math.imul(1664525, state) + 1013904223) >>> 0;
				window.__baselineRandomCalls = (window.__baselineRandomCalls ?? 0) + 1;
				return state / 0x100000000;
			},
		});
		window.__baselineRandomSeed = "0x00c0ffee";
	});
	const page = await context.newPage();
	const observations = {};
	try {
		await page.goto(`${origin}/nice-books/`, { waitUntil: "domcontentloaded" });
		await page.waitForSelector("#nb-today-shuffle", { timeout: 10000 });
		observations.homeShuffle = await page.evaluate(() => ({
			ssrBookId: document.querySelector("#nb-hero")?.getAttribute("data-ssr-book-id") ?? null,
			beforeHref: document.querySelector('#nb-hero a[href*="/nice-books/"]')?.getAttribute("href") ?? null,
			beforeTitle: document.querySelector("#nb-hero .hero-title")?.textContent?.trim() ?? null,
			button: document.querySelector("#nb-today-shuffle")?.textContent?.trim() ?? null,
		}));
		await page.locator("#nb-today-shuffle").click();
		try {
			await page.waitForFunction(
				(previous) =>
					document.querySelector('#nb-hero a[href*="/nice-books/"]')?.getAttribute("href") !== previous,
				observations.homeShuffle.beforeHref,
				{ timeout: 5000 },
			);
			observations.homeShuffle.waitedForChange = true;
		} catch {
			observations.homeShuffle.waitedForChange = false;
		}
		try {
			await page.waitForFunction(
				() => !document.querySelector("#nb-today-shuffle")?.hasAttribute("aria-busy"),
				null,
				{ timeout: 10000 },
			);
			observations.homeShuffle.busyCleared = true;
		} catch {
			observations.homeShuffle.busyCleared = false;
		}
		observations.homeShuffle.after = await page.evaluate(() => ({
			href: document.querySelector('#nb-hero a[href*="/nice-books/"]')?.getAttribute("href") ?? null,
			title: document.querySelector("#nb-hero .hero-title")?.textContent?.trim() ?? null,
			busy: document.querySelector("#nb-today-shuffle")?.getAttribute("aria-busy") ?? null,
			randomCalls: window.__baselineRandomCalls ?? 0,
		}));

		await page.goto(`${origin}/nice-books/archive/`, { waitUntil: "domcontentloaded" });
		await page.waitForFunction(
			() => document.querySelector("#nb-result-line")?.textContent?.includes("共 "),
			null,
			{ timeout: 15000 },
		);
		observations.archiveInitial = await page.evaluate(() => ({
			resultLine: document.querySelector("#nb-result-line")?.textContent?.trim() ?? null,
			visibleGrid: !document.querySelector("#nb-archive-grid")?.hidden,
			gridItems: document.querySelectorAll("#nb-archive-grid > li").length,
			url: location.href,
		}));
		await page.locator("#nb-search-input").fill("百年孤独");
		await page.locator("#nb-search-btn").click();
		await page.waitForFunction(
			() => new URLSearchParams(location.search).get("q") === "百年孤独",
			null,
			{ timeout: 5000 },
		);
		observations.archiveSearch = await page.evaluate(() => ({
			resultLine: document.querySelector("#nb-result-line")?.textContent?.trim() ?? null,
			gridItems: document.querySelectorAll("#nb-archive-grid > li").length,
			url: location.href,
			searchValue: document.querySelector("#nb-search-input")?.value ?? null,
		}));
		await page.locator("#nb-search-input").fill("");
		await page.locator("#nb-search-btn").click();
		await page.locator("#nb-view-list").click();
		await page.waitForFunction(
			() => !document.querySelector("#nb-archive-list")?.hidden,
			null,
			{ timeout: 5000 },
		);
		observations.archiveListView = await page.evaluate(() => ({
			listHidden: document.querySelector("#nb-archive-list")?.hidden ?? null,
			listItems: document.querySelectorAll("#nb-archive-list > li").length,
			gridHidden: document.querySelector("#nb-archive-grid")?.hidden ?? null,
			viewListPressed: document.querySelector("#nb-view-list")?.getAttribute("aria-pressed") ?? null,
			url: location.href,
		}));
	} catch (error) {
		observations.error = error.message;
	} finally {
		await context.close();
	}
	return observations;
}
