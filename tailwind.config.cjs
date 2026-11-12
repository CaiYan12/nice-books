/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue,mjs}"],
	darkMode: "class",
	theme: {
		extend: {
			colors: {
				// Nice Books tokens are defined in src/nice-books/styles/books.css.
				nb: {
					paper: "var(--nb-paper)",
					surface: "var(--nb-surface)",
					note: "var(--nb-note)",
					"note-border": "var(--nb-note-border)",
					ink: "var(--nb-ink)",
					"ink-soft": "var(--nb-ink-soft)",
					"ink-warm": "var(--nb-ink-warm)",
					"ink-warm-soft": "var(--nb-ink-warm-soft)",
					muted: "var(--nb-muted)",
					blue: "var(--nb-blue)",
					seal: "var(--nb-seal)",
					border: "var(--nb-border)",
					"border-strong": "var(--nb-border-strong)",
					"note-label": "var(--nb-note-label)",
				},
			},
			fontFamily: {
				// Nice Books font slots; variables are defined in books.css.
				"nb-body": ["var(--nb-font-body)"],
				"nb-serif": ["var(--nb-font-serif)"],
				"nb-kai": ["var(--nb-font-kai)"],
				"nb-hand": ["var(--nb-font-hand)"],
				"nb-mono": ["var(--nb-font-mono)"],
			},
		},
	},
};
