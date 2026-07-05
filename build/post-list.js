'use strict';

const { escapeHtml } = require('./markdown');

function renderPostList(posts) {
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
