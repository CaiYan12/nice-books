# Review Fixes Acceptance

This record covers the three review findings fixed in the independent Nice Books project. It does not change the book data, routes, interactions, or geometry.

## 1. Color tokens

The recommendation label, recommendation text, excerpt text, and excerpt citation now use the semantic `--nb-*` tokens declared in `src/nice-books/styles/books.css` and mapped in `tailwind.config.cjs`:

| Content                              | Token                | Preserved color |
| ------------------------------------ | -------------------- | --------------- |
| Recommendation label                 | `--nb-note-label`    | `#6f5a35`       |
| Recommendation text and excerpt text | `--nb-ink-warm`      | `#4a3f2c`       |
| Excerpt citation                     | `--nb-ink-warm-soft` | `#655a4a`       |

The pre-change values were read from the `de7104987cd591ca24d988e54f33e26c3c0a18a2` source snapshot. Post-change browser computed styles returned `rgb(111, 90, 53)`, `rgb(74, 63, 44)`, and `rgb(101, 90, 74)` respectively, which are the same values. The browser probe is retained at `output/nice-books-migration/review-fixes/computed-style-after.log`.

## 2. Tailwind configuration and dependency

Removed the unused blog palette (`primary`, `primarydark`, `hot`, `new`, `pagebg`, `line`), generic `sans` and `mono` font overrides, `wrapper` shadow and `box` radius, and the `@tailwindcss/typography` plugin. The direct dependency and its lockfile entries were removed with it.

An exact utility scan covered all 31 files under `src/` with the extensions registered by the project's `@source` directive. It found no blog palette utilities, no `font-sans` or `font-mono` utility classes, and no `prose` selectors or utilities. The scan script and result are retained at `output/nice-books-migration/review-fixes/config-usage-scan.mjs` and `config-usage-scan.json`.

The `nb` color and font mappings remain because the source uses those utilities and `books.css` defines their `--nb-*` values. The existing source glob and `darkMode: "class"` setting also remain unchanged to preserve the current Tailwind configuration contract. Browser captures checked the preflight-sensitive font behavior: before and after, the body computed to the same explicit Noto Sans SC font stack, and the controlled fixture reported both body and title fonts loaded. The post-change root `--font-sans` and `--font-mono` values are Tailwind's defaults; the page's explicit `font-nb-*` utilities continue to use the independent Nice Books font tokens.

`pnpm-lock.yaml` removes only `@tailwindcss/typography@0.5.20` and its exclusive `postcss-selector-parser@6.0.10` package and snapshots. The semantic comparison found no added, changed, or unrelated removed package or snapshot entries. `pnpm install --frozen-lockfile` passed with pnpm `10.26.2`, and the lockfile SHA-256 was unchanged by installation. The initial `pnpm remove --save-prod --ignore-scripts` attempt exited non-zero; a retry without `--ignore-scripts` succeeded, but its broader lockfile rewrite was discarded before the minimal lock diff was prepared.

## 3. Shared markup escaping

`src/nice-books/lib/escape-markup.ts` now owns the common replacement sequence used by `render.ts` and SVG generation in `cover.ts`. `render.ts` still exports `esc` with the same signature and delegates to the shared function. The implementation preserves `String(s ?? "")` coercion and replaces `&`, `<`, `>`, `"`, and `'` in the existing order. A rendering test checks hostile recommendation markup, already escaped text, and the established null-to-empty behavior.

## Browser comparison

Before and after captures used the same controlled font fixture, random seed `0x00c0ffee`, routes, viewport sizes, and local preview port. All six route/viewport pairs returned HTTP 200; the body and title font checks passed; page errors were zero; and all selected layout rectangles matched exactly. The two archive screenshots had identical hashes. The other four screenshots differed; a repeated after capture also varied. Screenshot hashes therefore are not used as the geometry or style acceptance criterion. The controlled captures and PNGs are in `output/nice-books-migration/review-fixes/controlled/`.

The independent browser QA completed against `http://127.0.0.1:4334/nice-books/` with exit code 0 for each command:

| Check                         | Result                |
| ----------------------------- | --------------------- |
| `pnpm smoke:nice-books`       | 72/72 passed          |
| `pnpm qa:nice-books-design`   | 67 passed, 0 failed   |
| `pnpm qa:nice-books-geometry` | 1507 passed, 0 failed |
| `pnpm qa:nice-books-404`      | 25 passed, 0 failed   |

The QA agent verified the source/config/lock snapshot had no changes during those read-only checks. Logs and the design screenshots are retained under `output/nice-books-migration/review-fixes-qa/`.

## Build evidence

On Windows with Node.js `24.18.0` and pnpm `10.26.2`:

- `pnpm install --frozen-lockfile` passed; the lockfile was unchanged.
- `pnpm check` passed with 0 errors, 0 warnings, and 4 hints.
- `pnpm test:nice-books` passed all 52 tests.
- `pnpm build` passed, including all 52 tests, and built 73 pages.
- `pnpm verify:pages-artifact` passed: 72 pages, 70 book routes, 72 sitemap URLs, 1476 same-origin URL references, and 107 CSS references.
- `SAFE_DELETE_*` matches in the install/build/artifact and browser QA logs: 0.

The build and install logs are retained under `output/nice-books-migration/review-fixes/`. No push, PR, or deployment was performed.
