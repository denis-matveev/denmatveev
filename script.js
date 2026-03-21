const page = document.body.dataset.page;
const slug = new URLSearchParams(window.location.search).get("slug") || "atlas";

const projects = {
  atlas: {
    title: "Atlas",
    type: "Brand + product redesign",
    year: "2024",
    role: "Lead designer",
    summary:
      "A focused redesign for a B2B workflow platform, turning a cluttered interface into a cleaner, faster, and more trustworthy product story.",
    challenge:
      "The original product had strong functionality but weak information hierarchy, which made the experience feel heavier than it needed to be.",
    approach:
      "We simplified the navigation, tightened the layout system, and introduced a clearer visual language for dashboards, task flows, and onboarding.",
    outcome:
      "The result is a portfolio-ready case study that communicates strategy, systems thinking, and polished execution.",
  },
  northstar: {
    title: "Northstar",
    type: "Mobile experience",
    year: "2023",
    role: "Product designer",
    summary:
      "A mobile-first service experience designed to reduce friction in onboarding and make daily use feel immediate and calm.",
    challenge:
      "Users were dropping off during setup because the flow asked too much too early.",
    approach:
      "I broke the process into smaller steps, added stronger defaults, and used clear progress cues throughout the experience.",
    outcome:
      "A lighter, more confident onboarding flow that is easier to understand on first use.",
  },
  signal: {
    title: "Signal",
    type: "Visual system",
    year: "2022",
    role: "Design systems",
    summary:
      "A design language and component library built to help a small team ship with consistency across marketing and product surfaces.",
    challenge:
      "Multiple teams were creating inconsistent UI patterns that slowed down design and development.",
    approach:
      "I defined reusable tokens, card patterns, type scales, and spacing rules that worked across different content types.",
    outcome:
      "The team gained a shared system that made future pages faster to design and easier to maintain.",
  },
};

function setCurrentNav() {
  const path = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav a").forEach((link) => {
    const target = link.getAttribute("href");
    if (target === path || (path === "" && target === "index.html")) {
      link.setAttribute("aria-current", "page");
    }
  });
}

function renderCaseStudy() {
  const project = projects[slug] || projects.atlas;
  const title = `${project.title} | Denis Matveev`;
  document.title = title;

  const titleNode = document.querySelector("[data-case-title]");
  const summaryNode = document.querySelector("[data-case-summary]");
  const metaNode = document.querySelector("[data-case-meta]");
  const detailsNode = document.querySelector("[data-case-details]");

  if (titleNode) titleNode.textContent = project.title;
  if (summaryNode) summaryNode.textContent = project.summary;
  if (metaNode) metaNode.textContent = `${project.type} · ${project.year} · ${project.role}`;
  if (detailsNode) {
    detailsNode.innerHTML = `
      <li><strong>Challenge</strong><br>${project.challenge}</li>
      <li><strong>Approach</strong><br>${project.approach}</li>
      <li><strong>Outcome</strong><br>${project.outcome}</li>
    `;
  }
}

setCurrentNav();

if (page === "case-study") {
  renderCaseStudy();
}
