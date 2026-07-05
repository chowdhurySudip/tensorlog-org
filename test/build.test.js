'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { build } = require('../build');

const DIST = path.join(__dirname, '..', 'dist');

test('build produces every expected file', () => {
  build();

  assert.ok(fs.existsSync(path.join(DIST, 'index.html')));
  assert.ok(fs.existsSync(path.join(DIST, 'writing', 'index.html')));
  assert.ok(fs.existsSync(path.join(DIST, 'experiments', 'index.html')));
  assert.ok(fs.existsSync(path.join(DIST, 'about', 'index.html')));
  assert.ok(fs.existsSync(path.join(DIST, 'contact', 'index.html')));
  assert.ok(fs.existsSync(path.join(DIST, '404.html')));
  assert.ok(fs.existsSync(path.join(DIST, 'article', 'rag-late-chunking', 'index.html')));
  assert.ok(fs.existsSync(path.join(DIST, 'sitemap.xml')));
  assert.ok(fs.existsSync(path.join(DIST, 'robots.txt')));
  assert.ok(fs.existsSync(path.join(DIST, 'feed.xml')));
  assert.ok(fs.existsSync(path.join(DIST, 'css', 'style.css')));
  assert.ok(fs.existsSync(path.join(DIST, 'js', 'tag-filter.js')));
});

test('home page only lists 5 of the 6 posts', () => {
  const html = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
  const matches = html.match(/class="post-item"/g) || [];
  assert.equal(matches.length, 5);
});

test('writing page lists all 6 posts', () => {
  const html = fs.readFileSync(path.join(DIST, 'writing', 'index.html'), 'utf8');
  const matches = html.match(/class="post-item"/g) || [];
  assert.equal(matches.length, 6);
});
