document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('sellForm');
  if (!form) return;

  const $ = (id) => document.getElementById(id);
  const reset = (id, t) => { const el = $(id); if (el) { if (t) el.textContent = t; el.style.color = 'white'; } };
  const error = (id, t) => { const el = $(id); if (el) { if (t) el.textContent = t; el.style.color = 'yellow'; } };

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRe = /^\+?1?[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Read
    const fName     = $('fName').value.trim();
    const lName     = $('lName').value.trim();
    const email     = $('email').value.trim();
    const cEmail    = $('cEmail').value.trim();
    const phone     = $('phone').value.trim();
    const itemType  = $('itemType').value.trim();
    const makeModel = $('makeModel').value.trim();
    const condition = $('condition').value.trim();
    const reserve   = $('reserve').value.trim();
    const message   = $('message').value.trim();
    const terms     = $('terms').checked;

    // Reset labels
    reset('fNameLabel', 'First Name:');
    reset('lNameLabel', 'Last Name:');
    reset('emailLabel', 'Email:');
    reset('cEmailLabel', 'Confirm Email:');
    reset('phoneLabel', 'Phone (optional):');
    reset('itemTypeLabel', 'Item Type:');
    reset('makeModelLabel', 'Make / Model:');
    reset('serialLabel', 'Serial (optional):');
    reset('conditionLabel', 'Estimated Condition:');
    reset('reserveLabel', 'Desired Reserve (optional):');
    reset('messageLabel', 'Notes / Additional Details:');
    $('termsLabel').style.color = 'white';

    let valid = true;
    let firstBad = null;
    const invalidate = (labId, msg, inputId) => {
      error(labId, msg);
      const input = $(inputId);
      if (!firstBad && input) firstBad = input;
      valid = false;
    };

    // Validate
    if (!fName) invalidate('fNameLabel', 'First Name (required):', 'fName');
    if (!lName) invalidate('lNameLabel', 'Last Name (required):', 'lName');

    if (!email || !emailRe.test(email)) invalidate('emailLabel', 'Valid Email (required):', 'email');
    if (!cEmail || !emailRe.test(cEmail)) invalidate('cEmailLabel', 'Valid Confirm Email (required):', 'cEmail');
    if (email && cEmail && email !== cEmail) {
      invalidate('emailLabel', "Emails don't match:", 'email');
      invalidate('cEmailLabel', "Emails don't match:", 'cEmail');
    }

    if (phone && !phoneRe.test(phone)) invalidate('phoneLabel', 'Phone looks invalid:', 'phone');

    if (!itemType) invalidate('itemTypeLabel', 'Item Type (required):', 'itemType');
    if (!makeModel) invalidate('makeModelLabel', 'Make / Model (required):', 'makeModel');
    if (!condition) invalidate('conditionLabel', 'Estimated Condition (required):', 'condition');

    if (!message) invalidate('messageLabel', 'Please add some notes (required):', 'message');

    if (!terms) { $('termsLabel').style.color = 'yellow'; valid = false; }

    // Reserve sanity (optional)
    if (reserve && Number(reserve) < 0) invalidate('reserveLabel', 'Reserve cannot be negative:', 'reserve');

    if (!valid) {
      if (firstBad) firstBad.focus();
      alert('Please fix the highlighted fields and try again.');
      return;
    }

    alert('Thanks! Your consignment inquiry has been submitted (demo).');
    form.reset();
  });
});
