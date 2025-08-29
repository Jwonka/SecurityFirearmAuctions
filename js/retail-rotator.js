document.addEventListener('DOMContentLoaded', () => {
  const gunsPool = {
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

  const ammoPool = {
    handgun: [
      "images/ammunition/9mm/9mm.jpg",
      "images/ammunition/10mm/10mm.jpg",
      "images/ammunition/45ACP/45ACP.jpg",
      "images/ammunition/380ACP/380ACP.jpg",
    ],
    rifle: [
      "images/ammunition/556/556-1.jpg",
      "images/ammunition/308/308.jpg",
    ],
    shotgun: [
      "images/ammunition/12Gauge/12GaugeShells.jpg",
    ]
  };

  const accessoriesPool = {
    optics: [
      "images/accessories/optics/springfield-scope-001.jpg",
      "images/accessories/optics/rifle-scope-001.jpg",
      "images/accessories/optics/winchester-scope-001.jpg",
    ],
    cases: [
      "images/accessories/cases/handgun-case-001.jpg",
      "images/accessories/cases/winchester-case.jpg",
    ],
    misc: [
      "images/accessories/misc/springfield-sling-001.jpg",
      "images/accessories/misc/smith-wesson-stock-001.jpg",
    ]
  };

  window.retailPools = { guns: gunsPool, ammo: ammoPool, accessories: accessoriesPool };

  // --- Helper: wire a single category card to rotate through its sub-categories ---
   function wireRotator(cardKey, pool, order, labelPrefix, intervalMs = 5000) {
    const card  = document.querySelector(`.categoryCard[data-category="${cardKey}"]`);
    const media = card?.querySelector('.productMedia');
    if (!card || !media) return;

    // Ensure exactly one <img>
    let img = media.querySelector('img');
    if (!img) {
      img = document.createElement('img');
      media.appendChild(img);
    }
    [...media.querySelectorAll('img')].forEach((el, i) => { if (i > 0) el.remove(); });
    img.classList.add('active');  
    img.decoding = 'async';
    img.loading  = 'eager';
    img.style.opacity = 1;

    const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
    const pick = cat => {
      const list = pool[cat] || [];
      return list.length ? list[Math.floor(Math.random() * list.length)] : null;
    };

    // Show a first frame immediately
    let k = 0;
    (function showFirst() {
      for (let i = 0; i < order.length; i++) {
        const cat = order[(k + i) % order.length];
        const src = pick(cat);
        if (src) {
          img.src = src;
          img.alt = `${labelPrefix} — ${cap(cat)}`;
          k = (k + i) % order.length;
          break;
        }
      }
    })();

    // Crossfade to a category
    function swapTo(cat) {
      const src = pick(cat);
      if (!src) return;
      const pre = new Image();
      pre.onload = () => {
        img.style.transition = 'opacity .25s ease';
        img.style.opacity = 0;
        setTimeout(() => {
          img.src = src;
          img.alt = `${labelPrefix} — ${cap(cat)}`;
          img.style.opacity = 1;
        }, 120);
      };
      pre.src = src;
    }

    // Timer
    let timer = null;
    function step() { k = (k + 1) % order.length; swapTo(order[k]); }
    function start(){ stop(); timer = setInterval(step, intervalMs); }
    function stop(){ if (timer) { clearInterval(timer); timer = null; } }

    // Controls + hover
    card.querySelector('.prev')?.addEventListener('click', e => { e.preventDefault(); stop(); k = (k - 1 + order.length) % order.length; swapTo(order[k]); start(); });
    card.querySelector('.next')?.addEventListener('click', e => { e.preventDefault(); stop(); k = (k + 1) % order.length;           swapTo(order[k]); start(); });
    card.addEventListener('mouseenter', stop);
    card.addEventListener('mouseleave', start);

    start();
  }
  
  // --- Wire all three cards ---
  wireRotator('guns', gunsPool, ['handguns','revolvers','rifles','shotguns'], 'Guns');
  wireRotator('ammo', ammoPool, ['handgun','rifle','shotgun'], 'Ammo');
  wireRotator('accessories', accessoriesPool, ['optics','cases','misc'], 'Accessories');
});
