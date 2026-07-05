document.addEventListener('DOMContentLoaded', () => {
  const list = document.querySelector('[data-post-list]');
  const chips = document.querySelectorAll('.tag-chip');
  if (!list || !chips.length) return;

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const tag = chip.dataset.tag;
      chips.forEach(c => c.classList.remove('tag-chip--active'));
      chip.classList.add('tag-chip--active');

      list.querySelectorAll('.post-item').forEach(item => {
        const tags = (item.dataset.tags || '').split(',');
        item.style.display = (!tag || tags.includes(tag)) ? '' : 'none';
      });
    });
  });
});
