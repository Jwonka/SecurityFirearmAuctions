document.addEventListener('DOMContentLoaded', () => {
  // Catalog (base images). Rotation will look for -002/-003/-004 siblings.
  const gunsCatalog = (window.catalog && window.catalog.guns) || {
    handguns: [
      "images/guns/handguns/9mmGlock-001.jpg",
      "images/guns/handguns/HiPoint9mm-001.jpg",
      "images/guns/handguns/WaltherPPK-001.jpg",
      "images/guns/handguns/beretta-9mm-001.jpg",
      "images/guns/handguns/springfield-handgun-001.jpg",
      "images/guns/handguns/smith-wesson-9mm-001.jpg",
      "images/guns/handguns/taurus-10mm-001.jpg",
    ],
    revolvers: [
      "images/guns/revolvers/38Special-001.jpg",
      "images/guns/revolvers/smith-wesson-revolver-9mm-001.jpg",
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

  function leftFor(id){
    const stock  = window.inventory?.get?.(id) ?? 0;
    const inCart = window.demoCart?.count?.(id) ?? 0;
    return Math.max(0, stock - inCart);
  }

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

  function modelFor(brand, cat, src) {
    const s = src.toLowerCase();
  
    // Handguns
    if (brand === 'Glock') return '17';
    if (brand === 'Hi-Point') return 'C9';
    if (brand === 'Walther') return 'PPK';
    if (brand === 'Beretta') return '92FS';
    if (brand === 'Springfield Armory' && cat === 'handguns') return 'XD-M';
    if (brand === 'Smith & Wesson' && cat === 'handguns') return 'M&P9';
    if (brand === 'Taurus') return 'G3c';
  
    // Revolvers
    if (brand === 'Smith & Wesson' && cat === 'revolvers') {
      if (s.includes('9mm')) return '986';  // S&W 9mm revolver (PC 986)
      return '686';
    }
    if (brand === 'Colt' && cat === 'revolvers') return 'Python';
  
    // Rifles
    if (brand === 'Smith & Wesson' && cat === 'rifles') return 'M&P15';
    if (brand === 'Barrett') return 'REC7';
    if (brand === 'Springfield Armory' && cat === 'rifles') return 'M1A';
    if (brand === 'Winchester') return 'Model 1895';
  
    // Shotguns
    if (brand === 'Browning') return 'A5';
    if (brand === 'Remington') return '870';
  
    // Fallback
    return '';
  }

  const usd = new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'});
  function priceFor(src){
    const map = window.pricesByPath || {};
    if (typeof map[src] === 'number') return usd.format(map[src]);
    // Map foo-002.jpg → foo-001.jpg for price lookup
    const dot = src.lastIndexOf('.');
    const ext = src.slice(dot);
    let stem = src.slice(0, dot);
    stem = stem.replace(/-(?:00[2-9]|0?[2-9]|[1-9]\d{2,})$/, '-001'); // 002+ → 001
    const candidate = stem + ext;
    if (typeof map[candidate] === 'number') return usd.format(map[candidate]);
    return 'Call for price';
  }

  // Pre-seed stock (1–5) (use image path as id)
  const allIds = Object.values(gunsCatalog).flat();
  window.inventory?.ensure?.(allIds);

  // Stock-aware cart shim (only if not already provided elsewhere)
  (function ensureCart() {
    const KEY = 'demo_cart';
    if (!window.demoCart) window.demoCart = {};
    
    const get = window.demoCart._get || (() => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } });
    const set = window.demoCart._set || (arr => localStorage.setItem(KEY, JSON.stringify(arr)));
    
    window.demoCart.count = window.demoCart.count || function(id){ const it = get().find(i => i.id === id); return it ? it.qty : 0; };
    if (!window.demoCart.add) {
      window.demoCart.add = function(item){
        // item = { id, name, price, qty }
        const cart = get();
        const found = cart.find(i => i.id === item.id);
  
        // remaining inventory right now
        const remaining = window.inventory?.get?.(item.id);
        const allowCheck = (typeof remaining === 'number');
        const want = Math.max(1, Number(item.qty) || 1);
  
        let addable = want;
        if (allowCheck) {
          if (remaining <= 0) { alert('Sorry, this item is out of stock.'); return 0; }
          addable = Math.min(remaining, want);
        }
  
        if (found) found.qty += addable;
        else cart.push({ id: item.id, name: item.name, price: Number(item.price) || 0, qty: addable });
  
        set(cart);
  
        // Decrement inventory here so UI updates immediately
        if (allowCheck && window.inventory?.set) {
          window.inventory.set(item.id, remaining - addable);
        }
  
        if (addable < want) alert(`Only ${allowCheck ? remaining : 0} in stock. Added ${addable}.`);
        return addable;
      };
    }
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

    const model = modelFor(brand, cat, src);
    const name = model ? `${brand} ${model}` : brand;

    const article = document.createElement('article');
    article.className = 'productCard';
    article.dataset.id = src;
    article.dataset.name = name; 

    const media = document.createElement('div'); media.className = 'productMedia';

   (function buildGallery(baseSrc) {
      const dot = baseSrc.lastIndexOf('.');
      const ext = baseSrc.slice(dot);
      const stem = baseSrc.slice(0, dot).replace(/-(?:0*1|001)$/, '');
      const candidates = [`${stem}-001${ext}`, `${stem}-002${ext}`, `${stem}-003${ext}`];

      let first = true;
      candidates.forEach((src, idx) => {
        const im = document.createElement('img');
        im.alt = name;
        im.src = src;
        if (first) { im.classList.add('active'); first = false; }
        im.addEventListener('error', () => im.remove());
        media.appendChild(im);
      });
    })(src);
    
    // add the controls that retail-media.js listens for
    let controls = null;
    if ((media.querySelectorAll('img').length) > 1) {
      controls = document.createElement('div');
      controls.className = 'productControls';
      controls.innerHTML = `
        <button class="arrowBtn prev" aria-label="Previous image">◀</button>
        <button class="arrowBtn next" aria-label="Next image">▶</button>`;
    }

    const body = document.createElement('div'); body.className='productBody';
    const h4 = document.createElement('h4'); h4.textContent = name;
    const priceEl = document.createElement('div'); priceEl.className='price'; priceEl.textContent = priceFor(src);
    const stockEl = document.createElement('div'); stockEl.className='stock';

    const id = src;
    const btn = document.createElement('button'); btn.className='button'; btn.textContent='Add to Cart';
    let bounceTimer = null;

    function applyAvailability(){
      const stock = window.inventory?.get?.(id) ?? 0;
      stockEl.textContent = `In stock: ${stock}`;
      if (stock <= 0) { 
        if (bounceTimer) { clearTimeout(bounceTimer); bounceTimer = null; }
        btn.disabled = true; 
        btn.textContent = 'Out of stock'; 
      } else { 
        btn.disabled = false; 
        btn.textContent = 'Add to Cart'; 
      }
    }

    btn.addEventListener('click', () => {
      if (bounceTimer) { clearTimeout(bounceTimer); bounceTimer = null; }
      const priceNum = (window.pricesByPath && typeof window.pricesByPath[id] === 'number')
        ? window.pricesByPath[id] : 0;

      const added = window.demoCart.add({ id, name: name, price: priceNum, qty: 1 });
      
      applyAvailability();
      const remaining = window.inventory?.get?.(id) ?? 0;
      
      if (added > 0 && remaining > 0 && !btn.disabled) { 
        btn.textContent = 'Added';
        bounceTimer = setTimeout(() => {
          const leftNow = window.inventory?.get?.(id) ?? 0;
          if (leftNow > 0 && !btn.disabled) btn.textContent = 'Add to Cart';
        }, 800);
      }
    });

    body.appendChild(h4); 
    body.appendChild(priceEl); 
    body.appendChild(stockEl); 
    body.appendChild(btn);
    article.append(media);
    if (controls) article.append(controls);
    article.append(body);

    // expose updater for global refresh
    article.__applyAvailability = applyAvailability;
    return article;
  }

  // Render all categories
  Object.entries(grids).forEach(([cat, grid]) => {
    if (!grid) return;
    const list = gunsCatalog[cat] || [];
    const frag = document.createDocumentFragment();
    list.forEach(src => frag.appendChild(createCard(src, cat)));
    grid.innerHTML = ''; grid.appendChild(frag);
  });

  // Refresh availability when coming back, storage changes, or tab visible
  function refreshAllAvailability(){
    document.querySelectorAll('.productCard').forEach(card => {
      card.__applyAvailability?.();
    });
  }

  document.getElementById('restockDemo')?.addEventListener('click', () => {
    const ids = Object.values(gunsCatalog).flat();
    window.inventory.restockRandom(ids, 2, 6);
    document.querySelectorAll('.productCard').forEach(c => c.__applyAvailability?.());
  });
  
  window.addEventListener('pageshow', refreshAllAvailability);
  window.addEventListener('storage', (e) => { if (e.key === 'demo_cart') refreshAllAvailability(); });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') refreshAllAvailability();
  });
});
