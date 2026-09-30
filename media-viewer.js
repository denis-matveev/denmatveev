/*
 * Shared case-study media viewer.
 * `.case-media` images share a page-level sequence; every `.case-mockups`
 * container creates an isolated sequence from its own `.screen-mockup` images.
 */
(function () {
  var mobileQuery = window.matchMedia('(max-width: 640px)');
  var mediaFigures = Array.prototype.slice.call(document.querySelectorAll('.case-media'));
  var presentations = Array.prototype.slice.call(document.querySelectorAll('.case-mockups'));
  var groups = [];
  var mediaItems = mediaFigures.map(function (figure) {
    var image = figure.querySelector('img');
    var caption = figure.querySelector('figcaption');

    return {
      image: image,
      src: image.currentSrc || image.src,
      alt: image.alt,
      caption: caption ? caption.textContent.trim() : image.alt,
    };
  });

  if (mediaItems.length) {
    groups.push({ type: 'media', items: mediaItems });
  }

  presentations.forEach(function (presentation) {
    var mockups = Array.prototype.slice.call(presentation.querySelectorAll('.screen-mockup'));
    var mockupItems = mockups.map(function (mockup) {
      var image = mockup.querySelector('img');
      var caption = mockup.querySelector('figcaption');
      var label = caption ? caption.textContent.trim() : image.alt;

      return {
        image: image,
        src: image.currentSrc || image.src,
        alt: image.alt || label,
        caption: label,
      };
    });

    if (mockupItems.length) {
      groups.push({ type: 'mockups', items: mockupItems });
    }
  });

  if (!groups.length) {
    return;
  }

  var viewer = document.createElement('div');
  var viewerItems = [];
  var currentIndex = 0;
  var previousFocus = null;
  var scale = 1;
  var panX = 0;
  var panY = 0;
  var dragX = 0;
  var dismissY = 0;
  var pointers = new Map();
  var gesture = null;
  var pinchDistance = 0;
  var pinchScale = 1;
  var pinching = false;
  var lastTap = 0;

  viewer.className = 'media-viewer';
  viewer.hidden = true;
  viewer.setAttribute('role', 'dialog');
  viewer.setAttribute('aria-modal', 'true');
  viewer.setAttribute('aria-label', 'Image viewer');
  viewer.innerHTML =
    '<div class="media-viewer__toolbar">' +
      '<div class="media-viewer__zoom" aria-label="Image zoom controls">' +
        '<button type="button" data-viewer-action="zoom-out" aria-label="Zoom out"><span class="media-viewer__icon media-viewer__icon--minus" aria-hidden="true"></span></button>' +
        '<span class="media-viewer__zoom-value" aria-live="polite">100%</span>' +
        '<button type="button" data-viewer-action="zoom-in" aria-label="Zoom in"><span class="media-viewer__icon media-viewer__icon--plus" aria-hidden="true"></span></button>' +
      '</div>' +
      '<button class="media-viewer__close" type="button" data-viewer-action="close" aria-label="Close image viewer"><span class="media-viewer__icon media-viewer__icon--close" aria-hidden="true"></span></button>' +
    '</div>' +
    '<div class="media-viewer__stage">' +
      '<img class="media-viewer__image" alt="" draggable="false" />' +
    '</div>' +
    '<div class="media-viewer__footer">' +
      '<button type="button" data-viewer-action="previous" aria-label="Previous image"><span class="media-viewer__icon media-viewer__icon--arrow-left" aria-hidden="true"></span></button>' +
      '<div class="media-viewer__details">' +
        '<p class="media-viewer__caption"></p>' +
        '<span class="media-viewer__position" aria-live="polite"></span>' +
      '</div>' +
      '<button type="button" data-viewer-action="next" aria-label="Next image"><span class="media-viewer__icon media-viewer__icon--arrow-right" aria-hidden="true"></span></button>' +
    '</div>';
  document.body.appendChild(viewer);

  var viewerImage = viewer.querySelector('.media-viewer__image');
  var stage = viewer.querySelector('.media-viewer__stage');
  var caption = viewer.querySelector('.media-viewer__caption');
  var position = viewer.querySelector('.media-viewer__position');
  var zoomValue = viewer.querySelector('.media-viewer__zoom-value');
  var previousButton = viewer.querySelector('[data-viewer-action="previous"]');
  var nextButton = viewer.querySelector('[data-viewer-action="next"]');
  var closeButton = viewer.querySelector('[data-viewer-action="close"]');

  function clamp(value, minimum, maximum) {
    return Math.min(Math.max(value, minimum), maximum);
  }

  function distance(first, second) {
    return Math.hypot(second.x - first.x, second.y - first.y);
  }

  function constrainPan() {
    var imageRect = viewerImage.getBoundingClientRect();
    var stageRect = stage.getBoundingClientRect();
    var maxX = Math.max(0, (imageRect.width - stageRect.width) / 2);
    var maxY = Math.max(0, (imageRect.height - stageRect.height) / 2);

    panX = clamp(panX, -maxX, maxX);
    panY = clamp(panY, -maxY, maxY);
  }

  function updateTransform(animate) {
    viewerImage.classList.toggle('media-viewer__image--animate', Boolean(animate));
    viewerImage.style.transform =
      'translate(' + (panX + dragX) + 'px, ' + (panY + dismissY) + 'px) scale(' + scale + ')';
    zoomValue.textContent = Math.round(scale * 100) + '%';
  }

  function updateDismissAppearance(progress) {
    var opacity = 1 - clamp(progress, 0, 1) * 0.72;

    viewer.style.setProperty('--viewer-backdrop-alpha', opacity.toFixed(2));
    viewer.querySelector('.media-viewer__toolbar').style.opacity = String(opacity);
    viewer.querySelector('.media-viewer__footer').style.opacity = String(opacity);
  }

  function resetDismissAppearance() {
    viewer.style.removeProperty('--viewer-backdrop-alpha');
    viewer.querySelector('.media-viewer__toolbar').style.removeProperty('opacity');
    viewer.querySelector('.media-viewer__footer').style.removeProperty('opacity');
  }

  function setScale(nextScale, animate) {
    scale = clamp(nextScale, 1, 4);

    if (scale === 1) {
      panX = 0;
      panY = 0;
    }

    dragX = 0;
    dismissY = 0;
    resetDismissAppearance();
    constrainPan();
    updateTransform(animate);
  }

  function resetImage() {
    scale = 1;
    panX = 0;
    panY = 0;
    dragX = 0;
    dismissY = 0;
    pointers.clear();
    gesture = null;
    pinching = false;
    resetDismissAppearance();
    updateTransform(false);
  }

  function showImage(index) {
    currentIndex = clamp(index, 0, viewerItems.length - 1);
    resetImage();
    viewerImage.src = viewerItems[currentIndex].src;
    viewerImage.alt = viewerItems[currentIndex].alt;
    caption.textContent = viewerItems[currentIndex].caption;
    position.textContent = currentIndex + 1 + ' / ' + viewerItems.length;
    previousButton.disabled = currentIndex === 0;
    nextButton.disabled = currentIndex === viewerItems.length - 1;
  }

  function openViewer(group, index) {
    if (!mobileQuery.matches) {
      return;
    }

    previousFocus = document.activeElement;
    viewerItems = group.items;
    showImage(index);
    viewer.hidden = false;
    document.body.classList.add('media-viewer-open');
    closeButton.focus();
  }

  function closeViewer() {
    if (viewer.hidden) {
      return;
    }

    viewer.hidden = true;
    document.body.classList.remove('media-viewer-open');
    resetImage();

    if (previousFocus && typeof previousFocus.focus === 'function') {
      previousFocus.focus();
    }
  }

  function syncMobileAffordance() {
    groups.forEach(function (group) {
      group.items.forEach(function (item) {
        if (mobileQuery.matches) {
          item.image.setAttribute('role', 'button');
          item.image.setAttribute('tabindex', '0');
          item.image.setAttribute('aria-label', 'Open image: ' + item.caption);
        } else {
          item.image.removeAttribute('role');
          item.image.removeAttribute('tabindex');
          item.image.removeAttribute('aria-label');
        }
      });
    });

    if (!mobileQuery.matches) {
      closeViewer();
    }
  }

  groups.forEach(function (group) {
    group.items.forEach(function (item, index) {
      item.image.addEventListener('click', function () {
        openViewer(group, index);
      });
      item.image.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openViewer(group, index);
        }
      });
    });
  });

  viewer.addEventListener('click', function (event) {
    var action = event.target.closest('[data-viewer-action]');

    if (action) {
      switch (action.dataset.viewerAction) {
        case 'close':
          closeViewer();
          break;
        case 'previous':
          showImage(currentIndex - 1);
          break;
        case 'next':
          showImage(currentIndex + 1);
          break;
        case 'zoom-in':
          setScale(scale + 0.5, true);
          break;
        case 'zoom-out':
          setScale(scale - 0.5, true);
          break;
      }
      return;
    }

    if (event.target === viewer || event.target === stage) {
      closeViewer();
    }
  });

  viewerImage.addEventListener('pointerdown', function (event) {
    event.preventDefault();
    viewerImage.setPointerCapture(event.pointerId);
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (pointers.size === 1) {
      gesture = {
        x: event.clientX,
        y: event.clientY,
        panX: panX,
        panY: panY,
        axis: null,
        startedAt: Date.now(),
      };
    } else if (pointers.size === 2) {
      var pair = Array.from(pointers.values());
      pinchDistance = distance(pair[0], pair[1]);
      pinchScale = scale;
      pinching = true;
    }
  });

  viewerImage.addEventListener('pointermove', function (event) {
    if (!pointers.has(event.pointerId)) {
      return;
    }

    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (pointers.size === 2) {
      var pair = Array.from(pointers.values());
      setScale(pinchScale * (distance(pair[0], pair[1]) / pinchDistance), false);
      return;
    }

    if (!gesture || pinching) {
      return;
    }

    var deltaX = event.clientX - gesture.x;
    var deltaY = event.clientY - gesture.y;

    if (scale > 1) {
      panX = gesture.panX + deltaX;
      panY = gesture.panY + deltaY;
      constrainPan();
    } else {
      if (!gesture.axis && Math.max(Math.abs(deltaX), Math.abs(deltaY)) > 8) {
        gesture.axis = Math.abs(deltaY) > Math.abs(deltaX) && deltaY > 0
          ? 'vertical'
          : 'horizontal';
      }

      if (gesture.axis === 'vertical') {
        dismissY = Math.max(0, deltaY);
        dragX = 0;
        updateDismissAppearance(dismissY / Math.max(stage.clientHeight * 0.5, 240));
      } else {
        dragX = deltaX * 0.4;
        dismissY = 0;
      }
    }

    updateTransform(false);
  });

  function finishPointer(event) {
    if (!pointers.has(event.pointerId)) {
      return;
    }

    var deltaX = gesture ? event.clientX - gesture.x : 0;
    var deltaY = gesture ? event.clientY - gesture.y : 0;
    var elapsed = gesture ? Math.max(Date.now() - gesture.startedAt, 1) : 1;
    pointers.delete(event.pointerId);

    if (pinching) {
      if (pointers.size < 2) {
        pinching = false;
        gesture = null;
      }
      return;
    }

    if (
      scale === 1 &&
      gesture &&
      gesture.axis === 'vertical' &&
      (deltaY > 96 || (deltaY > 44 && deltaY / elapsed > 0.55))
    ) {
      closeViewer();
      return;
    }

    if (scale === 1 && Math.abs(deltaX) > 56 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
      if (deltaX < 0 && currentIndex < viewerItems.length - 1) {
        showImage(currentIndex + 1);
      } else if (deltaX > 0 && currentIndex > 0) {
        showImage(currentIndex - 1);
      }
    } else if (scale === 1 && Math.abs(deltaX) < 8 && Math.abs(deltaY) < 8) {
      var now = Date.now();
      if (now - lastTap < 300) {
        setScale(2, true);
        lastTap = 0;
      } else {
        lastTap = now;
      }
    }

    dragX = 0;
    dismissY = 0;
    resetDismissAppearance();
    constrainPan();
    updateTransform(true);
    gesture = null;
  }

  viewerImage.addEventListener('pointerup', finishPointer);
  viewerImage.addEventListener('pointercancel', finishPointer);

  document.addEventListener('keydown', function (event) {
    if (viewer.hidden) {
      return;
    }

    if (event.key === 'Escape') {
      closeViewer();
    } else if (event.key === 'ArrowLeft') {
      showImage(currentIndex - 1);
    } else if (event.key === 'ArrowRight') {
      showImage(currentIndex + 1);
    } else if (event.key === '+' || event.key === '=') {
      setScale(scale + 0.5, true);
    } else if (event.key === '-') {
      setScale(scale - 0.5, true);
    }
  });

  if (typeof mobileQuery.addEventListener === 'function') {
    mobileQuery.addEventListener('change', syncMobileAffordance);
  } else {
    mobileQuery.addListener(syncMobileAffordance);
  }

  syncMobileAffordance();
})();
