'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { loadPosts } = require('../build/posts');

const FIXTURES_DIR = path.join(__dirname, 'fixtures', 'posts');

test('loads posts sorted newest-first', () => {
  const posts = loadPosts(FIXTURES_DIR);
  assert.equal(posts.length, 2);
  assert.equal(posts[0].slug, 'newer-post');
  assert.equal(posts[1].slug, 'older-post');
});

test('parses frontmatter fields and formats the date', () => {
  const posts = loadPosts(FIXTURES_DIR);
  const older = posts.find(p => p.slug === 'older-post');
  assert.equal(older.title, 'Older Post');
  assert.equal(older.isoDate, '2026-01-01');
  assert.equal(older.date, 'Jan 2026');
  assert.deepEqual(older.tags, ['alpha']);
  assert.equal(older.summary, 'The older one.');
});

test('computes read time and parses body into blocks', () => {
  const posts = loadPosts(FIXTURES_DIR);
  const newer = posts.find(p => p.slug === 'newer-post');
  assert.equal(newer.readTime, '1 min read');
  assert.deepEqual(newer.blocks, [
    { type: 'h2', text: 'A heading' },
    { type: 'p', text: 'Body text for the newer post.' }
  ]);
});

test('returns an empty list when the posts directory does not exist', () => {
  const posts = loadPosts(path.join(__dirname, 'fixtures', 'does-not-exist'));
  assert.deepEqual(posts, []);
});
