document.addEventListener('DOMContentLoaded', () => {
  const form  = document.getElementById('siteSearch');
  const input = document.getElementById('searchInput');
  const msg   = document.getElementById('searchMsg');
  if (!form) return;

  // Normalize for robust matching
  const norm = s => (s || '')
    .toLowerCase()
    .replace(/&amp;/g, '&')
    .normalize('NFKD').replace(/[\u0300-\u036f]/g, '') // strip accents
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

  // Prefer retail, then auctions
  const RETAIL_PAGES = ['guns.html', 'ammo.html', 'accessories.html'];
  const AUCTIONS_PAGE = 'auctions.html';

  // quick heuristic to skip a couple fetches (still verified by fetch below)
  function guessRetailPage(qn) {
    if (/\b(ammo|9mm|10mm|45|380|acp|luger|nato|556|5 56|308|12 ?g|gauge|shell)\b/.test(qn)) return 'ammo.html';
    if (/\b(scope|optic|red dot|stock|sling|case|holster|mag|magazine|accessor)/.test(qn)) return 'accessories.html';
    if (/\b(gun|pistol|handgun|revolver|rifle|shotgun|glock|smith|wesson|sig|beretta|taurus|springfield|colt|barrett|winchester|remington|browning)\b/.test(qn)) return 'guns.html';
    return null;
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

  async function findRetailMatch(qn) {
    // try a guessed page first (fast path), then the rest
    const guess = guessRetailPage(qn);
    const ordered = guess ? [guess, ...RETAIL_PAGES.filter(p => p !== guess)] : RETAIL_PAGES;
    for (const url of ordered) {
      if (await pageHasQuery(url, qn)) return url;
    }
    return null;
  }

  function clearUI() {
    msg.textContent = '';
    document.querySelectorAll('.productCard').forEach(c => {
      c.style.display = '';
      c.classList.remove('search-hit');
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const q = (input.value || '').trim();
    if (!q) { clearUI(); return; }
    const qn = norm(q);

    // 1) Prefer retail: redirect to the FIRST retail page that contains the term
    const retailUrl = await findRetailMatch(qn);
    if (retailUrl) {
      location.href = `${retailUrl}?q=${encodeURIComponent(q)}`;
      return;
    }

    // 2) If no retail match, try auctions
    if (await pageHasQuery(AUCTIONS_PAGE, qn)) {
      location.href = `${AUCTIONS_PAGE}?q=${encodeURIComponent(q)}`;
      return;
    }

    // 3) Nothing anywhere
    msg.textContent = 'No matches found in retail or auctions.';
  });

  // Auto-apply ?q=... if someone linked here
  const qParam = new URLSearchParams(location.search).get('q');
  if (qParam) {
    input.value = qParam;
    form.dispatchEvent(new Event('submit'));
  }

  document.getElementById('clearSearch')?.addEventListener('click', () => {
    input.value = '';
    clearUI();
  });
});
