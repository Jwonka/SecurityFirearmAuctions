document.addEventListener('DOMContentLoaded', () => {
  const form  = document.getElementById('siteSearch');
  if (!form) return;

  const input = document.getElementById('searchInput');
  const msg   = document.getElementById('searchMsg');

  // Support old (.gallery) and new (.productCard) cards
  const tiles = [...document.querySelectorAll('.gallery, .productCard')];

  const getName = (el) =>
    el.dataset.name?.trim()
    || el.querySelector('[data-name]')?.dataset.name?.trim()
    || el.querySelector('.productBody h3')?.textContent?.trim()
    || el.querySelector('img[alt]')?.getAttribute('alt')?.trim()
    || '';

  tiles.forEach(el => { el.dataset._name = getName(el).toLowerCase(); });

  const showAll = () => {
    tiles.forEach(el => { el.style.display = ''; });
    if (msg) msg.textContent = '';
  };

  const showSet = (els) => {
    tiles.forEach(t => { t.style.display = els.includes(t) ? '' : 'none'; });
    (document.getElementById('products') || els[0] || document.body)
      .scrollIntoView({ behavior:'smooth', block:'start' });
  };

  async function auctionMatches(qLower) {
    // Prefer a global JS index if present
    if (Array.isArray(window.auctionIndex)) {
      return window.auctionIndex.filter(n => n.toLowerCase().includes(qLower));
    }
    // Fallback: try JSON file
    try {
      const res = await fetch('js/auctions-index.json', { cache: 'no-store' });
      if (!res.ok) return [];
      const arr = await res.json();
      return (Array.isArray(arr) ? arr : [])
        .filter(n => (n?.toLowerCase?.() || '').includes(qLower));
    } catch {
      return [];
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const qRaw = (input.value || '').trim();
    if (!qRaw) { showAll(); return; }

    const q = qRaw.toLowerCase();

    // 1) Home results?
    const homeHits = tiles.filter(t => (t.dataset._name || '').includes(q));

    if (homeHits.length > 0) {
      showSet(homeHits);
      if (msg) msg.innerHTML = `Showing ${homeHits.length} result${homeHits.length>1?'s':''} here.`;

      // 2) Also check auctions; if there are hits, offer a link (no redirect)
      const aHits = await auctionMatches(q);
      if (aHits.length > 0 && msg) {
        msg.innerHTML += ` <a href="auctions.html?q=${encodeURIComponent(qRaw)}">(Also found ${aHits.length} in Auctions)</a>`;
      }
      return;
    }

    // 3) No home hits → check auctions and only redirect if there are matches
    const aHits = await auctionMatches(q);
    if (aHits.length > 0) {
      location.href = `auctions.html?q=${encodeURIComponent(qRaw)}`;
    } else {
      if (msg) msg.textContent = 'No results here or in Auctions.';
    }
  });

  document.getElementById('clearSearch')?.addEventListener('click', () => {
    input.value = '';
    showAll();
  });
});
