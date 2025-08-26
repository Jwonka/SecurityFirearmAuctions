document.addEventListener('DOMContentLoaded', () => {
  const form  = document.getElementById('siteSearch');
  const input = document.getElementById('searchInput');
  const msg   = document.getElementById('searchMsg');

  if (!form) return;

  // Collect product cards (new or legacy)
  const cards = [...document.querySelectorAll('.productCard, .gallery')];

  const cardName = (el) =>
    el.dataset.name?.trim()
    || el.querySelector('h3')?.textContent.trim()
    || el.querySelector('.addToCart')?.dataset.name?.trim()
    || el.querySelector('img')?.getAttribute('alt')?.trim()
    || '';

  const cardDesc = (el) =>
    el.querySelector('.blurb')?.textContent.trim()
    || el.querySelector('p')?.textContent.trim()
    || '';

  const showAll = () => {
    cards.forEach(c => c.style.display = '');
    msg.textContent = '';
    cards.forEach(c => c.classList.remove('search-hit'));
  };

  const focusCard = (card, note='') => {
    cards.forEach(c => {
      c.style.display = (c === card) ? '' : 'none';
      c.classList.toggle('search-hit', c === card);
    });
    if (note) msg.textContent = note;
    card.scrollIntoView({behavior:'smooth', block:'start'});
  };

  // Quick check against the auctions page (static fetch + text search)
  async function hasAuctionMatch(q){
    try{
      const res  = await fetch('auctions.html', {cache:'no-store'});
      const html = (await res.text()).toLowerCase();
      return html.includes(q.toLowerCase());
    }catch(_){
      // If we can’t check, play it safe and say “no match”
      return false;
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const q = (input.value || '').trim();
    if (!q) { showAll(); return; }

    const qLower = q.toLowerCase();

    // Local (products) – look for exact first, then contains
    const exact = cards.filter(c =>
      cardName(c).toLowerCase() === qLower
    );

    const contains = exact.length ? exact : cards.filter(c => {
      const hay = (cardName(c) + ' ' + cardDesc(c)).toLowerCase();
      return hay.includes(qLower);
    });

    if (contains.length === 1){
      focusCard(contains[0], `Showing 1 product: “${cardName(contains[0])}”`);
      // Per your request: if auctions have a match too, go there
      if (await hasAuctionMatch(q)) {
        location.href = `auctions.html?q=${encodeURIComponent(q)}`;
      }
      return;
    }

    if (contains.length > 1){
      // Show all matches locally; still jump to auctions if they also match
      cards.forEach(c => {
        const hay = (cardName(c) + ' ' + cardDesc(c)).toLowerCase();
        c.style.display = hay.includes(qLower) ? '' : 'none';
        c.classList.toggle('search-hit', hay.includes(qLower));
      });
      msg.textContent = `Found ${contains.length} products.`;
      if (await hasAuctionMatch(q)) {
        location.href = `auctions.html?q=${encodeURIComponent(q)}`;
      }
      return;
    }

    // No product matches → only go to auctions if they actually contain it
    if (await hasAuctionMatch(q)) {
      location.href = `auctions.html?q=${encodeURIComponent(q)}`;
    } else {
      msg.textContent = 'No matches found.';
    }
  });
  
  const qParam = new URLSearchParams(location.search).get('q');
  if (qParam) {
    input.value = qParam;
    form.dispatchEvent(new Event('submit')); // reuse the same logic
  }

  document.getElementById('clearSearch')?.addEventListener('click', () => {
    input.value = '';
    showAll();
  });
});
