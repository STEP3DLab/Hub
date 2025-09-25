(function () {
  const PHONE_REGEXP = /^(?:\+?7|8)?[\s-]?\(?(\d{3})\)?[\s-]?(\d{3})[\s-]?(\d{2})[\s-]?(\d{2})$/;
  const EMAIL_REGEXP = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

  function getErrorElement(field) {
    const describedBy = field.getAttribute('aria-describedby');
    if (describedBy) {
      const ids = describedBy.split(/\s+/);
      for (const id of ids) {
        if (!id) continue;
        const el = document.getElementById(id);
        if (el) return el;
      }
    }
    return field.closest('[data-field-wrapper]')?.querySelector('[data-error-message]') || null;
  }

  function setFieldError(field, message) {
    const errorEl = getErrorElement(field);
    if (message) {
      field.setAttribute('aria-invalid', 'true');
      if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.remove('hidden');
      }
    } else {
      field.setAttribute('aria-invalid', 'false');
      if (errorEl) {
        errorEl.textContent = '';
        errorEl.classList.add('hidden');
      }
    }
  }

  function validateField(field) {
    const name = field.name;
    const value = field.value.trim();
    let error = '';

    const isRequired = field.hasAttribute('required');

    if (name === 'name') {
      if (!value) {
        error = 'Укажите ваше имя.';
      }
    } else if (name === 'phone') {
      if (!value && isRequired) {
        error = 'Введите номер телефона.';
      } else if (value && !PHONE_REGEXP.test(value.replace(/\s+/g, ''))) {
        error = 'Телефон должен быть в формате +7 (XXX) XXX-XX-XX.';
      }
    } else if (name === 'email') {
      if (!value && isRequired) {
        error = 'Укажите адрес электронной почты.';
      } else if (value && !EMAIL_REGEXP.test(value)) {
        error = 'Проверьте корректность адреса электронной почты.';
      }
    } else if (name === 'agreement') {
      if (!field.checked) {
        error = 'Необходимо согласие на обработку персональных данных.';
      }
    } else if (field.hasAttribute('required') && !value) {
      error = 'Заполните это поле.';
    }

    setFieldError(field, error);
    return !error;
  }

  function setStatus(form, message, variant) {
    const status = form.querySelector('[data-form-status]');
    if (!status) return;
    const successClasses = ['text-emerald-600', 'dark:text-emerald-300'];
    const errorClasses = ['text-rose-600', 'dark:text-rose-400'];
    status.classList.remove('hidden', ...successClasses, ...errorClasses);
    if (!message) {
      status.textContent = '';
      status.classList.add('hidden');
      return;
    }
    if (variant === 'success') {
      status.classList.add(...successClasses);
      status.classList.remove(...errorClasses);
    } else if (variant === 'error') {
      status.classList.add(...errorClasses);
      status.classList.remove(...successClasses);
    } else {
      status.classList.remove(...successClasses, ...errorClasses);
    }
    status.textContent = message;
  }

  function serializeForm(form) {
    const fd = new FormData(form);
    const entries = [];
    for (const [key, rawValue] of fd.entries()) {
      if (key === 'company') continue;
      if (typeof rawValue === 'string') {
        entries.push([key, rawValue.trim()]);
      } else {
        entries.push([key, rawValue]);
      }
    }
    return Object.fromEntries(entries);
  }

  async function submitForm(form) {
    const endpoint = form.dataset.endpoint || 'https://httpbin.org/post';
    const serviceId = form.dataset.emailjsService?.trim();
    const templateId = form.dataset.emailjsTemplate?.trim();
    const publicKey = form.dataset.emailjsPublicKey?.trim();
    const useEmailJs = serviceId && templateId && publicKey;
    const payload = serializeForm(form);
    const requestInit = { method: 'POST' };

    if (useEmailJs) {
      requestInit.headers = { 'Content-Type': 'application/json' };
      requestInit.body = JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        template_params: payload,
      });
    } else {
      requestInit.headers = { 'Content-Type': 'application/json' };
      requestInit.body = JSON.stringify(payload);
    }

    const response = await fetch(endpoint, requestInit);
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    return response;
  }

  function resetFormState(form) {
    form.querySelectorAll('[aria-invalid="true"]').forEach((field) => {
      field.setAttribute('aria-invalid', 'false');
    });
    form
      .querySelectorAll('[data-error-message]')
      .forEach((el) => {
        el.textContent = '';
        el.classList.add('hidden');
      });
  }

  function initForm(form) {
    form.addEventListener('input', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement)) {
        return;
      }
      if (target.name === 'agreement' && !(target instanceof HTMLInputElement)) {
        return;
      }
      validateField(target);
    });

    form.addEventListener('change', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement)) {
        return;
      }
      validateField(target);
    });

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if ((form.querySelector('input[name="company"]')?.value || '').trim()) {
        // Honeypot triggered
        setStatus(form, 'Не удалось отправить форму. Попробуйте ещё раз позже.', 'error');
        return;
      }

      let valid = true;
      const fields = form.querySelectorAll('input, select, textarea');
      fields.forEach((field) => {
        if (
          field instanceof HTMLInputElement ||
          field instanceof HTMLSelectElement ||
          field instanceof HTMLTextAreaElement
        ) {
          if (field.type === 'hidden' || field.name === 'company') return;
          const fieldValid = validateField(field);
          if (!fieldValid) {
            valid = false;
          }
        }
      });

      if (!valid) {
        setStatus(form, 'Проверьте выделенные поля и заполните корректно.', 'error');
        return;
      }

      const submitBtn = form.querySelector('[data-submit]');
      submitBtn?.setAttribute('aria-busy', 'true');
      if (submitBtn) {
        submitBtn.disabled = true;
      }

      setStatus(form, 'Отправляем заявку…', '');

      try {
        await submitForm(form);
        setStatus(
          form,
          form.dataset.successMessage || 'Форма успешно отправлена. Спасибо!',
          'success',
        );
        form.dataset.skipStatus = 'true';
        form.reset();
        const autoCloseDelay = Number(form.dataset.autoCloseDelay || 2000);
        setTimeout(() => {
          if (window.step3dModal?.close) {
            window.step3dModal.close();
          }
          setStatus(form, '', '');
        }, autoCloseDelay);
      } catch (error) {
        console.error('[Request error]', error);
        setStatus(
          form,
          form.dataset.errorMessage ||
            'Сервис временно недоступен. Свяжитесь с нами по почте projects.step3d@gmail.com.',
          'error',
        );
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.removeAttribute('aria-busy');
        }
      }
    });

    form.addEventListener('reset', () => {
      const preserveStatus = form.dataset.skipStatus === 'true';
      resetFormState(form);
      if (!preserveStatus) {
        setStatus(form, '', '');
      } else {
        delete form.dataset.skipStatus;
      }
    });

    resetFormState(form);
    setStatus(form, '', '');
  }

  document.addEventListener('DOMContentLoaded', () => {
    document
      .querySelectorAll('[data-request-form]')
      .forEach((form) => initForm(form));
  });
})();
