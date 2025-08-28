(() => {
  const CART_KEY = 'demo_cart';

  function getCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch { return []; }
  }
  function saveCart(items) { localStorage.setItem(CART_KEY, JSON.stringify(items)); }
  function money(n) { return '$' + (Math.round(n * 100) / 100).toFixed(2); }

  // Demo fees from your T&Cs
  const RATES = { buyerPremium: 0.10, salesTax: 0.055, bgFee: 10.00 }; // premium 10%, tax 5.5%, background check $10

  function totals(items) {
    const subtotal = items.reduce((s, it) => s + (it.price * it.qty), 0);
    const premium  = subtotal * RATES.buyerPremium;
    const taxable  = subtotal + premium;
    const tax      = taxable * RATES.salesTax;
    const bg       = items.length ? RATES.bgFee : 0;
    const total    = taxable + tax + bg;
    return { subtotal, premium, tax, bg, total };
  }

  function render() {
    const list = document.getElementById('cartItems');
    const tBox = document.getElementById('cartTotals');
    if (!list || !tBox) return;

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

  // Event delegation for +/- buttons
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.qtyBtn');
    if (!btn) return;
  
    const li = btn.closest('li');
    if (!li) return;
  
    const idx  = Number(li.dataset.i);
    const cart = getCart();
    const item = cart[idx];
    if (!item) return;
  
    if (btn.dataset.act === 'add') {
      const id = item.id;
      const remaining = window.inventory?.get?.(id) ?? 0;
      if (remaining <= 0) {
        alert('No more in stock for this item.');
        return;
      }
      item.qty += 1;
      window.inventory?.set?.(id, remaining - 1);
    }
  
    if (btn.dataset.act === 'sub') {
      if (item.qty > 0) {
        item.qty -= 1;
        // restock when removing from cart
        const rem = window.inventory?.get?.(item.id) ?? 0;
        window.inventory?.set?.(item.id, rem + 1);
      }
    }
  
    // remove zero-qty items
    for (let i = cart.length - 1; i >= 0; i--) {
      if (cart[i].qty <= 0) cart.splice(i, 1);
    }
  
    saveCart(cart);
    render();
  });

  // Clear cart
  document.addEventListener('click', (e) => {
    if (e.target.id !== 'clearCart') return;
    localStorage.removeItem(CART_KEY);
    render();
  });

  // Expose tiny helper to add items from other pages (optional)
   window.demoCart = {
    add(item) {
      // item = { id, name, price, qty }
      const cart = getCart();
      const found = cart.find(i => i.id === item.id);
  
      // What's the ceiling?
      const rawStock = window.inventory?.get?.(item.id);
      // If stock is unknown (e.g., user landed directly on checkout), don't allow more than current qty.
      const max = (typeof rawStock === 'number') ? rawStock : (found ? found.qty : 0);
  
      const inCart = found ? found.qty : 0;
      const left   = max - inCart;
      const want   = Math.max(1, Number(item.qty) || 1);
  
      if (left <= 0) {
        alert('Sorry, this item is out of stock.');
        return 0;
      }
  
      const addable = Math.min(left, want);
      if (found) found.qty += addable;
      else cart.push({ id: item.id, name: item.name, price: Number(item.price) || 0, qty: addable });
  
      saveCart(cart);
      render();
  
      if (addable < want) alert(`Only ${left} in stock. Added ${addable}.`);
      return addable;
    },
    get: getCart
  };

  // initial render
  document.addEventListener('DOMContentLoaded', render);
})();
