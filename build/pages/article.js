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
