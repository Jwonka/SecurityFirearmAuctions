document.addEventListener('DOMContentLoaded', () => {
  const form  = document.getElementById('siteSearch');
  const input = document.getElementById('searchInput');
  const msg   = document.getElementById('searchMsg');
  if (!form) return;

  // ---------- Normalize ----------
  const norm = (s) => (s || '')
    .toLowerCase()
    .replace(/&amp;/g, '&')
    .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

  // ---------- Global search index ----------
  let SEARCH_INDEX = null;
  async function loadIndex(){
    if (SEARCH_INDEX) return SEARCH_INDEX;
    try{
      const res = await fetch('data/search-index.json', { cache: 'no-store' });
      SEARCH_INDEX = await res.json();
    }catch{
      SEARCH_INDEX = { retail: [], auctions: [] };
    }
    return SEARCH_INDEX;
  }
  const hay = (o) => (o.name + ' ' + (o.tokens || []).join(' ')).toLowerCase();
  const includes = (qn, text) => text.includes(qn);

  async function findRetailMatch(qn){
    const idx = await loadIndex();
    return idx.retail.find(r => includes(qn, hay(r))) || null;
  }
  async function findAuctionMatch(qn){
    const idx = await loadIndex();
    return idx.auctions.find(a => includes(qn, hay(a))) || null;
  }

  // ---------- UI helpers ----------
  function showAll(){
    document.querySelectorAll('.productCard:not(.categoryCard), .gallery').forEach(c => {
      c.style.display = '';
      c.classList.remove('search-hit');
    });
    if (msg) msg.textContent = '';
  }
  function getName(el){
    return (
      el.dataset.name?.trim() ||
      el.querySelector('h3')?.textContent?.trim() ||
      el.querySelector('.addToCart')?.dataset?.name?.trim() ||
      el.querySelector('img')?.getAttribute('alt')?.trim() ||
      ''
    );
  }
  function getDesc(el){
    return (
      el.querySelector('.blurb')?.textContent?.trim() ||
      el.querySelector('p')?.textContent?.trim() ||
      ''
    );
  }

  // ---------- Local retail filter (retail pages only) ----------
  function runLocalRetailSearch(q){
    const qn = norm(q);
    const cards = [...document.querySelectorAll('.productCard:not(.categoryCard), .gallery')];
    if (!cards.length) return 0;

    const hits = cards.filter(c => norm(getName(c) + ' ' + getDesc(c)).includes(qn));
    cards.forEach(c => {
      const on = hits.includes(c);
      c.style.display = on ? '' : 'none';
      c.classList.toggle('search-hit', on);
    });
    if (msg) {
      msg.textContent = hits.length
        ? `Found ${hits.length} product${hits.length > 1 ? 's' : ''}.`
        : 'No local matches.';
    }
    return hits.length;
  }

  // ---------- Submit ----------
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const q = (input.value || '').trim();
    if (!q) { showAll(); return; }
    const qn = norm(q);

    // 1) Try local products (only works on retail pages that render products)
    const localHits = runLocalRetailSearch(q);
    if (localHits > 0) return;

    // 2) Use global index — retail first, then auctions (route appropriately)
    const retail = await findRetailMatch(qn);
    if (retail) { location.href = `${retail.url}?q=${encodeURIComponent(q)}`; return; }

    const auction = await findAuctionMatch(qn);
    if (auction) { location.href = `${auction.url}?q=${encodeURIComponent(q)}`; return; }

    if (msg) msg.textContent = 'No matches found in retail or auctions.';
  });

  // ---------- Clear ----------
  document.getElementById('clearSearch')?.addEventListener('click', () => {
    input.value = '';
    showAll();
  });

  // ---------- Apply ?q on load ----------
  const qParam = new URLSearchParams(location.search).get('q');
  if (qParam) {
    input.value = qParam;
    // On the index (category tiles), there are no product cards, so this will
    // return 0 and we’ll leave it visible. On product pages, it will filter.
    runLocalRetailSearch(qParam);
  }
});
