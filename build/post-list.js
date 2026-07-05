'use strict';

const { escapeHtml } = require('./markdown');

function renderPostList(posts) {
  if (posts.length === 0) {
    return `
    <div class="teaser-card post-empty">
      <div class="status-row"><span class="status-dot"></span><span class="status-label">// status: empty</span></div>
      <div class="teaser-card__title">Nothing published yet.</div>
      <p class="teaser-card__body">The drafts are still arguing with each other. Check back soon.</p>
      <a class="post-empty__link" href="/experiments/">See what's cooking in Experiments &rarr;</a>
    </div>`;
  }
  return posts.map(post => `
    <a class="post-item" href="/article/${post.slug}/" data-tags="${post.tags.map(escapeHtml).join(',')}">
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
