'use strict';

const config = require('./site-config');
const { escapeHtml } = require('./markdown');

function renderNav(activeNav) {
  return config.navItems.map(item => {
    const key = item.path.replace(/\//g, '');
    const isActive = activeNav === key || (activeNav === 'article' && key === 'writing');
    const cls = isActive ? 'nav__link nav__link--active' : 'nav__link';
    return `<a class="${cls}" href="${item.path}">${item.label}</a>`;
  }).join('\n        ');
}

function renderLayout({ title, description, canonicalPath, activeNav, bodyHtml, ogType = 'website' }) {
  const canonicalUrl = `${config.baseUrl}${canonicalPath}`;
  const escapedTitle = escapeHtml(title);
  const escapedDescription = escapeHtml(description);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapedTitle}</title>
<meta name="description" content="${escapedDescription}">
<link rel="canonical" href="${canonicalUrl}">
<meta property="og:title" content="${escapedTitle}">
<meta property="og:description" content="${escapedDescription}">
<meta property="og:type" content="${ogType}">
<meta property="og:url" content="${canonicalUrl}">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${escapedTitle}">
<meta name="twitter:description" content="${escapedDescription}">
<link rel="alternate" type="application/rss+xml" title="${config.siteTitle}" href="${config.baseUrl}/feed.xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/style.css">
</head>
<body>
<div class="site-header">
  <header class="site-header__inner">
    <a class="brand" href="/">${config.siteTitle}</a>
    <nav class="nav">
      ${renderNav(activeNav)}
    </nav>
  </header>
</div>
<main class="site-main">
${bodyHtml}
</main>
<footer class="site-footer">
  <div class="site-footer__inner">
    <span>&copy; 2026 &middot; tensorlog.org</span>
    <span class="footer-links">
      <a href="${config.github}" target="_blank" rel="noopener">GitHub</a>
      <a href="${config.twitter}" target="_blank" rel="noopener">X</a>
      <a href="mailto:${config.contactEmail}">Email</a>
    </span>
  </div>
</footer>
<script src="/js/tag-filter.js"></script>
</body>
</html>
`;
}

module.exports = { renderLayout };
