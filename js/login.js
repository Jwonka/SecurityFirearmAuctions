document.addEventListener('DOMContentLoaded', () => {
  const $ = (id) => document.getElementById(id);
  const form = document.getElementById('loginForm');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const user = {
      firstName: $('fName').value.trim(),
      lastName:  $('lName').value.trim(),
      email:     $('email').value.trim(),
      phone:     $('phone').value.trim(),
      address1:  $('address1').value.trim(),
      address2:  $('address2').value.trim(),
      city:      $('city').value.trim(),
      state:     $('state').value,
      zip:       $('zip').value.trim(),
      notes:     $('notes').value.trim()
    };

    if (!user.firstName || !user.lastName || !user.email || !user.address1 || !user.city || !user.state || !user.zip) {
      alert('Please complete all required fields.');
      return;
    }

    auth.set(user);  
    alert('Demo account saved locally. You are now “logged in”.');
    const next = new URLSearchParams(location.search).get('next') || 'index.html';
    location.href = next;
  });
});
