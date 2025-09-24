function updateButtonState(button, active) {
  button.classList.toggle("bg-slate-900", active);
  button.classList.toggle("text-white", active);
  button.classList.toggle("dark:bg-white", active);
  button.classList.toggle("dark:text-slate-900", active);
  button.setAttribute("aria-pressed", String(active));
}

function updateMapVisibility(maps, activeIndex) {
  maps.forEach((map) => {
    const matches = map.dataset.map === String(activeIndex);
    map.classList.toggle("opacity-0", !matches);
    map.classList.toggle("pointer-events-none", !matches);
    map.setAttribute("aria-hidden", matches ? "false" : "true");
    if (matches) {
      map.removeAttribute("tabindex");
    } else {
      map.setAttribute("tabindex", "-1");
    }
  });
}

export function initMapTabs() {
  const buttons = Array.from(document.querySelectorAll("[data-maptab]"));
  if (!buttons.length) return;
  const maps = Array.from(document.querySelectorAll("[data-map]"));

  buttons.forEach((button) => {
    if (!button.hasAttribute("type")) {
      button.type = "button";
    }
  });

  let activeIndex = buttons.findIndex((button) =>
    button.classList.contains("bg-slate-900"),
  );
  if (activeIndex < 0) activeIndex = 0;

  const setActive = (index) => {
    activeIndex = index;
    buttons.forEach((button, idx) => updateButtonState(button, idx === activeIndex));
    updateMapVisibility(maps, activeIndex);
  };

  buttons.forEach((button, index) => {
    button.addEventListener("click", () => setActive(index));
    button.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      event.preventDefault();
      const step = event.key === "ArrowRight" ? 1 : -1;
      const nextIndex = (index + step + buttons.length) % buttons.length;
      buttons[nextIndex].focus();
      setActive(nextIndex);
    });
  });

  setActive(activeIndex);
}
