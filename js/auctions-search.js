document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const q = (params.get('q') || '').trim();
  const cards = Array.from(document.querySelectorAll('.auction-card'));
  const msg = document.getElementById('auctionSearchMsg');

  if (!q) return; // no filter

  const qLower = q.toLowerCase();
  const exact = cards.filter(c => (c.dataset.name || '').toLowerCase() === qLower);
  const contains = cards.filter(c => (c.dataset.name || '').toLowerCase().includes(qLower));

  function showOnly(el) {
    cards.forEach(c => { c.style.display = (c === el) ? '' : 'none'; });
    msg.textContent = `Showing auction: "${el.dataset.name}"`;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  if (exact.length === 1) { showOnly(exact[0]); return; }
  if (contains.length === 1) { showOnly(contains[0]); return; }

  // Not found — show message, show nothing
  cards.forEach(c => c.style.display = 'none');
  msg.textContent = `No auction found for "${q}".`;
});
