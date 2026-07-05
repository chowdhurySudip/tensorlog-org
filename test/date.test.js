'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { formatDate } = require('../build/date');

test('formats an ISO date as "Mon YYYY"', () => {
  assert.equal(formatDate('2026-06-15'), 'Jun 2026');
});

test('handles January and December correctly', () => {
  assert.equal(formatDate('2026-01-01'), 'Jan 2026');
  assert.equal(formatDate('2026-12-31'), 'Dec 2026');
});
