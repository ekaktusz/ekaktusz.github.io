(() => {
  const title = document.querySelector('.site-title');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!title) return;

  // Each interaction resolves once, even if the pointer stays over the link.
  const tune = () => {
    if (reducedMotion.matches || title.classList.contains('is-tuning')) return;
    title.classList.add('is-tuning');
    window.setTimeout(() => title.classList.remove('is-tuning'), 900);
  };

  title.addEventListener('pointerenter', event => {
    if (event.pointerType === 'mouse' || event.pointerType === 'pen') tune();
  });
  title.addEventListener('pointerdown', event => {
    if (event.pointerType === 'touch') tune();
  });
  title.addEventListener('focus', () => {
    if (title.matches(':focus-visible')) tune();
  });
  document.querySelectorAll('.theme-controls button').forEach(button => {
    button.addEventListener('click', () => tune());
  });

  // Keep the entrance effect in the title bar on every page.
  document.fonts.ready.then(() => tune());
})();
