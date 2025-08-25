document.addEventListener('DOMContentLoaded', function() {

  var form = document.querySelector('.contact');

  if (form) {
    form.addEventListener('submit', function(event) {
      event.preventDefault();
  
      var email = document.getElementById('email').value;
      var cEmail = document.getElementById('cEmail').value;
  
      var emailLabel = document.getElementById('emailLabel');
      var cEmailLabel = document.getElementById('cEmailLabel');
  
      // Clear error messages
      emailLabel.textContent = 'Email:';
      emailLabel.style.color = 'white';
      cEmailLabel.textContent = 'Confirm Email:';
      cEmailLabel.style.color = 'white';
  
        if (email !== cEmail) {
          emailLabel.textContent = "Email's Do Not Match";
          emailLabel.style.color = 'yellow';
          cEmailLabel.textContent = "Email's Do Not Match";
         cEmailLabel.style.color = 'yellow';
          alert("Your Email's Do Not Match!");
        } else {
          alert('Your message has been sent successfully!');
        }
      });
  } else {
    console.error("Form with class 'contact' not found.");
  }

});
