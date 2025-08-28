(function () {
  const KEY = 'demo_stock_v1';

  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } }
  function save(map) { localStorage.setItem(KEY, JSON.stringify(map)); }

  // Ensure each id has a stock value; if missing, seed 1–5
  function ensure(ids) {
    const map = load();
    let changed = false;
    ids.forEach(id => {
      if (map[id] == null) { map[id] = Math.floor(Math.random() * 5) + 1; changed = true; }
    });
    if (changed) save(map);
    return map;
  }

  window.inventory = {
    ensure,
    get(id) { return load()[id] ?? 0; },
    set(id, qty) { const m = load(); m[id] = Math.max(0, qty|0); save(m); },
    decrement(id, n = 1) { const m = load(); m[id] = Math.max(0, (m[id] ?? 0) - n); save(m); return m[id]; }
  };
})();
