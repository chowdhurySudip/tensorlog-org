# tensorlog.org SSG Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild tensorlog.org as a fully static-site-generated blog/portfolio (Home, Writing, Article, Experiments, About, Contact) sourced from markdown posts, matching the approved `tensorlog.dc.html` design, deployable to Cloudflare Pages with zero server-side logic.

**Architecture:** A Node build script (`build.js`) reads markdown posts from `content/posts/*.md` via small, independently-testable modules under `build/` (markdown parsing, read-time calculation, date formatting, post loading, page templates, feed generation), and writes complete static HTML files plus `sitemap.xml`/`robots.txt`/`feed.xml` to `dist/`. `css/style.css` and `js/tag-filter.js` are copied into `dist/` verbatim. No client framework; the only client JS is progressive-enhancement tag filtering on the Writing page.

**Tech Stack:** Node.js (CommonJS, `require`/`module.exports`), Node's built-in test runner (`node --test`), `gray-matter` for frontmatter parsing. No bundler, no framework.

## Global Constraints

- Node.js >= 18, CommonJS modules only (no ESM, no bundler/build framework).
- Exactly one production dependency: `gray-matter`. No other runtime or client-side dependencies.
- Every generated page includes: `<title>`, `<meta name="description">`, `<link rel="canonical">`, Open Graph (`og:title`/`og:description`/`og:type`/`og:url`), Twitter Card (`summary`) tags — per spec §6.
- Site identity values (fixed, copy verbatim everywhere they're needed): site title `Sudip Chowdhury`, base URL `https://tensorlog.org`, contact email `contact@tensorlog.org`, GitHub `https://github.com/chowdhurySudip`, X `https://x.com/SudipCh03813050`, LinkedIn `https://in.linkedin.com/in/sudip-chowdhury`.
- Visual design: white background `#ffffff`, primary text `#16161a`, secondary text `#6b6b74`, muted text `#9a9aa3`, accent `#5b54f0`, borders `#ececef`/`#ededf1`, fonts Geist (body) + Geist Mono (labels/meta/code) via Google Fonts.
- Read time is always computed from body word count at build time (~200 wpm) — never a frontmatter field.
- Every route is a real file in `dist/` (full SSG) — no client-side router, no `_redirects` rewrite needed.
- `dist/` and `node_modules/` are gitignored; nothing under `dist/` is committed.

---

### Task 1: Clean up legacy site files and scaffold the Node project

**Files:**
- Delete: `index.html`
- Delete: `js/script.js`
- Create: `.gitignore`
- Create: `package.json`
- Create: `test/smoke.test.js`

**Interfaces:**
- Produces: `npm test` runs Node's built-in test runner against `test/`; `npm run build` will later run `build.js` (not created until Task 17).

- [ ] **Step 1: Remove the old hand-written site files**

The current `index.html` and `js/script.js` implement the old dark-theme landing page, which this rebuild fully replaces with a generated `dist/` output. `css/style.css` is kept — its content will be fully rewritten in Task 14.

```bash
git rm index.html js/script.js
```

- [ ] **Step 2: Create `.gitignore`**

```
node_modules/
dist/
```

- [ ] **Step 3: Create `package.json`**

```json
{
  "name": "tensorlog-org",
  "private": true,
  "version": "1.0.0",
  "description": "tensorlog.org static site build",
  "scripts": {
    "build": "node build.js",
    "test": "node --test test/"
  },
  "engines": {
    "node": ">=18"
  },
  "dependencies": {
    "gray-matter": "^4.0.3"
  }
}
```

- [ ] **Step 4: Install dependencies**

```bash
npm install
```

Expected: `node_modules/` created, `package-lock.json` written, no errors.

- [ ] **Step 5: Write a smoke test to confirm the test runner works**

```js
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

test('test runner is wired up', () => {
  assert.equal(1 + 1, 2);
});
```

- [ ] **Step 6: Run the test suite**

Run: `npm test`
Expected: 1 test passes.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "Remove legacy site files, scaffold Node build project"
```

---

### Task 2: Site config and date formatting

**Files:**
- Create: `build/site-config.js`
- Create: `build/date.js`
- Test: `test/date.test.js`

**Interfaces:**
- Produces: `build/site-config.js` exports `{ siteTitle, siteDescription, baseUrl, authorName, authorBio, contactEmail, github, twitter, linkedin, navItems }` where `navItems` is `[{ label, path }]`.
- Produces: `build/date.js` exports `formatDate(isoDate: string) => string`, e.g. `'2026-06-15' => 'Jun 2026'`.

- [ ] **Step 1: Write the failing test for `formatDate`**

```js
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { formatDate } = require('../build/date');

test('formats an ISO date as "Mon YYYY"', () => {
  assert.equal(formatDate('2026-06-15'), 'Jun 2026');
});

test('handles January and December correctly', () => {
  assert.equal(formatDate('2026-01-01'), 'Jan 2026');
  assert.equal(formatDate('2026-12-31'), 'Dec 2026');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `Cannot find module '../build/date'`

- [ ] **Step 3: Implement `build/date.js`**

```js
'use strict';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDate(isoDate) {
  const [year, month] = isoDate.split('-');
  const monthIndex = parseInt(month, 10) - 1;
  return `${MONTHS[monthIndex]} ${year}`;
}

module.exports = { formatDate };
```

- [ ] **Step 4: Implement `build/site-config.js`**

```js
'use strict';

module.exports = {
  siteTitle: 'Sudip Chowdhury',
  siteDescription: "I build, break, and write about machine learning systems.",
  baseUrl: 'https://tensorlog.org',
  authorName: 'Sudip Chowdhury',
  authorBio: 'AI engineer, learning out loud.',
  contactEmail: 'contact@tensorlog.org',
  github: 'https://github.com/chowdhurySudip',
  twitter: 'https://x.com/SudipCh03813050',
  linkedin: 'https://in.linkedin.com/in/sudip-chowdhury',
  navItems: [
    { label: 'Writing', path: '/writing/' },
    { label: 'Experiments', path: '/experiments/' },
    { label: 'About', path: '/about/' },
    { label: 'Contact', path: '/contact/' }
  ]
};
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test`
Expected: 3 tests pass (smoke + 2 date tests).

- [ ] **Step 6: Commit**

```bash
git add build/site-config.js build/date.js test/date.test.js
git commit -m "Add site config and date formatting"
```

---

### Task 3: Markdown-ish body parser

**Files:**
- Create: `build/markdown.js`
- Test: `test/markdown.test.js`

**Interfaces:**
- Produces: `parseBody(body: string) => Array<{ type: 'p'|'h2'|'code'|'quote', text: string }>`
- Produces: `escapeHtml(str: string) => string` (escapes `&`, `<`, `>`)

- [ ] **Step 1: Write the failing tests**

```js
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { parseBody, escapeHtml } = require('../build/markdown');

test('merges consecutive lines into one paragraph', () => {
  const blocks = parseBody('line one\nline two\n\nsecond paragraph');
  assert.deepEqual(blocks, [
    { type: 'p', text: 'line one line two' },
    { type: 'p', text: 'second paragraph' }
  ]);
});

test('parses a heading line', () => {
  const blocks = parseBody('## A Heading\n\nBody text.');
  assert.deepEqual(blocks, [
    { type: 'h2', text: 'A Heading' },
    { type: 'p', text: 'Body text.' }
  ]);
});

test('parses a pull quote line', () => {
  const blocks = parseBody('> A quote.\n\nBody text.');
  assert.deepEqual(blocks, [
    { type: 'quote', text: 'A quote.' },
    { type: 'p', text: 'Body text.' }
  ]);
});

test('parses a fenced code block, preserving internal blank lines', () => {
  const blocks = parseBody('Intro.\n\n```\nline1\n\nline2\n```\n\nOutro.');
  assert.deepEqual(blocks, [
    { type: 'p', text: 'Intro.' },
    { type: 'code', text: 'line1\n\nline2' },
    { type: 'p', text: 'Outro.' }
  ]);
});

test('escapeHtml escapes ampersand and angle brackets', () => {
  assert.equal(escapeHtml('a < b & c > d'), 'a &lt; b &amp; c &gt; d');
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — `Cannot find module '../build/markdown'`

- [ ] **Step 3: Implement `build/markdown.js`**

```js
'use strict';

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function parseBody(body) {
  const lines = (body || '').replace(/\r/g, '').split('\n');
  const blocks = [];
  let para = [];

  const flush = () => {
    if (para.length) {
      blocks.push({ type: 'p', text: para.join(' ').trim() });
      para = [];
    }
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    if (line.trim().startsWith('```')) {
      flush();
      i++;
      const code = [];
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        code.push(lines[i]);
        i++;
      }
      i++; // skip closing fence
      blocks.push({ type: 'code', text: code.join('\n') });
      continue;
    }

    if (line.trim() === '') { flush(); i++; continue; }
    if (line.startsWith('## ')) { flush(); blocks.push({ type: 'h2', text: line.slice(3).trim() }); i++; continue; }
    if (line.startsWith('> ')) { flush(); blocks.push({ type: 'quote', text: line.slice(2).trim() }); i++; continue; }

    para.push(line);
    i++;
  }
  flush();
  return blocks;
}

module.exports = { parseBody, escapeHtml };
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: All tests pass (8 total so far).

- [ ] **Step 5: Commit**

```bash
git add build/markdown.js test/markdown.test.js
git commit -m "Add markdown-ish body parser and HTML escaping helper"
```

---

### Task 4: Read-time calculator

**Files:**
- Create: `build/read-time.js`
- Test: `test/read-time.test.js`

**Interfaces:**
- Produces: `computeReadTime(bodyText: string) => string`, e.g. `'8 min read'`. Minimum is `'1 min read'`. Uses 200 words/minute.

- [ ] **Step 1: Write the failing tests**

```js
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { computeReadTime } = require('../build/read-time');

test('very short text rounds up to 1 min read', () => {
  assert.equal(computeReadTime('just a few words here'), '1 min read');
});

test('computes minutes from word count at 200 wpm', () => {
  const words = new Array(400).fill('word').join(' ');
  assert.equal(computeReadTime(words), '2 min read');
});

test('rounds to nearest minute', () => {
  const words = new Array(1000).fill('word').join(' ');
  assert.equal(computeReadTime(words), '5 min read');
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — `Cannot find module '../build/read-time'`

- [ ] **Step 3: Implement `build/read-time.js`**

```js
'use strict';

const WORDS_PER_MINUTE = 200;

function computeReadTime(bodyText) {
  const words = (bodyText || '').trim().split(/\s+/).filter(Boolean);
  const minutes = Math.max(1, Math.round(words.length / WORDS_PER_MINUTE));
  return `${minutes} min read`;
}

module.exports = { computeReadTime };
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add build/read-time.js test/read-time.test.js
git commit -m "Add automatic read-time calculator"
```

---

### Task 5: Post loader

**Files:**
- Create: `build/posts.js`
- Create fixtures: `test/fixtures/posts/older-post.md`
- Create fixtures: `test/fixtures/posts/newer-post.md`
- Test: `test/posts.test.js`

**Interfaces:**
- Consumes: `parseBody` and `escapeHtml` from `build/markdown.js` (Task 3), `computeReadTime` from `build/read-time.js` (Task 4), `formatDate` from `build/date.js` (Task 2).
- Produces: `loadPosts(postsDir: string) => Array<Post>` sorted newest-first by `isoDate`, where `Post = { slug, title, isoDate, date, tags: string[], summary, readTime, blocks }`.

- [ ] **Step 1: Create fixture post files**

`test/fixtures/posts/older-post.md`:
```markdown
---
title: Older Post
date: 2026-01-01
tags: [alpha]
summary: The older one.
---
Just a short body for the older post.
```

`test/fixtures/posts/newer-post.md`:
```markdown
---
title: Newer Post
date: 2026-02-01
tags: [alpha, beta]
summary: The newer one.
---
## A heading

Body text for the newer post.
```

- [ ] **Step 2: Write the failing test**

```js
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { loadPosts } = require('../build/posts');

const FIXTURES_DIR = path.join(__dirname, 'fixtures', 'posts');

test('loads posts sorted newest-first', () => {
  const posts = loadPosts(FIXTURES_DIR);
  assert.equal(posts.length, 2);
  assert.equal(posts[0].slug, 'newer-post');
  assert.equal(posts[1].slug, 'older-post');
});

test('parses frontmatter fields and formats the date', () => {
  const posts = loadPosts(FIXTURES_DIR);
  const older = posts.find(p => p.slug === 'older-post');
  assert.equal(older.title, 'Older Post');
  assert.equal(older.isoDate, '2026-01-01');
  assert.equal(older.date, 'Jan 2026');
  assert.deepEqual(older.tags, ['alpha']);
  assert.equal(older.summary, 'The older one.');
});

test('computes read time and parses body into blocks', () => {
  const posts = loadPosts(FIXTURES_DIR);
  const newer = posts.find(p => p.slug === 'newer-post');
  assert.equal(newer.readTime, '1 min read');
  assert.deepEqual(newer.blocks, [
    { type: 'h2', text: 'A heading' },
    { type: 'p', text: 'Body text for the newer post.' }
  ]);
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `Cannot find module '../build/posts'`

- [ ] **Step 4: Implement `build/posts.js`**

```js
'use strict';

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { parseBody } = require('./markdown');
const { computeReadTime } = require('./read-time');
const { formatDate } = require('./date');

function loadPosts(postsDir) {
  const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));

  const posts = files.map(file => {
    const slug = path.basename(file, '.md');
    const raw = fs.readFileSync(path.join(postsDir, file), 'utf8');
    const { data, content } = matter(raw);
    const body = content.trim();

    return {
      slug,
      title: data.title,
      isoDate: data.date,
      date: formatDate(data.date),
      tags: data.tags || [],
      summary: data.summary,
      readTime: computeReadTime(body),
      blocks: parseBody(body)
    };
  });

  posts.sort((a, b) => (a.isoDate < b.isoDate ? 1 : a.isoDate > b.isoDate ? -1 : 0));
  return posts;
}

module.exports = { loadPosts };
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test`
Expected: All tests pass.

- [ ] **Step 6: Commit**

```bash
git add build/posts.js test/posts.test.js test/fixtures
git commit -m "Add post loader with frontmatter parsing and sorting"
```

---

### Task 6: Shared layout renderer

**Files:**
- Create: `build/layout.js`
- Test: `test/layout.test.js`

**Interfaces:**
- Consumes: `build/site-config.js` (Task 2).
- Produces: `renderLayout({ title, description, canonicalPath, activeNav, bodyHtml, ogType? }) => string` (full HTML document string). `activeNav` is one of `'home' | 'writing' | 'article' | 'experiments' | 'about' | 'contact' | null`. When `activeNav === 'article'`, the "Writing" nav link is highlighted active.

- [ ] **Step 1: Write the failing tests**

```js
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { renderLayout } = require('../build/layout');

test('renders title, description, and canonical URL', () => {
  const html = renderLayout({
    title: 'Test Page',
    description: 'A test description.',
    canonicalPath: '/test/',
    activeNav: null,
    bodyHtml: '<p>hi</p>'
  });
  assert.match(html, /<title>Test Page<\/title>/);
  assert.match(html, /<meta name="description" content="A test description\.">/);
  assert.match(html, /<link rel="canonical" href="https:\/\/tensorlog\.org\/test\/">/);
  assert.match(html, /<p>hi<\/p>/);
});

test('marks the matching nav link active', () => {
  const html = renderLayout({
    title: 'Writing', description: 'd', canonicalPath: '/writing/', activeNav: 'writing', bodyHtml: ''
  });
  assert.match(html, /class="nav__link nav__link--active" href="\/writing\/"/);
});

test('article activeNav highlights the Writing nav link', () => {
  const html = renderLayout({
    title: 'A Post', description: 'd', canonicalPath: '/article/foo/', activeNav: 'article', bodyHtml: ''
  });
  assert.match(html, /class="nav__link nav__link--active" href="\/writing\/"/);
});

test('defaults og:type to website, allows override', () => {
  const html = renderLayout({
    title: 't', description: 'd', canonicalPath: '/', activeNav: null, bodyHtml: '', ogType: 'article'
  });
  assert.match(html, /<meta property="og:type" content="article">/);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — `Cannot find module '../build/layout'`

- [ ] **Step 3: Implement `build/layout.js`**

```js
'use strict';

const config = require('./site-config');

function renderNav(activeNav) {
  return config.navItems.map(item => {
    const key = item.path.replace(/\//g, '');
    const isActive = activeNav === key || (activeNav === 'article' && key === 'writing');
    const cls = isActive ? 'nav__link nav__link--active' : 'nav__link';
    return `<a class="${cls}" href="${item.path}">${item.label}</a>`;
  }).join('\n        ');
}

function renderLayout({ title, description, canonicalPath, activeNav, bodyHtml, ogType = 'website' }) {
  const canonicalUrl = `${config.baseUrl}${canonicalPath}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<meta name="description" content="${description}">
<link rel="canonical" href="${canonicalUrl}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:type" content="${ogType}">
<meta property="og:url" content="${canonicalUrl}">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
<link rel="alternate" type="application/rss+xml" title="${config.siteTitle}" href="${config.baseUrl}/feed.xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/style.css">
</head>
<body>
<div class="site-header">
  <header class="site-header__inner">
    <a class="brand" href="/">${config.siteTitle}</a>
    <nav class="nav">
      ${renderNav(activeNav)}
    </nav>
  </header>
</div>
<main class="site-main">
${bodyHtml}
</main>
<footer class="site-footer">
  <div class="site-footer__inner">
    <span>&copy; 2026 &middot; tensorlog.org</span>
    <span class="footer-links">
      <a href="${config.github}" target="_blank" rel="noopener">GitHub</a>
      <a href="${config.twitter}" target="_blank" rel="noopener">X</a>
      <a href="mailto:${config.contactEmail}">Email</a>
    </span>
  </div>
</footer>
<script src="/js/tag-filter.js"></script>
</body>
</html>
`;
}

module.exports = { renderLayout };
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add build/layout.js test/layout.test.js
git commit -m "Add shared page layout with SEO meta and nav highlighting"
```

---

### Task 7: Post-list partial

**Files:**
- Create: `build/post-list.js`
- Test: `test/post-list.test.js`

**Interfaces:**
- Consumes: `escapeHtml` from `build/markdown.js` (Task 3).
- Produces: `renderPostList(posts: Array<Post>) => string` (HTML for a list of post items, used by both Home and Writing pages). Each item is an `<a class="post-item">` with `data-tags="tag1,tag2"`.

- [ ] **Step 1: Write the failing test**

```js
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { renderPostList } = require('../build/post-list');

const posts = [
  { slug: 'foo', title: 'Foo & Bar', date: 'Jun 2026', tags: ['RAG', 'retrieval'], summary: 'A <summary>.' }
];

test('renders a linked post item with date, title, summary, and tags', () => {
  const html = renderPostList(posts);
  assert.match(html, /href="\/article\/foo\/"/);
  assert.match(html, /data-tags="RAG,retrieval"/);
  assert.match(html, /Jun 2026/);
  assert.match(html, /Foo &amp; Bar/);
  assert.match(html, /A &lt;summary&gt;\./);
  assert.match(html, /<span class="tag-pill">RAG<\/span>/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `Cannot find module '../build/post-list'`

- [ ] **Step 3: Implement `build/post-list.js`**

```js
'use strict';

const { escapeHtml } = require('./markdown');

function renderPostList(posts) {
  return posts.map(post => `
    <a class="post-item" href="/article/${post.slug}/" data-tags="${post.tags.join(',')}">
      <div class="post-item__date">${post.date}</div>
      <div>
        <div class="post-item__title">${escapeHtml(post.title)}</div>
        <div class="post-item__summary">${escapeHtml(post.summary)}</div>
        <div class="post-item__tags">
          ${post.tags.map(tag => `<span class="tag-pill">${escapeHtml(tag)}</span>`).join('')}
        </div>
      </div>
    </a>`).join('\n');
}

module.exports = { renderPostList };
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add build/post-list.js test/post-list.test.js
git commit -m "Add shared post-list partial for Home and Writing pages"
```

---

### Task 8: Home page renderer

**Files:**
- Create: `build/pages/home.js`
- Test: `test/pages/home.test.js`

**Interfaces:**
- Consumes: `renderLayout` (Task 6), `renderPostList` (Task 7), `site-config` (Task 2).
- Produces: `renderHome(posts: Array<Post>) => string` — full HTML page. Shows only the first 5 posts (posts must already be sorted newest-first by the caller).

- [ ] **Step 1: Write the failing test**

```js
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { renderHome } = require('../../build/pages/home');

function makePost(n) {
  return { slug: `post-${n}`, title: `Post ${n}`, date: '2026', tags: [], summary: 's' };
}

test('renders hero copy and only the first 5 posts', () => {
  const posts = [1, 2, 3, 4, 5, 6].map(makePost);
  const html = renderHome(posts);
  assert.match(html, /I build, break, and write about machine learning systems\./);
  assert.match(html, /href="\/article\/post-5\/"/);
  assert.doesNotMatch(html, /href="\/article\/post-6\/"/);
  assert.match(html, /href="\/writing\/">All posts/);
  assert.match(html, /href="\/experiments\/"/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `Cannot find module '../../build/pages/home'`

- [ ] **Step 3: Implement `build/pages/home.js`**

```js
'use strict';

const { renderLayout } = require('../layout');
const { renderPostList } = require('../post-list');
const config = require('../site-config');

function renderHome(posts) {
  const homePosts = posts.slice(0, 5);

  const body = `
<section class="hero">
  <div class="eyebrow">AI Engineer &middot; Learning out loud</div>
  <h1>I build, break, and write about machine learning systems.</h1>
  <p class="tagline">I'm ${config.authorName}. This is my notebook &mdash; experiments I'm running, papers I'm digesting, and the occasional thing that actually worked.</p>
</section>

<section class="section">
  <div class="section-header">
    <h2>Latest writing</h2>
    <a class="section-header__link" href="/writing/">All posts &rarr;</a>
  </div>
  <div class="post-list">
    ${renderPostList(homePosts)}
  </div>
</section>

<section class="section">
  <div class="section-header">
    <h2>Experiments</h2>
    <a class="section-header__link" href="/experiments/">Peek &rarr;</a>
  </div>
  <a class="teaser-card" href="/experiments/">
    <div class="status-row"><span class="status-dot"></span><span class="status-label">// status: cooking</span></div>
    <div class="teaser-card__title">Something interesting is cooking.</div>
    <p class="teaser-card__body">Interactive demos &mdash; attention maps, a tokenizer playground, and a couple of from-scratch builds &mdash; will show up here soon.</p>
  </a>
</section>`;

  return renderLayout({
    title: `${config.siteTitle} | AI Engineer`,
    description: config.siteDescription,
    canonicalPath: '/',
    activeNav: 'home',
    bodyHtml: body
  });
}

module.exports = { renderHome };
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add build/pages/home.js test/pages/home.test.js
git commit -m "Add Home page renderer"
```

---

### Task 9: Writing page renderer

**Files:**
- Create: `build/pages/writing.js`
- Test: `test/pages/writing.test.js`

**Interfaces:**
- Consumes: `renderLayout` (Task 6), `renderPostList` (Task 7).
- Produces: `renderWriting(posts: Array<Post>) => string` — full HTML page with all posts and a tag-filter chip row (`.tag-chip`, `data-tag` attribute, "All" chip active by default, `.post-list` wrapped in `[data-post-list]` for the client JS in Task 15 to target).

- [ ] **Step 1: Write the failing test**

```js
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { renderWriting } = require('../../build/pages/writing');

const posts = [
  { slug: 'a', title: 'A', date: '2026', tags: ['RAG'], summary: 's' },
  { slug: 'b', title: 'B', date: '2026', tags: ['training'], summary: 's' }
];

test('renders all posts and one tag chip per unique tag plus All', () => {
  const html = renderWriting(posts);
  assert.match(html, /href="\/article\/a\/"/);
  assert.match(html, /href="\/article\/b\/"/);
  assert.match(html, /data-post-list/);
  assert.match(html, /class="tag-chip tag-chip--active" data-tag="">All<\/button>/);
  assert.match(html, /data-tag="RAG">RAG<\/button>/);
  assert.match(html, /data-tag="training">training<\/button>/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `Cannot find module '../../build/pages/writing'`

- [ ] **Step 3: Implement `build/pages/writing.js`**

```js
'use strict';

const { renderLayout } = require('../layout');
const { renderPostList } = require('../post-list');
const config = require('../site-config');

function uniqueTags(posts) {
  const tags = [];
  posts.forEach(p => p.tags.forEach(t => { if (!tags.includes(t)) tags.push(t); }));
  return tags;
}

function renderWriting(posts) {
  const tags = uniqueTags(posts);
  const chips = [`<button class="tag-chip tag-chip--active" data-tag="">All</button>`]
    .concat(tags.map(t => `<button class="tag-chip" data-tag="${t}">${t}</button>`))
    .join('\n    ');

  const body = `
<section class="page-header">
  <h1>Writing</h1>
  <p class="tagline">Working notes on the systems I'm building and the papers I'm trying to understand.</p>
</section>

<div class="tag-filter">
    ${chips}
</div>

<section class="section post-list" data-post-list>
  ${renderPostList(posts)}
</section>`;

  return renderLayout({
    title: `Writing | ${config.siteTitle}`,
    description: "Working notes on the systems I'm building and the papers I'm trying to understand.",
    canonicalPath: '/writing/',
    activeNav: 'writing',
    bodyHtml: body
  });
}

module.exports = { renderWriting };
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add build/pages/writing.js test/pages/writing.test.js
git commit -m "Add Writing page renderer with tag chips"
```

---

### Task 10: Article page renderer

**Files:**
- Create: `build/pages/article.js`
- Test: `test/pages/article.test.js`

**Interfaces:**
- Consumes: `renderLayout` (Task 6), `escapeHtml` (Task 3), `site-config` (Task 2).
- Produces: `renderArticle(post: Post) => string` — full HTML page rendering `post.blocks` (paragraph/heading/quote/code) plus a static author bio block. Uses `ogType: 'article'`.

- [ ] **Step 1: Write the failing test**

```js
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { renderArticle } = require('../../build/pages/article');

const post = {
  slug: 'my-post',
  title: 'My Post Title',
  date: 'Jun 2026',
  readTime: '3 min read',
  tags: ['RAG'],
  summary: 'A summary.',
  blocks: [
    { type: 'p', text: 'A paragraph.' },
    { type: 'h2', text: 'A Heading' },
    { type: 'quote', text: 'A quote.' },
    { type: 'code', text: 'a = 1' }
  ]
};

test('renders title, meta, and every block type', () => {
  const html = renderArticle(post);
  assert.match(html, /<h1>My Post Title<\/h1>/);
  assert.match(html, /Jun 2026 &middot; 3 min read/);
  assert.match(html, /<p>A paragraph\.<\/p>/);
  assert.match(html, /<h2>A Heading<\/h2>/);
  assert.match(html, /<blockquote>A quote\.<\/blockquote>/);
  assert.match(html, /<pre><code>a = 1<\/code><\/pre>/);
  assert.match(html, /<meta property="og:type" content="article">/);
  assert.match(html, /class="author-bio"/);
  assert.match(html, /href="\/writing\/"/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `Cannot find module '../../build/pages/article'`

- [ ] **Step 3: Implement `build/pages/article.js`**

```js
'use strict';

const { renderLayout } = require('../layout');
const { escapeHtml } = require('../markdown');
const config = require('../site-config');

function renderBlock(block) {
  if (block.type === 'h2') return `<h2>${escapeHtml(block.text)}</h2>`;
  if (block.type === 'code') return `<pre><code>${escapeHtml(block.text)}</code></pre>`;
  if (block.type === 'quote') return `<blockquote>${escapeHtml(block.text)}</blockquote>`;
  return `<p>${escapeHtml(block.text)}</p>`;
}

function renderArticle(post) {
  const tagsHtml = post.tags.map(t => `<span class="tag-pill">${escapeHtml(t)}</span>`).join('');

  const body = `
<section class="article-header">
  <a class="back-link" href="/writing/">&larr; Writing</a>
  <div class="article-meta">${post.date} &middot; ${post.readTime}</div>
  <h1>${escapeHtml(post.title)}</h1>
  <div class="post-item__tags">${tagsHtml}</div>
</section>
<article class="article-body">
  ${post.blocks.map(renderBlock).join('\n  ')}
  <div class="author-bio">
    <div class="author-avatar"></div>
    <div>
      <div class="author-bio__name">${config.authorName}</div>
      <div class="author-bio__role">${config.authorBio}</div>
    </div>
  </div>
</article>`;

  return renderLayout({
    title: `${post.title} | ${config.siteTitle}`,
    description: post.summary,
    canonicalPath: `/article/${post.slug}/`,
    activeNav: 'article',
    bodyHtml: body,
    ogType: 'article'
  });
}

module.exports = { renderArticle };
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add build/pages/article.js test/pages/article.test.js
git commit -m "Add Article page renderer"
```

---

### Task 11: Experiments, About, and Contact static pages

**Files:**
- Create: `build/pages/static-pages.js`
- Test: `test/pages/static-pages.test.js`

**Interfaces:**
- Consumes: `renderLayout` (Task 6), `site-config` (Task 2).
- Produces: `renderExperiments() => string`, `renderAbout() => string`, `renderContact() => string`.

- [ ] **Step 1: Write the failing test**

```js
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { renderExperiments, renderAbout, renderContact } = require('../../build/pages/static-pages');

test('renderExperiments shows the cooking teaser and a link back to writing', () => {
  const html = renderExperiments();
  assert.match(html, /Something interesting is cooking\./);
  assert.match(html, /href="\/writing\/">In the meantime, read the writing/);
});

test('renderAbout shows the four focus-area cards and the timeline', () => {
  const html = renderAbout();
  assert.match(html, /Inference efficiency/);
  assert.match(html, /Retrieval/);
  assert.match(html, /Interpretability/);
  assert.match(html, /Eval/);
  assert.match(html, /ML Engineer/);
  assert.match(html, /href="\/contact\/">Get in touch/);
});

test('renderContact shows the email card and social links', () => {
  const html = renderContact();
  assert.match(html, /href="mailto:contact@tensorlog\.org"/);
  assert.match(html, /href="https:\/\/github\.com\/chowdhurySudip"/);
  assert.match(html, /href="https:\/\/x\.com\/SudipCh03813050"/);
  assert.match(html, /href="https:\/\/in\.linkedin\.com\/in\/sudip-chowdhury"/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `Cannot find module '../../build/pages/static-pages'`

- [ ] **Step 3: Implement `build/pages/static-pages.js`**

```js
'use strict';

const { renderLayout } = require('../layout');
const config = require('../site-config');

function renderExperiments() {
  const body = `
<section class="page-header">
  <h1>Experiments</h1>
  <p class="tagline">Small interactive things &mdash; charts, visualizations, and the occasional model demo. Built to poke at, not just read.</p>
</section>
<section class="section">
  <div class="experiments-panel">
    <div class="status-row"><span class="status-dot"></span><span class="status-label">// status: cooking</span></div>
    <h2>Something interesting is cooking.</h2>
    <p>I'm building a set of interactive demos to go here &mdash; an attention visualizer, a tokenizer playground, and a couple of from-scratch teaching tools. This section will be updated soon.</p>
    <div class="tag-pill-row">
      <span class="tag-pill">attention heatmap</span>
      <span class="tag-pill">tokenizer playground</span>
      <span class="tag-pill">tiny autograd</span>
      <span class="tag-pill">embedding atlas</span>
    </div>
    <a class="section-header__link" href="/writing/">In the meantime, read the writing &rarr;</a>
  </div>
</section>`;

  return renderLayout({
    title: `Experiments | ${config.siteTitle}`,
    description: 'Small interactive things built to poke at, not just read.',
    canonicalPath: '/experiments/',
    activeNav: 'experiments',
    bodyHtml: body
  });
}

function renderAbout() {
  const cards = [
    ['Inference efficiency', 'Quantization, speculative decoding, getting more out of one GPU.'],
    ['Retrieval', 'Chunking strategies, rerankers, and where RAG quietly breaks.'],
    ['Interpretability', 'Attention maps, probes, and small toy models I can fully inspect.'],
    ['Eval', 'Harnesses I trust more than a single benchmark number.']
  ].map(([title, desc]) => `<div class="about-card"><div class="about-card__title">${title}</div><div class="about-card__desc">${desc}</div></div>`).join('\n      ');

  const timeline = [
    ['2024 &mdash; now', 'ML Engineer', 'Building and shipping LLM-powered systems; obsessing over latency and cost.'],
    ['2022 &mdash; 2024', 'Software Engineer, ML', 'Data pipelines, training infra, and my first taste of "it works on the eval set."'],
    ['earlier', 'Learning in public', 'Reimplementing papers for fun until it turned into a career.']
  ].map(([range, role, desc]) => `<div class="timeline-item"><div class="timeline-item__range">${range}</div><div><div class="timeline-item__role">${role}</div><div class="timeline-item__desc">${desc}</div></div></div>`).join('\n    ');

  const body = `
<section class="page-header">
  <div class="eyebrow">About</div>
  <h1>I learn by building the smallest thing that actually runs.</h1>
</section>
<section class="section about-copy">
  <p>I'm Sudip &mdash; an AI engineer who's happiest taking something I half-understand from a paper and turning it into a tiny reproduction I can poke at. I care less about the leaderboard number and more about knowing exactly <em>why</em> a system behaves the way it does.</p>
  <p>Day to day I work on retrieval, inference efficiency, and interpretability &mdash; chunking strategies and rerankers, quantization and speculative decoding, attention maps and small probes. This site is where I keep the receipts: what I tried, what broke, and what I'd do differently.</p>
</section>
<section class="section">
  <h2 class="section-label">What I'm into right now</h2>
  <div class="about-grid">
    ${cards}
  </div>
</section>
<section class="section">
  <h2 class="section-label">A short timeline</h2>
  <div class="timeline">
    ${timeline}
  </div>
</section>
<section class="section">
  <div class="cta-card">
    <div>
      <div class="cta-card__title">Want to compare notes?</div>
      <div class="cta-card__desc">I like talking to people building in the same space.</div>
    </div>
    <a class="cta-card__button" href="/contact/">Get in touch &rarr;</a>
  </div>
</section>`;

  return renderLayout({
    title: `About | ${config.siteTitle}`,
    description: 'I learn by building the smallest thing that actually runs.',
    canonicalPath: '/about/',
    activeNav: 'about',
    bodyHtml: body
  });
}

function renderContact() {
  const body = `
<section class="page-header contact-header">
  <div class="eyebrow">Contact</div>
  <h1>Say hello.</h1>
  <p>I like comparing notes with people building in the same space. If you're working on inference, retrieval, or interpretability &mdash; or just want to share a paper &mdash; the fastest way to reach me is email.</p>
</section>
<section class="section">
  <a class="contact-card" href="mailto:${config.contactEmail}">
    <span class="contact-card__label"><span class="contact-card__title">Email</span><span class="contact-card__sub">Best for anything substantial.</span></span>
    <span class="contact-card__value">${config.contactEmail} &rarr;</span>
  </a>
  <div class="contact-grid">
    <a class="contact-grid__item" href="${config.github}" target="_blank" rel="noopener"><span>GitHub</span><span>&rarr;</span></a>
    <a class="contact-grid__item" href="${config.twitter}" target="_blank" rel="noopener"><span>X</span><span>&rarr;</span></a>
    <a class="contact-grid__item" href="${config.linkedin}" target="_blank" rel="noopener"><span>LinkedIn</span><span>&rarr;</span></a>
  </div>
</section>
<section class="section">
  <div class="contact-note">Usually reply within a day or two &middot; Based remotely, UTC+5:30</div>
</section>`;

  return renderLayout({
    title: `Contact | ${config.siteTitle}`,
    description: 'Get in touch with Sudip Chowdhury.',
    canonicalPath: '/contact/',
    activeNav: 'contact',
    bodyHtml: body
  });
}

module.exports = { renderExperiments, renderAbout, renderContact };
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add build/pages/static-pages.js test/pages/static-pages.test.js
git commit -m "Add Experiments, About, and Contact page renderers"
```

---

### Task 12: Feeds — sitemap, robots.txt, RSS

**Files:**
- Create: `build/feeds.js`
- Test: `test/feeds.test.js`

**Interfaces:**
- Consumes: `site-config` (Task 2).
- Produces: `generateSitemap(posts: Array<Post>) => string`, `generateRobots() => string`, `generateRss(posts: Array<Post>) => string`.

- [ ] **Step 1: Write the failing test**

```js
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { generateSitemap, generateRobots, generateRss } = require('../build/feeds');

const posts = [
  { slug: 'foo', title: 'Foo & Bar', isoDate: '2026-06-01', summary: 'A summary.' }
];

test('sitemap includes static pages and every post URL', () => {
  const xml = generateSitemap(posts);
  assert.match(xml, /<loc>https:\/\/tensorlog\.org\/<\/loc>/);
  assert.match(xml, /<loc>https:\/\/tensorlog\.org\/writing\/<\/loc>/);
  assert.match(xml, /<loc>https:\/\/tensorlog\.org\/article\/foo\/<\/loc>/);
});

test('robots.txt allows all and points to the sitemap', () => {
  const txt = generateRobots();
  assert.match(txt, /Allow: \//);
  assert.match(txt, /Sitemap: https:\/\/tensorlog\.org\/sitemap\.xml/);
});

test('rss escapes XML entities in titles', () => {
  const xml = generateRss(posts);
  assert.match(xml, /<title>Foo &amp; Bar<\/title>/);
  assert.match(xml, /<link>https:\/\/tensorlog\.org\/article\/foo\/<\/link>/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `Cannot find module '../build/feeds'`

- [ ] **Step 3: Implement `build/feeds.js`**

```js
'use strict';

const config = require('./site-config');

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function generateSitemap(posts) {
  const staticPaths = ['/', '/writing/', '/experiments/', '/about/', '/contact/'];
  const postPaths = posts.map(p => `/article/${p.slug}/`);
  const urls = staticPaths.concat(postPaths)
    .map(p => `  <url><loc>${config.baseUrl}${p}</loc></url>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function generateRobots() {
  return `User-agent: *\nAllow: /\nSitemap: ${config.baseUrl}/sitemap.xml\n`;
}

function generateRss(posts) {
  const items = posts.map(p => `  <item>
    <title>${escapeXml(p.title)}</title>
    <link>${config.baseUrl}/article/${p.slug}/</link>
    <guid>${config.baseUrl}/article/${p.slug}/</guid>
    <description>${escapeXml(p.summary)}</description>
    <pubDate>${new Date(p.isoDate).toUTCString()}</pubDate>
  </item>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>${config.siteTitle}</title>
  <link>${config.baseUrl}</link>
  <description>${config.siteDescription}</description>
${items}
</channel>
</rss>
`;
}

module.exports = { generateSitemap, generateRobots, generateRss };
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add build/feeds.js test/feeds.test.js
git commit -m "Add sitemap, robots.txt, and RSS feed generation"
```

---

### Task 13: 404 page

**Files:**
- Create: `build/not-found.js`
- Test: `test/not-found.test.js`

**Interfaces:**
- Consumes: `renderLayout` (Task 6), `site-config` (Task 2).
- Produces: `renderNotFound() => string`.

- [ ] **Step 1: Write the failing test**

```js
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { renderNotFound } = require('../build/not-found');

test('renders a not-found message with a link home', () => {
  const html = renderNotFound();
  assert.match(html, /Page not found/);
  assert.match(html, /href="\/">Go back home/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `Cannot find module '../build/not-found'`

- [ ] **Step 3: Implement `build/not-found.js`**

```js
'use strict';

const { renderLayout } = require('./layout');
const config = require('./site-config');

function renderNotFound() {
  const body = `
<section class="page-header">
  <h1>Page not found</h1>
  <p class="tagline">That page doesn't exist. <a href="/">Go back home &rarr;</a></p>
</section>`;

  return renderLayout({
    title: `Not found | ${config.siteTitle}`,
    description: 'Page not found.',
    canonicalPath: '/404.html',
    activeNav: null,
    bodyHtml: body
  });
}

module.exports = { renderNotFound };
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add build/not-found.js test/not-found.test.js
git commit -m "Add 404 page renderer"
```

---

### Task 14: Full stylesheet

**Files:**
- Modify: `css/style.css` (full rewrite)

**Interfaces:**
- Produces: every class referenced by Tasks 6–13's templates (`.site-header`, `.nav__link`, `.hero`, `.post-item`, `.tag-chip`, `.article-body`, `.experiments-panel`, `.about-grid`, `.timeline-item`, `.contact-card`, `.site-footer`, etc.) plus a responsive breakpoint at 680px.

- [ ] **Step 1: Replace `css/style.css` entirely**

```css
:root {
  --bg: #ffffff;
  --text: #16161a;
  --text-secondary: #6b6b74;
  --text-muted: #9a9aa3;
  --accent: #5b54f0;
  --border: #ececef;
  --border-alt: #ededf1;
  --chip-bg: #f5f5f7;
  --chip-border: #ededf0;
  --code-bg: #14141a;
  --code-text: #e6e6ee;
  --font-main: 'Geist', -apple-system, sans-serif;
  --font-mono: 'Geist Mono', monospace;
  --max-width: 780px;
}

* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
::selection { background: #ddd9ff; }

body {
  font-family: var(--font-main);
  background: var(--bg);
  color: var(--text);
  -webkit-font-smoothing: antialiased;
}

a { color: inherit; }

@keyframes tl-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: .35; transform: scale(.82); }
}

/* Header */
.site-header {
  position: sticky;
  top: 0;
  z-index: 20;
  background: rgba(255, 255, 255, .82);
  backdrop-filter: saturate(180%) blur(14px);
  border-bottom: 1px solid var(--border);
}
.site-header__inner {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 20px 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.brand {
  font: 600 16px 'Geist', sans-serif;
  letter-spacing: -.015em;
  color: var(--text);
  text-decoration: none;
}
.nav { display: flex; gap: 30px; }
.nav__link {
  font: 500 14px 'Geist', sans-serif;
  letter-spacing: -.005em;
  color: var(--text-muted);
  text-decoration: none;
}
.nav__link--active { color: var(--text); }

/* Main */
.site-main {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 28px;
}

.section { padding: 8px 0 56px; }
.page-header { padding: 84px 0 36px; }
.page-header h1 {
  margin: 0;
  font: 600 42px/1.08 'Geist', sans-serif;
  letter-spacing: -.03em;
}
.page-header .tagline {
  margin: 18px 0 0;
  font: 400 18px/1.6 'Geist', sans-serif;
  color: var(--text-secondary);
  max-width: 540px;
}
.eyebrow {
  font: 500 13px/1 'Geist Mono', monospace;
  letter-spacing: .12em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 22px;
}
.section-label {
  margin: 0 0 18px;
  font: 500 13px 'Geist Mono', monospace;
  letter-spacing: .12em;
  text-transform: uppercase;
  color: var(--text-muted);
}

/* Hero */
.hero { padding: 108px 0 76px; }
.hero h1 {
  margin: 28px 0 0;
  font: 600 54px/1.06 'Geist', sans-serif;
  letter-spacing: -.034em;
  max-width: 680px;
}
.hero .tagline {
  margin: 28px 0 0;
  font: 400 19px/1.62 'Geist', sans-serif;
  color: var(--text-secondary);
  max-width: 560px;
}

/* Section header */
.section-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  border-bottom: 1px solid var(--border);
  padding-bottom: 15px;
  margin-bottom: 4px;
}
.section-header h2 {
  margin: 0;
  font: 500 13px 'Geist Mono', monospace;
  letter-spacing: .12em;
  text-transform: uppercase;
  color: var(--text-muted);
}
.section-header__link {
  font: 500 14px 'Geist', sans-serif;
  color: var(--accent);
  text-decoration: none;
}

/* Post list */
.post-item {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 30px;
  padding: 26px 0;
  border-bottom: 1px solid var(--border);
  text-decoration: none;
  color: inherit;
}
.post-item__date {
  font: 500 13px 'Geist Mono', monospace;
  color: var(--text-muted);
  padding-top: 5px;
}
.post-item__title {
  font: 600 22px/1.3 'Geist', sans-serif;
  color: var(--text);
  letter-spacing: -.012em;
}
.post-item__summary {
  font: 400 15.5px/1.55 'Geist', sans-serif;
  color: var(--text-secondary);
  margin-top: 7px;
}
.post-item__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 13px;
}
.tag-pill {
  font: 500 11.5px 'Geist Mono', monospace;
  color: var(--text-secondary);
  background: var(--chip-bg);
  border: 1px solid var(--chip-border);
  border-radius: 6px;
  padding: 3px 9px;
  letter-spacing: .01em;
}

/* Teaser card (home experiments) */
.teaser-card {
  position: relative;
  overflow: hidden;
  display: block;
  border: 1px solid var(--border-alt);
  border-radius: 16px;
  padding: 40px 36px;
  text-decoration: none;
  color: inherit;
  background: radial-gradient(120% 140% at 88% -10%, #f1f0fe 0%, rgba(241, 240, 254, 0) 55%), #fff;
}
.status-row { display: flex; align-items: center; gap: 10px; margin-bottom: 18px; }
.status-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: var(--accent);
  display: inline-block;
  animation: tl-pulse 1.6s ease-in-out infinite;
}
.status-label {
  font: 500 12px 'Geist Mono', monospace;
  letter-spacing: .12em;
  text-transform: uppercase;
  color: var(--accent);
}
.teaser-card__title {
  font: 600 27px/1.2 'Geist', sans-serif;
  letter-spacing: -.02em;
  max-width: 520px;
}
.teaser-card__body {
  margin: 12px 0 0;
  font: 400 16px/1.6 'Geist', sans-serif;
  color: var(--text-secondary);
  max-width: 480px;
}

/* Tag filter (writing page) */
.tag-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border);
}
.tag-chip {
  font: 500 12.5px 'Geist Mono', monospace;
  cursor: pointer;
  border-radius: 7px;
  padding: 6px 12px;
  letter-spacing: .01em;
  border: 1px solid #e6e6ea;
  color: var(--text-secondary);
  background: #fff;
}
.tag-chip--active {
  border-color: var(--accent);
  color: #fff;
  background: var(--accent);
}

/* Article page */
.article-header { padding: 64px 0 0; }
.back-link {
  font: 500 13px 'Geist Mono', monospace;
  color: var(--text-muted);
  text-decoration: none;
  letter-spacing: .02em;
}
.article-meta {
  font: 500 13px 'Geist Mono', monospace;
  color: var(--accent);
  margin-top: 34px;
  letter-spacing: .04em;
}
.article-header h1 {
  margin: 16px 0 0;
  font: 600 40px/1.12 'Geist', sans-serif;
  letter-spacing: -.03em;
  max-width: 640px;
}
.article-header .post-item__tags { margin-top: 20px; }

.article-body {
  padding: 40px 0 88px;
  max-width: 660px;
}
.article-body p {
  margin: 0 0 24px;
  font: 400 18px/1.72 'Geist', sans-serif;
  color: #2c2c33;
}
.article-body h2 {
  margin: 44px 0 18px;
  font: 600 25px/1.25 'Geist', sans-serif;
  letter-spacing: -.02em;
  color: var(--text);
}
.article-body pre {
  margin: 0 0 28px;
  padding: 20px 22px;
  background: var(--code-bg);
  border-radius: 12px;
  overflow: auto;
  font: 500 13.5px/1.7 'Geist Mono', monospace;
  color: var(--code-text);
}
.article-body blockquote {
  margin: 0 0 28px;
  padding: 4px 0 4px 22px;
  border-left: 2px solid var(--accent);
  font: 500 19px/1.6 'Geist', sans-serif;
  color: var(--text);
}
.author-bio {
  margin-top: 48px;
  padding-top: 28px;
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 14px;
}
.author-avatar {
  width: 44px; height: 44px; border-radius: 50%; flex: none;
  background: linear-gradient(135deg, #5b54f0, #8b7bff);
}
.author-bio__name { font: 600 15px 'Geist', sans-serif; color: var(--text); }
.author-bio__role { font: 400 13.5px 'Geist', sans-serif; color: var(--text-muted); }

/* Experiments page */
.experiments-panel {
  position: relative;
  overflow: hidden;
  border: 1px solid var(--border-alt);
  border-radius: 18px;
  padding: 72px 48px;
  text-align: center;
  background: radial-gradient(120% 120% at 50% -20%, #f1f0fe 0%, rgba(241, 240, 254, 0) 60%), #fff;
}
.experiments-panel h2 {
  margin: 0 auto;
  font: 600 34px/1.16 'Geist', sans-serif;
  letter-spacing: -.025em;
  max-width: 460px;
}
.experiments-panel p {
  margin: 18px auto 0;
  font: 400 17px/1.62 'Geist', sans-serif;
  color: var(--text-secondary);
  max-width: 440px;
}
.tag-pill-row {
  margin-top: 30px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}
.experiments-panel .section-header__link {
  display: inline-block;
  margin-top: 34px;
}

/* About page */
.about-copy p {
  margin: 0 0 22px;
  font: 400 18px/1.72 'Geist', sans-serif;
  color: #2c2c33;
  max-width: 640px;
}
.about-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
.about-card {
  border: 1px solid var(--border-alt);
  border-radius: 12px;
  padding: 20px;
}
.about-card__title { font: 600 16px 'Geist', sans-serif; color: var(--text); }
.about-card__desc {
  font: 400 14.5px/1.55 'Geist', sans-serif;
  color: var(--text-secondary);
  margin-top: 6px;
}

.timeline-item {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 30px;
  padding: 22px 0;
  border-bottom: 1px solid var(--border);
}
.timeline-item__range {
  font: 500 13px 'Geist Mono', monospace;
  color: var(--text-muted);
  padding-top: 3px;
}
.timeline-item__role { font: 600 17px 'Geist', sans-serif; color: var(--text); }
.timeline-item__desc {
  font: 400 15px/1.55 'Geist', sans-serif;
  color: var(--text-secondary);
  margin-top: 5px;
}

.cta-card {
  border: 1px solid var(--border-alt);
  border-radius: 14px;
  padding: 26px 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}
.cta-card__title { font: 600 18px 'Geist', sans-serif; color: var(--text); letter-spacing: -.01em; }
.cta-card__desc { font: 400 15px/1.55 'Geist', sans-serif; color: var(--text-secondary); margin-top: 5px; }
.cta-card__button {
  font: 500 15px 'Geist', sans-serif;
  color: #fff;
  background: var(--accent);
  padding: 12px 22px;
  border-radius: 10px;
  text-decoration: none;
  white-space: nowrap;
}

/* Contact page */
.contact-header { max-width: 560px; }
.contact-header p {
  margin: 24px 0 0;
  font: 400 18px/1.7 'Geist', sans-serif;
  color: #2c2c33;
}
.contact-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 22px;
  border: 1px solid var(--border-alt);
  border-radius: 14px;
  text-decoration: none;
  color: inherit;
  margin-bottom: 12px;
}
.contact-card__label { display: flex; flex-direction: column; gap: 3px; }
.contact-card__title { font: 600 17px 'Geist', sans-serif; color: var(--text); }
.contact-card__sub { font: 400 14px 'Geist', sans-serif; color: var(--text-muted); }
.contact-card__value { font: 500 14px 'Geist Mono', monospace; color: var(--accent); }
.contact-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.contact-grid__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  border: 1px solid var(--border-alt);
  border-radius: 14px;
  text-decoration: none;
  color: inherit;
  font: 600 16px 'Geist', sans-serif;
}
.contact-grid__item span:last-child { font: 500 13.5px 'Geist Mono', monospace; color: var(--accent); }
.contact-note {
  font: 400 14px/1.6 'Geist Mono', monospace;
  color: var(--text-muted);
  letter-spacing: .02em;
}

/* Footer */
.site-footer { border-top: 1px solid var(--border); }
.site-footer__inner {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 30px 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font: 500 13px 'Geist Mono', monospace;
  color: var(--text-muted);
  letter-spacing: .03em;
}
.footer-links { display: flex; gap: 24px; }
.footer-links a { color: var(--text-muted); text-decoration: none; }

/* Responsive */
@media (max-width: 680px) {
  .hero { padding: 84px 0 56px; }
  .hero h1 { font-size: 36px; }
  .page-header h1 { font-size: 32px; }
  .post-item { grid-template-columns: 1fr; gap: 6px; }
  .post-item__date { padding-top: 0; }
  .timeline-item { grid-template-columns: 1fr; gap: 6px; }
  .timeline-item__range { padding-top: 0; }
  .about-grid { grid-template-columns: 1fr; }
  .contact-grid { grid-template-columns: 1fr; }
  .nav { gap: 18px; }
  .site-header__inner, .site-main, .site-footer__inner { padding-left: 20px; padding-right: 20px; }
  .cta-card { flex-direction: column; align-items: flex-start; }
}
```

- [ ] **Step 2: Commit**

```bash
git add css/style.css
git commit -m "Rewrite stylesheet to match the tensorlog.dc.html design"
```

(No automated test for this file — it's pure visual styling, verified manually in Task 18.)

---

### Task 15: Tag-filter client JS

**Files:**
- Create: `js/tag-filter.js`

**Interfaces:**
- Consumes (at runtime, in the browser): DOM produced by `renderWriting` (Task 9) — `[data-post-list]`, `.tag-chip[data-tag]`, `.post-item[data-tags]`.

- [ ] **Step 1: Create `js/tag-filter.js`**

```js
document.addEventListener('DOMContentLoaded', () => {
  const list = document.querySelector('[data-post-list]');
  const chips = document.querySelectorAll('.tag-chip');
  if (!list || !chips.length) return;

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const tag = chip.dataset.tag;
      chips.forEach(c => c.classList.remove('tag-chip--active'));
      chip.classList.add('tag-chip--active');

      list.querySelectorAll('.post-item').forEach(item => {
        const tags = (item.dataset.tags || '').split(',');
        item.style.display = (!tag || tags.includes(tag)) ? '' : 'none';
      });
    });
  });
});
```

- [ ] **Step 2: Commit**

```bash
git add js/tag-filter.js
git commit -m "Add progressive-enhancement tag filter for the Writing page"
```

(No automated test — this is DOM interaction with no test-runner-accessible browser environment in this project. Verified manually in Task 18.)

---

### Task 16: Seed content — port the six launch posts

**Files:**
- Create: `content/posts/rag-late-chunking.md`
- Create: `content/posts/small-lm-4090.md`
- Create: `content/posts/spec-decoding-flipbook.md`
- Create: `content/posts/mamba2-distilled.md`
- Create: `content/posts/death-of-prompt.md`
- Create: `content/posts/eval-harness.md`

**Interfaces:**
- Produces: six files matching the frontmatter/body contract consumed by `loadPosts` (Task 5): `title`, `date` (ISO), `tags` (array), `summary`, plain-text body.

- [ ] **Step 1: Create `content/posts/rag-late-chunking.md`**

````markdown
---
title: Why I rebuilt my RAG pipeline around late chunking
date: 2026-06-01
tags: [RAG, retrieval, embeddings]
summary: Embedding the whole document before splitting fixed more retrieval bugs than any reranker I'd tried.
---
For about a year my retrieval setup was the textbook one: split documents into chunks, embed each chunk on its own, store the vectors, retrieve top-k. It worked, mostly. But a specific class of failure kept showing up — questions whose answer was obvious to a human reading the page, yet whose chunk scored badly because the chunk in isolation lost the thread.

The fix that finally stuck was almost embarrassingly simple: embed the full document first, then pool the per-chunk vectors out of that shared context. The chunks stop being amnesiac.

## What late chunking actually does

Instead of cutting first and embedding the pieces, you run the encoder over the whole document so every token attends to everything around it. Only then do you slice the token embeddings into chunk-sized spans and pool them.

```
emb = model.encode(doc)            # encode the WHOLE doc first
spans = splitter.spans(doc)        # then decide on boundaries
chunk_vecs = [pool(emb, s) for s in spans]
```

A pronoun three sentences away, a heading two paragraphs up — those now leak into the chunk vector the way they should. Retrieval recall on my eval set jumped more from this one change than from swapping in a heavier reranker.

> The chunk boundary stopped being a wall the model couldn't see past.

It isn't free — you pay for encoding the full document, and very long docs still need a windowing strategy. But for the 2–20 page PDFs that make up most of my corpus, late chunking is now the default.
````

- [ ] **Step 2: Create `content/posts/small-lm-4090.md`**

````markdown
---
title: Training a small language model on a single 4090
date: 2026-05-01
tags: [training, GPUs, LLMs]
summary: What a 24GB card can and can't do, and the dumb tricks that bought me another billion tokens.
---
I wanted to know, end to end, what it takes to train a language model when you have exactly one consumer GPU and no cluster to hide behind. The answer is: more than you'd hope, less than you'd fear.

## Where the 24GB actually goes

Parameters are the small part. Optimizer state, activations, and the KV cache during eval eat the rest fast. Mixed precision plus gradient checkpointing is the difference between a model that fits and an out-of-memory error at step 3.

```
model = compile(model)
scaler = GradScaler()
# checkpoint the transformer blocks, not the embeddings
for blk in model.blocks: blk.use_checkpoint = True
```

After that it's mostly patience and a good data pipeline. The training loop is the easy 20%; keeping the GPU fed at 95% utilization is the other 80%.
````

- [ ] **Step 3: Create `content/posts/spec-decoding-flipbook.md`**

```markdown
---
title: Speculative decoding, explained with a flipbook
date: 2026-04-01
tags: [inference, latency]
summary: A visual walk through draft-and-verify, and why it's basically free latency.
---
Speculative decoding feels like cheating the first time you see it work: a small draft model proposes several tokens, the big model checks them all in one forward pass, and you keep the longest prefix that agrees.

## Why it wins

The expensive model runs the same number of forward passes whether it generates one token or verifies five. If the draft is right most of the time, you get those extra tokens almost for free.

The catch is the draft has to be good enough that its proposals usually survive verification — otherwise you're paying for the draft and getting nothing back.
```

- [ ] **Step 4: Create `content/posts/mamba2-distilled.md`**

```markdown
---
title: 'Reading group: the Mamba-2 paper, distilled'
date: 2026-03-01
tags: [SSMs, papers]
summary: State-space models without the linear-algebra cold sweat.
---
Our reading group spent two sessions on Mamba-2, and the thing that finally made it click was reframing the whole structured-state-space machinery as a particular kind of linear attention.

## The one idea to keep

You can write the core update as a matrix that's cheap to apply but expressive enough to carry information across long sequences. Once you see that duality, the rest of the paper is engineering around it.
```

- [ ] **Step 5: Create `content/posts/death-of-prompt.md`**

```markdown
---
title: The quiet death of the prompt, and what replaces it
date: 2026-02-01
tags: [prompting, agents]
summary: Why the interesting work is moving from wording to structure.
---
Two years ago a clever prompt could carry a whole product. That era is closing. Models follow instructions well enough now that the leverage has moved to what surrounds the prompt: tools, memory, retrieval, and control flow.

## From wording to wiring

The teams shipping reliable systems aren't winning on phrasing. They're winning on the scaffolding — what the model can see, what it can call, and what happens when it's wrong.
```

- [ ] **Step 6: Create `content/posts/eval-harness.md`**

```markdown
---
title: Building an eval harness I actually trust
date: 2026-01-01
tags: [evals, tooling]
summary: One benchmark number is a vibe. A harness is an argument.
---
Every time I shipped a change based on a single eval number, I eventually regretted it. So I rebuilt my evaluation as something closer to a test suite: many small, legible checks instead of one aggregate score.

## Legible beats impressive

When a number moves, I want to know exactly which examples moved it. A harness that can answer that is worth ten leaderboard points you can't explain.
```

- [ ] **Step 7: Commit**

```bash
git add content/posts
git commit -m "Add six launch posts"
```

---

### Task 17: Build orchestrator

**Files:**
- Create: `build.js`
- Test: `test/build.test.js`

**Interfaces:**
- Consumes: `loadPosts` (Task 5), `renderHome`/`renderWriting`/`renderArticle` (Tasks 8–10), `renderExperiments`/`renderAbout`/`renderContact` (Task 11), `renderNotFound` (Task 13), `generateSitemap`/`generateRobots`/`generateRss` (Task 12).
- Produces: `dist/` populated with `index.html`, `writing/index.html`, `experiments/index.html`, `about/index.html`, `contact/index.html`, `404.html`, `article/<slug>/index.html` per post, `sitemap.xml`, `robots.txt`, `feed.xml`, plus copied `css/` and `js/`. Also exports `build()` for the integration test.

- [ ] **Step 1: Write the failing integration test**

```js
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { build } = require('../build');

const DIST = path.join(__dirname, '..', 'dist');

test('build produces every expected file', () => {
  build();

  assert.ok(fs.existsSync(path.join(DIST, 'index.html')));
  assert.ok(fs.existsSync(path.join(DIST, 'writing', 'index.html')));
  assert.ok(fs.existsSync(path.join(DIST, 'experiments', 'index.html')));
  assert.ok(fs.existsSync(path.join(DIST, 'about', 'index.html')));
  assert.ok(fs.existsSync(path.join(DIST, 'contact', 'index.html')));
  assert.ok(fs.existsSync(path.join(DIST, '404.html')));
  assert.ok(fs.existsSync(path.join(DIST, 'article', 'rag-late-chunking', 'index.html')));
  assert.ok(fs.existsSync(path.join(DIST, 'sitemap.xml')));
  assert.ok(fs.existsSync(path.join(DIST, 'robots.txt')));
  assert.ok(fs.existsSync(path.join(DIST, 'feed.xml')));
  assert.ok(fs.existsSync(path.join(DIST, 'css', 'style.css')));
  assert.ok(fs.existsSync(path.join(DIST, 'js', 'tag-filter.js')));
});

test('home page only lists 5 of the 6 posts', () => {
  const html = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
  const matches = html.match(/class="post-item"/g) || [];
  assert.equal(matches.length, 5);
});

test('writing page lists all 6 posts', () => {
  const html = fs.readFileSync(path.join(DIST, 'writing', 'index.html'), 'utf8');
  const matches = html.match(/class="post-item"/g) || [];
  assert.equal(matches.length, 6);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `Cannot find module '../build'`

- [ ] **Step 3: Implement `build.js`**

```js
'use strict';

const fs = require('fs');
const path = require('path');
const { loadPosts } = require('./build/posts');
const { renderHome } = require('./build/pages/home');
const { renderWriting } = require('./build/pages/writing');
const { renderArticle } = require('./build/pages/article');
const { renderExperiments, renderAbout, renderContact } = require('./build/pages/static-pages');
const { renderNotFound } = require('./build/not-found');
const { generateSitemap, generateRobots, generateRss } = require('./build/feeds');

const ROOT = __dirname;
const CONTENT_DIR = path.join(ROOT, 'content', 'posts');
const DIST_DIR = path.join(ROOT, 'dist');

function writeFile(relPath, contents) {
  const fullPath = path.join(DIST_DIR, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, contents);
}

function copyDir(src, destRel) {
  if (!fs.existsSync(src)) return;
  const dest = path.join(DIST_DIR, destRel);
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src)) {
    fs.copyFileSync(path.join(src, entry), path.join(dest, entry));
  }
}

function build() {
  fs.rmSync(DIST_DIR, { recursive: true, force: true });
  const posts = loadPosts(CONTENT_DIR);

  writeFile('index.html', renderHome(posts));
  writeFile('writing/index.html', renderWriting(posts));
  writeFile('experiments/index.html', renderExperiments());
  writeFile('about/index.html', renderAbout());
  writeFile('contact/index.html', renderContact());
  writeFile('404.html', renderNotFound());

  posts.forEach(post => {
    writeFile(`article/${post.slug}/index.html`, renderArticle(post));
  });

  writeFile('sitemap.xml', generateSitemap(posts));
  writeFile('robots.txt', generateRobots());
  writeFile('feed.xml', generateRss(posts));

  copyDir(path.join(ROOT, 'css'), 'css');
  copyDir(path.join(ROOT, 'js'), 'js');

  console.log(`Built ${posts.length} posts + 6 pages to ${DIST_DIR}`);
}

if (require.main === module) {
  build();
}

module.exports = { build };
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: All tests pass (build runs against the real `content/posts/` created in Task 16 and the real `css/`/`js/` from Tasks 14–15).

- [ ] **Step 5: Commit**

```bash
git add build.js test/build.test.js
git commit -m "Add build orchestrator wiring posts, pages, and feeds into dist/"
```

---

### Task 18: Deployment docs and manual browser verification

**Files:**
- Modify: `README.md`

**Interfaces:**
- None (documentation + manual verification only).

- [ ] **Step 1: Document the build and deploy process in `README.md`**

`````markdown
# tensorlog-org

Source for tensorlog.org — a statically generated blog/portfolio.

## Development

```bash
npm install
npm run build   # writes the site to dist/
npm test        # runs the build's unit + integration tests
```

To preview locally after building:

```bash
npx serve dist
```

## Publishing a post

Add a new file to `content/posts/<slug>.md`:

```markdown
---
title: Your title
date: 2026-07-05
tags: [tag-one, tag-two]
summary: One-sentence summary shown in post lists and link previews.
---
Your post body. Blank line = new paragraph, "## " = heading,
"> " = pull quote, and ``` fenced blocks = code.
```

The filename becomes the URL slug (`/article/<slug>/`). Read time is computed automatically — do not add a "read" field.

## Deployment (Cloudflare Pages)

1. Connect this GitHub repo to a new Cloudflare Pages project.
2. Build command: `npm run build`
3. Build output directory: `dist`
4. Root directory: `/`
5. Push to `main` — Cloudflare Pages builds and deploys automatically.
`````

- [ ] **Step 2: Run the full test suite one more time**

Run: `npm test`
Expected: All tests pass.

- [ ] **Step 3: Build and start a local preview server**

```bash
npm run build
npx serve dist
```

Expected: server starts and prints a local URL (e.g. `http://localhost:3000`).

- [ ] **Step 4: Manually verify in Chrome**

Open the printed local URL and check:
- `/` shows the hero, 5 latest posts, and the experiments teaser.
- `/writing/` shows all 6 posts; clicking a tag chip filters the list; clicking "All" restores it.
- Clicking a post opens `/article/<slug>/` with the rendered body (paragraphs, a heading, a quote, and — on the RAG and 4090 posts — a code block), plus the author bio at the bottom.
- `/experiments/`, `/about/`, and `/contact/` render their static content; the Contact page's mailto and social links have the correct hrefs.
- The nav highlights the current section, and "Writing" stays highlighted while viewing an article.
- Visiting an unknown path (e.g. `/nonexistent/`) — if using `npx serve`, pass `-s` or check `dist/404.html` directly — shows the 404 page with a working link home.
- Resize the browser below ~680px width and confirm the layout stacks to single columns without overlapping text.

- [ ] **Step 5: Commit**

```bash
git add README.md
git commit -m "Document build, publishing, and Cloudflare Pages deployment"
```
