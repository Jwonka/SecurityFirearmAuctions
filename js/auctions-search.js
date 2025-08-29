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

  // ---------- Normalize / tokens / helpers ----------
  const STOP = new Set(['and','the','for','of','to','a','&']);
  const TYPO = { 'smiht':'smith', 'smih':'smith', 'smtih':'smith', 'wessn':'wesson' };
  const norm = (s) => (s || '')
    .toLowerCase()
    .replace(/&amp;/g, '&')
    .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
  function fixTypos(qn){
    return qn.split(' ').map(w => TYPO[w] || w).join(' ');
  }
  function tokensFrom(q){
    return fixTypos(norm(q)).split(' ')
      .filter(t => t && !STOP.has(t));
  }
  const hayOf = (el) => norm(el.dataset.name || el.textContent || '');

  // ---------- Local auctions filter (ANY-token match, len>=3) ----------
  function filterAuctions(q){
    const qTokens = tokensFrom(q);
    const lotCards = [...document.querySelectorAll('.lotCard')];
    const auctionCards = [...document.querySelectorAll('.auctionCard')];

    if (!lotCards.length) return { lotMatches: 0, auctionMatches: 0 };

    let lotMatches = 0;
    lotCards.forEach(lc => {
      const hit = qTokens.some(t => t.length >= 3 && hayOf(lc).includes(t));
      lc.style.display = hit ? '' : 'none';
      lc.classList.toggle('search-hit', hit);
      if (hit) lotMatches++;
    });

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

  // ---------- Global index fallback (route to retail) ----------
  let SEARCH_INDEX = null;
  async function loadIndex(){
    if (SEARCH_INDEX) return SEARCH_INDEX;
    try {
      const res = await fetch('data/search-index.json', { cache: 'no-store' });
      SEARCH_INDEX = await res.json();
    } catch {
      SEARCH_INDEX = { retail: [], auctions: [] };
    }
    return SEARCH_INDEX;
  }
  const hayIndex = (o) => (o.name + ' ' + (o.tokens || []).join(' ')).toLowerCase();
  function score(text, qTokens){
    let s = 0;
    for (const t of qTokens) if (t.length >= 3 && text.includes(t)) s++;
    return s;
  }
  function bestMatch(list, qTokens){
    let best = null, bestScore = 0;
    for (const item of list){
      const s = score(hayIndex(item), qTokens);
      if (s > bestScore){ best = item; bestScore = s; }
    }
    return bestScore > 0 ? best : null;
  }

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const q = (input.value || '').trim();
    if (!q) {
      document.querySelectorAll('.lotCard, .auctionCard').forEach(el => { el.style.display = ''; el.classList.remove('search-hit'); });
      if (msg) msg.textContent = '';
      return;
    }

    const r = filterAuctions(q);
    if (r.lotMatches > 0) return;

    // No auction hits → try retail via index (best match)
    const qTokens = tokensFrom(q);
    const idx = await loadIndex();
    const retail = bestMatch(idx.retail, qTokens);
    if (retail) { location.href = `${retail.url}?q=${encodeURIComponent(q)}`; return; }

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
