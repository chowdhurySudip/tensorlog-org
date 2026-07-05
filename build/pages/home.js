'use strict';

const { renderLayout } = require('../layout');
const { renderPostList } = require('../post-list');
const config = require('../site-config');

function renderHome(posts) {
  const homePosts = posts.slice(0, 5);

  const body = `
<section class="hero">
  <div class="eyebrow">AI Engineer &middot; Learning out loud</div>
  <h1>I build, break, and write about machine learning systems.</h1>
  <p class="tagline">I'm ${config.authorName}. This is my notebook &mdash; experiments I'm running, papers I'm digesting, and the occasional thing that actually worked.</p>
</section>

<section class="section">
  <div class="section-header">
    <h2>Latest writing</h2>
    <a class="section-header__link" href="/writing/">All posts &rarr;</a>
  </div>
  <div class="post-list">
    ${renderPostList(homePosts)}
  </div>
</section>

<section class="section">
  <div class="section-header">
    <h2>Experiments</h2>
    <a class="section-header__link" href="/experiments/">Peek &rarr;</a>
  </div>
  <a class="teaser-card" href="/experiments/">
    <div class="status-row"><span class="status-dot"></span><span class="status-label">// status: cooking</span></div>
    <div class="teaser-card__title">Something interesting is cooking.</div>
    <p class="teaser-card__body">Interactive demos &mdash; attention maps, a tokenizer playground, and a couple of from-scratch builds &mdash; will show up here soon.</p>
  </a>
</section>`;

  return renderLayout({
    title: `${config.siteTitle} | AI Engineer`,
    description: config.siteDescription,
    canonicalPath: '/',
    activeNav: 'home',
    bodyHtml: body
  });
}

module.exports = { renderHome };
