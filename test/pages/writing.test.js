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

test('escapes special characters in tag chips for both data-tag attribute and visible text', () => {
  const postsWithSpecialChars = [
    { slug: 'p1', title: 'Post 1', date: '2026', tags: ['C++ & Systems', 'data"injection'], summary: 'Test' }
  ];
  const html = renderWriting(postsWithSpecialChars);
  assert.match(html, /data-tag="C\+\+ &amp; Systems">C\+\+ &amp; Systems<\/button>/);
  assert.match(html, /data-tag="data&quot;injection">data&quot;injection<\/button>/);
});
