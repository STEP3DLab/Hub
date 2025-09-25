export function initAboutToggle() {
  const toggle = document.getElementById("toggleAbout");
  const panel = document.getElementById("aboutBox");
  if (!toggle || !panel) return;

  const setState = (expanded) => {
    toggle.setAttribute("aria-expanded", String(expanded));
    panel.classList.toggle("hidden", !expanded);
    panel.setAttribute("aria-hidden", expanded ? "false" : "true");
  };

  toggle.addEventListener("click", () => {
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    setState(!expanded);
  });

  // Синхронизация с начальными классами
  const initiallyExpanded = toggle.getAttribute("aria-expanded") === "true" && !panel.classList.contains("hidden");
  setState(initiallyExpanded);
}
