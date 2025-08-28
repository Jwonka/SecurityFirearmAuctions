document.addEventListener('DOMContentLoaded', () => {
  /* ---------- HERO (gavel) every 5s ---------- */
  const heroImgs = document.querySelectorAll('.heroSlide');
  if (heroImgs.length > 1) {
    let i = 0;
    setInterval(() => {
      heroImgs[i].classList.remove('active');
      i = (i + 1) % heroImgs.length;
      heroImgs[i].classList.add('active');
    }, 5000);
  }

  /* ---------- Normalizer for search text ---------- */
  const norm = s => (s||'')
    .toLowerCase()
    .replace(/&amp;/g, '&')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

  /* ---------- Lot carousels (5s, pause on hover, ◀ ▶) ---------- */
  const timers = new Map();

  function show(mediaEl, explicitIndex = null) {
    const imgs = mediaEl.querySelectorAll('img');
    if (!imgs.length) return;
    const cur  = [...imgs].findIndex(img => img.classList.contains('active'));
    const next = explicitIndex != null ? explicitIndex : (cur + 1) % imgs.length;
    imgs.forEach((img, k) => img.classList.toggle('active', k === next));
  }
  function start(mediaEl){ stop(mediaEl); timers.set(mediaEl, setInterval(() => show(mediaEl), 5000)); }
  function stop(mediaEl){ const t = timers.get(mediaEl); if (t){ clearInterval(t); timers.delete(mediaEl); } }

  document.querySelectorAll('.lotMedia').forEach(media => {
    start(media);
    media.addEventListener('mouseenter', () => stop(media));
    media.addEventListener('mouseleave', () => start(media));
  });

  document.addEventListener('click', (e) => {
    const prev = e.target.closest('.lotPrev');
    const next = e.target.closest('.lotNext');
    if (!prev && !next) return;
    const card  = (prev || next).closest('.lotCard');
    const media = card?.querySelector('.lotMedia');
    if (!media) return;
    const imgs = media.querySelectorAll('img');
    const cur  = [...imgs].findIndex(img => img.classList.contains('active'));
    const n    = prev ? (cur - 1 + imgs.length) % imgs.length : (cur + 1) % imgs.length;
    show(media, n);
  });

  /* ---------- Search & cross-page behavior ---------- */
  const form  = document.getElementById('auctionSearch');
  const input = document.getElementById('auctionSearchInput');
  const msg   = document.getElementById('auctionSearchMsg');

  function clearFilter(){
    document.querySelectorAll('.auctionCard').forEach(card => {
      card.style.display = '';
      card.querySelectorAll('.lotCard').forEach(l => {
        l.style.display = '';
        l.classList.remove('search-hit');
      });
    });
    if (msg) msg.textContent = '';
  }

  function filterAuctions(q){
    const qn = norm(q);
    let lotMatches = 0, auctionMatches = 0;
    let firstHit = null;

    document.querySelectorAll('.auctionCard').forEach(card => {
      let any = false;
      card.querySelectorAll('.lotCard').forEach(lot => {
        const name = norm(lot.dataset.name || lot.querySelector('h4')?.textContent);
        const desc = norm(lot.querySelector('.lotBody p')?.textContent);
        const hit  = name.includes(qn) || desc.includes(qn);
        lot.style.display = hit ? '' : 'none';
        lot.classList.toggle('search-hit', hit);
        if (hit) { any = true; lotMatches++; if (!firstHit) firstHit = lot; }
      });
      card.style.display = any ? '' : 'none';
      if (any) auctionMatches++;
    });

    if (firstHit) firstHit.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return { lotMatches, auctionMatches };
  }

  async function hasRetailMatch(q){
    try{
      const res  = await fetch('index.html', { cache:'no-store' });
      const html = norm(await res.text());
      return html.includes(norm(q));
    }catch{ return false; }
  }

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const q = (input.value || '').trim();
    if (!q) { clearFilter(); return; }

    const r = filterAuctions(q);
    if (msg) {
      msg.textContent = r.lotMatches
        ? `Showing ${r.lotMatches} lot${r.lotMatches>1?'s':''} in ${r.auctionMatches} auction${r.auctionMatches>1?'s':''}.`
        : 'No auction matches.';
    }

    // Only jump to retail if there were zero local matches
    if (!r.lotMatches) {
      if (await hasRetailMatch(q)) {
        location.href = `index.html?q=${encodeURIComponent(q)}`;
      } else {
        if (msg) msg.textContent = 'No matches found in auctions or retail.';
      }
    }
  });

  document.getElementById('auctionClear')?.addEventListener('click', () => {
    input.value = '';
    clearFilter();
  });

  // Apply ?q=... on load
  const qParam = new URLSearchParams(location.search).get('q');
  if (qParam) {
    input.value = qParam;
    const r = filterAuctions(qParam);
    if (msg) {
      msg.textContent = r.lotMatches
        ? `Showing ${r.lotMatches} lot${r.lotMatches>1?'s':''} in ${r.auctionMatches} auction${r.auctionMatches>1?'s':''}.`
        : 'No auction matches.';
    }
  }
});
