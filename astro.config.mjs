import sitemap from "@astrojs/sitemap";
import swup from "@swup/astro";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import { siteConfig } from "./src/config.ts";

export default defineConfig({
	site: siteConfig.siteURL,
	base: siteConfig.basePath,
	trailingSlash: "always",
	output: "static",
	compressHTML: true,
	integrations: [
		swup({
			theme: false,
			animationClass: "transition-swup-",
			containers: ["main"],
			smoothScrolling: false,
			cache: true,
			preload: true,
			ignore: ["[data-fancybox]"],
			accessibility: true,
			updateHead: true,
			updateBodyClass: false,
			globalInstance: true,
			animateHistoryBrowsing: false,
		}),
		sitemap(),
	],
	vite: {
		plugins: [tailwindcss()],
	},
});
