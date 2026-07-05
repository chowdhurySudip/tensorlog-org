'use strict';

const WORDS_PER_MINUTE = 200;

function computeReadTime(bodyText) {
  const words = (bodyText || '').trim().split(/\s+/).filter(Boolean);
  const minutes = Math.max(1, Math.round(words.length / WORDS_PER_MINUTE));
  return `${minutes} min read`;
}

module.exports = { computeReadTime };
