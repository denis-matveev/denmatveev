/* Switch only the hero artwork; the page theme remains independent. */
(function () {
  document.querySelectorAll('[data-hero-preview]').forEach(function (preview) {
    var image = preview.querySelector('[data-hero-image]');
    var switcher = preview.querySelector('.hero-preview__switcher');
    var status = preview.querySelector('[role="status"]');
    if (!image || !switcher) return;

    var sources = { light: preview.dataset.lightSrc, dark: preview.dataset.darkSrc };
    if (!sources.light || !sources.dark) return;
    var currentTheme = preview.dataset.heroTheme || 'light';
    var requestedTheme = currentTheme;
    var selection = 0;
    var loaded = {};

    function loadTheme(theme) {
      if (!loaded[theme]) {
        loaded[theme] = new Promise(function (resolve, reject) {
          var artwork = new Image();
          artwork.onload = function () { resolve(artwork); };
          artwork.onerror = function () { reject(new Error('Unable to load hero preview')); };
          artwork.src = sources[theme];
        }).catch(function (error) {
          delete loaded[theme];
          throw error;
        });
      }
      return loaded[theme];
    }

    function selectTheme(theme) {
      if (!sources[theme]) return;
      var request = ++selection;
      if (status) status.textContent = '';
      if (theme === currentTheme) {
        preview.removeAttribute('aria-busy');
        return;
      }

      preview.setAttribute('aria-busy', 'true');
      loadTheme(theme).then(function () {
        if (request !== selection) return;
        image.src = sources[theme];
        currentTheme = theme;
        preview.dataset.heroTheme = theme;
        switcher.setAttribute('aria-checked', String(theme === 'dark'));
        preview.removeAttribute('aria-busy');
      }).catch(function () {
        if (request !== selection) return;
        preview.removeAttribute('aria-busy');
        requestedTheme = currentTheme;
        if (status) status.textContent = 'The hero preview could not be loaded. Please try again.';
      });
    }

    switcher.addEventListener('click', function () {
      requestedTheme = requestedTheme === 'light' ? 'dark' : 'light';
      if (typeof window.trackEvent === 'function') {
        window.trackEvent('hero_theme_toggle', {
          page_path: window.location.pathname,
          page_title: document.title,
          section_name: 'hero',
          theme: requestedTheme
        });
      }
      selectTheme(requestedTheme);
    });
    switcher.hidden = false;
    // Warm the alternate artwork while retaining the initial image on failures.
    loadTheme('dark').catch(function () {});
  });
})();
