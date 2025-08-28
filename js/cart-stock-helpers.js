(function () {
  const KEY = 'demo_cart';
  const getCart = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
  const setCart = (arr) => localStorage.setItem(KEY, JSON.stringify(arr));

  window.demoCart = window.demoCart || {};
  window.demoCart._get = window.demoCart._get || getCart;
  window.demoCart._set = window.demoCart._set || setCart;
  window.demoCart.count = window.demoCart.count || function(id){
    const it = getCart().find(i => i.id === id);
    return it ? it.qty : 0;
  };

  // stock-aware add (returns how many were actually added; 0 if none)
  window.demoCart.add = (function(origAdd){
    return function(item){
      const stock = window.inventory?.get(item.id) ?? Infinity; 
      const inCart = window.demoCart.count(item.id);
      const left = stock - inCart;

      const want = Math.max(1, item.qty || 1);
      if (left <= 0) {
        alert('Sorry, this item is out of stock.');
        return 0;
      }
      const addable = Math.min(left, want);
      // add to cart 
      const cart = getCart();
      const found = cart.find(i => i.id === item.id);
      if (found) found.qty += addable; else cart.push({ id:item.id, name:item.name, price:Number(item.price)||0, qty:addable });
      setCart(cart);

      if (addable < want) alert(`Only ${left} in stock. Added ${addable}.`);
      return addable;
    };
  })(window.demoCart.add || function(){});
})();
