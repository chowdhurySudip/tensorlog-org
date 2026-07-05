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
