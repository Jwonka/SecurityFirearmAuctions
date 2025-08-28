(() => {
  const CART_KEY = 'demo_cart';

  // ----- storage
  const getCart  = () => { try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; } };
  const saveCart = (arr) => localStorage.setItem(CART_KEY, JSON.stringify(arr));

  // ----- public API (use on any page)
  window.demoCart = {
    get: getCart,
    count(id) {
      const it = getCart().find(i => i.id === id);
      return it ? it.qty : 0;
    },
    // stock-aware add; decrements inventory; returns how many actually added
    add({ id, name, price, qty = 1 }) {
      const remaining = window.inventory?.get?.(id);
      const check = (typeof remaining === 'number');

      if (check && remaining <= 0) {
        alert('Sorry, this item is out of stock.');
        return 0;
      }

      const want    = Math.max(1, Number(qty) || 1);
      const addable = check ? Math.min(remaining, want) : want;

      const cart = getCart();
      const found = cart.find(i => i.id === id);
      if (found) found.qty += addable;
      else cart.push({ id, name, price: Number(price) || 0, qty: addable });
      saveCart(cart);

      // decrement remaining inventory so product pages update immediately
      if (check && window.inventory?.set) {
        window.inventory.set(id, remaining - addable);
      }

      // nudge any open pages listening for cart changes
      try { window.dispatchEvent(new StorageEvent('storage', { key: CART_KEY })); } catch {}

      if (check && addable < want) alert(`Only ${remaining} in stock. Added ${addable}.`);
      return addable;
    }
  };

  // ---------- UI below only runs on pages that actually have a cart ----------
  const money = n => '$' + (Math.round(n * 100) / 100).toFixed(2);
  const RATES = { buyerPremium: 0.10, salesTax: 0.055, bgFee: 10.00 };

  function totals(items) {
    const subtotal = items.reduce((s, it) => s + (it.price * it.qty), 0);
    const premium  = subtotal * RATES.buyerPremium;
    const taxable  = subtotal + premium;
    const tax      = taxable * RATES.salesTax;
    const bg       = items.length ? RATES.bgFee : 0;
    const total    = taxable + tax + bg;
    return { subtotal, premium, tax, bg, total };
  }

  function hasCartDom() {
    return document.getElementById('cartItems') && document.getElementById('cartTotals');
  }

  function render() {
    if (!hasCartDom()) return; // safe no-op on non-cart pages
    const list = document.getElementById('cartItems');
    const tBox = document.getElementById('cartTotals');

    const items = getCart();
    list.innerHTML = '';

    if (items.length === 0) {
      list.innerHTML = '<li><span class="name">Your cart is empty.</span></li>';
      tBox.innerHTML = '';
      return;
    }

    items.forEach((it, i) => {
      const li = document.createElement('li');
      li.dataset.i = i;
      li.innerHTML = `
        <span class="name">${it.name}</span>
        <span class="qtyControls">
          <button class="qtyBtn" data-act="sub">−</button>
          <span>${it.qty}</span>
          <button class="qtyBtn" data-act="add">+</button>
        </span>
        <span class="price">${money(it.price * it.qty)}</span>
      `;
      list.appendChild(li);
    });

    const t = totals(items);
    tBox.innerHTML = `
      <div class="line"><span>Subtotal</span><span>${money(t.subtotal)}</span></div>
      <div class="line"><span>Buyer’s Premium (10%)</span><span>${money(t.premium)}</span></div>
      <div class="line"><span>Sales Tax (5.5%)</span><span>${money(t.tax)}</span></div>
      <div class="line"><span>Background Check</span><span>${money(t.bg)}</span></div>
      <div class="line total"><span>Total</span><span>${money(t.total)}</span></div>
    `;
  }

  // qty +/- (also updates inventory)
  document.addEventListener('click', (e) => {
    if (!hasCartDom()) return;
    const btn = e.target.closest('.qtyBtn');
    if (!btn) return;

    const li   = btn.closest('li');
    const idx  = Number(li?.dataset.i);
    const cart = getCart();
    const item = cart[idx];
    if (!item) return;

    if (btn.dataset.act === 'add') {
      const remaining = window.inventory?.get?.(item.id) ?? 0;
      if (remaining <= 0) { alert('No more in stock for this item.'); return; }
      item.qty += 1;
      window.inventory?.set?.(item.id, remaining - 1);
    }

    if (btn.dataset.act === 'sub') {
      if (item.qty > 0) {
        item.qty -= 1;
        // restock when removing from cart
        const rem = window.inventory?.get?.(item.id) ?? 0;
        window.inventory?.set?.(item.id, rem + 1);
      }
    }

    // remove zero-qty lines
    for (let i = cart.length - 1; i >= 0; i--) if (cart[i].qty <= 0) cart.splice(i, 1);

    saveCart(cart);
    render();
  });

  // Clear cart (restock everything first)
  document.addEventListener('click', (e) => {
    if (!hasCartDom()) return;
    if (e.target.id !== 'clearCart') return;

    const items = getCart();
    items.forEach(it => {
      const rem = window.inventory?.get?.(it.id) ?? 0;
      window.inventory?.set?.(it.id, rem + it.qty);
    });
    localStorage.removeItem(CART_KEY);
    render();
  });

  document.addEventListener('DOMContentLoaded', render);
  window.addEventListener('storage', (e) => { if (e.key === CART_KEY) render(); });
})();
