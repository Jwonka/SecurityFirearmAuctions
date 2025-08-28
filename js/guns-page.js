document.addEventListener('DOMContentLoaded', () => {
  // Catalog (base images). Rotation will look for -002/-003/-004 siblings.
  const gunsCatalog = (window.catalog && window.catalog.guns) || {
    handguns: [
      "images/guns/handguns/9mmGlock.jpg",
      "images/guns/handguns/HiPoint9mm.jpg",
      "images/guns/handguns/WaltherPPK.jpg",
      "images/guns/handguns/beretta-handgun-001.jpg",
      "images/guns/handguns/springfield-handgun001.jpg",
      "images/guns/handguns/smith-wesson-handgun-001.jpg",
      "images/guns/handguns/taurus-handgun-001.jpg",
    ],
    revolvers: [
      "images/guns/revolvers/38Special-001.jpg",
      "images/guns/revolvers/amith-wesson-revolver-9mm-001.jpg",
      "images/guns/revolvers/colt-revolver-001.jpg",
    ],
    rifles: [
      "images/guns/rifles/smith-wesson-rifle-001.jpg",
      "images/guns/rifles/Barret-AR15-001.jpg",
      "images/guns/rifles/SpringfieldRifle-001.jpg",
      "images/guns/rifles/Winchester1895-001.jpg",
    ],
    shotguns: [
      "images/guns/shotguns/Browning12Ga-001.jpg",
      "images/guns/shotguns/Remington12Ga-001.jpg",
    ]
  };

  const grids = {
    handguns:  document.getElementById('handgunsGrid'),
    revolvers: document.getElementById('revolversGrid'),
    rifles:    document.getElementById('riflesGrid'),
    shotguns:  document.getElementById('shotgunsGrid'),
  };

  const brandFromPath = (p, fallback) => {
    const s = p.toLowerCase();
    if (s.includes('glock')) return 'Glock';
    if (s.includes('smith-wesson') || s.includes('smith&wesson')) return 'Smith & Wesson';
    if (s.includes('sig')) return 'SIG Sauer';
    if (s.includes('beretta')) return 'Beretta';
    if (s.includes('springfield')) return 'Springfield Armory';
    if (s.includes('walther')) return 'Walther';
    if (s.includes('hipoint')) return 'Hi-Point';
    if (s.includes('taurus')) return 'Taurus';
    if (s.includes('colt')) return 'Colt';
    if (s.includes('barret') || s.includes('barrett')) return 'Barrett';
    if (s.includes('winchester')) return 'Winchester';
    if (s.includes('remington')) return 'Remington';
    if (s.includes('browning')) return 'Browning';
    return fallback;
  };
  const typeLabel = { handguns:'Handgun', revolvers:'Revolver', rifles:'Rifle', shotguns:'Shotgun' };
  const usd = new Intl.NumberFormat('en-US', { style:'currency', currency:'USD' });
  const priceFor = (src) => {
    const val = (window.pricesByPath || {})[src];
    return (typeof val === 'number' && !Number.isNaN(val)) ? usd.format(val) : 'Call for price';
  };

  // Pre-seed stock (1–5) the first time we see each product id (use image path as id)
  const allIds = Object.values(gunsCatalog).flat();
  window.inventory?.ensure(allIds);

  // Quick cart shim if checkout script isn’t present
  (function ensureCart() {
    if (window.demoCart?.add) return;
    const KEY = 'demo_cart';
    const get = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
    const save = (arr) => localStorage.setItem(KEY, JSON.stringify(arr));
    window.demoCart = {
      add(item) {
        const cart = get();
        const f = cart.find(i => i.id === item.id);
        if (f) f.qty += item.qty || 1;
        else cart.push({ id:item.id, name:item.name, price:Number(item.price)||0, qty:item.qty||1 });
        save(cart);
      }
    };
  })();

  function galleryFor(baseSrc, max=6) {
    const dot = baseSrc.lastIndexOf('.');
    const ext = baseSrc.slice(dot);
    const stem0 = baseSrc.slice(0, dot);
    const m = stem0.match(/(.+?)-(?:0*1|001)$/);
    const stem = m ? m[1] : stem0;

    const candidates = [baseSrc];
    for (let n=2; n<=max; n++) candidates.push(`${stem}-${String(n).padStart(3,'0')}${ext}`);

    return Promise.all(candidates.map(src => new Promise(res => {
      const im = new Image();
      im.onload = () => res(src);
      im.onerror = () => res(null);
      im.src = src;
    }))).then(list => list.filter(Boolean));
  }

  function createCard(src, cat) {
    const brand = brandFromPath(src,
      cat==='handguns' ? 'Glock' :
      cat==='revolvers'? 'Smith & Wesson' :
      cat==='rifles'   ? 'Remington' : 'Remington');

    const article = document.createElement('article');
    article.className = 'productCard';

    const media = document.createElement('div'); media.className = 'productMedia';
    const img = document.createElement('img'); img.className='active';
    img.alt = `${brand} ${typeLabel[cat].toLowerCase()}`; img.src = src;
    media.appendChild(img);

    const body = document.createElement('div'); body.className='productBody';
    const h4 = document.createElement('h4'); h4.textContent = `${brand} ${typeLabel[cat]}`;
    const priceEl = document.createElement('div'); priceEl.className='price'; priceEl.textContent = priceFor(src);
    const stockEl = document.createElement('div'); stockEl.className='stock';

    let stock = window.inventory ? window.inventory.get(src) : 0;
    stockEl.textContent = `In stock: ${stock}`;

    const btn = document.createElement('button'); btn.className='button'; btn.textContent='Add to Cart';
    if (stock <= 0) { btn.disabled = true; btn.textContent = 'Out of stock'; }

    btn.addEventListener('click', () => {
      if (stock <= 0) return;
      const priceNum = (window.pricesByPath && typeof window.pricesByPath[src] === 'number') ? window.pricesByPath[src] : 0;
      window.demoCart.add({ id: src, name: `${brand} ${typeLabel[cat]}`, price: priceNum, qty: 1 });
      // decrement stock
      stock = window.inventory.decrement(src, 1);
      stockEl.textContent = `In stock: ${stock}`;
      if (stock <= 0) { btn.disabled = true; btn.textContent = 'Out of stock'; }
      else { btn.textContent = 'Added'; setTimeout(() => btn.textContent='Add to Cart', 800); }
    });

    body.appendChild(h4); body.appendChild(priceEl); body.appendChild(stockEl); body.appendChild(btn);
    article.appendChild(media); article.appendChild(body);

    // Per-card rotation (own gallery) every 5s
    galleryFor(src, 6).then(gal => {
      if (!gal || gal.length < 2) return;
      let i = 0;
      const tick = () => { i=(i+1)%gal.length; img.style.opacity=0; setTimeout(()=>{ img.src=gal[i]; img.style.opacity=1; },150); };
      let timer = setInterval(tick, 5000);
      media.addEventListener('mouseenter', () => clearInterval(timer));
      media.addEventListener('mouseleave', () => { clearInterval(timer); timer = setInterval(tick, 5000); });
    });

    return article;
  }

  Object.entries(grids).forEach(([cat, grid]) => {
    if (!grid) return;
    const list = gunsCatalog[cat] || [];
    const frag = document.createDocumentFragment();
    list.forEach(src => frag.appendChild(createCard(src, cat)));
    grid.innerHTML = ''; grid.appendChild(frag);
  });
});
