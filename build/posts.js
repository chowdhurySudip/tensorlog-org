'use strict';

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { parseBody } = require('./markdown');
const { computeReadTime } = require('./read-time');
const { formatDate } = require('./date');

function loadPosts(postsDir) {
  const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));

  const posts = files.map(file => {
    const slug = path.basename(file, '.md');
    const raw = fs.readFileSync(path.join(postsDir, file), 'utf8');
    const { data, content } = matter(raw);
    const body = content.trim();

    // gray-matter parses dates as Date objects, convert to ISO string (YYYY-MM-DD)
    const isoDate = data.date instanceof Date ? data.date.toISOString().slice(0, 10) : data.date;

    return {
      slug,
      title: data.title,
      isoDate,
      date: formatDate(isoDate),
      tags: data.tags || [],
      summary: data.summary,
      readTime: computeReadTime(body),
      blocks: parseBody(body)
    };
  });

  posts.sort((a, b) => (a.isoDate < b.isoDate ? 1 : a.isoDate > b.isoDate ? -1 : 0));
  return posts;
}

module.exports = { loadPosts };
