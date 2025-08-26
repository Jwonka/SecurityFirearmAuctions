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

  /* ---------- Lot carousels (5s, pause on hover, ◀ ▶) ---------- */
  const timers = new Map();

  function show(mediaEl, explicitIndex = null) {
    const imgs = mediaEl.querySelectorAll('img');
    if (!imgs.length) return;
    const cur  = [...imgs].findIndex(img => img.classList.contains('active'));
    const next = explicitIndex != null ? explicitIndex : (cur + 1) % imgs.length;
    imgs.forEach((img, k) => img.classList.toggle('active', k === next));
    // If the media is a link, keep href pointing at the active image so click opens that frame
    if (mediaEl.tagName === 'A') mediaEl.href = imgs[next].src;
  }
  function start(mediaEl){ stop(mediaEl); timers.set(mediaEl, setInterval(() => show(mediaEl), 5000)); }
  function stop(mediaEl){ const t = timers.get(mediaEl); if (t){ clearInterval(t); timers.delete(mediaEl); } }

  document.querySelectorAll('.lotMedia').forEach(media => {
    if (media.tagName === 'A') {
      const active = media.querySelector('img.active') || media.querySelector('img');
      if (active) media.href = active.src;
    }
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
    const n    = prev ? (cur - 1 + imgs.length) % imgs.length
                      : (cur + 1) % imgs.length;
    show(media, n);
  });

  /* ---------- Search & cross-page behavior ---------- */
  const form  = document.getElementById('auctionSearch');
  const input = document.getElementById('auctionSearchInput');
  const msg   = document.getElementById('auctionSearchMsg');

  function clearFilter(){
    document.querySelectorAll('.auctionCard').forEach(card => {
      card.style.display = '';
      card.querySelectorAll('.lotCard').forEach(l => l.style.display = '');
    });
    if (msg) msg.textContent = '';
  }

  function filterAuctions(q){
    const qLower = q.toLowerCase();
    let lotMatches = 0;
    let auctionMatches = 0;

    document.querySelectorAll('.auctionCard').forEach(card => {
      let any = false;
      const lots = card.querySelectorAll('.lotCard');

      lots.forEach(lot => {
        const name = (lot.dataset.name || lot.querySelector('h4')?.textContent || '').toLowerCase();
        const desc = (lot.querySelector('.lotBody p')?.textContent || '').toLowerCase();
        const hit  = name.includes(qLower) || desc.includes(qLower);
        lot.style.display = hit ? '' : 'none';
        if (hit) { any = true; lotMatches++; }
      });

      card.style.display = any ? '' : 'none';
      if (any) auctionMatches++;
    });

    return { lotMatches, auctionMatches };
  }

  // Check the retail page for a match (for symmetry with index)
  async function hasRetailMatch(q){
    try {
      const res  = await fetch('index.html', { cache: 'no-store' });
      const html = (await res.text()).toLowerCase();
      return html.includes(q.toLowerCase());
    } catch {
      return false;
    }
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

    // If there are zero auction matches but retail has a match, go to retail
    if (!r.lotMatches && await hasRetailMatch(q)) {
      location.href = `index.html?q=${encodeURIComponent(q)}`;
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
    const firstHit = document.querySelector('.lotCard[style=""]') || document.querySelector('.auctionCard[style=""]');
    firstHit?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});
