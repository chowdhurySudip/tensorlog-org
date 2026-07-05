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
