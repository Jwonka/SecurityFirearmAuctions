document.addEventListener('DOMContentLoaded', () => {
  const form  = document.getElementById('siteSearch');
  const input = document.getElementById('searchInput');
  const msg   = document.getElementById('searchMsg');
  if (!form) return;

  // Normalize: lower, decode &amp;, collapse to alphanumerics + space
  const norm = s => (s||'')
    .toLowerCase()
    .replace(/&amp;/g, '&')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

  const cards = [...document.querySelectorAll('.productCard, .gallery')];

  const cardName = el =>
    el.dataset.name?.trim()
    || el.querySelector('h3')?.textContent.trim()
    || el.querySelector('.addToCart')?.dataset.name?.trim()
    || el.querySelector('img')?.getAttribute('alt')?.trim()
    || '';

  const cardDesc = el =>
    el.querySelector('.blurb')?.textContent.trim()
    || el.querySelector('p')?.textContent.trim()
    || '';

  const showAll = () => {
    cards.forEach(c => c.style.display = '');
    msg.textContent = '';
    cards.forEach(c => c.classList.remove('search-hit'));
  };

  const focusCard = (card, note='') => {
    cards.forEach(c => {
      const on = c === card;
      c.style.display = on ? '' : 'none';
      c.classList.toggle('search-hit', on);
    });
    if (note) msg.textContent = note;
    card.scrollIntoView({behavior:'smooth', block:'start'});
  };

  async function hasAuctionMatch(q){
    try{
      const res  = await fetch('auctions.html', {cache:'no-store'});
      const html = norm(await res.text());
      return html.includes(norm(q));
    }catch{ return false; }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const q = (input.value || '').trim();
    if (!q) { showAll(); return; }

    const qn = norm(q);

    // exact then contains (normalized)
    const exact = cards.filter(c => norm(cardName(c)) === qn);

    const pool = exact.length ? exact : cards.filter(c => {
      const hay = norm(cardName(c) + ' ' + cardDesc(c));
      return hay.includes(qn);
    });

    if (pool.length === 1){
      focusCard(pool[0], `Showing 1 product: “${cardName(pool[0])}”`);
      return;
    }

    if (pool.length > 1){
      cards.forEach(c => {
        const hay = norm(cardName(c) + ' ' + cardDesc(c));
        const hit = hay.includes(qn);
        c.style.display = hit ? '' : 'none';
        c.classList.toggle('search-hit', hit);
      });
      msg.textContent = `Found ${pool.length} products.`;
      return;
    }

    if (await hasAuctionMatch(q)) {
      location.href = `auctions.html?q=${encodeURIComponent(q)}`;
    } else {
      msg.textContent = 'No matches found.';
    }
  });

  // Auto-apply ?q=...
  const qParam = new URLSearchParams(location.search).get('q');
  if (qParam) { input.value = qParam; form.dispatchEvent(new Event('submit')); }

  document.getElementById('clearSearch')?.addEventListener('click', () => {
    input.value = '';
    showAll();
  });
});
