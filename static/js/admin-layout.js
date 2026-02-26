document.addEventListener("DOMContentLoaded", () => {
  const toggleButton = document.querySelector(".admin-menu-toggle");
  const sidebar = document.getElementById("adminSidebar");
  const overlay = document.getElementById("adminSidebarOverlay");

  if (!toggleButton || !sidebar || !overlay) {
    return;
  }

  const mobileMedia = window.matchMedia("(max-width: 767px)");
  const menuLinks = sidebar.querySelectorAll("nav a");

  const closeMenu = () => {
    toggleButton.classList.remove("is-active");
    toggleButton.setAttribute("aria-expanded", "false");
    sidebar.classList.remove("is-open");
    overlay.classList.remove("is-active");
    document.body.classList.remove("admin-menu-open");
  };

  const openMenu = () => {
    toggleButton.classList.add("is-active");
    toggleButton.setAttribute("aria-expanded", "true");
    sidebar.classList.add("is-open");
    overlay.classList.add("is-active");
    document.body.classList.add("admin-menu-open");
  };

  const toggleMenu = () => {
    if (sidebar.classList.contains("is-open")) {
      closeMenu();
      return;
    }
    openMenu();
  };

  toggleButton.addEventListener("click", toggleMenu);
  overlay.addEventListener("click", closeMenu);

  menuLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (mobileMedia.matches) {
        closeMenu();
      }
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  mobileMedia.addEventListener("change", (event) => {
    if (!event.matches) {
      closeMenu();
    }
  });
});
