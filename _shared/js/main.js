/* =============================================================================
 * Tab switching (智能体中心 / 技能与工具)
 * ============================================================================= */
(function () {
  const tabs   = document.querySelectorAll('.nav-tab');
  const pages  = document.querySelectorAll('.page');
  const heroEl = document.querySelector('.hero');

  function show(name) {
    pages.forEach(p => p.classList.toggle('is-hidden', p.dataset.page !== name));
    tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === name));
    /* Hero lines only belong to the agents landing — hide on skills page. */
    if (heroEl) heroEl.style.display = (name === 'agents') ? '' : 'none';
    /* Scroll back to top so the new page is fully in view. */
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'auto' : 'auto' });
    history.replaceState(null, '', '#' + name);
  }

  tabs.forEach(t => t.addEventListener('click', e => {
    e.preventDefault();
    show(t.dataset.tab);
  }));

  /* Honour URL hash on first load. */
  const initial = location.hash.replace('#', '');
  if (initial && document.querySelector(`[data-page="${initial}"]`)) show(initial);
})();
