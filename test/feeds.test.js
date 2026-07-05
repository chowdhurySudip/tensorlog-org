'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { generateSitemap, generateRobots, generateRss } = require('../build/feeds');

const posts = [
  { slug: 'foo', title: 'Foo & Bar', isoDate: '2026-06-01', summary: 'A summary.' }
];

test('sitemap includes static pages and every post URL', () => {
  const xml = generateSitemap(posts);
  assert.match(xml, /<loc>https:\/\/tensorlog\.org\/<\/loc>/);
  assert.match(xml, /<loc>https:\/\/tensorlog\.org\/writing\/<\/loc>/);
  assert.match(xml, /<loc>https:\/\/tensorlog\.org\/article\/foo\/<\/loc>/);
});

test('robots.txt allows all and points to the sitemap', () => {
  const txt = generateRobots();
  assert.match(txt, /Allow: \//);
  assert.match(txt, /Sitemap: https:\/\/tensorlog\.org\/sitemap\.xml/);
});

test('rss escapes XML entities in titles', () => {
  const xml = generateRss(posts);
  assert.match(xml, /<title>Foo &amp; Bar<\/title>/);
  assert.match(xml, /<link>https:\/\/tensorlog\.org\/article\/foo\/<\/link>/);
});
