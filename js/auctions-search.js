document.addEventListener('DOMContentLoaded', () => {
  const form  = document.getElementById('auctionSearch');
  const input = document.getElementById('auctionSearchInput');
  const msg   = document.getElementById('auctionSearchMsg');

  // Optional: keep the simple hero rotator if present
  const heroImgs = document.querySelectorAll('.heroSlide');
  if (heroImgs.length > 1) {
    let i = 0;
    setInterval(() => {
      heroImgs[i].classList.remove('active');
      i = (i + 1) % heroImgs.length;
      heroImgs[i].classList.add('active');
    }, 5000);
  }

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

  async function findRetailMatch(qn){
    const idx = await loadIndex();
    return idx.retail.find(r => hay(r).includes(qn)) || null;
  }

  // ---------- Local auctions filter ----------
  function filterAuctions(q){
    const qn = norm(q);
    const lotCards = [...document.querySelectorAll('.lotCard')];
    const auctionCards = [...document.querySelectorAll('.auctionCard')];

    if (!lotCards.length) return { lotMatches: 0, auctionMatches: 0 };

    // Hide/show lots based on match
    let lotMatches = 0;
    lotCards.forEach(lc => {
      const text = norm(
        lc.dataset.name ||
        lc.textContent ||
        ''
      );
      const hit = text.includes(qn);
      lc.style.display = hit ? '' : 'none';
      lc.classList.toggle('search-hit', hit);
      if (hit) lotMatches++;
    });

    // Hide auction cards that have zero visible lots
    let auctionMatches = 0;
    auctionCards.forEach(ac => {
      const hasVisibleLot = ac.querySelector('.lotCard:not([style*="display: none"])');
      const on = !!hasVisibleLot;
      ac.style.display = on ? '' : 'none';
      if (on) auctionMatches++;
    });

    if (msg) {
      msg.textContent = lotMatches
        ? `Showing ${lotMatches} lot${lotMatches > 1 ? 's' : ''} in ${auctionMatches} auction${auctionMatches > 1 ? 's' : ''}.`
        : 'No auction matches.';
    }

    return { lotMatches, auctionMatches };
  }

  // ---------- Submit ----------
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const q = (input.value || '').trim();
    if (!q) {
      // Clear
      document.querySelectorAll('.lotCard, .auctionCard').forEach(el => { el.style.display = ''; el.classList.remove('search-hit'); });
      if (msg) msg.textContent = '';
      return;
    }

    const r = filterAuctions(q);
    if (r.lotMatches > 0) return; // stay on auctions when we have local hits

    // Auctions had zero hits → try RETAIL via the index (redirect if found)
    const qn = norm(q);
    const retail = await findRetailMatch(qn);
    if (retail) {
      location.href = `${retail.url}?q=${encodeURIComponent(q)}`;
      return;
    }

    if (msg) msg.textContent = 'No matches found in auctions or retail.';
  });

  // ---------- Clear ----------
  document.getElementById('auctionClear')?.addEventListener('click', () => {
    input.value = '';
    document.querySelectorAll('.lotCard, .auctionCard').forEach(el => { el.style.display = ''; el.classList.remove('search-hit'); });
    if (msg) msg.textContent = '';
  });

  // ---------- Apply ?q on load ----------
  const qParam = new URLSearchParams(location.search).get('q');
  if (qParam) {
    input.value = qParam;
    filterAuctions(qParam);
  }
});
