document.addEventListener('DOMContentLoaded', () => {
  const products = [
    {
      id: 'sku-1911',
      name: 'Colt 1911 (Demo)',
      price: 799.00,
      desc: 'Classic .45 ACP — dependable and iconic.',
      images: ['images/1911-1.jpg','images/1911-2.jpg','images/1911-3.jpg'],
      url:   'images/1911-1.jpg'
    },
    {
      id: 'sku-MandP',
      name: 'Smith & Wesson M&P (Demo)',
      price: 699.00,
      desc: 'Classic 9mm, 5" barrel, 17-rd mag. Includes case & manual. (Demo)',
      images: ['images/MandP-1.jpg','images/MandP-2.jpg','images/MandP-3.jpg'],
      url:   'images/MandP-1.jpg'
    },
    {
      id: 'sku-glock19',
      name: 'Glock 19 (Demo)',
      price: 899.00,
      desc: 'Versatile 9mm compact. Two mags, box, manual. (Demo)',
      images: ['images/glock19-1.jpg','images/glock19-2.jpg','images/glock19-3.jpg'],
      url:   'images/glock19-1.jpg'
    }
  ];

  const grid = document.getElementById('products');
  if (!grid) return;

  // Render cards
  grid.innerHTML = products.map((p,i)=>`
    <article class="productCard" data-idx="${i}">
      <a class="productMedia" href="${p.url}" target="_blank" rel="noopener">
        ${p.images.map((src,j)=>`<img src="${src}" alt="${p.name} image ${j+1}" class="${j===0?'active':''}">`).join('')}
      </a>

      <div class="productControls" role="group" aria-label="Image controls">
        <button class="arrowBtn prev" data-idx="${i}" aria-label="Previous image">◀</button>
        <button class="arrowBtn next" data-idx="${i}" aria-label="Next image">▶</button>
      </div>

      <div class="productBody">
        <h3>${p.name}</h3>
        <p>${p.desc}</p>
        <div class="productPrice">$${p.price.toFixed(2)}</div>
        <button class="button addToCart"
          data-id="${p.id}" data-name="${p.name}" data-price="${p.price}">
          Add to cart
        </button>
      </div>
    </article>
  `).join('');

  // Rotation helpers
  const timers = new Map();

  function show(i, explicit = null){
    const media = grid.querySelector(`.productCard[data-idx="${i}"] .productMedia`);
    if (!media) return;
    const imgs = media.querySelectorAll('img');
    if (!imgs.length) return;
    const cur  = [...imgs].findIndex(img => img.classList.contains('active'));
    const next = explicit != null ? explicit : (cur + 1) % imgs.length;
    imgs.forEach((img,k)=> img.classList.toggle('active', k === next));
  }
  function start(i){ stop(i); timers.set(i, setInterval(()=>show(i), 5000)); }
  function stop(i){ const t = timers.get(i); if (t){ clearInterval(t); timers.delete(i); } }

  // Start auto-advance and pause on hover
  products.forEach((_,i)=>{
    start(i);
    const media = grid.querySelector(`.productCard[data-idx="${i}"] .productMedia`);
    media?.addEventListener('mouseenter', ()=> stop(i));
    media?.addEventListener('mouseleave', ()=> start(i));
  });

  // Arrow controls (event delegation)
  grid.addEventListener('click', (e)=>{
    const prev = e.target.closest('.prev');
    const next = e.target.closest('.next');
    if (!prev && !next) return;

    const i    = +(prev?.dataset.idx ?? next.dataset.idx);
    const card = grid.querySelector(`.productCard[data-idx="${i}"]`);
    const imgs = card?.querySelectorAll('.productMedia img') ?? [];
    if (!imgs.length) return;

    const cur = [...imgs].findIndex(img => img.classList.contains('active'));
    const n   = prev ? (cur - 1 + imgs.length) % imgs.length : (cur + 1) % imgs.length;
    show(i, n);
  });
});
