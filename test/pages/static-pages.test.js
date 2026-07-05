'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { renderExperiments, renderAbout, renderContact } = require('../../build/pages/static-pages');

test('renderExperiments shows the cooking teaser and a link back to writing', () => {
  const html = renderExperiments();
  assert.match(html, /Something interesting is cooking\./);
  assert.match(html, /href="\/writing\/">In the meantime, read the writing/);
});

test('renderAbout shows the focus-area cards and the timeline', () => {
  const html = renderAbout();
  assert.match(html, /Hardware-aware inference/);
  assert.match(html, /New algorithms & architectures/);
  assert.match(html, /Agents & orchestration/);
  assert.match(html, /ML Engineer/);
  assert.match(html, /href="\/contact\/">Get in touch/);
});

test('renderContact shows the email card and social links', () => {
  const html = renderContact();
  assert.match(html, /href="mailto:contact@tensorlog\.org"/);
  assert.match(html, /href="https:\/\/github\.com\/chowdhurySudip"/);
  assert.match(html, /href="https:\/\/x\.com\/SudipCh03813050"/);
  assert.match(html, /href="https:\/\/in\.linkedin\.com\/in\/sudip-chowdhury"/);
});
