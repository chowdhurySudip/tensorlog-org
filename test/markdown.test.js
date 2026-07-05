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

test('leading and trailing blank lines are ignored', () => {
  const blocks = parseBody('\n\nHello.\n\n');
  assert.deepEqual(blocks, [
    { type: 'p', text: 'Hello.' }
  ]);
});

test('multiple consecutive code blocks', () => {
  const blocks = parseBody('```\nfirst\n```\n\n```\nsecond\n```');
  assert.deepEqual(blocks, [
    { type: 'code', text: 'first' },
    { type: 'code', text: 'second' }
  ]);
});

test('a heading interrupts an in-progress paragraph with no blank line separator', () => {
  const blocks = parseBody('Some text\n## A Heading');
  assert.deepEqual(blocks, [
    { type: 'p', text: 'Some text' },
    { type: 'h2', text: 'A Heading' }
  ]);
});

test('a quote line interrupts an in-progress paragraph with no blank line separator', () => {
  const blocks = parseBody('Some text\n> A Quote');
  assert.deepEqual(blocks, [
    { type: 'p', text: 'Some text' },
    { type: 'quote', text: 'A Quote' }
  ]);
});

test('consecutive quote lines each become a separate quote block (single-line quotes by design)', () => {
  // This test documents and locks in the single-line-per-quote behavior,
  // which matches the original design prototype this parser was ported from.
  // Unlike paragraph lines which merge, consecutive quote lines remain separate blocks.
  const blocks = parseBody('> First line.\n> Second line.');
  assert.deepEqual(blocks, [
    { type: 'quote', text: 'First line.' },
    { type: 'quote', text: 'Second line.' }
  ]);
});
