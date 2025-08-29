document.addEventListener('DOMContentLoaded', () => {
  const accessoriesCatalog = {
    optics: [
      {
        // Springfield scope (3 images)
        brand: 'Springfield Armory',
        name:  'Rifle Scope',
        images: [
          'images/accessories/optics/springfield-scope-001.jpg',
          'images/accessories/optics/springfield-scope-002.jpg',
          'images/accessories/optics/springfield-scope-003.jpg',
        ],
      },
      {
        // Generic rifle scope set (2 images)
        brand: 'Vortex',
        name:  'Rifle Scope',
        images: [
          'images/accessories/optics/rifle-scope-001.jpg',
          'images/accessories/optics/rifle-scope-002.jpg',
        ],
      },
      {
        // Winchester scope (note: second file has filename typo "scpope")
        brand: 'Winchester',
        name:  'Rifle Scope',
        images: [
          'images/accessories/optics/winchester-scope-001.jpg',
          'images/accessories/optics/winchester-scope-002.jpg',
        ],
      },
    ],
    cases: [
      {
        brand: 'Plano',
        name:  'Handgun Case',
        images: [
          'images/accessories/cases/handgun-case-001.jpg',
        ],
      },
      {
        brand: 'Winchester',
        name:  'Rifle Case',
        images: [
          'images/accessories/cases/winchester-case.jpg',
        ],
      },
    ],
    misc: [
      {
        brand: 'Springfield Armory',
        name:  'Rifle Sling',
        images: [
          'images/accessories/misc/springfield-sling-001.jpg',
          'images/accessories/misc/springfield-sling-002.jpg',
        ],
      },
      {
        brand: 'Smith & Wesson',
        name:  'Adjustable Stock',
        images: [
          'images/accessories/misc/smith-wesson-stock-001.jpg',
        ],
      },
    ],
  };

  // ----- DOM helpers -----
  const usd = new Intl.NumberFormat('en-US',{ style:'currency', currency:'USD' });

  function priceFor(src){
    const map = window.pricesByPath || {};
    if (typeof map[src] === 'number') return usd.format(map[src]);

    // Allow -002/-003 lookups to fall back to -001
    const dot = src.lastIndexOf('.');
    const ext = src.slice(dot);
    let stem = src.slice(0, dot);
    stem = stem.replace(/-(?:00[2-9]|0?[2-9]|[1-9]\d{2,})$/, '-001');
    const candidate = stem + ext;
    if (typeof map[candidate] === 'number') return usd.format(map[candidate]);

    return 'Call for price';
  }

  function el(tag, attrs={}, ...kids){
    const n = document.createElement(tag);
    for (const [k,v] of Object.entries(attrs)){
      if (k === 'class') n.className = v;
      else if (k === 'dataset') Object.assign(n.dataset, v);
      else n.setAttribute(k, v);
    }
    for (const k of kids) if (k) n.append(k);
    return n;
  }

  function makeCard({ brand, name, images }){
    const displayName = `${brand} ${name}`.trim();
    const id = images[0]; 

    const article = el('article', { class:'productCard', dataset:{ name: displayName.toLowerCase() } });

    // media (multiple images so retail-media.js will auto-rotate)
    const media = el('div', { class:'productMedia' });
    images.forEach((src, i) => media.append(el('img', { src, alt: displayName, class: i===0 ? 'active' : '' })));
    article.append(media);

    // controls under the image, only if 2+ images exist
    if (images.length > 1) {
      article.append(
        el('div', { class:'productControls' },
          el('button', { class:'arrowBtn prev', 'aria-label':'Previous image' }, '◀'),
          el('button', { class:'arrowBtn next', 'aria-label':'Next image' }, '▶'),
        )
      );
    }

    // body
    const body  = el('div', { class:'productBody' });
    const h4    = el('h4', {}, displayName);
    const price = el('div', { class:'price' }, priceFor(id));
    const stock = el('div', { class:'stock' });
    const btn   = el('button', { class:'button' }, 'Add to Cart');

    body.append(h4, price, stock, btn);
    article.append(body);

    // availability UI
    function applyAvailability(){
      const onHand = window.inventory?.get?.(id) ?? 0;
      stock.textContent = `In stock: ${onHand}`;
      btn.disabled = onHand <= 0;
      btn.textContent = onHand <= 0 ? 'Out of stock' : 'Add to Cart';
    }
    applyAvailability();
    article.__applyAvailability = applyAvailability;

    // add-to-cart
    btn.addEventListener('click', () => {
      const priceNum = (window.pricesByPath && typeof window.pricesByPath[id] === 'number')
        ? window.pricesByPath[id] : 0;
      const added = window.demoCart?.add?.({ id, name: displayName, price: priceNum, qty: 1 }) ?? 0;
      applyAvailability();
      if (added > 0) {
        btn.textContent = 'Added';
        setTimeout(() => { if (!btn.disabled) btn.textContent = 'Add to Cart'; }, 900);
      }
    });

    return article;
  }

  function renderGrid(gridId, items){
    const grid = document.getElementById(gridId);
    if (!grid) return;
    grid.innerHTML = '';
    items.forEach(it => grid.append(makeCard(it)));
  }

  // ----- Seed inventory for this page -----
  const allIds = Object.values(accessoriesCatalog)
    .flat()
    .map(item => item.images?.[0])
    .filter(Boolean);
  window.inventory?.ensure?.(allIds);

  // ----- Render -----
  renderGrid('opticsGrid', accessoriesCatalog.optics);
  renderGrid('casesGrid',  accessoriesCatalog.cases);
  renderGrid('miscGrid',   accessoriesCatalog.misc);

  // ----- Restock (demo) just for this page -----
  document.getElementById('restockDemo')?.addEventListener('click', () => {
    const ids = allIds.slice(); 
    window.inventory.restockRandom(ids, 2, 6);
    document.querySelectorAll('.productCard').forEach(c => c.__applyAvailability?.());
  });

  // keep stock labels fresh across tabs
  function refreshAll(){ document.querySelectorAll('.productCard').forEach(c => c.__applyAvailability?.()); }
  window.addEventListener('pageshow', refreshAll);
  window.addEventListener('storage', (e) => { if (e.key === 'demo_cart' || e.key === 'demo_inventory') refreshAll(); });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') refreshAll(); });
});
