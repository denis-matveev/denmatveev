(function () {
  var presentations = document.querySelectorAll('.case-mockups');

  if (!presentations.length) {
    return;
  }

  function createArrow() {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'case-mockups__arrow case-mockups__arrow--next';
    button.setAttribute('aria-label', 'Show next mockups');
    button.hidden = true;
    button.innerHTML =
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"></path></svg>';
    return button;
  }

  presentations.forEach(function (presentation, index) {
    var track = presentation.querySelector('.case-mockups__track');

    if (!track) {
      return;
    }

    var next = createArrow();
    var viewport = document.createElement('div');
    var regionLabel = 'Mockup presentation ' + (index + 1);

    viewport.className = 'case-mockups__viewport';
    viewport.setAttribute('role', 'region');
    viewport.setAttribute('aria-label', regionLabel);
    viewport.setAttribute('tabindex', '0');
    presentation.insertBefore(viewport, track);
    viewport.appendChild(track);
    presentation.append(next);

    function updateControls() {
      var maxScroll = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
      var hasOverflow = maxScroll > 1;
      var scrollLeft = viewport.scrollLeft;

      presentation.classList.toggle('case-mockups--overflow', hasOverflow);
      next.hidden = !hasOverflow || scrollLeft >= maxScroll - 1;
    }

    function scrollByPage(direction) {
      viewport.scrollBy({
        left: direction * Math.max(viewport.clientWidth * 0.75, 280),
        behavior: 'smooth',
      });
    }

    next.addEventListener('click', function () {
      scrollByPage(1);
    });

    viewport.addEventListener('scroll', updateControls, { passive: true });
    window.addEventListener('resize', updateControls);

    if ('ResizeObserver' in window) {
      new ResizeObserver(updateControls).observe(viewport);
    }

    updateControls();
  });
})();
