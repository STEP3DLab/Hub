// script.js — функциональность демо-страницы Codex Lab
// Все обработчики вынесены в отдельные функции, чтобы их было проще тестировать
// и расширять.

const body = document.body;
const nav = document.querySelector('[data-nav]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const menuClose = document.querySelector('[data-menu-close]');
const navBackdrop = document.querySelector('[data-menu-backdrop]');
const navLinks = Array.from(document.querySelectorAll('[data-nav-link]'));
const askForm = document.querySelector('[data-ask-form]');
const contactForm = document.querySelector('[data-contact-form]');
const toast = document.querySelector('[data-toast]');

const focusableSelectors = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'textarea:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
];

let trapCleanup = null;

function trapFocus(container) {
  const focusable = container ? Array.from(container.querySelectorAll(focusableSelectors.join(','))) : [];
  if (!focusable.length) {
    return () => {};
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  function handleKeydown(event) {
    if (event.key !== 'Tab') return;
    if (event.shiftKey) {
      if (document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
    } else if (document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  container.addEventListener('keydown', handleKeydown);

  return () => {
    container.removeEventListener('keydown', handleKeydown);
  };
}

function openMenu() {
  if (!nav) return;
  nav.dataset.open = 'true';
  body.classList.add('is-locked');
  navBackdrop?.setAttribute('aria-hidden', 'false');
  navBackdrop?.classList.add('is-visible');
  const panel = nav.querySelector('[data-menu-panel]');
  if (panel) {
    panel.setAttribute('aria-hidden', 'false');
    const firstFocusable = panel.querySelector(focusableSelectors.join(','));
    firstFocusable?.focus({ preventScroll: true });
    trapCleanup = trapFocus(panel);
  }
  menuToggle?.setAttribute('aria-expanded', 'true');
}

function closeMenu() {
  if (!nav) return;
  nav.dataset.open = 'false';
  body.classList.remove('is-locked');
  navBackdrop?.setAttribute('aria-hidden', 'true');
  navBackdrop?.classList.remove('is-visible');
  const panel = nav.querySelector('[data-menu-panel]');
  panel?.setAttribute('aria-hidden', 'true');
  trapCleanup?.();
  trapCleanup = null;
  menuToggle?.setAttribute('aria-expanded', 'false');
  menuToggle?.focus({ preventScroll: true });
}

menuToggle?.addEventListener('click', () => {
  const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
  if (expanded) {
    closeMenu();
  } else {
    openMenu();
  }
});

menuClose?.addEventListener('click', closeMenu);
navBackdrop?.addEventListener('click', closeMenu);

navLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    const href = link.getAttribute('href');
    if (!href || !href.startsWith('#')) return;
    const target = document.querySelector(href);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    closeMenu();
  });
});

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const { id } = entry.target;
      navLinks.forEach((link) => {
        const href = link.getAttribute('href');
        const active = href === `#${id}`;
        link.classList.toggle('is-active', active);
        if (active) {
          link.setAttribute('aria-current', 'page');
        } else {
          link.removeAttribute('aria-current');
        }
      });
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-section]').forEach((section) => observer.observe(section));
}

function showToast(message, tone = 'neutral') {
  if (!toast) return;
  toast.textContent = message;
  toast.dataset.tone = tone;
  toast.hidden = false;
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => {
    toast.hidden = true;
  }, 5000);
}

async function requestRemoteAnswer(payload) {
  // Сначала пробуем отправить запрос на основной API (демо-URL заглушка).
  try {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 8000);
    const response = await fetch('https://chatgpt.com/codex/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    window.clearTimeout(timeoutId);
    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }
    const data = await response.json();
    if (!data || typeof data.answer !== 'string') {
      throw new Error('Malformed response');
    }
    return { ok: true, message: data.answer };
  } catch (error) {
    return { ok: false, error };
  }
}

async function requestFallbackAnswer(payload) {
  // Используем статический JSON как резервный источник данных.
  const response = await fetch('assets/mock-answer.json');
  if (!response.ok) {
    throw new Error('Fallback data is not available');
  }
  const data = await response.json();
  const message = (data.answer || '').replace('{question}', payload.question ?? '');
  return { ok: true, message };
}

async function askAssistant(question) {
  const payload = { question: question.trim(), timestamp: new Date().toISOString() };
  const remote = await requestRemoteAnswer(payload);
  if (remote.ok) {
    return remote;
  }
  try {
    return await requestFallbackAnswer(payload);
  } catch (fallbackError) {
    console.error('Fallback request failed', fallbackError);
    return { ok: false, message: 'Ошибка связи' };
  }
}

async function submitAskForm(event) {
  event.preventDefault();
  if (!askForm) return;
  const formData = new FormData(askForm);
  const question = String(formData.get('question') || '');
  const statusField = askForm.querySelector('[data-form-status]');
  if (question.trim().length < 5) {
    statusField.textContent = 'Пожалуйста, напишите чуть подробнее, чтобы мы могли помочь.';
    statusField.dataset.state = 'error';
    statusField.hidden = false;
    return;
  }

  askForm.setAttribute('data-busy', 'true');
  statusField.hidden = false;
  statusField.dataset.state = 'info';
  statusField.textContent = 'Отправляем вопрос…';

  const result = await askAssistant(question);

  askForm.removeAttribute('data-busy');
  if (result.ok) {
    statusField.dataset.state = 'success';
    statusField.textContent = result.message;
    askForm.reset();
    showToast('Ответ ассистента получен', 'success');
  } else {
    statusField.dataset.state = 'error';
    statusField.textContent = result.message ?? 'Ошибка связи';
    showToast('Ошибка связи. Попробуйте ещё раз позже.', 'error');
  }
}

askForm?.addEventListener('submit', submitAskForm);

async function submitContactForm(event) {
  event.preventDefault();
  if (!contactForm) return;
  const statusField = contactForm.querySelector('[data-form-status]');
  const formData = Object.fromEntries(new FormData(contactForm).entries());

  contactForm.setAttribute('data-busy', 'true');
  statusField.hidden = false;
  statusField.dataset.state = 'info';
  statusField.textContent = 'Отправляем сообщение…';

  try {
    const response = await fetch('https://chatgpt.com/codex/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    if (!response.ok) {
      throw new Error(`Status ${response.status}`);
    }
    statusField.dataset.state = 'success';
    statusField.textContent = 'Спасибо! Мы ответим на указанную почту.';
    showToast('Сообщение отправлено', 'success');
    contactForm.reset();
  } catch (error) {
    console.warn('Contact form request failed', error);
    statusField.dataset.state = 'error';
    statusField.textContent = 'Ошибка связи';
    showToast('Ошибка связи. Проверьте подключение и попробуйте снова.', 'error');
  } finally {
    contactForm.removeAttribute('data-busy');
  }
}

contactForm?.addEventListener('submit', submitContactForm);

const demoButtons = document.querySelectorAll('[data-solution-button]');
const demoOutput = document.querySelector('[data-solution-output]');

demoButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const targetId = button.getAttribute('data-solution-button');
    const target = document.getElementById(targetId);
    demoButtons.forEach((btn) => {
      const isActive = btn === button;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
    if (target && demoOutput) {
      demoOutput.innerHTML = target.innerHTML;
      demoOutput.classList.add('is-visible');
      demoOutput.setAttribute('aria-labelledby', `${targetId}-title`);
    }
  });
});

if (demoButtons.length) {
  demoButtons[0].click();
}

const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
if (prefersReducedMotion && 'addEventListener' in prefersReducedMotion) {
  prefersReducedMotion.addEventListener('change', (event) => {
    document.documentElement.dataset.reducedMotion = event.matches ? 'true' : 'false';
  });
}
