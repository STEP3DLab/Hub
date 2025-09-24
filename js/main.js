import { initNavigation } from "./modules/navigation.js";
import { initModal } from "./modules/modal.js";
import { initTeamToggles } from "./modules/team.js";
import { initAboutToggle } from "./modules/about.js";
import { initPhotoViewers, initGalleries } from "./modules/carousels.js";
import { initMapTabs } from "./modules/map-tabs.js";
import { initShareFeatures } from "./modules/share.js";
import { initInvaderGrid } from "./modules/invader-grid.js";

const prefersReduceMotion =
  typeof window !== "undefined" && window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : null;

function initializeSite() {
  initNavigation();
  initModal();
  initTeamToggles();
  initAboutToggle();
  initPhotoViewers(prefersReduceMotion);
  initGalleries();
  initMapTabs();
  initShareFeatures();
  initInvaderGrid();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeSite);
} else {
  initializeSite();
}
