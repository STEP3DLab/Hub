function normalizeIndex(index, total) {
  if (!total) return 0;
  return ((index % total) + total) % total;
}

export function initPhotoViewers(prefersReduceMotion) {
  document.querySelectorAll(".js-photo-viewer").forEach((viewer) => {
    const slides = viewer.querySelectorAll(".js-photo-slide");
    if (!slides.length) return;
    const dotsBox = viewer.querySelector(".js-photo-dots");
    const prev = viewer.querySelector("[data-photo-prev]");
    const next = viewer.querySelector("[data-photo-next]");
    viewer.dataset.index = viewer.dataset.index || "0";

    if (dotsBox) {
      dotsBox.innerHTML = "";
      slides.forEach((_, index) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className =
          "h-2.5 w-2.5 rounded-full bg-slate-300 transition-all duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 dark:bg-slate-600";
        dot.setAttribute("aria-label", `Перейти к кадру ${index + 1}`);
        dot.setAttribute("aria-current", "false");
        dot.addEventListener("click", () => {
          setActive(index);
          schedule();
        });
        dotsBox.appendChild(dot);
      });
    }

    let timerId = null;
    let startX = null;

    const setActive = (rawIndex) => {
      const total = slides.length;
      if (!total) return;
      const currentIndex = normalizeIndex(rawIndex, total);
      viewer.dataset.index = String(currentIndex);
      slides.forEach((slide, slideIndex) => {
        const isActive = slideIndex === currentIndex;
        slide.classList.toggle("opacity-100", isActive);
        slide.classList.toggle("opacity-0", !isActive);
        slide.classList.toggle("z-10", isActive);
        slide.classList.toggle("z-0", !isActive);
        slide.classList.toggle("pointer-events-none", !isActive);
        slide.setAttribute("aria-hidden", isActive ? "false" : "true");
      });
      dotsBox?.querySelectorAll("button").forEach((dot, dotIndex) => {
        const isActive = dotIndex === currentIndex;
        dot.classList.toggle("w-6", isActive);
        dot.classList.toggle("bg-slate-900", isActive);
        dot.classList.toggle("dark:bg-white", isActive);
        dot.setAttribute("aria-current", isActive ? "true" : "false");
      });
    };

    const schedule = () => {
      if (slides.length <= 1) return;
      if (timerId) {
        clearInterval(timerId);
        timerId = null;
      }
      if (prefersReduceMotion?.matches) return;
      timerId = window.setInterval(() => {
        const nextIndex = Number.parseInt(viewer.dataset.index || "0", 10) + 1;
        setActive(nextIndex);
      }, 8000);
    };

    prev?.addEventListener("click", () => {
      const currentIndex = Number.parseInt(viewer.dataset.index || "0", 10) - 1;
      setActive(currentIndex);
      schedule();
    });

    next?.addEventListener("click", () => {
      const currentIndex = Number.parseInt(viewer.dataset.index || "0", 10) + 1;
      setActive(currentIndex);
      schedule();
    });

    viewer.addEventListener("pointerdown", (event) => {
      if (event.target.closest("button")) return;
      startX = event.clientX;
    });

    viewer.addEventListener("pointerup", (event) => {
      if (startX === null || event.target.closest("button")) {
        startX = null;
        return;
      }
      const delta = event.clientX - startX;
      if (Math.abs(delta) > 40) {
        const direction = delta > 0 ? -1 : 1;
        const currentIndex = Number.parseInt(viewer.dataset.index || "0", 10) + direction;
        setActive(currentIndex);
        schedule();
      }
      startX = null;
    });

    viewer.addEventListener("pointerleave", () => {
      startX = null;
    });

    if (slides.length > 1) {
      viewer.addEventListener("mouseenter", () => {
        if (timerId) {
          clearInterval(timerId);
          timerId = null;
        }
      });
      viewer.addEventListener("mouseleave", () => {
        schedule();
      });
    }

    if (prefersReduceMotion?.addEventListener) {
      prefersReduceMotion.addEventListener("change", schedule);
    } else if (prefersReduceMotion?.addListener) {
      prefersReduceMotion.addListener(schedule);
    }

    setActive(Number.parseInt(viewer.dataset.index || "0", 10));
    schedule();
  });
}

export function initGalleries() {
  document.querySelectorAll(".js-gallery").forEach((card) => {
    const slides = card.querySelectorAll(".slide");
    const dotsBox = card.querySelector(".js-dots");
    if (!dotsBox) return;

    const setActive = (index) => {
      slides.forEach((slide, slideIndex) => {
        const isActive = slideIndex === index;
        slide.classList.toggle("hidden", !isActive);
      });
      dotsBox.querySelectorAll("span").forEach((dot, dotIndex) => {
        const isActive = dotIndex === index;
        dot.classList.toggle("bg-slate-900", isActive);
        dot.classList.toggle("dark:bg-white", isActive);
      });
      card.dataset.index = String(index);
    };

    dotsBox.innerHTML = "";
    slides.forEach((_, index) => {
      const dot = document.createElement("span");
      dot.className = "inline-block size-2 rounded-full bg-slate-300 dark:bg-slate-600";
      dot.addEventListener("click", () => setActive(index));
      dotsBox.appendChild(dot);
    });

    card
      .querySelector(".js-prev")
      ?.addEventListener("click", () => {
        const currentIndex = Number.parseInt(card.dataset.index || "0", 10);
        const nextIndex = normalizeIndex(currentIndex - 1, slides.length);
        setActive(nextIndex);
      });

    card
      .querySelector(".js-next")
      ?.addEventListener("click", () => {
        const currentIndex = Number.parseInt(card.dataset.index || "0", 10);
        const nextIndex = normalizeIndex(currentIndex + 1, slides.length);
        setActive(nextIndex);
      });

    setActive(0);
  });
}
