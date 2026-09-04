(function () {
  var presentations = document.querySelectorAll('.case-mockups');

  if (!presentations.length) {
    return;
  }

  function createArrow(direction) {
    var button = document.createElement('button');
    var isPrevious = direction === 'previous';

    button.type = 'button';
    button.className =
      'case-mockups__arrow case-mockups__arrow--' +
      (isPrevious ? 'previous' : 'next');
    button.setAttribute(
      'aria-label',
      isPrevious ? 'Show previous mockups' : 'Show next mockups',
    );
    button.hidden = true;
    button.innerHTML = '<span class="case-mockups__arrow-icon" aria-hidden="true"></span>';
    return button;
  }

  presentations.forEach(function (presentation, index) {
    var track = presentation.querySelector('.case-mockups__track');

    if (!track) {
      return;
    }

    var previous = createArrow('previous');
    var next = createArrow('next');
    var viewport = document.createElement('div');
    var regionLabel = 'Mockup presentation ' + (index + 1);

    viewport.className = 'case-mockups__viewport';
    viewport.setAttribute('role', 'region');
    viewport.setAttribute('aria-label', regionLabel);
    viewport.setAttribute('tabindex', '0');
    presentation.insertBefore(viewport, track);
    viewport.appendChild(track);
    presentation.append(previous);
    presentation.append(next);

    function updateControls() {
      var maxScroll = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
      var hasOverflow = maxScroll > 1;
      var scrollLeft = viewport.scrollLeft;
      var hidePrevious = !hasOverflow || scrollLeft <= 1;
      var hideNext = !hasOverflow || scrollLeft >= maxScroll - 1;

      presentation.classList.toggle('case-mockups--overflow', hasOverflow);

      if (document.activeElement === previous && hidePrevious && !hideNext) {
        next.focus();
      } else if (document.activeElement === next && hideNext && !hidePrevious) {
        previous.focus();
      }

      previous.hidden = hidePrevious;
      next.hidden = hideNext;
    }

    function scrollByPage(direction) {
      viewport.scrollBy({
        left: direction * Math.max(viewport.clientWidth * 0.75, 280),
        behavior: 'smooth',
      });
    }

    previous.addEventListener('click', function () {
      scrollByPage(-1);
    });

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
