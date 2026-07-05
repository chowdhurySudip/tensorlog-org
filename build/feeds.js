'use strict';

const config = require('./site-config');

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function generateSitemap(posts) {
  const staticPaths = ['/', '/writing/', '/experiments/', '/about/', '/contact/'];
  const postPaths = posts.map(p => `/article/${p.slug}/`);
  const urls = staticPaths.concat(postPaths)
    .map(p => `  <url><loc>${config.baseUrl}${p}</loc></url>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function generateRobots() {
  return `User-agent: *\nAllow: /\nSitemap: ${config.baseUrl}/sitemap.xml\n`;
}

function generateRss(posts) {
  const items = posts.map(p => `  <item>
    <title>${escapeXml(p.title)}</title>
    <link>${config.baseUrl}/article/${p.slug}/</link>
    <guid>${config.baseUrl}/article/${p.slug}/</guid>
    <description>${escapeXml(p.summary)}</description>
    <pubDate>${new Date(p.isoDate).toUTCString()}</pubDate>
  </item>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>${config.siteTitle}</title>
  <link>${config.baseUrl}</link>
  <description>${config.siteDescription}</description>
${items}
</channel>
</rss>
`;
}

module.exports = { generateSitemap, generateRobots, generateRss };
