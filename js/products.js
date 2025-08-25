(function () {
  function initProducts() {
    var grid = document.getElementById('products');
    if (!grid) { console.warn('[products] #products not found'); return; }

    var products = [
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

    // Render
    grid.innerHTML = products.map(function (p, i) {
      return (
        '<article class="productCard" data-idx="' + i + '">' +
          '<a class="productMedia" href="' + p.url + '" target="_blank" rel="noopener">' +
            p.images.map(function (src, j) {
              return '<img src="' + src + '" alt="' + p.name + ' image ' + (j+1) + '" class="' + (j===0?'active':'') + '">';
            }).join('') +
          '</a>' +
          '<div class="productControls" role="group" aria-label="Image controls">' +
            '<button class="arrowBtn prev" data-idx="' + i + '" aria-label="Previous image">◀</button>' +
            '<button class="arrowBtn next" data-idx="' + i + '" aria-label="Next image">▶</button>' +
          '</div>' +
          '<div class="productBody">' +
            '<h3>' + p.name + '</h3>' +
            '<p>' + p.desc + '</p>' +
            '<div class="productPrice">$' + p.price.toFixed(2) + '</div>' +
            '<button class="button addToCart" data-id="' + p.id + '" data-name="' + p.name + '" data-price="' + p.price + '">Add to cart</button>' +
          '</div>' +
        '</article>'
      );
    }).join('');

    // Slide logic
    var timers = {};

    function show(i, explicit) {
      var card  = grid.querySelector('.productCard[data-idx="' + i + '"]');
      var media = card && card.querySelector('.productMedia');
      if (!media) return;
      var imgs  = media.querySelectorAll('img');
      if (!imgs.length) return;
      var cur = -1;
      for (var k=0; k<imgs.length; k++) if (imgs[k].classList.contains('active')) { cur = k; break; }
      if (cur < 0) cur = 0;
      var next = (typeof explicit === 'number') ? explicit : (cur + 1) % imgs.length;
      for (var j=0; j<imgs.length; j++) imgs[j].classList.toggle('active', j === next);
    }
    function start(i) { stop(i); timers[i] = setInterval(function(){ show(i); }, 5000); }
    function stop(i)  { if (timers[i]) { clearInterval(timers[i]); delete timers[i]; } }

    // Start auto-advance + pause on hover
    for (var i=0; i<products.length; i++) {
      start(i);
      (function(idx){
        var media = grid.querySelector('.productCard[data-idx="' + idx + '"] .productMedia');
        if (!media) return;
        media.addEventListener('mouseenter', function(){ stop(idx); });
        media.addEventListener('mouseleave', function(){ start(idx); });
      })(i);
    }

    // Arrow controls (delegated)
    grid.addEventListener('click', function(e){
      var btn = e.target.closest && e.target.closest('.prev, .next');
      if (!btn || !grid.contains(btn)) return;
      var i = +btn.getAttribute('data-idx');
      var card = grid.querySelector('.productCard[data-idx="' + i + '"]');
      var imgs = card ? card.querySelectorAll('.productMedia img') : [];
      if (!imgs.length) return;
      var cur = -1;
      for (var k=0; k<imgs.length; k++) if (imgs[k].classList.contains('active')) { cur = k; break; }
      if (cur < 0) cur = 0;
      var n = btn.classList.contains('prev') ? (cur - 1 + imgs.length) % imgs.length
                                             : (cur + 1) % imgs.length;
      show(i, n);
    });

    console.log('[products] rendered:', products.length, 'card(s)');
  }

  // Run now (if DOM is parsed) or on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProducts, { once: true });
  } else {
    initProducts();
  }
})();
