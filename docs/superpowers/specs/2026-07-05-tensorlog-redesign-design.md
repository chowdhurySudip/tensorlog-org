# tensorlog.org redesign — design spec

Date: 2026-07-05
Status: Approved for planning

## 1. Purpose

The site serves two roughly equal goals for Sudip Chowdhury:

1. **Learning-in-public journal** — a running record of ML experiments, papers digested, and things that worked or didn't.
2. **Portfolio for career/consulting** — signals credibility to employers/clients via the About, Experiments, and Contact sections.

Posts should read as genuine working notes, not marketing copy. The About/Experiments/Contact pages carry the portfolio weight.

## 2. Source design

This redesign implements the Claude Design prototype `tensorlog.dc.html` (project `f92719db-8205-472b-8e7f-6b30404910c6`), which specifies: visual style (light theme, Geist/Geist Mono fonts, `#5b54f0` indigo accent), exact copy, and page layouts for six views: Home, Writing, Article, Experiments, About, Contact. The prototype uses the Claude Design (`x-dc`/`sc-if`/`sc-for`) template runtime with pure in-memory client state and no URL routing — that runtime is not used in production; this spec re-implements the same visual design and copy as a real static site.

Companion prototype file `articles.js` (from the same design project) supplied the seed content for the six initial blog posts, ported into the markdown content files described below.

## 3. Architecture

Full static site generation (SSG). A Node build script (`build.js`) reads content from `content/posts/*.md`, renders it through shared layout/template functions, and writes complete, self-contained HTML files to `dist/`. There is no client-side framework and no runtime data-fetching for content — every URL the site serves is a real file on disk with the actual page content already present in the HTML.

Rationale: the deploy target is Cloudflare Pages, which is a static-file host. Full SSG is the native fit — every route becomes a real file Cloudflare serves directly with no rewrite rules, gives every page real per-page SEO/Open-Graph metadata without needing edge functions, and avoids a client-rendered empty-shell-until-JS-runs problem entirely.

## 4. Content authoring workflow

- Publishing a new post = adding one file: `content/posts/<slug>.md`.
- Frontmatter (parsed via the `gray-matter` npm package) fields: `title`, `date` (ISO `YYYY-MM-DD`), `tags` (array), `summary`.
- Body is plain text below the frontmatter, using the same lightweight markdown-ish syntax as the source prototype's `parseBody()`:
  - Blank line between lines → paragraph break
  - Line starting with `## ` → section heading
  - Line starting with `> ` → pull quote
  - Lines fenced with ` ``` ` on their own line → code block
- **Read time is computed automatically** from body word count at build time (~200 wpm) — never hand-typed, so it can't go stale.
- The filename is the slug is the URL (`content/posts/rag-late-chunking.md` → `/article/rag-late-chunking/`) — no separate ID field to keep in sync.
- No draft/unpublished flag for v1 — a file that exists is published. (Explicitly out of scope; see §10.)

## 5. Pages & URLs

Every route below is a real static file/directory written by the build:

| URL | Source | Contents |
|---|---|---|
| `/` | `index.html` | Hero, latest 5 posts (by date desc), "experiments cooking" teaser |
| `/writing/` | `writing/index.html` | Full post list (all posts, date desc) + client-side tag filter chips |
| `/article/<slug>/` | one per `content/posts/*.md` | Full post: title, date, read time, tags, rendered body, static author bio block |
| `/experiments/` | `experiments/index.html` | "Cooking" placeholder/teaser page, links back to Writing |
| `/about/` | `about/index.html` | Bio, "what I'm into" grid, timeline, CTA linking to Contact |
| `/contact/` | `contact/index.html` | Email card (`mailto:contact@tensorlog.org`), GitHub/X/LinkedIn links |
| `/404.html` | `404.html` | Real not-found page with a link home; served automatically by Cloudflare Pages on unmatched paths |

Copy, layout, and visual details for each page match the `tensorlog.dc.html` prototype (see §2).

Shared header (brand + nav with active-page highlighting) and footer (copyright + social links) are rendered by one shared layout function in `build.js`, so all pages stay visually consistent from a single source of truth. Nav highlighting: the "Writing" nav item is active on both `/writing/` and any `/article/<slug>/` page.

## 6. SEO & discoverability

Since the site doubles as a portfolio, each generated page includes:

- Per-page `<title>` and `<meta name="description">`
- Canonical URL (`<link rel="canonical">`)
- Open Graph tags (`og:title`, `og:description`, `og:type`, `og:url`)
- Twitter Card tags (`twitter:card=summary`, `twitter:title`, `twitter:description`)

Additionally generated at build time from the same post list, with no extra authoring effort:

- `sitemap.xml` — lists all pages
- `robots.txt` — allows all crawlers, points to the sitemap
- `feed.xml` — RSS 2.0 feed of all posts

## 7. Visual design

Carried over directly from the approved `tensorlog.dc.html` prototype: white background, `#16161a` primary text, `#6b6b74`/`#9a9aa3` secondary/muted text, `#5b54f0` indigo accent, `#ececef`/`#ededf1` borders, Geist (body) + Geist Mono (labels/metadata/code) via Google Fonts. Inline styles from the prototype are translated into real CSS classes in `css/style.css` (one stylesheet, shared across all pages) rather than kept inline, for maintainability.

The prototype defines no responsive/mobile behavior; this implementation adds sensible breakpoints (single-column post/timeline rows, stacked grids, tighter nav/section padding) below roughly 680px, consistent with the current site's existing mobile handling.

## 8. Client-side JS

Minimal and strictly progressive enhancement: the only interactive behavior is the tag-filter chips on `/writing/`, which filter the already-rendered, already-visible post list in the DOM (show/hide by tag — no re-fetching, no re-rendering from a data source). No router, no client-side data fetching. The site is fully readable and navigable with JavaScript disabled.

## 9. Directory structure

```
content/posts/*.md        — source content; the only thing edited to publish a post
build.js                  — the entire build pipeline (reads content, writes dist/)
package.json               — one dependency: gray-matter (frontmatter parsing)
css/style.css               — single shared stylesheet
js/tag-filter.js            — the one piece of client interactivity
dist/                      — generated output (gitignored; what Cloudflare Pages deploys)
_redirects                 — not needed for routing (every route is a real file); omitted unless a future need arises
```

## 10. Deployment

Cloudflare Pages project connected to this GitHub repo:

- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: `/`
- Push to `main` → automatic deploy

## 11. Explicitly out of scope for v1

Draft/unpublished post flags, comments, search, pagination (single full list is fine at current post volume), analytics. None of these were requested; the architecture (plain markdown files, simple build script) doesn't preclude adding any of them later without restructuring.
