document.addEventListener('DOMContentLoaded', () => {
  // -------- Catalog --------
  const ammoCatalog = {
    handgun: [
      { caliber: '9mm Luger',  images: ['images/ammunition/9mm/9mm.jpg','images/ammunition/9mm/9mm-2.jpg'] },
      { caliber: '10mm Auto',  images: ['images/ammunition/10mm/10mm.jpg','images/ammunition/10mm/10mm-2.jpg'] },
      { caliber: '.45 ACP',    images: ['images/ammunition/45ACP/45ACP.jpg','images/ammunition/45ACP/45ACP-2.jpg'] },
      { caliber: '.380 ACP',   images: ['images/ammunition/380ACP/380ACP.jpg','images/ammunition/380ACP/380ACP-2.jpg'] },
    ],
    rifle: [
      { caliber: '5.56 NATO',  images: ['images/ammunition/556/556-1.jpg','images/ammunition/556/556-2.jpg','images/ammunition/556/556-3.jpg'] },
      { caliber: '.308 Win',   images: ['images/ammunition/308/308.jpg','images/ammunition/308/308-2.jpg','images/ammunition/308/308-3.jpg'] },
    ],
    shotgun: [
      { caliber: '12 Gauge',   images: ['images/ammunition/12Gauge/12GaugeShells.jpg'] },
    ]
  };

  // -------- Brand + spec helpers --------
  function brandFor(caliber){
    // Stable “default” brands by caliber (override here anytime)
    if (caliber.includes('5.56')) return 'PMC';
    if (caliber.includes('.308')) return 'Hornady';
    if (caliber.includes('9mm'))  return 'Winchester';
    if (caliber.includes('10mm')) return 'SIG Sauer';
    if (caliber.includes('.45'))  return 'Federal';
    if (caliber.includes('.380')) return 'Remington';
    if (caliber.includes('12 Gauge')) return 'Fiocchi';
    return 'Various';
  }
  function specFor(caliber){
    if (caliber.includes('5.56')) return '55gr FMJ • Brass';
    if (caliber.includes('.308')) return '150gr FMJ • Brass';
    if (caliber.includes('9mm'))  return '115gr FMJ • Brass';
    if (caliber.includes('10mm')) return '180gr FMJ • Brass';
    if (caliber.includes('.45'))  return '230gr FMJ • Brass';
    if (caliber.includes('.380')) return '95gr FMJ • Brass';
    if (caliber.includes('12 Gauge')) return '2¾" target loads';
    return '';
  }

  const usd = new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'});
  function priceFor(src){
    const map = window.pricesByPath || {};
    if (typeof map[src] === 'number') return usd.format(map[src]);
    // Try first image as key if you passed a variant
    const dot = src.lastIndexOf('.');
    const base = dot > 0 ? src.slice(0, dot) : src;
    const candidate = base.replace(/-([23]|0?0[2-9]|\d{2,})$/, '') + (dot>0 ? src.slice(dot) : '');
    if (typeof map[candidate] === 'number') return usd.format(map[candidate]);
    return 'Call for price';
  }

  // Seed inventory once for every image path (id = image path)
  const allIds = Object.values(ammoCatalog).flat().flatMap(it => it.flat ? it : [it])
    .flatMap(item => item.images ? [item.images[0]] : [])
    .filter(Boolean);
  window.inventory?.ensure?.(allIds);

  // -------- DOM helpers --------
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

  function makeCard({ caliber, images }) {
    const brand = brandFor(caliber);
    const name  = `${brand} ${caliber}`;
    const id    = images[0]; // use first image as stable id
  
    const article = el('article', { class: 'productCard', dataset: { name: name.toLowerCase() } });
  
    // --- media (multiple images so retail-media.js can rotate) ---
    const media = el('div', { class: 'productMedia' });
    images.forEach((src, i) => {
      media.append(el('img', { src, alt: name, class: i === 0 ? 'active' : '' }));
    });
  
    // centered arrows UNDER the image, only if 2+ images exist
    let controls = null;
    if (images.length > 1) {
      controls = el('div', { class: 'productControls' },
        el('button', { class: 'arrowBtn prev', 'aria-label': 'Previous image' }, '◀'),
        el('button', { class: 'arrowBtn next', 'aria-label': 'Next image' }, '▶')
      );
    }
  
    // --- body ---
    const body   = el('div', { class: 'productBody' });
    const h4     = el('h4', {}, name);
    const desc   = el('p', { class:'desc' }, specFor(caliber));
    const price  = el('div', { class:'price' }, priceFor(id));
    const stock  = el('div', { class:'stock' });
    const btn    = el('button', { class:'button' }, 'Add to Cart');
  
    body.append(h4, desc, price, stock, btn);
  
    // final order: media → controls → body
    article.append(media);
    if (controls) article.append(controls);
    article.append(body);
  
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
      const priceNum = (window.pricesByPath && typeof window.pricesByPath[id] === 'number') ? window.pricesByPath[id] : 0;
      const added = window.demoCart?.add?.({ id, name, price: priceNum, qty: 1 }) ?? 0;
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
    items.forEach(item => grid.append(makeCard(item)));
  }

  // Render all sections
  renderGrid('handgunAmmoGrid', ammoCatalog.handgun);
  renderGrid('rifleAmmoGrid',   ammoCatalog.rifle);
  renderGrid('shotgunAmmoGrid', ammoCatalog.shotgun);

  document.getElementById('restockDemo')?.addEventListener('click', () => {
    const ids = [
      ...ammoCatalog.handgun.map(i => i.images[0]),
      ...ammoCatalog.rifle.map(i => i.images[0]),
      ...ammoCatalog.shotgun.map(i => i.images[0]),
    ];
    window.inventory.restockRandom(ids, 2, 6);
    document.querySelectorAll('.productCard').forEach(c => c.__applyAvailability?.());
  });
  
  // keep stock labels fresh across tabs
  function refreshAll(){ document.querySelectorAll('.productCard').forEach(c => c.__applyAvailability?.()); }
  window.addEventListener('pageshow', refreshAll);
  window.addEventListener('storage', (e) => { if (e.key === 'demo_cart' || e.key === 'demo_inventory') refreshAll(); });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') refreshAll(); });
});
