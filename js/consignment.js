document.addEventListener('DOMContentLoaded', () => {
  const $ = (id) => document.getElementById(id);
  const form = $('consignForm');
  if (!form) return;

  const resetLabel = (id, text) => { const el = $(id); if (!el) return; el.textContent = text; el.style.color = 'white'; };
  const setError   = (id, text) => { const el = $(id); if (!el) return; el.textContent = text; el.style.color = 'yellow'; };

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRe = /^\+?1?[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
  const zipRe   = /^\d{5}(?:[-\s]\d{4})?$/;

  // --- prefill from auth, if available ---
  try {
    if (window.auth?.loggedIn && window.auth.loggedIn()) {
      const u = window.auth.get();
      if (u) {
        if (u.firstName || u.lastName) $('sellerName').value = [u.firstName||'', u.lastName||''].join(' ').trim();
        if (u.email) $('email').value = u.email;
        if (u.phone) $('phone').value = u.phone;
        if (u.address1) $('address1').value = u.address1;
        if (u.address2) $('address2').value = u.address2;
        if (u.city) $('city').value = u.city;
        if (u.state) $('state').value = u.state || '';
        if (u.zip) $('zip').value = u.zip;
      }
    }
  } catch (_) {}

  // default signature date = today
  const today = new Date().toISOString().slice(0,10);
  $('sigDate').value = today;

  // --- item rows ---
  const itemsWrap = $('itemsWrap');
  const addItemBtn = $('addItemBtn');

  function itemRowTemplate(idx) {
  const row = document.createElement('div');
  row.className = 'formInput';
  row.style.border = '1px solid black';
  row.style.borderRadius = '0.25vw';
  row.style.padding = '0.5rem';
  row.style.marginBottom = '0.75rem';

  row.innerHTML = `
    <label for="itemDesc_${idx}">Item Description:</label>
    <input type="text" id="itemDesc_${idx}" name="itemDesc_${idx}" placeholder="Make/Model, caliber, accessories, etc." required>

    <label for="itemReserve_${idx}">Reserve (optional):</label>
    <input type="number" id="itemReserve_${idx}" name="itemReserve_${idx}" min="0" step="1" placeholder="0">

    <label for="itemSerial_${idx}">Serial/ID (optional):</label>
    <input type="text" id="itemSerial_${idx}" name="itemSerial_${idx}" placeholder="Serial or identifying marks">

    <label for="itemCondition_${idx}">Condition:</label>
    <select id="itemCondition_${idx}" name="itemCondition_${idx}">
      <option>New</option>
      <option>Excellent</option>
      <option>Good</option>
      <option>Fair</option>
      <option>Poor</option>
    </select>

    <label for="itemPhotos_${idx}">Photos (up to 5, JPG/PNG, ≤ 3MB each):</label>
    <input type="file" id="itemPhotos_${idx}" name="itemPhotos_${idx}" accept="image/*" multiple>

    <div id="thumbs_${idx}" class="thumbs" style="display:flex;gap:.5rem;flex-wrap:wrap;margin-top:.5rem;"></div>

    <div style="margin-top:.5rem;">
      <button type="button" class="button removeItem">Remove Item</button>
    </div>
  `;
  return row;
}

  function addItem() {
    const idx = itemsWrap.children.length + 1;
    itemsWrap.appendChild(itemRowTemplate(idx));
  }

  addItemBtn.addEventListener('click', addItem);
  itemsWrap.addEventListener('click', (e) => {
    const btn = e.target.closest('.removeItem');
    if (btn) {
      const row = btn.closest('.formInput');
      if (row) row.remove();
    }
  });

  // basic client-side photo validation + preview
const MAX_FILES = 5;
const MAX_MB = 3;
const OK_TYPES = ['image/jpeg','image/png','image/webp','image/jpg'];

function renderThumbs(files, thumbsEl) {
  thumbsEl.innerHTML = '';
  [...files].forEach(file => {
    const url = URL.createObjectURL(file);
    const img = document.createElement('img');
    img.src = url;
    img.alt = file.name;
    img.style.width = '96px';
    img.style.height = '96px';
    img.style.objectFit = 'cover';
    img.style.border = '1px solid black';
    img.style.borderRadius = '6px';
    thumbsEl.appendChild(img);
  });
}

itemsWrap.addEventListener('change', (e) => {
  const input = e.target.closest('input[type="file"][id^="itemPhotos_"]');
  if (!input) return;

  const files = input.files;
  const thumbsEl = document.getElementById(`thumbs_${input.id.split('_')[1]}`);
  if (!thumbsEl) return;

  // validate
  if (files.length > MAX_FILES) {
    alert(`Please select up to ${MAX_FILES} images.`);
    input.value = ''; // reset
    thumbsEl.innerHTML = '';
    return;
  }

  for (const f of files) {
    const mb = f.size / (1024 * 1024);
    if (mb > MAX_MB) {
      alert(`"${f.name}" is ${mb.toFixed(1)}MB. Max is ${MAX_MB}MB.`);
      input.value = '';
      thumbsEl.innerHTML = '';
      return;
    }
    if (!OK_TYPES.includes(f.type)) {
      alert(`"${f.name}" is not a supported image type.`);
      input.value = '';
      thumbsEl.innerHTML = '';
      return;
    }
  }

  renderThumbs(files, thumbsEl);
});

  // start with one item row
  addItem();

  // --- validation & submit ---
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const sellerName = $('sellerName').value.trim();
    const email      = $('email').value.trim();
    const phone      = $('phone').value.trim();
    const address1   = $('address1').value.trim();
    const city       = $('city').value.trim();
    const state      = $('state').value.trim();
    const zip        = $('zip').value.trim();
    const terms      = $('terms').checked;
    const signature  = $('signature').value.trim();
    const sigDate    = $('sigDate').value;

    resetLabel('sellerNameLabel', 'Seller Name:');
    resetLabel('emailLabel', 'Email:');
    resetLabel('phoneLabel', 'Phone (optional):');
    resetLabel('address1Label', 'Address Line 1:');
    resetLabel('address2Label', 'Address Line 2 (optional):');
    resetLabel('cityLabel', 'City:');
    resetLabel('stateLabel', 'State:');
    resetLabel('zipLabel', 'ZIP Code:');
    resetLabel('signatureLabel', 'Type your name as signature:');
    resetLabel('sigDateLabel', 'Date:');
    $('termsLabel').style.color = 'white';

    let valid = true;
    const invalidate = (labelId, msg) => { setError(labelId, msg); valid = false; };

    if (!sellerName) invalidate('sellerNameLabel', 'Seller Name (required):');
    if (!email || !emailRe.test(email)) invalidate('emailLabel', 'Valid Email (required):');
    if (phone && !phoneRe.test(phone)) invalidate('phoneLabel', 'Phone looks invalid:');
    if (!address1) invalidate('address1Label', 'Address Line 1 (required):');
    if (!city) invalidate('cityLabel', 'City (required):');
    if (!state) invalidate('stateLabel', 'State (required):');
    if (!zip || !zipRe.test(zip)) invalidate('zipLabel', 'ZIP Code (5 or 9 digits):');

    // at least one item with a description
    let hasItem = false;
    [...itemsWrap.querySelectorAll('input[id^="itemDesc_"]')].forEach(inp => {
      if (inp.value.trim()) hasItem = true;
    });
    if (!hasItem) {
      alert('Please add at least one item with a description.');
      valid = false;
    }

    if (!terms) { $('termsLabel').style.color = 'yellow'; valid = false; }
    if (!signature) invalidate('signatureLabel', 'Signature (required):');
    if (!sigDate) invalidate('sigDateLabel', 'Date (required):');

    if (!valid) {
      alert('Please fix the highlighted fields and try again.');
      return;
    }

    // NOTE: On GitHub Pages there is no backend; files are NOT uploaded.
    // demo success
    alert('Your consignment request has been submitted (demo). We will reach out via email.');
    // clear items area (keep seller info to be nice)
    itemsWrap.innerHTML = '';
    addItem();
    $('notes').value = '';
    $('terms').checked = false;
  });
});
