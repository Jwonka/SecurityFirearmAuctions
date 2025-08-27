(function () {
  function onLogoutClick(e) {
    const link = e.target.closest('a.logout, #logoutLink');
    if (!link) return;

    e.preventDefault();

    // ask before logging out
    if (!confirm('Log out now?')) return;

    try {
      if (window.auth && typeof window.auth.clear === 'function') {
        window.auth.clear();
      }
    } catch (err) {
      console.error('Logout error:', err);
    }

    // Post-logout confirmation
    alert('You have been logged out.');

    // Redirect target:
    // - default to "account.html" (login/register)
    // - allow override via data-redirect="reload" to simply refresh
    const redirect = link.getAttribute('data-redirect') || 'account.html';
    if (redirect === 'reload') {
      location.reload();
    } else {
      location.href = redirect;
    }
  }

  // Event delegation so it works even if the header is re-rendered
  document.addEventListener('click', onLogoutClick, false);
})();
