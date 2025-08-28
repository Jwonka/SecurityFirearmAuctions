document.addEventListener('DOMContentLoaded', () => {
  const gunsPool = {
    handguns: [
      "images/guns/handguns/9mmGlock.jpg",
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

  const gunsCard = document.querySelector('.categoryCard[data-category="guns"] .productMedia');
  if (gunsCard) {
    let img = gunsCard.querySelector('img');
    if (!img) {
      img = document.createElement('img');
      img.className = 'active';
      gunsCard.appendChild(img);
    }
    const order = ['handguns','revolvers','rifles','shotguns'];
    let k = 0;

    const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

    const step = () => {
      const cat = order[k % order.length];
      const list = gunsPool[cat] || [];
      if (list.length) {
        const src = pickRandom(list);
        img.style.opacity = 0;
        setTimeout(() => { img.src = src; img.alt = `Guns – ${cat.slice(0,1).toUpperCase()+cat.slice(1)}`; img.style.opacity = 1; }, 120);
      }
      k++;
    };

    step(); 
    setInterval(step, 5000);
  }
});
