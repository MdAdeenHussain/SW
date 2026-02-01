// NAVBAR
// function openMobileMenu() {
//   document.getElementById("mobileMenu").classList.add("active");
//   document.getElementById("mobileOverlay").classList.add("active");
//   document.body.style.overflow = "hidden"
// }

// function closeMobileMenu() {
//   document.getElementById("mobileMenu").classList.remove("active");
//   document.getElementById("mobileOverlay").classList.remove("active");
//   document.body.style.overflow = "auto"
// }
document.addEventListener("DOMContentLoaded", function () {

  const hamburger = document.querySelector(".hamburger");
  const mobileMenu = document.querySelector(".mobile-menu");
  const mobileOverlay = document.querySelector(".mobile-overlay");

  if (!hamburger || !mobileMenu || !mobileOverlay) {
    return; // page without navbar
  }

  function openMenu() {
    mobileMenu.classList.add("active");
    mobileOverlay.classList.add("active");
    document.body.classList.add("no-scroll");
  }

  function closeMenu() {
    mobileMenu.classList.remove("active");
    mobileOverlay.classList.remove("active");
    document.body.classList.remove("no-scroll");
  }

  hamburger.addEventListener("click", openMenu);
  mobileOverlay.addEventListener("click", closeMenu);

  // Optional close button inside menu
  document.querySelectorAll(".close-menu").forEach(btn => {
    btn.addEventListener("click", closeMenu);
  });

});


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

// PLANS 
document.addEventListener("DOMContentLoaded", () => {
  const plan = document.getElementById("recommended-plan");

  if (!plan) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          plan.classList.add("active");
        } else {
          plan.classList.remove("active");
        }
      });
    },
    { threshold: 0.6 }
  );

  observer.observe(plan);
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