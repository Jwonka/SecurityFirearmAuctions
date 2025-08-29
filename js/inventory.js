(function () {
  const KEY = 'demo_inventory';
  const load = () => {
    try { return new Map(Object.entries(JSON.parse(localStorage.getItem(KEY) || '{}'))); }
    catch { return new Map(); }
  };
  const save = (map) => localStorage.setItem(KEY, JSON.stringify(Object.fromEntries(map)));

  let map = load();

  function get(id){ return Number(map.get(id) ?? 0); }
  function set(id, qty){ map.set(id, Math.max(0, Number(qty)||0)); save(map); }
  function decrement(id, by=1){ set(id, get(id) - by); }
  function ensure(ids, min=1, max=5){
    ids.forEach(id => { if (!map.has(id)) set(id, Math.floor(Math.random()*(max-min+1))+min); });
  }

  // restock helpers
  function restockRandom(ids, min=2, max=6){
    ids.forEach(id => set(id, Math.floor(Math.random()*(max-min+1))+min));
  }
  function restockTo(ids, qty){ ids.forEach(id => set(id, qty)); }
  function clear(){ map.clear(); save(map); }
  function all(){ return new Map(map); }
  function restockAll(min=2, max=6){
    restockRandom([...map.keys()], min, max);
  }
  window.inventory = { get, set, decrement, ensure, restockRandom, restockTo, clear, all, restockAll };
})();
