(() => {
  "use strict";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Performance: lite mode on weak devices + pause animations that are off screen ---- */
  const conn = navigator.connection || {};
  const weak = (navigator.deviceMemory && navigator.deviceMemory <= 4) ||
               (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
               conn.saveData === true;
  if (weak) document.documentElement.classList.add("lite");

  if ("IntersectionObserver" in window) {
    const pausers = new IntersectionObserver((entries) => {
      entries.forEach((en) => en.target.classList.toggle("is-off", !en.isIntersecting));
    }, { rootMargin: "120px" });
    document.querySelectorAll(".cube-wrap, .cs, .sc, .marquee, .hero__stage").forEach((el) => pausers.observe(el));
  }

  if (reduce || weak || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  const SEL = ".card:not(.hero):not(.contact__cta), .int, .about__photo, .project, .tool__app, .tchip, .folder";
  const MAX = 7;   // degrees at the edge of a ~400px card

  const attach = (el) => {
    if (el.dataset.tilt) return;
    el.dataset.tilt = "1";
    if (el.classList.contains("folder")) return;        // folders have their own tilt
    if (getComputedStyle(el).position === "static") el.style.position = "relative";
    el.classList.add("tilt");
    const glare = document.createElement("span");
    glare.className = "tilt-glare";
    glare.setAttribute("aria-hidden", "true");
    el.appendChild(glare);

    let raf = 0, last = null, rest = 0;

    const paint = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const px = (last.x - r.left) / r.width - 0.5;
      const py = (last.y - r.top) / r.height - 0.5;
      const k = Math.min(1, 420 / r.width);              // big cards tilt less
      el.style.transform =
        `perspective(1000px) rotateX(${(-py * MAX * 2 * k).toFixed(2)}deg) rotateY(${(px * MAX * 2 * k).toFixed(2)}deg) translateY(-4px)`;
      el.style.setProperty("--gx", `${(px + 0.5) * 100}%`);
      el.style.setProperty("--gy", `${(py + 0.5) * 100}%`);
    };

    el.addEventListener("pointerenter", () => {
      clearTimeout(rest);
      el.classList.add("is-tilting");
      el.style.transition = "transform .18s ease-out, box-shadow .3s, border-color .3s";
    });
    el.addEventListener("pointermove", (e) => {
      last = { x: e.clientX, y: e.clientY };
      if (!raf) raf = requestAnimationFrame(paint);
    });
    el.addEventListener("pointerleave", () => {
      cancelAnimationFrame(raf); raf = 0;
      el.classList.remove("is-tilting");
      el.style.transition = "transform .6s cubic-bezier(.22,1,.36,1), box-shadow .4s";
      el.style.transform = "";
      rest = setTimeout(() => { el.style.transition = ""; }, 650);
    });
  };

  document.querySelectorAll(SEL).forEach(attach);
  // elements rendered later (tech stack chips, GitHub calendar etc.)
  new MutationObserver(() => document.querySelectorAll(SEL).forEach(attach))
    .observe(document.body, { childList: true, subtree: true });
})();
