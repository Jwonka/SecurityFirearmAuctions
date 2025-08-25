(() => {
  const KEY = 'sfa:user';

  const toHex = (buf) => [...new Uint8Array(buf)]
    .map(b => b.toString(16).padStart(2, '0')).join('');

  const hexToBytes = (hex) => {
    const arr = new Uint8Array(hex.length / 2);
    for (let i = 0; i < arr.length; i++) arr[i] = parseInt(hex.substr(i*2, 2), 16);
    return arr;
  };

  const genSaltHex = (len = 16) => {
    const u = new Uint8Array(len);
    crypto.getRandomValues(u);
    return toHex(u);
  };

  // PBKDF2(SHA-256) -> 256-bit derived key as hex
  async function deriveHash(password, saltHex, iterations = 100000) {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw', enc.encode(password), { name: 'PBKDF2' }, false, ['deriveBits']
    );
    const bits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', hash: 'SHA-256', salt: hexToBytes(saltHex), iterations },
      keyMaterial,
      256
    );
    return toHex(bits);
  }

  const auth = {
    get() {
      try { return JSON.parse(localStorage.getItem(KEY) || 'null'); }
      catch { return null; }
    },
    set(profile) {
      localStorage.setItem(KEY, JSON.stringify(profile));
    },
    clear() { localStorage.removeItem(KEY); },
    loggedIn() { return !!this.get(); },

    // Set/replace password for the current user in storage
    async setPassword(password) {
      const u = this.get();
      if (!u) return;
      const salt = genSaltHex(16);
      const hash = await deriveHash(password, salt);
      u.passwordSalt = salt;
      u.passwordHash = hash;
      this.set(u);
    },

    // Verify email + password (returns boolean)
    async verify(email, password) {
      const u = this.get();
      if (!u) return false;
      if ((u.email || '').toLowerCase() !== (email || '').toLowerCase()) return false;

      // Back-compat: if no password stored, allow login (demo) by email match.
      if (!u.passwordHash || !u.passwordSalt) return true;

      const hash = await deriveHash(password, u.passwordSalt);
      return hash === u.passwordHash;
    }
  };

  // Expose globally
  window.auth = auth;
})();
