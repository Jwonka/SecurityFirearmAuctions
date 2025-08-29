document.addEventListener('DOMContentLoaded', () => {
  const form  = document.getElementById('siteSearch');
  const input = document.getElementById('searchInput');
  const msg   = document.getElementById('searchMsg');
  if (!form) return;

  // ------------ helpers ------------
  const norm = s => (s||'')
    .toLowerCase()
    .replace(/&amp;/g, '&')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

  const page = (location.pathname.split('/').pop() || 'index.html');
  const retailPages = ['index.html','guns.html','ammo.html','accessories.html'];

  const cards = [...document.querySelectorAll('.productCard, .gallery')];

  const cardName = el =>
    el.dataset.name?.trim()
    || el.querySelector('h4,h3')?.textContent.trim()
    || el.querySelector('.addToCart')?.dataset.name?.trim()
    || el.querySelector('img')?.getAttribute('alt')?.trim()
    || '';

  const cardDesc = el =>
    el.querySelector('.desc')?.textContent.trim()
    || el.querySelector('.blurb')?.textContent.trim()
    || el.querySelector('p')?.textContent.trim()
    || '';

  const showAll = () => {
    cards.forEach(c => {
      c.style.display = '';
      c.classList.remove('search-hit');
    });
    if (msg) msg.textContent = '';
  };

  function filterHere(q) {
    const qn = norm(q);
    if (!cards.length) return 0;

    // try exact match first
    const exact = cards.filter(c => norm(cardName(c)) === qn);

    const pool = exact.length ? exact : cards.filter(c => {
      const hay = norm(cardName(c) + ' ' + cardDesc(c));
      return hay.includes(qn);
    });

    if (pool.length === 0) return 0;

    // show only matches
    cards.forEach(c => {
      const hay = norm(cardName(c) + ' ' + cardDesc(c));
      const hit = pool.includes(c) || hay.includes(qn);
      c.style.display = hit ? '' : 'none';
      c.classList.toggle('search-hit', hit);
    });

    if (msg) msg.textContent = `Found ${pool.length} product${pool.length>1?'s':''}.`;
    // scroll to first match
    pool[0]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return pool.length;
  }

  async function findRetailElsewhere(qn) {
    const others = retailPages.filter(p => p !== page);
    for (const url of others) {
      try {
        const res = await fetch(url, { cache: 'no-store' });
        const html = norm(await res.text());
        if (html.includes(qn)) return url;
      } catch {}
    }
    return null;
  }

  async function hasAuctionMatch(qn) {
    try {
      const res = await fetch('auctions.html', { cache: 'no-store' });
      const html = norm(await res.text());
      return html.includes(qn);
    } catch { return false; }
  }

  // ------------ submit ------------
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const q = (input.value || '').trim();
    if (!q) { showAll(); return; }
    const qn = norm(q);

    // 1) try here first
    if (filterHere(q) > 0) return;

    // 2) try other retail pages
    const retailUrl = await findRetailElsewhere(qn);
    if (retailUrl) {
      location.href = `${retailUrl}?q=${encodeURIComponent(q)}`;
      return;
    }

    // 3) fall back to auctions
    if (await hasAuctionMatch(qn)) {
      location.href = `auctions.html?q=${encodeURIComponent(q)}`;
      return;
    }

    if (msg) msg.textContent = 'No matches found in retail or auctions.';
  });

  // apply ?q=... on load
  const qParam = new URLSearchParams(location.search).get('q');
  if (qParam) {
    input.value = qParam;
    // Try local filtering immediately; if no hits here, keep message
    if (filterHere(qParam) === 0 && msg) msg.textContent = 'No local matches on this page.';
  }

  document.getElementById('clearSearch')?.addEventListener('click', () => {
    input.value = '';
    showAll();
  });
});
