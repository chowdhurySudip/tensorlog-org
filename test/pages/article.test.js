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

test('escapes HTML metacharacters in title, tags, and all block types', () => {
  const postWithMetachars = {
    slug: 'xss-test',
    title: '<script>alert("xss")</script>',
    date: 'Jul 2026',
    readTime: '2 min read',
    tags: ['<tag>', 'a&b', 'c"d'],
    summary: 'A summary.',
    blocks: [
      { type: 'p', text: 'Paragraph with <angle> & brackets' },
      { type: 'h2', text: 'Heading with "quotes" & ampers&and' },
      { type: 'quote', text: 'Quote <b>with html</b> & symbols' },
      { type: 'code', text: 'if (a < b && c > d) { }' }
    ]
  };

  const html = renderArticle(postWithMetachars);

  // Title escaping in h1
  assert.match(html, /<h1>&lt;script&gt;alert\(&quot;xss&quot;\)&lt;\/script&gt;<\/h1>/);

  // Tag escaping in tag pills
  assert.match(html, /<span class="tag-pill">&lt;tag&gt;<\/span>/);
  assert.match(html, /<span class="tag-pill">a&amp;b<\/span>/);
  assert.match(html, /<span class="tag-pill">c&quot;d<\/span>/);

  // Block content escaping
  assert.match(html, /<p>Paragraph with &lt;angle&gt; &amp; brackets<\/p>/);
  assert.match(html, /<h2>Heading with &quot;quotes&quot; &amp; ampers&amp;and<\/h2>/);
  assert.match(html, /<blockquote>Quote &lt;b&gt;with html&lt;\/b&gt; &amp; symbols<\/blockquote>/);
  assert.match(html, /<pre><code>if \(a &lt; b &amp;&amp; c &gt; d\) \{ \}<\/code><\/pre>/);
});
