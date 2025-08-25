const products = [
    {
      id: 'sku-1911',
      name: 'Colt 1911 (Demo)',
      price: 799.00,
      desc: 'Classic .45 ACP — dependable and iconic.',
      images: ['images/1911-1.jpg','images/1911-2.jpg','images/1911-3.jpg'],
      url:   'images/1911-1.jpg' // click opens first image in new tab
    },
    {
      id: 'sku-MandP',
      name: 'Smith & Wesson M&P (Demo)',
      price: 699.00,
      desc: 'Classic 9mm, 5" barrel, 17-rd mag. Includes case & manual. (Demo)',
      images: ['images/MandP-1.jpg','images/MandP-2.jpg','images/MandP-3.jpg'],
      url:   'images/garand-1.jpg'
    },
    {
      id: 'sku-glock19',
      name: 'Glock 19 (Demo)',
      price: 899.00,
      desc: 'Classic .45 ACP, 6" barrel, 14-rd mag. Includes case & manual. (Demo)',
      images: ['images/glock19-1.jpg','images/glock19-2.jpg','images/glock19-3.jpg'],
      url:   'images/glock19-1.jpg'
    }
  ];

  // --- Render cards ---
  const grid = document.getElementById('products');
  grid.innerHTML = products.map((p,i)=>`
    <article class="productCard" id="${p.id}" data-name="${p.name.toLowerCase()}">
      <a class="productMedia" href="${p.url}" target="_blank" rel="noopener" data-index="${i}">
        ${p.images.map((src,j)=>`<img src="${src}" alt="${p.name} image ${j+1}" class="${j===0?'active':''}">`).join('')}
      </a>

      <div class="productControls" role="group" aria-label="Image controls">
        <button class="arrowBtn prev" data-index="${i}" aria-label="Previous image">◀</button>
        <button class="arrowBtn next" data-index="${i}" aria-label="Next image">▶</button>
      </div>

      <div class="productBody">
        <h3>${p.name}</h3>
        <p>${p.desc}</p>
        <div class="productPrice">$${p.price.toFixed(2)}</div>
        <button
          class="button addToCart"
          data-id="${p.id}"
          data-name="${p.name}"
          data-price="${p.price}">
          Add to cart
        </button>
      </div>
    </article>
  `).join('');

  // --- 5s auto-advance + arrows (pauses on hover) ---
  const timers = new Map();

  function showImage(cardIdx, explicit=null){
    const media = document.querySelector(`.productMedia[data-index="${cardIdx}"]`);
    const imgs  = media.querySelectorAll('img');
    const cur   = [...imgs].findIndex(img => img.classList.contains('active'));
    const next  = explicit!=null ? explicit : (cur+1) % imgs.length;
    imgs.forEach((img,k)=> img.classList.toggle('active', k===next));
  }
  function startAuto(i){ stopAuto(i); timers.set(i, setInterval(()=>showImage(i), 5000)); }
  function stopAuto(i){ const t = timers.get(i); if (t){ clearInterval(t); timers.delete(i); } }

  products.forEach((_,i)=>{
    startAuto(i);
    const media = document.querySelector(`.productMedia[data-index="${i}"]`);
    media.addEventListener('mouseenter', ()=> stopAuto(i));
    media.addEventListener('mouseleave', ()=> startAuto(i));
  });

  document.addEventListener('click', (e)=>{
    const prev = e.target.closest('.prev');
    const next = e.target.closest('.next');
    if (!(prev || next)) return;

    const i = +(prev?.dataset.index ?? next.dataset.index);
    const media = document.querySelector(`.productMedia[data-index="${i}"]`);
    const imgs  = media.querySelectorAll('img');
    const cur   = [...imgs].findIndex(img => img.classList.contains('active'));
    const n     = prev ? (cur-1+imgs.length) % imgs.length : (cur+1) % imgs.length;
    showImage(i, n);
  });

  // --- Search: scroll to the first matching card and highlight it ---
  const searchForm  = document.getElementById('siteSearch');
  const searchInput = document.getElementById('searchInput');
  const searchMsg   = document.getElementById('searchMsg');
  const clearBtn    = document.getElementById('clearSearch');

  function clearHighlights(){
    document.querySelectorAll('.productCard').forEach(c => c.classList.remove('search-hit'));
    if (searchMsg) searchMsg.textContent = '';
  }

  if (searchForm){
    searchForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      clearHighlights();
      const q = (searchInput.value||'').trim().toLowerCase();
      if (!q) return;

      const cards = [...document.querySelectorAll('.productCard')];
      const matches = cards.filter(c=>{
        const name = c.querySelector('h3')?.textContent.toLowerCase() || '';
        const desc = c.querySelector('p')?.textContent.toLowerCase() || '';
        return name.includes(q) || desc.includes(q);
      });

      if (matches.length){
        matches[0].classList.add('search-hit');
        matches[0].scrollIntoView({behavior:'smooth', block:'center'});
        if (searchMsg) searchMsg.textContent =
          matches.length > 1 ? `Found ${matches.length} matches (highlighted the first).`
                             : 'Found 1 match.';
      } else {
        if (searchMsg) searchMsg.textContent = 'No matches.';
      }
    });
  }
  if (clearBtn){
    clearBtn.addEventListener('click', ()=>{
      searchInput.value = '';
      clearHighlights();
    });
  }
