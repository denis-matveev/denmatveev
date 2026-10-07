(function() {
  var hostname = window.location.hostname;
  if (hostname !== "denmatveev.com" && hostname !== "www.denmatveev.com") return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function() { window.dataLayer.push(arguments); };
  window.gtag("js", new Date());
  window.gtag("config", "G-JJW8ZLRV99");

  var script = document.createElement("script");
  script.async = true;
  script.src = "https://www.googletagmanager.com/gtag/js?id=G-JJW8ZLRV99";
  document.head.appendChild(script);
})();
