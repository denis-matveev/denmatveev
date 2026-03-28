(function() {
  var storageKey = "portfolio-theme";
  var root = document.documentElement;

  function getSystemTheme() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function applyTheme(theme) {
    root.dataset.theme = theme;
  }

  function setTheme(theme) {
    var nextTheme = theme === "dark" ? "dark" : theme === "light" ? "light" : getSystemTheme();

    applyTheme(nextTheme);

    if (theme === "dark" || theme === "light") {
      window.localStorage.setItem(storageKey, theme);
    } else {
      window.localStorage.removeItem(storageKey);
    }
  }

  var storedTheme = window.localStorage.getItem(storageKey);
  applyTheme(storedTheme === "dark" || storedTheme === "light" ? storedTheme : getSystemTheme());

  window.portfolioTheme = {
    getTheme: function() {
      return root.dataset.theme;
    },
    setTheme: setTheme,
    useSystemTheme: function() {
      setTheme("system");
    }
  };

  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function(event) {
    if (!window.localStorage.getItem(storageKey)) {
      applyTheme(event.matches ? "dark" : "light");
    }
  });
})();
