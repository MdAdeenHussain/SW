// ===== NAVBAR =====
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

// ===== THEME TOGGLE =====
document.addEventListener("DOMContentLoaded", function () {

  const storageKey = "spydra_theme";
  const themeToggle = document.getElementById("themeToggle");
  const themeImageSelectors = [
    ".hero-image",
    ".feature-icon img",
    ".about-image img",
    ".contact-image img"
  ];

  function getThemeImageSources(image) {
    const rawSrc = image.getAttribute("src");
    if (!rawSrc || !/\.png(\?.*)?$/i.test(rawSrc)) return null;

    const lightSrc = image.dataset.lightSrc || rawSrc.replace(/-dark(?=\.png(\?.*)?$)/i, "");
    if (!/\.png(\?.*)?$/i.test(lightSrc)) return null;

    const darkSrc = image.dataset.darkSrc || lightSrc.replace(/(?=\.png(\?.*)?$)/i, "-dark");
    image.dataset.lightSrc = lightSrc;
    image.dataset.darkSrc = darkSrc;

    return { lightSrc, darkSrc };
  }

  function applyThemeImages(isDark) {
    document.querySelectorAll(themeImageSelectors.join(", ")).forEach(image => {
      const sources = getThemeImageSources(image);
      if (!sources) return;

      const nextSrc = isDark ? sources.darkSrc : sources.lightSrc;
      if (image.getAttribute("src") !== nextSrc) {
        image.setAttribute("src", nextSrc);
      }
    });
  }

  function getSavedTheme() {
    try {
      return localStorage.getItem(storageKey);
    } catch (error) {
      return null;
    }
  }

  function saveTheme(theme) {
    try {
      localStorage.setItem(storageKey, theme);
    } catch (error) {
      // no-op
    }
  }

  function applyTheme(theme) {
    const isDark = theme === "dark";
    document.body.classList.toggle("dark-mode", isDark);
    applyThemeImages(isDark);

    if (themeToggle) {
      themeToggle.classList.toggle("active", isDark);
      themeToggle.setAttribute("aria-pressed", String(isDark));
    }
  }

  const savedTheme = getSavedTheme();
  const initialTheme = savedTheme === "dark" ? "dark" : "light";
  applyTheme(initialTheme);

  if (!themeToggle) return;

  themeToggle.addEventListener("click", function () {
    const nextTheme = document.body.classList.contains("dark-mode")
      ? "light"
      : "dark";

    applyTheme(nextTheme);
    saveTheme(nextTheme);
  });

});

// ===== GLOBAL SMOOTH SCROLL =====

document.addEventListener("DOMContentLoaded", function () {

  document.querySelectorAll(".scroll-link").forEach(link => {

    link.addEventListener("click", function (e) {

      const targetId = this.getAttribute("href");

      if (targetId.startsWith("#")) {
        e.preventDefault();

        const target = document.querySelector(targetId);
        if (!target) return;

        const offset = 100; // navbar height offset
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth"
        });
      }

    });

  });

});

// ===== LEVEL 3 HERO INTERACTION =====

document.addEventListener("DOMContentLoaded", function () {

  const container = document.getElementById("heroImageContainer");
  const wrapper = document.querySelector(".hero-image-wrapper");
  const image = document.getElementById("heroImage");
  const glow = document.getElementById("lightGlow");
  const button = document.getElementById("heroBtn");

  if (!container || window.innerWidth < 900) return;

  let currentX = 0;
  let currentY = 0;
  let targetX = 0;
  let targetY = 0;

  container.addEventListener("mousemove", (e) => {

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    targetX = (y - centerY) / 25;
    targetY = (x - centerX) / 25;

    glow.style.opacity = 1;
    glow.style.background = `
      radial-gradient(circle at ${x}px ${y}px,
      rgba(255,255,255,0.5), transparent 60%)
    `;
  });

  container.addEventListener("mouseleave", () => {
    targetX = 0;
    targetY = 0;
    glow.style.opacity = 0;
  });

  function animateTilt() {
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;

    wrapper.style.transform = `
      rotateX(${-currentX}deg)
      rotateY(${currentY}deg)
      scale(1.04)
    `;

    requestAnimationFrame(animateTilt);
  }

  animateTilt();

  // Magnetic button
  button.addEventListener("mousemove", (e) => {
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    button.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
  });

  button.addEventListener("mouseleave", () => {
    button.style.transform = "translate(0,0)";
  });

});

// ===== HERO PARTICLES =====

document.addEventListener("DOMContentLoaded", function () {

  const canvas = document.getElementById("heroParticles");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  let particles = [];
  const count = window.innerWidth < 900 ? 40 : 80;
  let mouse = { x: null, y: null };

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  window.addEventListener("resize", resize);
  resize();

  window.addEventListener("mousemove", e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.radius = Math.random() * 2 + 1;
      this.dx = (Math.random() - 0.5) * 0.4;
      this.dy = (Math.random() - 0.5) * 0.4;
    }

    update() {
      this.x += this.dx;
      this.y += this.dy;

      // Bounce
      if (this.x < 0 || this.x > canvas.width) this.dx *= -1;
      if (this.y < 0 || this.y > canvas.height) this.dy *= -1;

      // Mouse interaction
      if (mouse.x && mouse.y) {
        let distX = this.x - mouse.x;
        let distY = this.y - mouse.y;
        let distance = Math.sqrt(distX * distX + distY * distY);

        if (distance < 120) {
          this.x += distX * 0.02;
          this.y += distY * 0.02;
        }
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(37, 99, 235, 0.5)";
      ctx.fill();
    }
  }

  for (let i = 0; i < count; i++) {
    particles.push(new Particle());
  }

  function connectParticles() {
    for (let a = 0; a < particles.length; a++) {
      for (let b = a; b < particles.length; b++) {
        let dx = particles[a].x - particles[b].x;
        let dy = particles[a].y - particles[b].y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 120) {
          ctx.strokeStyle = "rgba(37, 99, 235, 0.1)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(particles[b].x, particles[b].y);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      p.update();
      p.draw();
    });

    connectParticles();

    requestAnimationFrame(animate);
  }

  animate();

});

// ===== HERO ENTRANCE ANIMATION =====

window.addEventListener("load", () => {

  const elements = [
    document.querySelector(".hero-content h1"),
    document.querySelector(".hero-content p"),
    document.querySelector(".hero-btn"),
    document.querySelector(".hero-image-wrapper")
  ];

  elements.forEach((el, index) => {
    if (!el) return;

    setTimeout(() => {
      el.classList.add("hero-animate");
    }, 300 + index * 200);
  });

});

// ===== CONTACT CARD PARTICLES =====
document.addEventListener("DOMContentLoaded", function () {

  const canvas = document.getElementById("contactParticles");
  if (!canvas) return;

  const card = canvas.closest(".contact-card");
  if (!card) return;

  const ctx = canvas.getContext("2d");
  const particles = [];
  const count = window.innerWidth < 900 ? 22 : 40;
  let width = 0;
  let height = 0;

  function resize() {
    width = card.clientWidth;
    height = card.clientHeight;
    canvas.width = width;
    canvas.height = height;
  }

  window.addEventListener("resize", resize);
  resize();

  class ContactParticle {
    constructor(y) {
      this.reset(y);
    }

    reset(y) {
      this.x = Math.random() * width;
      this.y = y !== undefined ? y : height + Math.random() * 36;
      this.radius = Math.random() * 2 + 1;
      this.speed = Math.random() * 0.45 + 0.2;
      this.drift = (Math.random() - 0.5) * 0.25;
      this.alpha = Math.random() * 0.35 + 0.1;
    }

    update() {
      this.y -= this.speed;
      this.x += this.drift;

      if (this.y < -12 || this.x < -12 || this.x > width + 12) {
        this.reset();
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < count; i++) {
    particles.push(new ContactParticle(Math.random() * height));
  }

  function connectParticles() {
    const maxDistance = 72;

    for (let a = 0; a < particles.length; a++) {
      for (let b = a + 1; b < particles.length; b++) {
        const dx = particles[a].x - particles[b].x;
        const dy = particles[a].y - particles[b].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < maxDistance) {
          const lineOpacity = (1 - distance / maxDistance) * 0.14;
          ctx.strokeStyle = `rgba(255, 255, 255, ${lineOpacity})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(particles[b].x, particles[b].y);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach(particle => {
      particle.update();
      particle.draw();
    });

    connectParticles();
    requestAnimationFrame(animate);
  }

  animate();
});

// ===== TECH/FLAG SCROLL =====
document.addEventListener("DOMContentLoaded", function () {

  function setupInfiniteScroll(wrapperId, scrollId, speed) {
    const wrapper = document.getElementById(wrapperId);
    const scroll = document.getElementById(scrollId);

    if (!wrapper || !scroll) return;

    // Duplicate content
    scroll.innerHTML += scroll.innerHTML;

    let isPaused = false;

    function animate() {
      if (!isPaused) {
        wrapper.scrollLeft += speed;

        if (wrapper.scrollLeft >= scroll.scrollWidth / 2) {
          wrapper.scrollLeft = 0;
        }
      }
      requestAnimationFrame(animate);
    }

    animate();

    wrapper.addEventListener("mouseenter", () => isPaused = true);
    wrapper.addEventListener("mouseleave", () => isPaused = false);
  }

  // Tech scroll
  setupInfiniteScroll("techWrapper", "techScroll", 0.5);

  // Flag scroll
  setupInfiniteScroll("flagWrapper", "flagScroll", 0.5);

});

// ===== ABOUT SECTION ANIMATION =====

document.addEventListener("DOMContentLoaded", function () {

  const aboutSection = document.querySelector(".about-section");
  if (!aboutSection) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        aboutSection.classList.add("visible");
      }
    });
  }, { threshold: 0.2 });

  observer.observe(aboutSection);

});

// ===== SERVICES TOGGLE SYSTEM =====

document.addEventListener("DOMContentLoaded", function () {

  const items = document.querySelectorAll(".service-item");
  const panels = document.querySelectorAll(".service-panel");

  let currentIndex = 0;
  let autoSwitch = true;

  function activateService(index) {

    items.forEach(item => item.classList.remove("active"));
    panels.forEach(panel => panel.classList.remove("active"));

    items[index].classList.add("active");

    const targetId = items[index].dataset.service;
    document.getElementById(targetId).classList.add("active");

    currentIndex = index;
  }

  // Manual click
  items.forEach((item, index) => {
    item.addEventListener("click", () => {
      activateService(index);
      autoSwitch = false; // stop auto toggle when clicked
    });
  });

  // Auto toggle every 3 seconds
  setInterval(() => {
    if (!autoSwitch) return;

    let nextIndex = (currentIndex + 1) % items.length;
    activateService(nextIndex);

  }, 3000);

});

// ===== NEWSLETTER FORM =====
document.querySelector(".newsletter-form").addEventListener("submit", function(e) {
  e.preventDefault();
  alert("Thank you for subscribing!");
});

// ===== INQUIRY FORM =====
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

// ===== PLANS =====
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

// ==== CONTACT FORM MODAL =====
// ---- AJAX SUBMISSION ----
const contactForm = document.getElementById("contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", function(e) {
      e.preventDefault();

      let formData = new FormData(this);

      fetch("/contact", {
          method: "POST",
          body: formData
      })
      .then(response => response.json())
      .then(data => {
          if(data.status === "success"){
              alert("Message sent successfully!");
              contactForm.reset();
          }
      });
  });

  // ---- LIVE VALIDATION ----
  document.querySelectorAll("#contactForm input, #contactForm textarea")
  .forEach(input => {
      input.addEventListener("input", function(){
          if(this.value.trim() === ""){
              this.style.borderColor = "red";
          } else {
              this.style.borderColor = "#e2e8f0";
          }
      });
  });
}

// ===== NEW CODE =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", function (e) {
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth" });
    }
  });
});
