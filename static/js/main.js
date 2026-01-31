// NAVBAR
function openMobileMenu() {
  document.getElementById("mobileMenu").classList.add("active");
  document.getElementById("mobileOverlay").classList.add("active");
  document.body.style.overflow = "hidden"
}

function closeMobileMenu() {
  document.getElementById("mobileMenu").classList.remove("active");
  document.getElementById("mobileOverlay").classList.remove("active");
  document.body.style.overflow = "auto"
}

document.querySelector(".newsletter-form").addEventListener("submit", function(e) {
  e.preventDefault();
  alert("Thank you for subscribing!");
});

// INQUIRY FORM
document.addEventListener("DOMContentLoaded", function () {

  const form = document.querySelector(".inquiry-form");
  const errorBox = document.getElementById("formError");

  if (!form) return;

  form.addEventListener("submit", function (e) {
    let valid = true;

    // Required inputs & selects
    form.querySelectorAll("input[required], textarea[required], select[required]").forEach(field => {
      if (!field.value.trim()) {
        valid = false;
        field.style.borderColor = "#dc2626";
      } else {
        field.style.borderColor = "#dbe0ea";
      }
    });

    // Project Type checkbox group
    if (form.querySelectorAll("input[name='project_type']:checked").length === 0) {
      valid = false;
    }

    // Features checkbox group
    if (form.querySelectorAll("input[name='features']:checked").length === 0) {
      valid = false;
    }

    if (!valid) {
      e.preventDefault();
      errorBox.style.display = "block";
      errorBox.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      errorBox.style.display = "none";
    }
  });

});



// NEW CODE
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", function (e) {
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth" });
    }
  });
});