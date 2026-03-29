(function() {
  var scrollMilestones = {
    50: false,
    90: false
  };
  var scrollTrackingStarted = false;
  var ticking = false;

  function trackEvent(eventName, params) {
    if (typeof window.gtag !== "function") {
      return;
    }

    window.gtag("event", eventName, params || {});
  }

  function getPageParams() {
    return {
      page_path: window.location.pathname,
      page_title: document.title
    };
  }

  function getLinkText(link) {
    return (link.textContent || "").replace(/\s+/g, " ").trim();
  }

  function getSectionName(element) {
    var section = element.closest("[data-section-name]");
    return section ? section.dataset.sectionName : "unknown";
  }

  function normalizeUrl(href) {
    if (!href) {
      return "";
    }

    return new URL(href, window.location.href).href;
  }

  function getContactType(link) {
    var href = (link.getAttribute("href") || "").trim().toLowerCase();

    if (!href) {
      return "external";
    }

    if (href.indexOf("mailto:") === 0) {
      return "email";
    }

    if (href.indexOf("t.me/") !== -1 || href.indexOf("telegram.me/") !== -1 || href.indexOf("telegram.org/") !== -1) {
      return "telegram";
    }

    if (href.indexOf("linkedin.com/") !== -1) {
      return "linkedin";
    }

    if (href.indexOf("behance.net/") !== -1) {
      return "behance";
    }

    if (href.indexOf("dribbble.com/") !== -1) {
      return "dribbble";
    }

    if (href.indexOf("github.com/") !== -1) {
      return "github";
    }

    return "external";
  }

  function handlePortfolioCtaClick(event) {
    var link = event.currentTarget;

    trackEvent("portfolio_cta_click", Object.assign({}, getPageParams(), {
      link_url: normalizeUrl(link.getAttribute("href")),
      link_text: getLinkText(link),
      section_name: getSectionName(link)
    }));
  }

  function handleContactClick(event) {
    var link = event.currentTarget;

    trackEvent("contact_click", Object.assign({}, getPageParams(), {
      link_url: normalizeUrl(link.getAttribute("href")),
      link_text: getLinkText(link),
      contact_type: getContactType(link),
      section_name: getSectionName(link)
    }));
  }

  function handlePortfolioClick(event) {
    var link = event.currentTarget;

    trackEvent("portfolio_click", Object.assign({}, getPageParams(), {
      link_url: normalizeUrl(link.getAttribute("href")),
      link_text: getLinkText(link),
      section_name: getSectionName(link)
    }));
  }

  function getScrollPercent() {
    var doc = document.documentElement;
    var scrollTop = window.pageYOffset || doc.scrollTop || 0;
    var scrollableHeight = doc.scrollHeight - window.innerHeight;

    if (scrollableHeight <= 0) {
      return 100;
    }

    return (scrollTop / scrollableHeight) * 100;
  }

  function checkScrollMilestones() {
    var percentScrolled = getScrollPercent();

    if (!scrollMilestones[50] && percentScrolled >= 50) {
      scrollMilestones[50] = true;
      trackEvent("scroll_50", Object.assign({}, getPageParams(), {
        percent_scrolled: 50
      }));
    }

    if (!scrollMilestones[90] && percentScrolled >= 90) {
      scrollMilestones[90] = true;
      trackEvent("scroll_90", Object.assign({}, getPageParams(), {
        percent_scrolled: 90
      }));
    }

    if (scrollMilestones[50] && scrollMilestones[90]) {
      window.removeEventListener("scroll", onScroll, { passive: true });
    }
  }

  function onScroll() {
    scrollTrackingStarted = true;

    if (ticking) {
      return;
    }

    ticking = true;
    window.requestAnimationFrame(function() {
      checkScrollMilestones();
      ticking = false;
    });
  }

  function initAnalytics() {
    var portfolioCta = document.querySelector('[data-analytics="portfolio-cta"]');
    var portfolioLinks = document.querySelectorAll('[data-analytics="portfolio-link"]');
    var contactLinks = document.querySelectorAll('[data-analytics="contact-link"]');

    if (portfolioCta) {
      portfolioCta.addEventListener("click", handlePortfolioCtaClick);
    }

    portfolioLinks.forEach(function(link) {
      link.addEventListener("click", handlePortfolioClick);
    });

    contactLinks.forEach(function(link) {
      link.addEventListener("click", handleContactClick);
    });

    window.addEventListener("scroll", onScroll, { passive: true });

    window.addEventListener("beforeunload", function() {
      if (!scrollTrackingStarted) {
        return;
      }

      checkScrollMilestones();
    });
  }

  window.trackEvent = trackEvent;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAnalytics);
  } else {
    initAnalytics();
  }
})();
