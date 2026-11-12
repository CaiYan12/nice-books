import fs from "node:fs";
import path from "node:path";

const projectDir = process.cwd();
const distDir = path.join(projectDir, "dist");
const siteOrigin = "https://caiyan12.github.io";
const basePath = "/nice-books";
const baseUrl = siteOrigin + basePath + "/";
const errors = [];
let checkedSameOriginRefs = 0;
let checkedCssRefs = 0;

function report(condition, message) {
	if (!condition) errors.push(message);
}

function walkFiles(directory) {
	if (!fs.existsSync(directory)) return [];
	return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		const fullPath = path.join(directory, entry.name);
		return entry.isDirectory() ? walkFiles(fullPath) : [fullPath];
	});
}

function relativeDistPath(filePath) {
	return path.relative(distDir, filePath).split(path.sep).join("/");
}

function decodeHtml(value) {
	return value
		.replace(/&amp;/g, "&")
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">");
}

function readAttributes(tag) {
	const attributes = new Map();
	for (const match of tag.matchAll(/([^\s=/>]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)) {
		const value = match[2] ?? match[3] ?? match[4] ?? "";
		attributes.set(match[1].toLowerCase(), decodeHtml(value));
	}
	return attributes;
}

function expectedPageUrl(relativeFile) {
	if (relativeFile === "index.html") return siteOrigin + basePath + "/";
	if (relativeFile.endsWith("/index.html")) {
		return siteOrigin + basePath + "/" + relativeFile.slice(0, -"index.html".length);
	}
	return siteOrigin + basePath + "/" + relativeFile;
}

function distPathForUrl(url) {
	let relativePath;
	try {
		relativePath = decodeURIComponent(url.pathname.slice(basePath.length)).replace(/^\/+/, "");
	} catch {
		return null;
	}
	if (!relativePath) relativePath = "index.html";
	else if (relativePath.endsWith("/")) relativePath += "index.html";
	const resolved = path.resolve(distDir, relativePath);
	if (resolved !== distDir && !resolved.startsWith(distDir + path.sep)) return null;
	return resolved;
}

function checkUrl(rawValue, sourceUrl, label, allowMainSiteRoot = false) {
	const value = String(rawValue ?? "").trim();
	if (!value || /^(?:#|data:|blob:|mailto:|tel:|javascript:|about:)/i.test(value)) return false;
	let url;
	try {
		url = new URL(value, sourceUrl);
	} catch {
		errors.push(label + ": invalid URL " + value);
		return false;
	}
	if (url.origin !== siteOrigin) return false;
	const absoluteReference = /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(value);
	if (url.pathname === "/" && absoluteReference) {
		if (allowMainSiteRoot) return false;
		errors.push(
			label + ": same-origin root URL is only allowed for main-site navigation: " + value,
		);
		return false;
	}
	if (url.pathname !== basePath && !url.pathname.startsWith(basePath + "/")) {
		errors.push(label + ": same-origin URL is outside " + basePath + ": " + value);
		return false;
	}
	const target = distPathForUrl(url);
	if (!target) {
		errors.push(label + ": URL escapes the dist directory: " + value);
		return false;
	}
	checkedSameOriginRefs += 1;
	if (!fs.existsSync(target)) errors.push(label + ": missing dist target for " + value);
	return true;
}

function collectTags(html, name) {
	return [...html.matchAll(new RegExp("<" + name + "\\b[^>]*>", "gi"))].map((match) => match[0]);
}

function getMetaContent(html, property) {
	for (const tag of collectTags(html, "meta")) {
		const attributes = readAttributes(tag);
		if ((attributes.get("property") ?? "").toLowerCase() === property)
			return attributes.get("content") ?? null;
	}
	return null;
}

function getCanonical(html) {
	for (const tag of collectTags(html, "link")) {
		const attributes = readAttributes(tag);
		const rel = (attributes.get("rel") ?? "").toLowerCase().split(/\s+/);
		if (rel.includes("canonical")) return attributes.get("href") ?? null;
	}
	return null;
}

report(fs.existsSync(distDir), "dist directory is missing; run pnpm build first");
if (errors.length) {
	console.error(errors.join("\n"));
	process.exit(1);
}

const files = walkFiles(distDir);
const relativeFiles = files.map(relativeDistPath);
const htmlFiles = relativeFiles.filter((file) => file.toLowerCase().endsWith(".html"));
const publicPageFiles = htmlFiles.filter((file) => file !== "404.html");
const errorPageExists = htmlFiles.includes("404.html");

for (const required of ["index.html", "archive/index.html", "data.json", "sitemap-index.xml"]) {
	report(relativeFiles.includes(required), "required artifact is missing: " + required);
}

const dataPath = path.join(distDir, "data.json");
let bookIds = [];
if (fs.existsSync(dataPath)) {
	try {
		const books = JSON.parse(fs.readFileSync(dataPath, "utf8"));
		report(
			Array.isArray(books) && books.length > 0,
			"data.json must contain a non-empty book array",
		);
		if (Array.isArray(books)) {
			bookIds = books.map((book) => book?.id);
			report(
				bookIds.every((id) => typeof id === "string" && /^\d{2}$/.test(id)),
				"data.json contains a book ID that is not a two-digit string",
			);
			report(new Set(bookIds).size === bookIds.length, "data.json contains duplicate book IDs");
		}
	} catch (error) {
		errors.push("data.json is not valid JSON: " + error.message);
	}
}

const detailPageFiles = publicPageFiles.filter((file) => /^\d{2}\/index\.html$/.test(file));
const detailIds = detailPageFiles.map((file) => file.slice(0, 2));
report(
	detailPageFiles.length === bookIds.length,
	"detail page count (" +
		detailPageFiles.length +
		") does not match data.json book count (" +
		bookIds.length +
		")",
);
for (const id of bookIds)
	report(detailIds.includes(id), "data.json book " + id + " has no static detail page");
for (const id of detailIds)
	report(bookIds.includes(id), "detail page " + id + " is not present in data.json");

const expectedSitemapUrls = new Set();
for (const relativeFile of publicPageFiles) {
	const htmlPath = path.join(distDir, relativeFile);
	const html = fs.readFileSync(htmlPath, "utf8");
	const expectedUrl = expectedPageUrl(relativeFile);
	expectedSitemapUrls.add(expectedUrl);

	const canonical = getCanonical(html);
	report(
		canonical === expectedUrl,
		relativeFile + ": canonical URL is " + (canonical ?? "missing") + "; expected " + expectedUrl,
	);
	const ogUrl = getMetaContent(html, "og:url");
	report(
		ogUrl === expectedUrl,
		relativeFile + ": og:url is " + (ogUrl ?? "missing") + "; expected " + expectedUrl,
	);
}

for (const relativeFile of htmlFiles) {
	const htmlPath = path.join(distDir, relativeFile);
	const html = fs.readFileSync(htmlPath, "utf8");
	const sourceUrl = relativeFile === "404.html" ? baseUrl : expectedPageUrl(relativeFile);
	const rootLinks = [];
	for (const match of html.matchAll(
		/<(a|area|link|script|img|source|iframe|video|audio|track|form|input)\b[^>]*>/gi,
	)) {
		const tagName = match[1].toLowerCase();
		const attributes = readAttributes(match[0]);
		for (const name of ["href", "src", "poster", "action"]) {
			const value = attributes.get(name);
			if (!value) continue;
			if (
				name === "href" &&
				relativeFile === "404.html" &&
				(value === basePath ||
					value.startsWith(basePath + "/") ||
					value.startsWith(siteOrigin + basePath + "/"))
			)
				rootLinks.push(value);
			checkUrl(
				value,
				sourceUrl,
				relativeFile + " " + name,
				name === "href" && (tagName === "a" || tagName === "area"),
			);
		}
		const srcset = attributes.get("srcset");
		if (srcset) {
			for (const candidate of srcset.split(",")) {
				const value = candidate.trim().split(/\s+/, 1)[0];
				if (value) checkUrl(value, sourceUrl, relativeFile + " srcset");
			}
		}
	}
	for (const image of [getMetaContent(html, "og:image"), getMetaContent(html, "twitter:image")]) {
		if (image) checkUrl(image, sourceUrl, relativeFile + " social image");
	}
	if (relativeFile === "404.html")
		report(rootLinks.length > 0, "404.html has no link back into the /nice-books/ path");
}

for (const file of files.filter((entry) => entry.toLowerCase().endsWith(".css"))) {
	const css = fs.readFileSync(file, "utf8");
	const sourceUrl = siteOrigin + basePath + "/" + relativeDistPath(file);
	for (const match of css.matchAll(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^)]*))\s*\)/gi)) {
		const value = (match[1] ?? match[2] ?? match[3] ?? "").trim();
		if (value && !value.startsWith("var("))
			checkUrl(value, sourceUrl, relativeDistPath(file) + " CSS url");
		checkedCssRefs += 1;
	}
}

const sitemapIndexPath = path.join(distDir, "sitemap-index.xml");
const sitemapUrls = new Set();
if (fs.existsSync(sitemapIndexPath)) {
	const indexXml = fs.readFileSync(sitemapIndexPath, "utf8");
	const sitemapLocs = [...indexXml.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)].map((match) =>
		decodeHtml(match[1].trim()),
	);
	report(sitemapLocs.length > 0, "sitemap-index.xml does not reference any sitemap files");
	for (const sitemapLoc of sitemapLocs) {
		checkUrl(sitemapLoc, baseUrl, "sitemap-index.xml loc");
		let sitemapUrl;
		try {
			sitemapUrl = new URL(sitemapLoc);
		} catch {
			errors.push("sitemap-index.xml contains an invalid loc: " + sitemapLoc);
			continue;
		}
		const sitemapFile = distPathForUrl(sitemapUrl);
		if (!sitemapFile || !fs.existsSync(sitemapFile)) {
			errors.push("sitemap-index.xml references a missing sitemap file: " + sitemapLoc);
			continue;
		}
		const sitemapXml = fs.readFileSync(sitemapFile, "utf8");
		for (const match of sitemapXml.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)) {
			const loc = decodeHtml(match[1].trim());
			checkUrl(loc, baseUrl, relativeDistPath(sitemapFile) + " loc");
			sitemapUrls.add(loc);
		}
	}
}

report(
	sitemapUrls.size === expectedSitemapUrls.size,
	"sitemap has " +
		sitemapUrls.size +
		" URLs; expected " +
		expectedSitemapUrls.size +
		" generated pages",
);
for (const url of expectedSitemapUrls)
	report(sitemapUrls.has(url), "sitemap is missing generated page: " + url);
for (const url of sitemapUrls)
	report(expectedSitemapUrls.has(url), "sitemap contains an unexpected URL: " + url);

if (errors.length) {
	console.error(errors.map((error) => "FAIL: " + error).join("\n"));
	console.error("Pages artifact check failed with " + errors.length + " issue(s).");
	process.exit(1);
}

console.log(
	"Pages artifact check passed: " +
		publicPageFiles.length +
		" pages, " +
		bookIds.length +
		" book routes, " +
		sitemapUrls.size +
		" sitemap URLs, " +
		checkedSameOriginRefs +
		" same-origin URL refs, " +
		checkedCssRefs +
		" CSS refs; target " +
		baseUrl +
		".",
);
if (errorPageExists)
	console.log("Optional 404.html artifact is present and its local targets use the project path.");
