function setToggleState(button, target, expanded) {
  button.setAttribute("aria-expanded", String(expanded));
  target.classList.toggle("hidden", !expanded);
  target.setAttribute("aria-hidden", expanded ? "false" : "true");
  const icon = button.querySelector("[data-state-icon]");
  if (icon) {
    icon.textContent = expanded ? "−" : "+";
  }
}

export function initTeamToggles() {
  document.querySelectorAll("[data-team-toggle]").forEach((button) => {
    const targetId = button.dataset.teamToggle;
    if (!targetId) return;
    const target = document.getElementById(targetId);
    if (!target) return;

    if (!button.hasAttribute("aria-controls")) {
      button.setAttribute("aria-controls", targetId);
    }

    const expanded = button.getAttribute("aria-expanded") === "true" && !target.classList.contains("hidden");
    setToggleState(button, target, expanded);

    button.addEventListener("click", () => {
      const isExpanded = button.getAttribute("aria-expanded") === "true";
      setToggleState(button, target, !isExpanded);
    });
  });
}
