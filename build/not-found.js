'use strict';

const { renderLayout } = require('./layout');
const config = require('./site-config');

function renderNotFound() {
  const body = `
<section class="page-header">
  <h1>Page not found</h1>
  <p class="tagline">That page doesn't exist. <a href="/">Go back home &rarr;</a></p>
</section>`;

  return renderLayout({
    title: `Not found | ${config.siteTitle}`,
    description: 'Page not found.',
    canonicalPath: '/404.html',
    activeNav: null,
    bodyHtml: body
  });
}

module.exports = { renderNotFound };
