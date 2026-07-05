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
