'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { computeReadTime } = require('../build/read-time');

test('very short text rounds up to 1 min read', () => {
  assert.equal(computeReadTime('just a few words here'), '1 min read');
});

test('computes minutes from word count at 200 wpm', () => {
  const words = new Array(400).fill('word').join(' ');
  assert.equal(computeReadTime(words), '2 min read');
});

test('rounds to nearest minute', () => {
  const words = new Array(1000).fill('word').join(' ');
  assert.equal(computeReadTime(words), '5 min read');
});
