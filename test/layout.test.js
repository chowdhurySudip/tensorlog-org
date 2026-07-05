'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { renderLayout } = require('../build/layout');

test('renders title, description, and canonical URL', () => {
  const html = renderLayout({
    title: 'Test Page',
    description: 'A test description.',
    canonicalPath: '/test/',
    activeNav: null,
    bodyHtml: '<p>hi</p>'
  });
  assert.match(html, /<title>Test Page<\/title>/);
  assert.match(html, /<meta name="description" content="A test description\.">/);
  assert.match(html, /<link rel="canonical" href="https:\/\/tensorlog\.org\/test\/">/);
  assert.match(html, /<p>hi<\/p>/);
});

test('marks the matching nav link active', () => {
  const html = renderLayout({
    title: 'Writing', description: 'd', canonicalPath: '/writing/', activeNav: 'writing', bodyHtml: ''
  });
  assert.match(html, /class="nav__link nav__link--active" href="\/writing\/"/);
});

test('article activeNav highlights the Writing nav link', () => {
  const html = renderLayout({
    title: 'A Post', description: 'd', canonicalPath: '/article/foo/', activeNav: 'article', bodyHtml: ''
  });
  assert.match(html, /class="nav__link nav__link--active" href="\/writing\/"/);
});

test('defaults og:type to website, allows override', () => {
  const html = renderLayout({
    title: 't', description: 'd', canonicalPath: '/', activeNav: null, bodyHtml: '', ogType: 'article'
  });
  assert.match(html, /<meta property="og:type" content="article">/);
});
