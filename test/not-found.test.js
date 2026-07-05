'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { renderNotFound } = require('../build/not-found');

test('renders a not-found message with a link home', () => {
  const html = renderNotFound();
  assert.match(html, /Page not found/);
  assert.match(html, /href="\/">Go back home/);
});
