(function () {
  var navigation = document.querySelector(".case-projects");
  if (!navigation) return;

  // The homepage is the source of truth for project order, titles, and previews.
  var home = new URL("./", document.currentScript.src);
  function normalizedPath(url) {
    return url.pathname.replace(/index\.html$/, "").replace(/\/$/, "");
  }

  fetch(home.href)
    .then(function (response) {
      if (!response.ok) throw new Error("Unable to load the project list");
      return response.text();
    })
    .then(function (html) {
      var page = new DOMParser().parseFromString(html, "text/html");
      var projects = Array.from(page.querySelectorAll(".case-card__link"))
        .map(function (link) {
          var title = link.querySelector("h3");
          var preview = link.querySelector("img");
          var visual = link.querySelector(".case-card__visual");
          if (!title || !preview) return null;
          return {
            url: new URL(link.getAttribute("href"), home),
            title: title.textContent.trim().replace(/\s+/g, " "),
            image: new URL(preview.getAttribute("src"), home).href,
            topAligned: visual && visual.classList.contains("case-card__visual--ihairium")
          };
        }).filter(Boolean);
      var current = projects.findIndex(function (project) {
        return normalizedPath(project.url) === normalizedPath(new URL(location.href));
      });
      if (current < 0) return;

      function addProject(project, direction) {
        if (!project) return;
        var link = document.createElement("a");
        link.className = "case-projects__card";
        link.href = project.url.href;
        link.rel = direction === "Previous" ? "prev" : "next";
        var image = document.createElement("img");
        image.className = "case-projects__image";
        if (project.topAligned) image.classList.add("case-projects__image--top");
        image.src = project.image;
        image.alt = "";
        image.width = 142;
        image.height = 88;
        image.loading = "lazy";
        var copy = document.createElement("span");
        copy.className = "case-projects__copy";
        var label = document.createElement("span");
        label.className = "case-projects__label";
        label.textContent = direction + " case";
        var title = document.createElement("span");
        title.className = "case-projects__title";
        title.textContent = project.title.split(" — ")[0];
        link.setAttribute("aria-label", direction + " case: " + project.title);
        copy.append(label, title);
        link.append(image, copy);
        navigation.append(link);
      }

      addProject(projects[current - 1], "Previous");
      addProject(projects[current + 1], "Next");
      navigation.hidden = !navigation.children.length;
    })
    .catch(function () {
      // Keep the optional navigation hidden if the project list is unavailable.
    });
})();
