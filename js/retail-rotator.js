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

  // --- Helper: wire a single category card to rotate through its sub-categories ---
  function wireRotator(cardKey, pool, order, labelPrefix, intervalMs = 5000) {
    const card = document.querySelector(`.categoryCard[data-category="${cardKey}"]`);
    if (!card) return;

    const media = card.querySelector('.productMedia');
    if (!media) return;

    // Keep only ONE <img> so it won't fight retail-media.js
    let img = media.querySelector('img');
    if (!img) {
      img = document.createElement('img');
      img.className = 'active';
      media.appendChild(img);
    } else {
      [...media.querySelectorAll('img')].forEach((el, i) => { if (i > 0) el.remove(); });
      img.classList.add('active');
    }

    // Crossfade helper with preloading
    function swap(src, alt) {
      const im = new Image();
      im.onload = () => {
        img.style.transition = 'opacity .25s ease';
        img.style.opacity = 0;
        setTimeout(() => {
          img.src = src;
          img.alt = alt;
          img.style.opacity = 1;
        }, 120);
      };
      im.src = src;
    }

    const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)] ?? null;
    let k = 0, timer = null;

    function step() {
      const cat = order[k % order.length];
      const list = pool[cat] || [];
      if (list.length) {
        const src = pickRandom(list);
        const label = `${labelPrefix} – ${cat[0].toUpperCase()}${cat.slice(1)}`;
        swap(src, label);
      }
      k++;
    }

    function start() { stop(); step(); timer = setInterval(step, intervalMs); }
    function stop()  { if (timer) { clearInterval(timer); timer = null; } }

    // Prev/Next buttons jump categories immediately and reset timer
    card.querySelector('.prev')?.addEventListener('click', (e) => { e.preventDefault(); k = (k - 1 + order.length) % order.length; stop(); step(); start(); });
    card.querySelector('.next')?.addEventListener('click', (e) => { e.preventDefault(); k = (k + 1) % order.length;                         stop(); step(); start(); });

    // Pause on hover
    card.addEventListener('mouseenter', stop);
    card.addEventListener('mouseleave', start);

    start();
  }

  // --- Wire all three cards ---
  wireRotator('guns', gunsPool, ['handguns','revolvers','rifles','shotguns'], 'Guns');
  wireRotator('ammo', ammoPool, ['handgun','rifle','shotgun'], 'Ammo');
  wireRotator('accessories', accessoriesPool, ['optics','cases','misc'], 'Accessories');
});
