document.addEventListener('DOMContentLoaded', () => {
  const auctionsData = {
    current: [
      {
        title: 'Estate Auction — August 2025',
        meta: 'Date: Aug 30, 2025 • Location: Blair, WI • Status: Live',
        highlights: 'Classic revolvers, rimfire rifles, modern carry pistols',
        lots: [
          {
            manufacturer: 'Smith & Wesson',
            model: 'Model 686',
            title: 'Lot 3 — Smith & Wesson Model 686 (.357 Magnum)',
            desc: 'Condition: Very Good • 4" barrel • 6-rd cylinder • Includes soft case.',
            images: [
              'images/guns/revolvers/38Special-001.jpg',
              'images/guns/revolvers/38Special-002.jpg',
              'images/guns/revolvers/38Special-003.jpg'
            ]
          },
          {
            manufacturer: 'Smith & Wesson',
            model: 'M&P15-22',
            title: 'Lot 7 — Smith & Wesson M&P15-22 (.22 LR)',
            desc: 'Condition: Excellent • 25-rd magazine • Adjustable stock • Includes 1 mag & manual.',
            images: [
              'images/smith-wesson-rifle-001.jpg',
              'images/smith-wesson-rifle-002.jpg',
              'images/smith-wesson-rifle-003.jpg'
            ]
          }
        ]
      },
      {
        title: 'Classic Handguns — September 12',
        meta: 'Date: Sep 12, 2025 • Location: Madison, WI • Status: Opens Soon',
        highlights: 'Carry pistols, range kits, period holsters',
        lots: [
          {
            manufacturer: 'Smith & Wesson',
            model: 'M&P Shield',
            title: 'Lot 12 — Smith & Wesson M&P Shield (9mm)',
            desc: 'Condition: Very Good • 3.1" barrel • 1×7-rd & 1×8-rd mags • Includes box & lock.',
            images: [
              'images/guns/handguns/smith-wesson-9mm-001.jpg',
              'images/guns/handguns/smith-wesson-9mm-002.jpg',
              'images/guns/handguns/smith-wesson-9mm-003.jpg'
            ]
          }
        ]
      }
    ],
    past: [
      {
        title: 'Rimfire Showcase — June 2025',
        meta: 'Date: Jun 14, 2025 • Location: Eau Claire, WI • Status: Closed',
        highlights: 'Top lots: Ruger Mark IV and Ruger 10/22',
        lots: [
          {
            manufacturer: 'Ruger', model: 'Mark IV',
            title: 'Lot 4 — Ruger Mark IV (.22 LR)',
            desc: 'Condition: Excellent • Target barrel • Includes 2 mags & case.',
            images: ['images/rugerMarkIV-1.jpg','images/rugerMarkIV-2.jpg','images/rugerMarkIV-3.jpg']
          },
          {
            manufacturer: 'Ruger', model: '10/22',
            title: 'Lot 9 — Ruger 10/22 (.22 LR)',
            desc: 'Condition: Very Good • Semi-auto • 10-rd rotary mag • Clean bore.',
            images: ['images/ruger-1.jpg','images/ruger-2.jpg','images/ruger-3.jpg']
          }
        ]
      }
    ],
    future: [
      {
        title: 'Ammunition Sale — February 2026',
        meta: 'Date: Sep 15, 2025 • Location: Online • Status: Live',
        highlights: 'Common calibers in bulk and range packs',
        lots: [
          { manufacturer: 'Various', model: '5.56 NATO', title: 'Lot A1 — 5.56 NATO', desc: 'Bulk pack • FMJ • New brass.',
            images: ['images/ammunition/556/556-1.jpg','images/ammunition/556/556-2.jpg','images/ammunition/556/556-3.jpg'] },
          { manufacturer: 'Various', model: '9mm Luger', title: 'Lot A2 — 9mm Luger', desc: '115gr FMJ • Range ammo.',
            images: ['images/ammunition/9mm/9mm.jpg','images/ammunition/9mm/9mm-2.jpg'] },
          { manufacturer: 'Various', model: '10mm Auto', title: 'Lot A3 — 10mm Auto', desc: '180gr • Brass case.',
            images: ['images/ammunition/10mm/10mm.jpg','images/ammunition/10mm/10mm-2.jpg'] },
          { manufacturer: 'Various', model: '.45 ACP', title: 'Lot A4 — .45 ACP', desc: '230gr FMJ • New brass.',
            images: ['images/ammunition/45ACP/45ACP.jpg','images/ammunition/45ACP/45ACP-2.jpg'] },
          { manufacturer: 'Various', model: '.380 ACP', title: 'Lot A5 — .380 ACP', desc: '95gr FMJ • Range pack.',
            images: ['images/ammunition/380ACP/380ACP.jpg','images/ammunition/380ACP/380ACP-2.jpg'] },
          { manufacturer: 'Various', model: '.308 Win', title: 'Lot A6 — .308 Winchester', desc: '150gr • Brass case.',
            images: ['images/ammunition/308/308.jpg','images/ammunition/308/308-2.jpg','images/ammunition/308/308-3.jpg'] },
          { manufacturer: 'Various', model: '12 Gauge', title: 'Lot A7 — 12 Gauge', desc: '2¾" target loads.',
            images: ['images/ammunition/12Gauge/12GaugeShells.jpg'] }
        ]
      }
    ]
  };

  // ===== RENDER HELPERS =====
  function el(tag, attrs = {}, ...children) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'class') node.className = v;
      else if (k === 'dataset') Object.assign(node.dataset, v);
      else node.setAttribute(k, v);
    }
    for (const c of children) if (c) node.append(c);
    return node;
  }

  function renderSection(containerId, items) {
    const col = document.getElementById(containerId);
    if (!col) return;
    [...col.querySelectorAll(':scope > article')].forEach(n => n.remove());

    for (const a of items) {
      const card = el('article', { class: 'auctionCard', dataset: { name: a.title.toLowerCase() } });
      const header = el('header', { class: 'auctionHeader' },
        el('h3', {}, a.title),
        el('p', {}, a.meta),
        a.highlights ? el('p', {}, `Highlights: ${a.highlights}`) : ''
      );
      const lotsGrid = el('div', { class: 'lotsGrid' });

      for (const lot of (a.lots || [])) {
        const dn = `${lot.manufacturer} ${lot.model} ${lot.title}`.trim().toLowerCase();
        const lotCard = el('div', { class: 'lotCard', dataset: { name: dn } });

        const media = el('div', { class: 'lotMedia' });
        (lot.images || []).forEach((src, i) => {
          media.append(el('img', {
            src,
            alt: `${lot.title} — image ${i + 1}`,
            class: i === 0 ? 'active' : ''
          }));
        });

        const controls = (lot.images && lot.images.length > 1)
          ? el('div', { class: 'lotControls' },
              el('button', { class: 'arrowBtn lotPrev', 'aria-label': 'Previous image' }, '◀'),
              el('button', { class: 'arrowBtn lotNext', 'aria-label': 'Next image' }, '▶')
            )
          : el('div', { class: 'lotControls' });

        const body = el('div', { class: 'lotBody' },
          el('h4', {}, lot.title),
          lot.desc ? el('p', {}, lot.desc) : ''
        );

        lotCard.append(media, controls, body);
        lotsGrid.append(lotCard);
      }

      card.append(header, lotsGrid);
      col.append(card);
    }
  }

  renderSection('current', auctionsData.current || []);
  renderSection('past', auctionsData.past || []);
  renderSection('future', auctionsData.future || []);
});
