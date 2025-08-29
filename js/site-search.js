document.addEventListener('DOMContentLoaded', () => {
  const form  = document.getElementById('siteSearch');
  const input = document.getElementById('searchInput');
  const msg   = document.getElementById('searchMsg');
  if (!form) return;

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
  const hayOf = (el) => norm(
    (el.dataset.name || '') + ' ' +
    (el.querySelector('h3')?.textContent || '') + ' ' +
    (el.querySelector('.blurb')?.textContent || el.querySelector('p')?.textContent || '') + ' ' +
    (el.querySelector('.addToCart')?.dataset?.name || '') + ' ' +
    (el.querySelector('img')?.getAttribute('alt') || '')
  );

  // ---------- Global search index ----------
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
  async function findRetailBest(qTokens){
    const idx = await loadIndex();
    return bestMatch(idx.retail, qTokens);
  }
  async function findAuctionBest(qTokens){
    const idx = await loadIndex();
    return bestMatch(idx.auctions, qTokens);
  }

  // ---------- Local retail filter (ANY-token match, len>=3) ----------
  function runLocalRetailSearch(q){
    const cards = [...document.querySelectorAll('.productCard:not(.categoryCard), .gallery')];
    if (!cards.length) return 0;

    const qTokens = tokensFrom(q);
    const hits = [];
    cards.forEach(c => {
      const hit = score(hayOf(c), qTokens) > 0;
      c.style.display = hit ? '' : 'none';
      c.classList.toggle('search-hit', hit);
      if (hit) hits.push(c);
    });
    if (msg) {
      msg.textContent = hits.length
        ? `Found ${hits.length} product${hits.length > 1 ? 's' : ''}.`
        : 'No local matches.';
    }
    return hits.length;
  }

  // Wait until products exist (for redirects with ?q=...)
  function waitForProducts(timeoutMs = 4000){
    return new Promise(resolve => {
      const start = performance.now();
      const check = () => {
        if (document.querySelector('.productCard, .gallery')) return resolve(true);
        if (performance.now() - start > timeoutMs) return resolve(false);
        requestAnimationFrame(check);
      };
      check();
    });
  }

  // ---------- Submit ----------
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const q = (input.value || '').trim();
    if (!q) {
      document.querySelectorAll('.productCard:not(.categoryCard), .gallery').forEach(c => {
        c.style.display = ''; c.classList.remove('search-hit');
      });
      if (msg) msg.textContent = '';
      return;
    }

    // 1) Try local (works on retail pages that show products)
    const localHits = runLocalRetailSearch(q);
    if (localHits > 0) return;

    // 2) Use global index — retail first, then auctions
    const qTokens = tokensFrom(q);
    const retail = await findRetailBest(qTokens);
    if (retail) { location.href = `${retail.url}?q=${encodeURIComponent(q)}`; return; }

    const auction = await findAuctionBest(qTokens);
    if (auction) { location.href = `${auction.url}?q=${encodeURIComponent(q)}`; return; }

    if (msg) msg.textContent = 'No matches found in retail or auctions.';
  });

  // ---------- Clear ----------
  document.getElementById('clearSearch')?.addEventListener('click', () => {
    input.value = '';
    document.querySelectorAll('.productCard:not(.categoryCard), .gallery').forEach(c => {
      c.style.display = ''; c.classList.remove('search-hit');
    });
    if (msg) msg.textContent = '';
  });

  // ---------- Apply ?q on load (AFTER products render) ----------
  (async () => {
    const qParam = new URLSearchParams(location.search).get('q');
    if (!qParam) return;
    input && (input.value = qParam);
    await waitForProducts(4000);
    runLocalRetailSearch(qParam);
  })();
});
