'use strict';

const { renderLayout } = require('../layout');
const config = require('../site-config');

function renderExperiments() {
  const body = `
<section class="page-header">
  <h1>Experiments</h1>
  <p class="tagline">Small interactive things &mdash; charts, visualizations, and the occasional model demo. Built to poke at, not just read.</p>
</section>
<section class="section">
  <div class="experiments-panel">
    <div class="status-row"><span class="status-dot"></span><span class="status-label">// status: cooking</span></div>
    <h2>Something interesting is cooking.</h2>
    <p>I'm building a set of interactive demos to go here &mdash; a kernel/throughput playground, a couple of from-scratch architecture rebuilds, and an agent-orchestration sandbox. This section will be updated soon.</p>
    <div class="tag-pill-row">
      <span class="tag-pill">kernel profiler</span>
      <span class="tag-pill">tiny autograd</span>
      <span class="tag-pill">agent trace viewer</span>
      <span class="tag-pill">orchestration sandbox</span>
    </div>
    <a class="section-header__link" href="/writing/">In the meantime, read the writing &rarr;</a>
  </div>
</section>`;

  return renderLayout({
    title: `Experiments | ${config.siteTitle}`,
    description: 'Small interactive things built to poke at, not just read.',
    canonicalPath: '/experiments/',
    activeNav: 'experiments',
    bodyHtml: body
  });
}

function renderAbout() {
  const cards = [
    ['Hardware-aware inference', 'Kernels, memory bandwidth, and the tricks that make training and inference faster on the GPUs I actually have.'],
    ['New algorithms & architectures', 'Chasing papers that change the computation itself, not just scale up the same one.'],
    ['Agents & orchestration', 'Multi-step, tool-using systems &mdash; and figuring out where they quietly fall apart.']
  ].map(([title, desc]) => `<div class="about-card"><div class="about-card__title">${title}</div><div class="about-card__desc">${desc}</div></div>`).join('\n      ');

  const timeline = [
    ['2024 &mdash; now', 'ML Engineer', 'Building and shipping LLM-powered systems; obsessing over latency and cost.'],
    ['2022 &mdash; 2024', 'Software Engineer, ML', 'Data pipelines, training infra, and my first taste of "it works on the eval set."'],
    ['earlier', 'Learning in public', 'Reimplementing papers for fun until it turned into a career.']
  ].map(([range, role, desc]) => `<div class="timeline-item"><div class="timeline-item__range">${range}</div><div><div class="timeline-item__role">${role}</div><div class="timeline-item__desc">${desc}</div></div></div>`).join('\n    ');

  const body = `
<section class="page-header">
  <div class="eyebrow">About</div>
  <h1>I learn by building the smallest thing that actually runs.</h1>
</section>
<section class="section about-copy">
  <p>I'm Sudip &mdash; an AI engineer who's happiest taking something I half-understand from a paper and turning it into a tiny reproduction I can poke at. I care less about the leaderboard number and more about knowing exactly <em>why</em> a system behaves the way it does.</p>
  <p>Day to day I work on inference optimization at the hardware level, new model architectures, and agent orchestration &mdash; kernels and memory bandwidth, papers that rethink the computation instead of just scaling it, and multi-step tool-using systems. This site is where I keep the receipts: what I tried, what broke, and what I'd do differently.</p>
</section>
<section class="section">
  <h2 class="section-label">What I'm into right now</h2>
  <div class="about-grid">
    ${cards}
  </div>
</section>
<section class="section">
  <h2 class="section-label">A short timeline</h2>
  <div class="timeline">
    ${timeline}
  </div>
</section>
<section class="section">
  <div class="cta-card">
    <div>
      <div class="cta-card__title">Want to compare notes?</div>
      <div class="cta-card__desc">I like talking to people building in the same space.</div>
    </div>
    <a class="cta-card__button" href="/contact/">Get in touch &rarr;</a>
  </div>
</section>`;

  return renderLayout({
    title: `About | ${config.siteTitle}`,
    description: 'I learn by building the smallest thing that actually runs.',
    canonicalPath: '/about/',
    activeNav: 'about',
    bodyHtml: body
  });
}

function renderContact() {
  const body = `
<section class="page-header contact-header">
  <div class="eyebrow">Contact</div>
  <h1>Say hello.</h1>
  <p>I like comparing notes with people building in the same space. If you're working on inference optimization, new model architectures, or agentic systems &mdash; or just want to share a paper &mdash; the fastest way to reach me is email.</p>
</section>
<section class="section">
  <a class="contact-card" href="mailto:${config.contactEmail}">
    <span class="contact-card__label"><span class="contact-card__title">Email</span><span class="contact-card__sub">Best for anything substantial.</span></span>
    <span class="contact-card__value">${config.contactEmail} &rarr;</span>
  </a>
  <div class="contact-grid">
    <a class="contact-grid__item" href="${config.github}" target="_blank" rel="noopener"><span>GitHub</span><span>&rarr;</span></a>
    <a class="contact-grid__item" href="${config.twitter}" target="_blank" rel="noopener"><span>X</span><span>&rarr;</span></a>
    <a class="contact-grid__item" href="${config.linkedin}" target="_blank" rel="noopener"><span>LinkedIn</span><span>&rarr;</span></a>
  </div>
</section>
<section class="section">
  <div class="contact-note">Usually reply within a day or two &middot; Based remotely, UTC+5:30</div>
</section>`;

  return renderLayout({
    title: `Contact | ${config.siteTitle}`,
    description: 'Get in touch with Sudip Chowdhury.',
    canonicalPath: '/contact/',
    activeNav: 'contact',
    bodyHtml: body
  });
}

module.exports = { renderExperiments, renderAbout, renderContact };
