(function () {
  var topbar = document.querySelector(".topbar");
  var menuToggle = document.querySelector(".menu-toggle");
  var navigation = document.querySelector(".topbar__nav");
  var compactNavigation = window.matchMedia("(max-width: 640px)");

  if (!topbar || !menuToggle || !navigation) {
    return;
  }

  function setMenuOpen(isOpen) {
    topbar.classList.toggle("topbar--menu-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
  }

  menuToggle.addEventListener("click", function () {
    setMenuOpen(!topbar.classList.contains("topbar--menu-open"));
  });

  navigation.addEventListener("click", function (event) {
    if (event.target.closest("a")) {
      setMenuOpen(false);
    }
  });

  document.addEventListener("click", function (event) {
    if (
      compactNavigation.matches &&
      topbar.classList.contains("topbar--menu-open") &&
      !topbar.contains(event.target)
    ) {
      setMenuOpen(false);
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && topbar.classList.contains("topbar--menu-open")) {
      setMenuOpen(false);
      menuToggle.focus();
    }
  });

  compactNavigation.addEventListener("change", function (event) {
    if (!event.matches) {
      setMenuOpen(false);
    }
  });
})();
