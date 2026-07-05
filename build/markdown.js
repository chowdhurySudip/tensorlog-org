'use strict';

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function parseBody(body) {
  const lines = (body || '').replace(/\r/g, '').split('\n');
  const blocks = [];
  let para = [];

  const flush = () => {
    if (para.length) {
      blocks.push({ type: 'p', text: para.join(' ').trim() });
      para = [];
    }
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    if (line.trim().startsWith('```')) {
      flush();
      i++;
      const code = [];
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        code.push(lines[i]);
        i++;
      }
      i++; // skip closing fence
      blocks.push({ type: 'code', text: code.join('\n') });
      continue;
    }

    if (line.trim() === '') { flush(); i++; continue; }
    if (line.startsWith('## ')) { flush(); blocks.push({ type: 'h2', text: line.slice(3).trim() }); i++; continue; }
    if (line.startsWith('> ')) { flush(); blocks.push({ type: 'quote', text: line.slice(2).trim() }); i++; continue; }

    para.push(line);
    i++;
  }
  flush();
  return blocks;
}

module.exports = { parseBody, escapeHtml };
