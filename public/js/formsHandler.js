document.addEventListener("DOMContentLoaded", function () {
  const newCampgrounForm = document.getElementById("newCampgrounForm");
  const newCampgrounFormTrigger = document.getElementById("newCampgrounFormTrigger");

  const loginForm = document.getElementById('loginForm');
  const loginFormTrigger = document.getElementById('loginFormTrigger');
  
  const registrationForm = document.getElementById('registrationForm');
  const registrationFormTrigger = document.getElementById('registrationFormTrigger');

  if (newCampgrounForm) {
    newCampgrounForm.addEventListener("submit", () => {
      newCampgrounFormTrigger.textContent = "Loading...";
      newCampgrounFormTrigger.setAttribute("disabled", true);
    });
  }

  if(loginForm) {
    loginForm.addEventListener("submit", () => {
      loginFormTrigger.textContent = "Loading...";
      loginFormTrigger.setAttribute("disabled", true);
    });
  }

  if(registrationForm) {
    registrationForm.addEventListener("submit", () => {
      registrationFormTrigger.textContent = "Loading...";
      registrationFormTrigger.setAttribute("disabled", true);
    });
  }
});
