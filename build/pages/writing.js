'use strict';

const { renderLayout } = require('../layout');
const { renderPostList } = require('../post-list');
const { escapeHtml } = require('../markdown');
const config = require('../site-config');

function uniqueTags(posts) {
  const tags = [];
  posts.forEach(p => p.tags.forEach(t => { if (!tags.includes(t)) tags.push(t); }));
  return tags;
}

function renderWriting(posts) {
  const tags = uniqueTags(posts);
  const chips = [`<button class="tag-chip tag-chip--active" data-tag="">All</button>`]
    .concat(tags.map(t => `<button class="tag-chip" data-tag="${escapeHtml(t)}">${escapeHtml(t)}</button>`))
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
