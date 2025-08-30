document.addEventListener('DOMContentLoaded', () => {
  const form  = document.getElementById('siteSearch');
  const input = document.getElementById('searchInput');
  const msg   = document.getElementById('searchMsg');
  const getName = (el) => el?.dataset?.name || el.querySelector('h3')?.textContent || '';
  const getDesc = (el) => el.querySelector('.blurb')?.textContent || el.querySelector('p')?.textContent || '';
  
  function focusCard(card, text){
    document.querySelectorAll('.productCard, .gallery').forEach(c => {
      const hit = c === card;
      c.style.display = hit ? '' : 'none';
      c.classList.toggle('search-hit', hit);
    });
    if (msg) msg.textContent = text || '';
    card.scrollIntoView({ behavior:'smooth', block:'center' });
  }
  
  if (!form) return;

  // ---------- Normalize / tokens / helpers ----------
  const STOP = new Set(['and','the','for','of','to','a','&']);
  const TYPO = { browing:'browning', browin:'browning', smithh:'smith', smiht:'smith', smih:'smith', smtih:'smith', wessn:'wesson' };
  const norm = s => (s||'').toLowerCase().replace(/&amp;/g,'&').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
  const fixTypos = qn => qn.split(' ').map(w => TYPO[w] || w).join(' ');
  const tokensFrom = q => fixTypos(norm(q)).split(' ').filter(t => t && !STOP.has(t));
  const isIndex = () => !document.querySelector('.productCard:not(.categoryCard)');

  async function waitForProductsStable(timeoutMs = 5000){
    const t0 = performance.now();
    let lastCount = -1, stable = 0;
    return new Promise(resolve => {
      (function tick(){
        const count = document.querySelectorAll('.productCard, .gallery').length;
        if (count > 0 && count === lastCount) stable++; else stable = 0;
        lastCount = count;
        if (stable >= 2) return resolve(true); // 2 consecutive frames equal
        if (performance.now() - t0 > timeoutMs) return resolve(false);
        requestAnimationFrame(tick);
      })();
    });
  }

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

  // Weighted scoring so "rifle scope" prefers optics, not ammo.
  const OPTICS_HINTS = new Set(['scope','scopes','optic','optics','sight','sights','holo','holographic','red','dot']);
  const AMMO_HINTS   = new Set(['ammo','luger','acp','nato','gauge','shotgun','win','magnum','rimfire','fmj','jhp','grain','gr','round','rounds','box','boxes','cartridge','cartridges','shell','shells','buckshot','birdshot','shot']);
  const GUNS_HINTS   = new Set(['glock','smith','wesson','beretta','springfield','walther','taurus','colt','barrett','winchester','mp','m1a','rec7','revolver','handgun','pistol','rifle','shotgun']);

  const baseScore = (text, qTokens) => qTokens.reduce((s,t)=> s + ((t.length>=3 && text.includes(t)) ? 1 : 0), 0);
  function categoryBoost(item, qTokens){
    const url = (item.url || '').toLowerCase();
    let boost = 0;
    const has = (set) => qTokens.some(t => set.has(t));
    if (url.includes('accessories.html#optics')) {
      if (has(OPTICS_HINTS)) boost += 3;
      if (qTokens.includes('rifle')) boost += 1;
    }
    if (url.includes('ammo.html')) {
      if (has(AMMO_HINTS)) boost += 2;
      if (qTokens.includes('rifle')) boost += 1;
    }
    if (url.includes('guns.html')) {
      if (has(GUNS_HINTS)) boost += 2;
    }
    return boost;
  }
  
  function bestMatch(list, qTokens){
    let best = null, bestScore = -1;
    for (const item of list){
      const text  = hayIndex(item);
      const score = baseScore(text, qTokens) + categoryBoost(item, qTokens);
      if (score > bestScore){ best = item; bestScore = score; }
    }
    return bestScore > 0 ? best : null;
  }
  
  const findRetailBest  = async (qTokens) => bestMatch((await loadIndex()).retail,  qTokens);
  const findAuctionBest = async (qTokens) => bestMatch((await loadIndex()).auctions,qTokens);

  function categoryFrom(q){
    const s = norm(fixTypos(q));
    if (/\b(handgun|handguns|pistol|pistols)\b/.test(s)) return 'handguns';
    if (/\b(revolver|revolvers)\b/.test(s)) return 'revolvers';
    if (/\b(rifle|rifles)\b/.test(s)) return 'rifles';
    if (/\b(shotgun|shotguns)\b/.test(s)) return 'shotguns';
    return null;
  }
  
  function revealCategory(cat){
    const grid = document.querySelector(`.productGrid[data-category="${cat}"], #${cat}Grid`);
    if (!grid) return false; // <— IMPORTANT: do nothing if that grid doesn't exist on this page
  
    // Hide every product grid + title
    document.querySelectorAll('.productGrid').forEach(g => g.style.display = 'none');
    document.querySelectorAll('.categoryTitle').forEach(t => t.style.display = 'none');
  
    // Show the chosen grid + its title <h3 id="handguns" ...>
    grid.style.display = '';
    const title = document.getElementById(cat);
    if (title) title.style.display = '';
  
    // Mark its cards as “hits”
    document.querySelectorAll('.productCard, .gallery').forEach(c => c.classList.remove('search-hit'));
    grid.querySelectorAll('.productCard').forEach(c => c.classList.add('search-hit'));
  
    grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (msg) msg.textContent = `Showing ${cat.charAt(0).toUpperCase()+cat.slice(1)}.`;
    return true;
  }

  function ammoBucketFrom(q){
    const s = norm(fixTypos(q));
    // shotgun first (so “12 gauge” doesn’t fall into rifle)
    if (/\b(12 ?g|12 ?ga|20 ?g|20 ?ga|410|gauge|shotgun|shell|buckshot|birdshot|shot)\b/.test(s)) return 'shotgun';
    if (/\b(556|5 56|223|308|7 ?62|7\.?62|30 06|30 30|300|creedmoor|6 5|243|270|rimfire|22 lr|22lr|22)\b/.test(s)) return 'rifle';
    if (/\b(9mm|9x19|10mm|40|45|acp|380|357|38|44|luger|handgun|pistol)\b/.test(s)) return 'handgun';
    return null;
  }
 
  function revealAmmoBucket(bucket){
    const idMap    = { handgun:'handgunAmmoGrid', rifle:'rifleAmmoGrid', shotgun:'shotgunAmmoGrid' };
    const titleMap = { handgun:'handgun-ammo',    rifle:'rifle-ammo',    shotgun:'shotgun-ammo'    };
    const grid = document.getElementById(idMap[bucket]);
    if (!grid) return false;
  
    document.querySelectorAll('.productGrid').forEach(g => g.style.display = 'none');
    document.querySelectorAll('.categoryTitle').forEach(t => t.style.display = 'none');
  
    grid.style.display = '';
    const titleEl = document.getElementById(titleMap[bucket]);
    if (titleEl) titleEl.style.display = '';
  
    grid.scrollIntoView({ behavior:'smooth', block:'start' });
    return true;
  }

  // ---------- Local retail filter (ANY-token match, len>=3) ----------
  function runLocalRetailSearch(q) {
    const qn = norm(fixTypos(q));
    const page = location.pathname.split('/').pop().toLowerCase();
  
    // Section-level intent first
    if (page === 'guns.html') {
      const cat = categoryFrom(q);
      if (cat && revealCategory(cat)) { return Infinity; }
    }
    if (page === 'ammo.html') {
      const bucket = ammoBucketFrom(q);
      if (bucket && revealAmmoBucket(bucket)) { return Infinity; }
    }
  
    // Card-level filter
    const cards = [...document.querySelectorAll('.productCard:not(.categoryCard), .gallery')];
    if (!cards.length) return 0;
  
    const exact = cards.filter(c => norm(getName(c)) === qn);
    const pool  = exact.length ? exact : cards.filter(c => {
          const hay = norm(`${getName(c)} ${getDesc(c)}`);
          return hay.includes(qn);
    });
  
    if (pool.length === 1) { focusCard(pool[0], `Showing 1 product: “${getName(pool[0])}”`); return 1; }
    if (pool.length > 1) {
      cards.forEach(c => {
        const hay = norm(`${getName(c)} ${getDesc(c)}`);
        const hit = hay.includes(qn);
        c.style.display = hit ? '' : 'none';
        c.classList.toggle('search-hit', hit);
      });
      if (msg) msg.textContent = `Found ${pool.length} products.`;
      return pool.length;
    }
    return 0;
  }

  // ---------- Robust "apply ?q=" after redirect ----------
  (async () => {
    const qParam = new URLSearchParams(location.search).get('q');
    if (!qParam) return;
    input.value = qParam;
  
    // determine page by filename, not DOM
    const page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  
    // On the homepage, just submit so the routing rules run
    if (page === '' || page === 'index.html') {
      form.dispatchEvent(new Event('submit'));
      return;
    }
  
    // On product pages (guns/ammo/accessories), keep trying until cards exist, then filter
    for (let i = 0; i < 30; i++) {              // ~3.6s at 120ms steps
      const cardsExist = document.querySelectorAll('.productCard, .gallery').length > 0;
      if (cardsExist) {
        const n = runLocalRetailSearch(qParam); // will also do the ammo/guns category jumps
        // If we got any hits (or took the category shortcut), stop.
        if (n === Infinity || n > 0) break;
      }
      await new Promise(r => setTimeout(r, 120));
    }
  })();
  
  // ---------- Submit ----------
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const q = (input.value || '').trim();
    if (!q) {
      showAll(); 
      return;
    }

    // 1) Try local (for product pages)
    const localHits = runLocalRetailSearch(q);
    if (localHits > 0) return;

    // 2) INTENT ROUTING (hard rules)
    const qTokens = tokensFrom(q);
    const T = new Set(qTokens);
    const has = (w) => T.has(w);

    // Obvious ammo intent?
    const wantsAmmoMarkers = [
      'ammo','round','rounds','box','boxes','fmj','jhp','hollow','grain','gr',
      'reload','cartridge','cartridges','shell','shells','buckshot','birdshot','shot'
    ].some(w => T.has(w));

    // Determine ammo bucket if needed
    function ammoBucket(tokens){
      const s = tokens.join(' ');
      const hasAny = list => list.some(w => s.includes(w));
      if (hasAny(['12g','12ga','12 gauge','20g','20ga','20 gauge','410','410g','410ga','gauge','buckshot','birdshot','shotgun','shell','shells']))
        return 'shotgun-ammo';
      if (hasAny(['556','5 56','223','308','7 62','762','7.62','30 06','30 30','300','creedmoor','6 5','243','270','rimfire','22 lr','22lr','22']))
        return 'rifle-ammo';
      if (hasAny(['9mm','9x19','10mm','40','45','acp','380','357','38','44','luger','handgun','pistol']))
        return 'handgun-ammo';
      return null;
    }

    // Accessories fast paths
    if (['scope','scopes','optic','optics','sight','sights','holo','holographic','red','dot'].some(has)) {
      location.href = `accessories.html?q=${encodeURIComponent(q)}#optics`;
      return;
    }
    if (['case','cases'].some(has)) {
      location.href = `accessories.html?q=${encodeURIComponent(q)}#cases`;
      return;
    }

    const AMMO_BRANDS = new Set(['fiocchi','federal','winchester','remington','hornady','cci','blazer','magtech','aguila','geco','sellier','bellot','s&b','ppu','prvi','sig','sauer','nosler','black','hills','barnes','wolf','tula']);
    const GUN_BRANDS  = new Set(['glock','smith','wesson','s&w','beretta','springfield','walther','taurus','colt','barrett','winchester','remington','browning','ruger','fn','savage','mossberg','marlin','hk','h&k','dan','wesson']);
    
    if ([...T].some(t => AMMO_BRANDS.has(t))) {
      location.href = `ammo.html?q=${encodeURIComponent(q)}`; 
      return;
    }
    if ([...T].some(t => GUN_BRANDS.has(t))) {
      location.href = `guns.html?q=${encodeURIComponent(q)}`; 
      return;
    }

    // Ammo intent → right ammo section
    if (wantsAmmoMarkers) {
      const bucket = ammoBucket(qTokens);
      if (bucket) {
        location.href = `ammo.html?q=${encodeURIComponent(q)}#${bucket}`;
        return;
      }
    }

    // category words go to GUNS, not ammo
    if (has('rifle') || has('rifles'))   { location.href = `guns.html?q=${encodeURIComponent(q)}#rifles`;   return; }
    if (has('shotgun') || has('shotguns')) { location.href = `guns.html?q=${encodeURIComponent(q)}#shotguns`; return; }
    if (has('revolver') || has('revolvers')) { location.href = `guns.html?q=${encodeURIComponent(q)}#revolvers`; return; }
    if (has('handgun') || has('handguns') || has('pistol') || has('pistols')) {
      location.href = `guns.html?q=${encodeURIComponent(q)}#handguns`;
      return;
    }

    // 3) Global index — retail first, then auctions (weighted)
    const retail  = await findRetailBest(qTokens);
    if (retail) { location.href = `${retail.url}?q=${encodeURIComponent(q)}`; return; }

    const auction = await findAuctionBest(qTokens);
    if (auction) { location.href = `${auction.url}?q=${encodeURIComponent(q)}`; return; }

    if (msg) msg.textContent = 'No matches found in retail or auctions.';
  });

  function showAll() {
    // show all product cards/galleries
    document.querySelectorAll('.productCard:not(.categoryCard), .gallery').forEach(c => {
      c.style.display = '';
      c.classList.remove('search-hit');
    });
    // NEW: also un-hide entire grids & their headings if we hid them for category terms
    document.querySelectorAll('.productGrid, .categoryTitle').forEach(el => { el.style.display = ''; });
    if (msg) msg.textContent = '';
  }

  // ---------- Clear ----------
  document.getElementById('clearSearch')?.addEventListener('click', () => {
    input.value = '';
    showAll();
  });
});
