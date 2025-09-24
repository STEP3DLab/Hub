const ACTIVE_CELLS = new Set([
  0, 1, 2, 3, 5, 6, 7, 8, 9, 17, 27, 35, 45, 53, 63, 71, 72, 73, 74, 75, 76, 77,
  78, 79, 80,
]);

export function initInvaderGrid() {
  document.querySelectorAll("[data-invader-grid]").forEach((container) => {
    if (container.dataset.initialized === "true") return;
    container.innerHTML = "";
    for (let i = 0; i < 81; i += 1) {
      const cell = document.createElement("div");
      if (ACTIVE_CELLS.has(i)) {
        cell.className = "bg-slate-400/70";
      }
      container.appendChild(cell);
    }
    container.dataset.initialized = "true";
  });
}
