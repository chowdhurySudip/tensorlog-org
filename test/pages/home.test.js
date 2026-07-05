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
