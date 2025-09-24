function parseNavData() {
  const navDataEl = document.getElementById("nav-data");
  if (!navDataEl) return [];
  try {
    const raw = navDataEl.dataset.nav ?? "[]";
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("[nav] Не удалось прочитать список навигации", error);
    return [];
  }
}

function createLink(item) {
  const link = document.createElement("a");
  const href = typeof item.href === "string" ? item.href : item.id ? `#${item.id}` : "#";
  link.href = href;
  link.textContent = item.label ?? href;
  link.className = "site-map__link";
  const isExternal = Boolean(item.external) || /^https?:/i.test(href);
  if (isExternal) {
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  }
  return link;
}

function createList(items) {
  const list = document.createElement("ul");
  list.className = "site-map__list";

  items.forEach((item) => {
    if (!item || !item.label) return;
    const listItem = document.createElement("li");
    listItem.className = "site-map__item";

    if (Array.isArray(item.children) && item.children.length) {
      const title = document.createElement("span");
      title.className = "site-map__item-title";
      title.textContent = item.label;
      listItem.appendChild(title);
      listItem.appendChild(createList(item.children));
    } else {
      listItem.appendChild(createLink(item));
    }

    list.appendChild(listItem);
  });

  return list;
}

function collectSectionIds(items, set) {
  items.forEach((item) => {
    if (!item) return;
    if (item.id) {
      set.add(item.id);
    }
    if (Array.isArray(item.children) && item.children.length) {
      collectSectionIds(item.children, set);
    }
  });
}

function renderSiteMap(navItems) {
  const siteMap = document.querySelector("[data-site-map]");
  const content = siteMap?.querySelector("[data-site-map-content]");
  if (!siteMap || !content) return { anchors: [], sections: [] };

  const groups = Array.isArray(navItems) ? navItems : [];
  content.innerHTML = "";

  const fragment = document.createDocumentFragment();
  const sectionIds = new Set();

  groups.forEach((group) => {
    const groupSection = document.createElement("section");
    groupSection.className = "site-map__group";

    if (group?.label) {
      const heading = document.createElement("h3");
      heading.className = "site-map__group-title";
      heading.textContent = group.label;
      groupSection.appendChild(heading);
    }

    const items = Array.isArray(group?.children) ? group.children : [];
    if (items.length) {
      groupSection.appendChild(createList(items));
      collectSectionIds(items, sectionIds);
    }

    fragment.appendChild(groupSection);
  });

  content.appendChild(fragment);

  const anchors = Array.from(content.querySelectorAll("a"));
  anchors.forEach((anchor) => {
    anchor.addEventListener("click", () => {
      window.requestAnimationFrame(() => {
        siteMap.open = false;
      });
    });
  });

  return {
    anchors,
    sections: Array.from(sectionIds),
  };
}

function initSiteMapHighlight(anchors, sectionIds) {
  const mappedAnchors = anchors
    .map((anchor) => {
      const href = anchor.getAttribute("href") ?? "";
      if (!href.startsWith("#")) return null;
      const id = href.slice(1);
      return id ? { id, anchor } : null;
    })
    .filter(Boolean);

  if (!mappedAnchors.length || !sectionIds.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const { id } = visible.target;
      mappedAnchors.forEach(({ id: anchorId, anchor }) => {
        const isActive = anchorId === id;
        anchor.classList.toggle("site-map__link--active", isActive);
        anchor.setAttribute("aria-current", isActive ? "page" : "false");
      });
    },
    { rootMargin: "-40% 0px -55% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
  );

  sectionIds.forEach((id) => {
    const section = document.getElementById(id);
    if (section) {
      observer.observe(section);
    }
  });
}

function initProgressBar() {
  const progress = document.getElementById("progress");
  if (!progress) return;
  const update = () => {
    const doc = document.documentElement;
    const range = doc.scrollHeight - doc.clientHeight;
    const ratio = range > 0 ? doc.scrollTop / range : 0;
    progress.style.transform = `scaleX(${Math.min(Math.max(ratio, 0), 1)})`;
  };
  document.addEventListener("scroll", update, { passive: true });
  update();
}

export function initNavigation() {
  const navItems = parseNavData();
  const { anchors, sections } = renderSiteMap(navItems);
  initSiteMapHighlight(anchors, sections);
  initProgressBar();
}
