document.addEventListener('DOMContentLoaded', () => {
  const form  = document.getElementById('siteSearch');
  const input = document.getElementById('searchInput');
  const msg   = document.getElementById('searchMsg');
  if (!form) return;

  // ---- Helpers -------------------------------------------------------------
  const norm = s => (s || '')
    .toLowerCase()
    .replace(/&amp;/g, '&')
    .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

  const RETAIL_PAGES = ['guns.html', 'ammo.html', 'accessories.html'];
  const AUCTIONS_PAGE = 'auctions.html';

  function hasRetailProducts() {
    return !!document.querySelector('.productCard:not(.categoryCard)');
  }
  const isIndex = !hasRetailProducts(); // index only has .categoryCard tiles

  function getName(el){
    return (
      el.dataset.name?.trim() ||
      el.querySelector('h3')?.textContent.trim() ||
      el.querySelector('.addToCart')?.dataset.name?.trim() ||
      el.querySelector('img')?.getAttribute('alt')?.trim() ||
      ''
    );
  }
  function getDesc(el){
    return (
      el.querySelector('.blurb')?.textContent.trim() ||
      el.querySelector('p')?.textContent.trim() ||
      ''
    );
  }
  function showAll() {
    document.querySelectorAll('.productCard:not(.categoryCard), .gallery').forEach(c => {
      c.style.display = '';
      c.classList.remove('search-hit');
    });
    if (msg) msg.textContent = '';
  }
  function focusCard(card, note='') {
    document.querySelectorAll('.productCard:not(.categoryCard), .gallery').forEach(c => {
      const on = c === card;
      c.style.display = on ? '' : 'none';
      c.classList.toggle('search-hit', on);
    });
    if (msg && note) msg.textContent = note;
    card.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function pageHasQuery(url, qn) {
    try {
      const res = await fetch(url, { cache: 'no-store' });
      const html = norm(await res.text());
      return html.includes(qn);
    } catch {
      return false;
    }
  }

  function guessRetailPage(qn) {
    if (/\b(ammo|9mm|10mm|45|380|acp|luger|nato|556|5 56|308|12 ?g|gauge|shell|winchester|federal|hornady|pmc|fiocchi)\b/.test(qn)) return 'ammo.html';
    if (/\b(scope|optic|red dot|holo|stock|sling|case|holster|mag|magazine|accessor)\b/.test(qn)) return 'accessories.html';
    if (/\b(gun|pistol|handgun|revolver|rifle|shotgun|glock|smith|wesson|sig|beretta|taurus|springfield|colt|barrett|winchester|remington|browning)\b/.test(qn)) return 'guns.html';
    return null;
  }

  async function findRetailMatch(qn, { skip } = {}) {
    const guess = guessRetailPage(qn);
    const ordered = guess
      ? [guess, ...RETAIL_PAGES.filter(p => p !== guess)]
      : [...RETAIL_PAGES];
    for (const url of ordered) {
      if (url === skip) continue;
      if (await pageHasQuery(url, qn)) return url;
    }
    return null;
  }

  // ---- Local retail filtering (used on product pages) ----------------------
  function runLocalRetailSearch(q) {
    const qn = norm(q);
    const cards = [...document.querySelectorAll('.productCard:not(.categoryCard), .gallery')];
    if (!cards.length) return 0;

    const exact = cards.filter(c => norm(getName(c)) === qn);
    const pool = exact.length
      ? exact
      : cards.filter(c => norm(getName(c) + ' ' + getDesc(c)).includes(qn));

    if (pool.length === 1) {
      focusCard(pool[0], `Showing 1 product: “${getName(pool[0])}”`);
      return 1;
    }
    if (pool.length > 1) {
      cards.forEach(c => {
        const hit = norm(getName(c) + ' ' + getDesc(c)).includes(qn);
        c.style.display = hit ? '' : 'none';
        c.classList.toggle('search-hit', hit);
      });
      if (msg) msg.textContent = `Found ${pool.length} products.`;
      return pool.length;
    }
    // zero hits
    return 0;
  }

  // ---- Submit handler ------------------------------------------------------
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const q = (input.value || '').trim();
    if (!q) { showAll(); return; }
    const qn = norm(q);

    if (isIndex) {
      // INDEX: prefer retail, then auctions
      const url = await findRetailMatch(qn);
      if (url) { location.href = `${url}?q=${encodeURIComponent(q)}`; return; }
      if (await pageHasQuery(AUCTIONS_PAGE, qn)) {
        location.href = `${AUCTIONS_PAGE}?q=${encodeURIComponent(q)}`; return;
      }
      if (msg) msg.textContent = 'No matches found in retail or auctions.';
      return;
    }

    // PRODUCT PAGES: try local filter first
    const localCount = runLocalRetailSearch(q);
    if (localCount > 0) return;

    // No local hits → look in other retail pages, then auctions
    const current = location.pathname.split('/').pop().toLowerCase();
    const otherRetail = await findRetailMatch(qn, { skip: current });
    if (otherRetail) { location.href = `${otherRetail}?q=${encodeURIComponent(q)}`; return; }

    if (await pageHasQuery(AUCTIONS_PAGE, qn)) {
      location.href = `${AUCTIONS_PAGE}?q=${encodeURIComponent(q)}`; return;
    }

    if (msg) msg.textContent = 'No matches found in retail or auctions.';
  });

  // ---- Apply ?q=... on load -----------------------------------------------
  const qParam = new URLSearchParams(location.search).get('q');
  if (qParam) {
    input.value = qParam;
    if (isIndex) {
      // Let the index redirect immediately
      form.dispatchEvent(new Event('submit'));
    } else {
      // Product pages: filter locally on load
      runLocalRetailSearch(qParam);
      if (msg) {
        const countShown = document.querySelectorAll('.productCard.search-hit, .gallery.search-hit').length;
        if (countShown > 1) msg.textContent = `Found ${countShown} products.`;
        else if (countShown === 1) msg.textContent = `Showing 1 product: “${document.querySelector('.productCard.search-hit h3, .gallery.search-hit h3')?.textContent ?? qParam}”`;
      }
    }
  }

  document.getElementById('clearSearch')?.addEventListener('click', () => {
    input.value = '';
    showAll();
  });
});
