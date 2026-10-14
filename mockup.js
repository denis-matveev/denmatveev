/* Shared Mockup fit and inline playback.
 * The hero opts into the same fit through data-fit-span.
 * Resize the viewport first; scale its entire canvas only at the side inset.
 */
(function () {
  var fitStates = new Map();

  document.querySelectorAll('[data-fit-span]').forEach(function (fit) {
    var image = fit.querySelector('img');
    var span = Number(fit.dataset.fitSpan);
    if (!image) return;
    var nativeHeight = Number(image.getAttribute('height')) / 2;
    var inset = parseFloat(window.getComputedStyle(fit).getPropertyValue('--media-fit-inset'));
    if (!(span > 0) || !(nativeHeight > 0)) return;
    fitStates.set(fit, {
      span: span,
      height: nativeHeight,
      inset: Number.isFinite(inset) ? inset : 24,
      width: -1
    });
  });

  function resizeFit(fit, width) {
    var state = fitStates.get(fit);
    if (!state || !(width > 0) || width === state.width) return;
    state.width = width;
    var scale = Math.min(1, Math.max(0, (width - 2 * state.inset) / state.span));
    fit.style.setProperty('--media-scale', String(scale));
    fit.style.setProperty('--media-render-height', state.height * scale + 'px');
    fit.setAttribute('data-fit-ready', '');
  }

  fitStates.forEach(function (state, fit) {
    resizeFit(fit, fit.getBoundingClientRect().width);
  });

  if (typeof ResizeObserver === 'function') {
    var observer = new ResizeObserver(function (entries) {
      entries.forEach(function (entry) {
        resizeFit(entry.target, entry.contentRect.width);
      });
    });
    fitStates.forEach(function (state, fit) { observer.observe(fit); });
  } else if (fitStates.size) {
    window.addEventListener('resize', function () {
      fitStates.forEach(function (state, fit) {
        resizeFit(fit, fit.getBoundingClientRect().width);
      });
    });
  }

  document.querySelectorAll('.mockup__screen').forEach(function (screen) {
    var video = screen.querySelector('video');
    if (!video) return;
    video.muted = true;

    function syncFrame() {
      if (!video.error && video.readyState >= 2) {
        screen.setAttribute('data-ready', '');
      } else {
        screen.removeAttribute('data-ready');
      }
    }

    video.addEventListener('loadeddata', syncFrame);
    video.addEventListener('playing', syncFrame);
    video.addEventListener('error', syncFrame);
    video.addEventListener('emptied', syncFrame);
    syncFrame();
  });
})();
