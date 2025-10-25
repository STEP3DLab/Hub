// Этот файл разместите рядом с index.html на GitHub Pages, чтобы вся интерактивность работала корректно

// Глобальная конфигурация. Редактируйте эти значения, чтобы обновить текст и цены без поиска по шаблону.
const CONFIG = {
    eventName: "Интенсив по искусственному интеллекту",
    eventDateISO: "2024-12-14T09:00:00+03:00",
    city: "Москва",
    venue: "Москва, Технопарк РГСУ, ул. Примерная, дом 1",
    priceOnline: 7900,
    priceOffline: 12900,
    seatsOnline: 50,
    seatsOffline: 30,
    contactEmail: "hello@course-ai.ru",
    contactPhone: "+7 (495) 123-45-67",
    policyURL: "privacy.html",
    offerURL: "offer.html"
};

// Заготовка для GA4. Позже можно заменить на реальный скрипт, просто удалите mock и вставьте официальный код.
window.dataLayer = window.dataLayer || [];
function gtag() {
    window.dataLayer.push(arguments);
    if (window.console && typeof window.console.info === "function") {
        console.info("gtag mock:", arguments);
    }
}

// Заготовка Яндекс Метрики. В параметры передаем идентификатор счетчика и название события.
function ym(counterId, eventName, params = {}) {
    if (!window.__ymQueue) {
        window.__ymQueue = [];
    }
    window.__ymQueue.push({ counterId, eventName, params });
    if (window.console && typeof window.console.info === "function") {
        console.info("ym mock:", counterId, eventName, params);
    }
}

// Данные FAQ дублируют контент в разметке. Измените здесь и в HTML, чтобы они совпадали.
const FAQ_DATA = [
    {
        question: "Нужно ли готовиться заранее?",
        answer: "Мы пришлем чек лист по сервисам и подготовим аккаунты. Возьмите ноутбук, наушники и зарядку."
    },
    {
        question: "Будет ли запись трансляции?",
        answer: "Да. Доступ к записям и материалам сохраняется на 6 месяцев для всех тарифов."
    },
    {
        question: "Чем отличаются тарифы?",
        answer: "Онлайн включает трансляцию и групповые сессии. Офлайн дает рабочее место, оборудование и личный аудит."
    },
    {
        question: "Можно оплатить от компании?",
        answer: "Мы выставляем счет и договор. Отправьте реквизиты и менеджер подготовит документы в течение дня."
    },
    {
        question: "Что если планы изменятся?",
        answer: "Предупредите заранее. Перенесем на следующий поток или предоставим запись и материалы."
    },
    {
        question: "Поможете внедрить решения?",
        answer: "Наставники сопровождают 14 дней после интенсива и помогают запускать пилоты."
    }
];

// Форматирование чисел и дат в удобном виде для посетителя.
const formatPrice = (value) => `${value.toLocaleString("ru-RU")} ₽`;
const formatSeats = (count) => `Осталось ${count} мест`;
const formatDateHuman = (iso) => {
    const date = new Date(iso);
    return date.toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        hour: "2-digit",
        minute: "2-digit"
    });
};

// Состояние приложения. Хранит UTM метки и текущий тариф.
const state = {
    utm: {
        utm_source: "direct",
        utm_medium: "none",
        utm_campaign: "default",
        utm_content: "",
        utm_term: ""
    },
    hasTriggeredRegistrationEvent: false,
    currentTariff: "online"
};

// Основная точка входа. После загрузки DOM инициализируем весь функционал.
document.addEventListener("DOMContentLoaded", () => {
    bindConfigData();
    parseUTMs();
    applyUTMToLinks();
    initSmoothScroll();
    initNavToggle();
    initScrollSpy();
    initProgramToggle();
    initReviewSlider();
    initFaqAccordion();
    initForm();
    initStickyCTA();
    initParticles();
    initAnalyticsObservers();
    injectJsonLd();
    observeHeaderShadow();
});

// Подстановка данных из CONFIG в разметку. Это избавляет от ручного редактирования HTML.
function bindConfigData() {
    const dateElement = document.querySelector('[data-config-text="eventDateHuman"]');
    if (dateElement) {
        dateElement.textContent = formatDateHuman(CONFIG.eventDateISO);
    }

    const venueElement = document.querySelector('[data-config-text="venue"]');
    if (venueElement) {
        venueElement.textContent = CONFIG.venue;
    }

    const yearElement = document.querySelector('[data-config-text="eventYear"]');
    if (yearElement) {
        yearElement.textContent = new Date(CONFIG.eventDateISO).getFullYear();
    }

    const organizerElement = document.querySelector('[data-config-text="organizerName"]');
    if (organizerElement) {
        organizerElement.textContent = "Технопарк РГСУ";
    }

    document.querySelectorAll('[data-config-link="email"]').forEach((link) => {
        link.href = `mailto:${CONFIG.contactEmail}`;
        link.textContent = CONFIG.contactEmail;
    });

    document.querySelectorAll('[data-config-link="emailFooter"]').forEach((link) => {
        link.href = `mailto:${CONFIG.contactEmail}`;
        link.textContent = CONFIG.contactEmail;
    });

    document.querySelectorAll('[data-config-link="phone"]').forEach((link) => {
        const sanitized = CONFIG.contactPhone.replace(/\D/g, "");
        link.href = `tel:${sanitized}`;
        link.textContent = CONFIG.contactPhone;
    });

    document.querySelectorAll('[data-config-link="phoneFooter"]').forEach((link) => {
        const sanitized = CONFIG.contactPhone.replace(/\D/g, "");
        link.href = `tel:${sanitized}`;
        link.textContent = CONFIG.contactPhone;
    });

    document.querySelectorAll('a[href="privacy.html"]').forEach((link) => {
        link.href = CONFIG.policyURL;
    });

    document.querySelectorAll('a[href="offer.html"]').forEach((link) => {
        link.href = CONFIG.offerURL;
    });

    const priceOnlineElement = document.querySelector('[data-price-label="online"]');
    if (priceOnlineElement) {
        priceOnlineElement.textContent = formatPrice(CONFIG.priceOnline);
    }

    const priceOfflineElement = document.querySelector('[data-price-label="offline"]');
    if (priceOfflineElement) {
        priceOfflineElement.textContent = formatPrice(CONFIG.priceOffline);
    }

    const seatsOnlineElement = document.querySelector('[data-seats-label="online"]');
    if (seatsOnlineElement) {
        seatsOnlineElement.textContent = formatSeats(CONFIG.seatsOnline);
    }

    const seatsOfflineElement = document.querySelector('[data-seats-label="offline"]');
    if (seatsOfflineElement) {
        seatsOfflineElement.textContent = formatSeats(CONFIG.seatsOffline);
    }

    const stickyPrice = document.querySelector('[data-sticky-price]');
    if (stickyPrice) {
        stickyPrice.textContent = formatPrice(CONFIG.priceOnline);
    }
}

// Читаем UTM метки из адресной строки и сохраняем в state.
function parseUTMs() {
    const params = new URLSearchParams(window.location.search);
    if (params.toString()) {
        state.utm = {
            utm_source: params.get("utm_source") || "direct",
            utm_medium: params.get("utm_medium") || "none",
            utm_campaign: params.get("utm_campaign") || "default",
            utm_content: params.get("utm_content") || "",
            utm_term: params.get("utm_term") || ""
        };
    }
}

// Применяем UTM метки ко всем CTA. Для внешних ссылок добавляем параметры, для внутренних учитываем якорь.
function applyUTMToLinks() {
    const utmString = window.location.search;
    const utmQuery = utmString ? utmString.replace(/^\?/, "") : "";

    document.querySelectorAll('[data-cta="true"]').forEach((cta) => {
        if (cta.tagName === "A") {
            const baseHref = cta.getAttribute("data-href-base") || cta.getAttribute("href") || "";
            let computedHref = baseHref;

            if (baseHref.startsWith("#")) {
                const basePath = window.location.pathname;
                computedHref = utmQuery ? `${basePath}?${utmQuery}${baseHref}` : `${basePath}${baseHref}`;
            } else if (baseHref.includes("?")) {
                computedHref = utmQuery ? `${baseHref}&${utmQuery}` : baseHref;
            } else if (baseHref.startsWith("http")) {
                computedHref = utmQuery ? `${baseHref}?${utmQuery}` : baseHref;
            }

            cta.setAttribute("href", computedHref);
        }

        cta.dataset.utmSource = state.utm.utm_source;
        cta.dataset.utmCampaign = state.utm.utm_campaign;
        cta.addEventListener("click", () => {
            trackEvent("click_cta", {
                tariff: cta.dataset.tariff || state.currentTariff,
                position: cta.dataset.position || "unknown"
            });
        });
    });
}

// Плавная прокрутка учитывает высоту шапки и закрывает мобильное меню после перехода.
function initSmoothScroll() {
    const header = document.querySelector("[data-header]");
    const offset = () => (header ? header.getBoundingClientRect().height : 0);

    function scrollToTarget(targetId) {
        const element = document.querySelector(targetId);
        if (!element) return;
        const top = element.getBoundingClientRect().top + window.scrollY - offset() - 16;
        window.scrollTo({ top, behavior: "smooth" });
    }

    document.querySelectorAll("[data-scroll]").forEach((link) => {
        link.addEventListener("click", (event) => {
            const href = link.getAttribute("href");
            if (href && href.startsWith("#")) {
                event.preventDefault();
                scrollToTarget(href);
                closeMobileMenu();
            }
        });
    });

    const topButton = document.querySelector("[data-scroll-top]");
    if (topButton) {
        topButton.addEventListener("click", () => scrollToTarget("#hero"));
    }
}

// Управление мобильным меню.
function initNavToggle() {
    const toggle = document.querySelector("[data-nav-toggle]");
    const list = document.querySelector("[data-nav-list]");
    if (!toggle || !list) return;

    toggle.addEventListener("click", () => {
        const expanded = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", String(!expanded));
        list.classList.toggle("is-open", !expanded);
    });
}

function closeMobileMenu() {
    const toggle = document.querySelector("[data-nav-toggle]");
    const list = document.querySelector("[data-nav-list]");
    if (toggle && list) {
        toggle.setAttribute("aria-expanded", "false");
        list.classList.remove("is-open");
    }
}

// Подсветка активного пункта меню при помощи IntersectionObserver.
function initScrollSpy() {
    const links = Array.from(document.querySelectorAll("[data-nav-link]"));
    const sections = links
        .map((link) => document.querySelector(link.getAttribute("href")))
        .filter(Boolean);

    if (!links.length || !sections.length) return;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                const id = entry.target.getAttribute("id");
                const activeLink = links.find((link) => link.getAttribute("href") === `#${id}`);
                if (!activeLink) return;
                if (entry.isIntersecting) {
                    links.forEach((link) => link.classList.remove("is-active"));
                    activeLink.classList.add("is-active");
                }
            });
        },
        { threshold: 0.6 }
    );

    sections.forEach((section) => observer.observe(section));
}

// Показ и скрытие расширенной программы.
function initProgramToggle() {
    const toggleButton = document.querySelector("[data-program-toggle]");
    const extraBlock = document.querySelector("[data-program-extra]");
    if (!toggleButton || !extraBlock) return;

    toggleButton.addEventListener("click", () => {
        const expanded = toggleButton.getAttribute("aria-expanded") === "true";
        toggleButton.setAttribute("aria-expanded", String(!expanded));
        if (expanded) {
            extraBlock.hidden = true;
            toggleButton.textContent = "Показать полную программу";
        } else {
            extraBlock.hidden = false;
            toggleButton.textContent = "Скрыть полную программу";
            trackEvent("view_program", { position: "button" });
        }
    });
}

// Простая реализация слайдера отзывов.
function initReviewSlider() {
    const track = document.querySelector("[data-slider-track]");
    const prev = document.querySelector("[data-slider-prev]");
    const next = document.querySelector("[data-slider-next]");
    if (!track || !prev || !next) return;

    const slides = Array.from(track.children);
    let index = 0;

    function updateSlider() {
        if (!slides.length) return;
        const slideWidth = slides[0].getBoundingClientRect().width + 24;
        const offset = -(index * slideWidth);
        track.style.transform = `translateX(${offset}px)`;
    }

    prev.addEventListener("click", () => {
        index = Math.max(0, index - 1);
        updateSlider();
    });

    next.addEventListener("click", () => {
        index = Math.min(slides.length - 1, index + 1);
        updateSlider();
    });

    window.addEventListener("resize", () => {
        window.requestAnimationFrame(updateSlider);
    });
}

// Аккордеон для FAQ с поддержкой клавиатуры.
function initFaqAccordion() {
    document.querySelectorAll("[data-faq-item]").forEach((item) => {
        const button = item.querySelector("[data-faq-button]");
        const panel = item.querySelector("[data-faq-panel]");
        if (!button || !panel) return;

        button.addEventListener("click", () => {
            const expanded = button.getAttribute("aria-expanded") === "true";
            button.setAttribute("aria-expanded", String(!expanded));
            panel.hidden = expanded;
        });

        button.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                button.click();
            }
        });
    });
}

// Обработка формы регистрации: валидация, вывод ошибок и отправка mock.
function initForm() {
    const form = document.querySelector("[data-registration-form]");
    const successBanner = document.querySelector("[data-success-banner]");
    if (!form) return;

    const requiredFields = form.querySelectorAll("[data-required]");
    const emailField = form.querySelector('input[type="email"]');
    const phoneField = form.querySelector("[data-phone-mask]");

    if (phoneField) {
        phoneField.addEventListener("input", () => {
            phoneField.value = formatPhone(phoneField.value);
        });
    }

    requiredFields.forEach((field) => {
        field.addEventListener("focus", () => {
            if (!state.hasTriggeredRegistrationEvent) {
                state.hasTriggeredRegistrationEvent = true;
                trackEvent("start_registration", { position: "form" });
            }
        });
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        let isValid = true;

        requiredFields.forEach((field) => {
            const errorElement = form.querySelector(`[data-error-for="${field.id}"]`);
            if (!errorElement) return;

            if (field.type === "checkbox" && !field.checked) {
                errorElement.textContent = "Нужно согласиться с условиями";
                isValid = false;
                return;
            }

            if (!field.value.trim()) {
                errorElement.textContent = "Заполните поле";
                isValid = false;
                return;
            }

            if (field.type === "email" && !validateEmail(field.value)) {
                errorElement.textContent = "Введите корректный email";
                isValid = false;
                return;
            }

            if (field.hasAttribute("data-phone-mask") && !validatePhone(field.value)) {
                errorElement.textContent = "Введите телефон в формате +7 (XXX) XXX-XX-XX";
                isValid = false;
                return;
            }

            errorElement.textContent = "";
        });

        if (!isValid) {
            return;
        }

        const formData = {
            fullName: form.fullName.value.trim(),
            email: emailField ? emailField.value.trim() : "",
            phone: phoneField ? phoneField.value.trim() : "",
            comment: form.comment.value.trim(),
            consent: form.consent.checked,
            tariff: state.currentTariff,
            utm: state.utm
        };

        console.log("Form data:", formData);
        trackEvent("submit_lead", { tariff: state.currentTariff, position: "form" });

        if (successBanner) {
            successBanner.hidden = false;
        }

        form.reset();
    });

    form.querySelectorAll("input, textarea").forEach((field) => {
        field.addEventListener("input", () => {
            const errorElement = form.querySelector(`[data-error-for="${field.id}"]`);
            if (errorElement) {
                errorElement.textContent = "";
            }
        });
    });
}

// Форматирование телефонов с автоматической подстановкой скобок и дефисов.
function formatPhone(value) {
    const digits = value.replace(/\D/g, "").replace(/^8/, "7");
    if (!digits) return "";
    const parts = [
        digits.substring(1, 4),
        digits.substring(4, 7),
        digits.substring(7, 9),
        digits.substring(9, 11)
    ];
    let result = "+7";
    if (parts[0]) {
        result += ` (${parts[0]}` + (parts[0].length === 3 ? ")" : "");
    }
    if (parts[1]) {
        result += parts[0].length === 3 ? ` ${parts[1]}` : parts[1];
    }
    if (parts[2]) {
        result += parts[1].length === 3 ? `-${parts[2]}` : parts[2];
    }
    if (parts[3]) {
        result += parts[2].length === 2 ? `-${parts[3]}` : parts[3];
    }
    return result.trim();
}

function validateEmail(value) {
    return /\S+@\S+\.\S+/.test(value);
}

function validatePhone(value) {
    return /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/.test(value);
}

// Липкая панель CTA показывает выбранный тариф и обновляет цену при наведении на карточки.
function initStickyCTA() {
    const sticky = document.querySelector("[data-sticky-cta]");
    if (!sticky) return;

    const priceLabel = sticky.querySelector("[data-sticky-price]");
    const label = sticky.querySelector("[data-sticky-label]");

    const showSticky = () => {
        sticky.classList.add("is-visible");
        sticky.setAttribute("aria-hidden", "false");
    };
    const hideSticky = () => {
        sticky.classList.remove("is-visible");
        sticky.setAttribute("aria-hidden", "true");
    };

    window.addEventListener("scroll", () => {
        window.requestAnimationFrame(() => {
            if (window.scrollY > 600) {
                showSticky();
            } else {
                hideSticky();
            }
        });
    });

    document.querySelectorAll("[data-tariff-card]").forEach((card) => {
        const tariff = card.getAttribute("data-tariff");
        card.addEventListener("mouseenter", () => updateSticky(tariff));
        card.addEventListener("focusin", () => updateSticky(tariff));
    });

    function updateSticky(tariff) {
        state.currentTariff = tariff;
        if (label) {
            label.textContent = tariff === "online" ? "Онлайн" : "Офлайн";
        }
        if (priceLabel) {
            priceLabel.textContent = tariff === "online" ? formatPrice(CONFIG.priceOnline) : formatPrice(CONFIG.priceOffline);
        }
    }
}

// Создаем легкую анимацию частиц на первом экране.
function initParticles() {
    const container = document.querySelector("[data-particles]");
    if (!container) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const particleCount = 18;
    const particles = [];

    for (let i = 0; i < particleCount; i += 1) {
        const particle = document.createElement("span");
        particle.classList.add("particle");
        const size = Math.random() * 16 + 8;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.dataset.speed = (Math.random() * 0.6 + 0.2).toFixed(2);
        particle.dataset.offsetX = (Math.random() * 100).toFixed(2);
        particle.dataset.offsetY = (Math.random() * 100).toFixed(2);
        container.appendChild(particle);
        particles.push(particle);
    }

    function animate(time) {
        particles.forEach((particle) => {
            const speed = parseFloat(particle.dataset.speed);
            const offsetX = parseFloat(particle.dataset.offsetX);
            const offsetY = parseFloat(particle.dataset.offsetY);
            const x = Math.sin(time * 0.0003 * speed + offsetX) * 30 + offsetX;
            const y = Math.cos(time * 0.0004 * speed + offsetY) * 30 + offsetY;
            particle.style.transform = `translate3d(${x}%, ${y}%, 0)`;
        });
        requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
}

// Отслеживаем появление секций для аналитики. Событие отправляется один раз на секцию.
function initAnalyticsObservers() {
    document.querySelectorAll("[data-analytics]").forEach((section) => {
        const eventName = section.getAttribute("data-analytics");
        if (!eventName) return;
        const observer = new IntersectionObserver(
            (entries, observerRef) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        trackEvent(eventName, { position: entry.target.id || "unknown" });
                        observerRef.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.5 }
        );
        observer.observe(section);
    });
}

// Универсальная отправка событий в mock аналитики.
function trackEvent(name, params = {}) {
    const payload = {
        ...params,
        tariff: params.tariff || state.currentTariff,
        utm_source: state.utm.utm_source,
        utm_campaign: state.utm.utm_campaign,
        event_category: "engagement"
    };
    gtag("event", name, payload);
    ym(99999999, name, payload);
}

// Генерация JSON-LD для события и FAQ. Помогает поисковикам правильно понимать контент.
function injectJsonLd() {
    const eventData = {
        "@context": "https://schema.org",
        "@type": "Event",
        name: CONFIG.eventName,
        description: "Практический интенсив по ИИ с наставниками, кейсами и поддержкой.",
        startDate: CONFIG.eventDateISO,
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/MixedEventAttendanceMode",
        location: [
            {
                "@type": "Place",
                name: CONFIG.city,
                address: CONFIG.venue
            },
            {
                "@type": "VirtualLocation",
                url: `${window.location.origin}${window.location.pathname}#registration`
            }
        ],
        organizer: {
            "@type": "Organization",
            name: "Технопарк РГСУ",
            url: window.location.origin
        },
        offers: [
            {
                "@type": "Offer",
                name: "Онлайн участие",
                price: CONFIG.priceOnline,
                priceCurrency: "RUB",
                availability: "https://schema.org/InStock",
                url: `${window.location.origin}${window.location.pathname}#registration`
            },
            {
                "@type": "Offer",
                name: "Офлайн участие",
                price: CONFIG.priceOffline,
                priceCurrency: "RUB",
                availability: "https://schema.org/InStock",
                url: `${window.location.origin}${window.location.pathname}#registration`
            }
        ]
    };

    const faqData = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: FAQ_DATA.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
                "@type": "Answer",
                text: item.answer
            }
        }))
    };

    const eventScript = document.createElement("script");
    eventScript.type = "application/ld+json";
    eventScript.textContent = JSON.stringify(eventData);

    const faqScript = document.createElement("script");
    faqScript.type = "application/ld+json";
    faqScript.textContent = JSON.stringify(faqData);

    document.head.appendChild(eventScript);
    document.head.appendChild(faqScript);
}

// Добавляем тень на шапку при прокрутке.
function observeHeaderShadow() {
    const header = document.querySelector("[data-header]");
    if (!header) return;
    window.addEventListener("scroll", () => {
        window.requestAnimationFrame(() => {
            header.classList.toggle("is-scrolled", window.scrollY > 20);
        });
    });
}
