(function () {
  const KEY = 'demo_user';
  window.auth = {
    get() {
      try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; }
    },
    set(userObj) { localStorage.setItem(KEY, JSON.stringify(userObj)); },
    clear() { localStorage.removeItem(KEY); },
    loggedIn() { return !!localStorage.getItem(KEY); }
  };
})();
