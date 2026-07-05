'use strict';

const fs = require('fs');
const path = require('path');
const { loadPosts } = require('./build/posts');
const { renderHome } = require('./build/pages/home');
const { renderWriting } = require('./build/pages/writing');
const { renderArticle } = require('./build/pages/article');
const { renderExperiments, renderAbout, renderContact } = require('./build/pages/static-pages');
const { renderNotFound } = require('./build/not-found');
const { generateSitemap, generateRobots, generateRss } = require('./build/feeds');

const ROOT = __dirname;
const CONTENT_DIR = path.join(ROOT, 'content', 'posts');
const DIST_DIR = path.join(ROOT, 'dist');

function writeFile(relPath, contents) {
  const fullPath = path.join(DIST_DIR, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, contents);
}

function copyDir(src, destRel) {
  if (!fs.existsSync(src)) return;
  const dest = path.join(DIST_DIR, destRel);
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src)) {
    fs.copyFileSync(path.join(src, entry), path.join(dest, entry));
  }
}

function build() {
  fs.rmSync(DIST_DIR, { recursive: true, force: true });
  const posts = loadPosts(CONTENT_DIR);

  writeFile('index.html', renderHome(posts));
  writeFile('writing/index.html', renderWriting(posts));
  writeFile('experiments/index.html', renderExperiments());
  writeFile('about/index.html', renderAbout());
  writeFile('contact/index.html', renderContact());
  writeFile('404.html', renderNotFound());

  posts.forEach(post => {
    writeFile(`article/${post.slug}/index.html`, renderArticle(post));
  });

  writeFile('sitemap.xml', generateSitemap(posts));
  writeFile('robots.txt', generateRobots());
  writeFile('feed.xml', generateRss(posts));

  copyDir(path.join(ROOT, 'css'), 'css');
  copyDir(path.join(ROOT, 'js'), 'js');

  console.log(`Built ${posts.length} posts + 6 pages to ${DIST_DIR}`);
}

if (require.main === module) {
  build();
}

module.exports = { build };
