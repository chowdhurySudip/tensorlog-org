'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { parseBody, escapeHtml } = require('../build/markdown');

test('merges consecutive lines into one paragraph', () => {
  const blocks = parseBody('line one\nline two\n\nsecond paragraph');
  assert.deepEqual(blocks, [
    { type: 'p', text: 'line one line two' },
    { type: 'p', text: 'second paragraph' }
  ]);
});

test('parses a heading line', () => {
  const blocks = parseBody('## A Heading\n\nBody text.');
  assert.deepEqual(blocks, [
    { type: 'h2', text: 'A Heading' },
    { type: 'p', text: 'Body text.' }
  ]);
});

test('parses a pull quote line', () => {
  const blocks = parseBody('> A quote.\n\nBody text.');
  assert.deepEqual(blocks, [
    { type: 'quote', text: 'A quote.' },
    { type: 'p', text: 'Body text.' }
  ]);
});

test('parses a fenced code block, preserving internal blank lines', () => {
  const blocks = parseBody('Intro.\n\n```\nline1\n\nline2\n```\n\nOutro.');
  assert.deepEqual(blocks, [
    { type: 'p', text: 'Intro.' },
    { type: 'code', text: 'line1\n\nline2' },
    { type: 'p', text: 'Outro.' }
  ]);
});

test('escapeHtml escapes ampersand and angle brackets', () => {
  assert.equal(escapeHtml('a < b & c > d'), 'a &lt; b &amp; c &gt; d');
});
