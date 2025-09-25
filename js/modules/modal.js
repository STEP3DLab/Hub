const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

function getFocusableElements(container) {
  return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
    (element) => !element.hasAttribute("aria-hidden"),
  );
}

export function initModal() {
  const modal = document.getElementById("modal");
  if (!modal) return;

  const openers = [
    document.getElementById("openModal"),
    document.getElementById("openModal2"),
  ].filter(Boolean);
  const closeButton = document.getElementById("closeModal");
  const backdrop = document.getElementById("modalBg");
  const form = document.getElementById("requestForm");

  let lastActiveElement = null;

  const openModal = () => {
    if (!modal.classList.contains("hidden")) return;
    lastActiveElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("overflow-hidden");
    const [firstFocusable] = getFocusableElements(modal);
    firstFocusable?.focus({ preventScroll: true });
  };

  const closeModal = () => {
    if (modal.classList.contains("hidden")) return;
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("overflow-hidden");
    lastActiveElement?.focus({ preventScroll: true });
  };

  openers.forEach((button) => button.addEventListener("click", openModal));
  closeButton?.addEventListener("click", closeModal);
  backdrop?.addEventListener("click", closeModal);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.classList.contains("hidden")) {
      closeModal();
    }
  });

  modal.addEventListener("keydown", (event) => {
    if (modal.classList.contains("hidden") || event.key !== "Tab") return;
    const focusable = getFocusableElements(modal);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    console.log("[Request]", Object.fromEntries(formData.entries()));
    closeModal();
    alert("Заявка отправлена! (демо)");
  });
}
