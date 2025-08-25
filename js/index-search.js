document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('siteSearch');
  const input = document.getElementById('searchInput');
  const msg = document.getElementById('searchMsg');

  // Retail product tiles (homepage)
  const tiles = Array.from(document.querySelectorAll('.gallery'));
  // Get a human name for each item: prefer data-name, then button[@data-name], then img alt
  const getName = (el) =>
    el.dataset.name?.trim() ||
    el.querySelector('.addToCart')?.dataset.name?.trim() ||
    el.querySelector('img')?.getAttribute('alt')?.trim() ||
    '';

  // Store names on nodes for quick filtering
  tiles.forEach(el => { el._name = getName(el); });

  function showAll() {
    tiles.forEach(el => { el.style.display = ''; });
    msg.textContent = '';
  }

  function showOnly(el) {
    tiles.forEach(t => { t.style.display = (t === el) ? '' : 'none'; });
    msg.textContent = `Showing 1 result: "${el._name || 'Item'}"`;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = (input.value || '').trim();
    if (!q) { showAll(); return; }

    const qLower = q.toLowerCase();

    // Try EXACT match first among retail products
    const exact = tiles.filter(t => (t._name || '').toLowerCase() === qLower);

    if (exact.length === 1) {
      showOnly(exact[0]);
      return;
    }

    // Try CONTAINS match; if exactly one, show it
    const contains = tiles.filter(t => (t._name || '').toLowerCase().includes(qLower));
    if (contains.length === 1) {
      showOnly(contains[0]);
      return;
    }

    // Not a single retail hit → send to auctions page to search there
    window.location.href = `auctions.html?q=${encodeURIComponent(q)}`;
  });

  document.getElementById('clearSearch')?.addEventListener('click', () => {
    input.value = '';
    showAll();
  });
});
