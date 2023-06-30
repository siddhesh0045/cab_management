// form.js
$(document).ready(() => {
    $('#rent-form').submit((e) => {
      e.preventDefault();
      const formData = $('#rent-form').serialize();
      $.ajax({
        type: 'POST',
        url: '/rent',
        data: formData,
        success: (data) => {
          // Redirect to the confirmation page
          window.location.href = '/confirmation';
        },
        error: (err) => {
          console.log(err);
        },
      });
    });
  });
  