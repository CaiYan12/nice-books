export const siteConfig = {
	siteURL: "https://caiyan12.github.io",
	basePath: "/nice-books",
	mainSiteURL: "https://caiyan12.github.io/",
};

export function sitePath(path: string): string {
	const relativePath = path.replace(/^\/+/, "");
	return `${siteConfig.basePath}/${relativePath}`;
}
