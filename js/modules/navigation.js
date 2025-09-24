const DESKTOP_CLASSES = "top-nav__link";
const MOBILE_CLASSES = "top-nav__mobile-link";

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

function renderLinks(container, variant, navItems) {
  if (!container) return [];
  container.innerHTML = "";
  const className = variant === "desktop" ? DESKTOP_CLASSES : MOBILE_CLASSES;
  navItems.forEach(({ id, label }) => {
    const link = document.createElement("a");
    link.href = `#${id}`;
    link.dataset.navLink = "true";
    link.textContent = label;
    link.className = className;
    container.appendChild(link);
  });
  return Array.from(container.querySelectorAll("a[data-nav-link]"));
}

function observeSections(sectionIds, anchors) {
  if (!sectionIds.length || !anchors.length) return;
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const { id } = visible.target;
      anchors.forEach((anchor) => {
        const isActive = anchor.getAttribute("href") === `#${id}`;
        anchor.classList.toggle("active-link", isActive);
        anchor.setAttribute("aria-current", isActive ? "page" : "false");
      });
    },
    { rootMargin: "-40% 0px -55% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
  );

  sectionIds.forEach((id) => {
    const element = document.getElementById(id);
    if (element) observer.observe(element);
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
  const linksWrap = document.getElementById("links");
  const mobileWrap = document.getElementById("mobile");
  const mobileLinks = document.getElementById("mobileLinks") || mobileWrap;
  const burger = document.getElementById("burger");
  const mobileBackdrop = document.getElementById("mobile-backdrop");
  const mobileContact = document.getElementById("mobileContact");

  if (burger && mobileWrap) {
    burger.setAttribute("aria-controls", mobileWrap.id);
  }

  const desktopAnchors = renderLinks(linksWrap, "desktop", navItems);
  const mobileAnchors = renderLinks(mobileLinks, "mobile", navItems);

  const setMobileState = (open) => {
    if (!mobileWrap) return;
    const wasOpen = !mobileWrap.classList.contains("hidden");
    mobileWrap.classList.toggle("hidden", !open);
    mobileWrap.setAttribute("aria-hidden", open ? "false" : "true");
    mobileBackdrop?.classList.toggle("hidden", !open);
    document.body.classList.toggle("overflow-hidden", open);
    if (burger) {
      burger.setAttribute("aria-expanded", String(open));
    }
    if (open) {
      const focusable = mobileWrap.querySelector(
        "a, button, [tabindex]:not([tabindex='-1'])",
      );
      focusable?.focus({ preventScroll: true });
    } else if (wasOpen) {
      burger?.focus({ preventScroll: true });
    }
  };

  if (mobileWrap) {
    mobileWrap
      .querySelectorAll("a[data-nav-link]")
      .forEach((anchor) =>
        anchor.addEventListener("click", () => setMobileState(false)),
      );
  }

  mobileContact?.addEventListener("click", () => setMobileState(false));
  burger?.addEventListener("click", () => {
    const open = mobileWrap?.classList.contains("hidden") === false;
    setMobileState(!open);
  });
  mobileBackdrop?.addEventListener("click", () => setMobileState(false));
  window.addEventListener("resize", () => {
    if (window.innerWidth >= 768) setMobileState(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMobileState(false);
  });

  observeSections(
    navItems.map((item) => item.id).filter(Boolean),
    [...desktopAnchors, ...mobileAnchors],
  );
  initProgressBar();
}
