const doc = document.documentElement;
if (doc.classList.contains('no-js')) {
  doc.classList.remove('no-js');
  doc.classList.add('js');
}

const body = document.body;
const themeButtons = document.querySelectorAll('[data-theme-toggle]');
const THEME_KEY = 'step3dlab-theme';

const getStoredTheme = () => {
  try {
    return localStorage.getItem(THEME_KEY);
  } catch (error) {
    return null;
  }
};

const storeTheme = (value) => {
  try {
    localStorage.setItem(THEME_KEY, value);
  } catch (error) {
    /* noop */
  }
};

const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

const applyTheme = (theme, { persist = true } = {}) => {
  const themeValue = theme === 'dark' ? 'dark' : 'light';
  body.classList.toggle('theme-dark', themeValue === 'dark');
  themeButtons.forEach((button) => {
    button.setAttribute('aria-pressed', themeValue === 'dark' ? 'true' : 'false');
    button.title = themeValue === 'dark' ? 'Переключить на светлую тему' : 'Переключить на тёмную тему';
  });
  if (persist) {
    storeTheme(themeValue);
  }
};

const storedTheme = getStoredTheme();
const initialTheme = storedTheme ?? (prefersDark ? 'dark' : 'light');
applyTheme(initialTheme, { persist: Boolean(storedTheme) });

if (!storedTheme && window.matchMedia) {
  const themeQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const updateFromSystem = (event) => applyTheme(event.matches ? 'dark' : 'light', { persist: false });
  if (typeof themeQuery.addEventListener === 'function') {
    themeQuery.addEventListener('change', updateFromSystem);
  } else if (typeof themeQuery.addListener === 'function') {
    themeQuery.addListener(updateFromSystem);
  }
}

themeButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const next = body.classList.contains('theme-dark') ? 'light' : 'dark';
    applyTheme(next);
  });
});

// Navigation highlight
const navLinks = Array.from(document.querySelectorAll('[data-nav-link]'));
const uniqueIds = [...new Set(navLinks
  .map((link) => link.getAttribute('href'))
  .filter((href) => href && href.startsWith('#'))
  .map((href) => href.slice(1))))];

const sections = uniqueIds
  .map((id) => ({ id, element: document.getElementById(id) }))
  .filter((item) => item.element);

const updateActiveLink = (id) => {
  navLinks.forEach((link) => {
    const href = link.getAttribute('href');
    const isActive = href === `#${id}`;
    if (isActive) {
      link.setAttribute('aria-current', 'true');
    } else {
      link.removeAttribute('aria-current');
    }
  });
};

if (sections.length) {
  updateActiveLink(sections[0].id);
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        updateActiveLink(entry.target.id);
      }
    });
  }, {
    root: null,
    threshold: 0.45,
    rootMargin: '-10% 0px -40% 0px'
  });

  sections.forEach(({ element }) => observer.observe(element));
}

// Site map overlay
const menuToggle = document.getElementById('menuToggle');
const siteMap = document.getElementById('siteMap');
const siteMapPanel = siteMap?.querySelector('.site-map__panel');
const siteMapCloseButtons = siteMap?.querySelectorAll('[data-site-map-close]') ?? [];
let siteMapLastFocus = null;

const focusableSelector = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const trapFocus = (container, event) => {
  if (event.key !== 'Tab') return;
  const focusable = Array.from(container.querySelectorAll(focusableSelector)).filter((el) => el.offsetParent !== null || el === document.activeElement);
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey) {
    if (document.activeElement === first) {
      event.preventDefault();
      last.focus();
    }
  } else if (document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
};

const openSiteMap = () => {
  if (!siteMap) return;
  siteMap.hidden = false;
  requestAnimationFrame(() => {
    siteMap.dataset.open = 'true';
  });
  body.classList.add('has-overlay');
  siteMapLastFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  menuToggle?.setAttribute('aria-expanded', 'true');
  const firstFocusable = siteMapPanel?.querySelector(focusableSelector);
  firstFocusable?.focus({ preventScroll: true });
  siteMap.addEventListener('keydown', onSiteMapKeyDown);
};

const closeSiteMap = () => {
  if (!siteMap || siteMap.hidden) return;
  delete siteMap.dataset.open;
  body.classList.remove('has-overlay');
  menuToggle?.setAttribute('aria-expanded', 'false');
  const handleTransitionEnd = () => {
    siteMap.hidden = true;
    siteMap.removeEventListener('transitionend', handleTransitionEnd);
  };
  siteMap.addEventListener('transitionend', handleTransitionEnd);
  setTimeout(handleTransitionEnd, 320);
  siteMap.removeEventListener('keydown', onSiteMapKeyDown);
  siteMapLastFocus?.focus?.({ preventScroll: true });
};

const onSiteMapKeyDown = (event) => {
  if (event.key === 'Escape') {
    event.preventDefault();
    closeSiteMap();
  } else {
    trapFocus(siteMapPanel ?? siteMap, event);
  }
};

menuToggle?.addEventListener('click', () => {
  const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
  if (expanded) {
    closeSiteMap();
  } else {
    openSiteMap();
  }
});

siteMap?.addEventListener('click', (event) => {
  if (event.target === siteMap) {
    closeSiteMap();
  }
});

siteMapCloseButtons.forEach((button) => button.addEventListener('click', closeSiteMap));

// Dialog handling
const dialog = document.getElementById('enrollDialog');
const dialogOpenButtons = document.querySelectorAll('[data-open-dialog]');
const dialogCloseButtons = document.querySelectorAll('[data-dialog-close]');

const openDialog = () => {
  if (!dialog) return;
  if (typeof dialog.showModal === 'function') {
    dialog.showModal();
  } else {
    window.location.hash = '#enroll';
  }
};

dialogOpenButtons.forEach((button) => button.addEventListener('click', openDialog));

dialogCloseButtons.forEach((button) => button.addEventListener('click', () => {
  if (!dialog) return;
  if (dialog.open) dialog.close();
}));

// Close dialog on form submission and show acknowledgement
if (dialog) {
  dialog.addEventListener('close', () => {
    if (!dialog.returnValue) return;
    const acknowledgement = document.createElement('div');
    acknowledgement.className = 'form__success';
    acknowledgement.setAttribute('role', 'status');
    acknowledgement.textContent = 'Спасибо! Мы свяжемся с вами в ближайшее время.';
    dialog.insertAdjacentElement('afterend', acknowledgement);
    setTimeout(() => acknowledgement.remove(), 5000);
  });
}

// Inline form submission feedback
const inlineForm = document.querySelector('#enroll form');
if (inlineForm) {
  const success = document.createElement('p');
  success.className = 'form__success';
  success.setAttribute('role', 'status');
  success.setAttribute('aria-live', 'polite');
  success.hidden = true;
  inlineForm.append(success);

  inlineForm.addEventListener('submit', (event) => {
    event.preventDefault();
    inlineForm.reset();
    success.hidden = false;
    success.textContent = 'Спасибо! Мы свяжемся с вами в ближайшее время.';
    inlineForm.append(success);
    setTimeout(() => {
      success.hidden = true;
    }, 6000);
  });
}

// Smooth scrolling fallback for older browsers
navLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    const href = link.getAttribute('href');
    if (!href || !href.startsWith('#')) return;
    const target = document.querySelector(href);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    closeSiteMap();
  });
});
