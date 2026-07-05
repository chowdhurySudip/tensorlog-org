'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { renderPostList } = require('../build/post-list');

const posts = [
  { slug: 'foo', title: 'Foo & Bar', date: 'Jun 2026', tags: ['RAG', 'retrieval'], summary: 'A <summary>.' },
  { slug: 'cpp', title: 'C++ Guide', date: 'Jul 2026', tags: ['C++ & Friends', 'code"injection'], summary: 'Advanced guide.' }
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

test('escapes special characters in tags for both data-tags attribute and tag pills', () => {
  const html = renderPostList(posts.slice(1));
  assert.match(html, /data-tags="C\+\+ &amp; Friends,code&quot;injection"/);
  assert.match(html, /<span class="tag-pill">C\+\+ &amp; Friends<\/span>/);
  assert.match(html, /<span class="tag-pill">code&quot;injection<\/span>/);
});

test('renders a witty empty state card when there are no posts', () => {
  const html = renderPostList([]);
  assert.match(html, /class="teaser-card post-empty"/);
  assert.match(html, /Nothing published yet\./);
  assert.match(html, /href="\/experiments\/"/);
  assert.doesNotMatch(html, /class="post-item"/);
});
