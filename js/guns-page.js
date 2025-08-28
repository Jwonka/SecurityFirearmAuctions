document.addEventListener('DOMContentLoaded', () => {
  const gunsCatalog = (window.catalog && window.catalog.guns) || {
    handguns: [
      "images/guns/handguns/9mmGlock.jpg",
      "images/guns/handguns/beretta-handgun-oo2.jpg", 
      "images/guns/handguns/HiPoint9mm.jpg",
      "images/guns/handguns/WaltherPPK.jpg",
      "images/guns/handguns/beretta-handgun-001.jpg",
      "images/guns/handguns/springfield-handgun.jpg",
      "images/guns/handguns/smith-wesson-handgun-001.jpg",
      "images/guns/handguns/taurus-handgun-001.jpg",
    ],
    revolvers: [
      "images/guns/revolvers/38Special.jpg", 
      "images/guns/revolvers/Smith&Wesson9mmRevolver.jpg",
      "images/guns/revolvers/colt-revolver-001.jpg",
    ],
    rifles: [
      "images/guns/rifles/AR-15.jpg",   
      "images/guns/rifles/BarretAR15.jpg", 
      "images/guns/rifles/SpringfieldRifle.jpg",
      "images/guns/rifles/Winchester1895.jpg",
    ],
    shotguns: [
      "images/guns/shotguns/Browning12Ga.jpg",
      "images/guns/shotguns/Remington12Ga.jpg",
    ]
  };

  // Where to render
  const grids = {
    handguns:  document.getElementById('handgunsGrid'),
    revolvers: document.getElementById('revolversGrid'),
    rifles:    document.getElementById('riflesGrid'),
    shotguns:  document.getElementById('shotgunsGrid'),
  };

  // Basic brand detection for nicer alt/title text
  const brandFromPath = (p, fallback) => {
    const s = p.toLowerCase();
    if (s.includes('glock')) return 'Glock';
    if (s.includes('smith-wesson') || s.includes('smith&wesson')) return 'Smith & Wesson';
    if (s.includes('sig') || s.includes('sig-sauer')) return 'SIG Sauer';
    if (s.includes('beretta')) return 'Beretta';
    if (s.includes('springfield')) return 'Springfield Armory';
    if (s.includes('walterppk') || s.includes('walther')) return 'Walther';
    if (s.includes('taurus')) return 'Taurus';
    if (s.includes('hipoint')) return 'Hi-Point';
    if (s.includes('colt')) return 'Colt';
    if (s.includes('barret') || s.includes('barrett')) return 'Barrett';
    if (s.includes('winchester')) return 'Winchester';
    if (s.includes('remington')) return 'Remington';
    if (s.includes('browning')) return 'Browning';
    return fallback;
  };

  const typeLabel = {
    handguns: 'Handgun',
    revolvers: 'Revolver',
    rifles: 'Rifle',
    shotguns: 'Shotgun',
  };

  const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
  const priceFor = (src) => {
    const pmap = window.pricesByPath || {};
    const val = pmap[src];
    return (typeof val === 'number' && !Number.isNaN(val)) ? val : null;
  };

  // Simple card factory
  const createCard = (src, cat) => {
    const brand = brandFromPath(src, cat === 'handguns' ? 'Glock'
                             : cat === 'revolvers' ? 'Smith & Wesson'
                             : cat === 'rifles' ? 'Remington'
                             : 'Remington');
    const alt = `${brand} ${typeLabel[cat].toLowerCase()}`;

    const article = document.createElement('article');
    article.className = 'productCard';

    const media = document.createElement('div');
    media.className = 'productMedia';

    const img = document.createElement('img');
    img.className = 'active';
    img.alt = alt;
    // Assign the src (support & in filenames like "Smith&Wesson...")
    img.src = src;

    // If the image fails, show a neutral placeholder
    img.onerror = () => {
      img.onerror = null;
      img.src =
        "data:image/svg+xml;utf8," +
        encodeURIComponent(
          `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='450'>
             <rect width='100%' height='100%' fill='#222'/>
             <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#aaa' font-size='22'>
               Image unavailable
             </text>
           </svg>`
        );
    };

    media.appendChild(img);

    const body = document.createElement('div');
    body.className = 'productBody';

    const h4 = document.createElement('h4');
    h4.textContent = `${brand} ${typeLabel[cat]}`;

    const price = document.createElement('div');
    price.className = 'price';
    const p = priceFor(src);
    price.textContent = (p != null) ? usd.format(p) : 'Call for price';

    const btn = document.createElement('button');
    btn.className = 'button';
    btn.textContent = 'Add to Cart';
    // (wire up later)

    body.appendChild(h4);
    body.appendChild(price);
    body.appendChild(btn);

    article.appendChild(media);
    article.appendChild(body);

    return article;
  };

  // Render each category
  Object.entries(grids).forEach(([cat, grid]) => {
    if (!grid) return;
    const list = gunsCatalog[cat] || [];
    if (list.length === 0) return;

    const frag = document.createDocumentFragment();
    list.forEach(src => {
      frag.appendChild(createCard(src, cat));
    });
    grid.innerHTML = ''; // clear any placeholders
    grid.appendChild(frag);
  });
});
