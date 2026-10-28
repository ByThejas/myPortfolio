/* Drag-to-rotate for every 3D object, with inertia, spring-back and click kicks. */
(() => {
  "use strict";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.classList.contains("lite");
  const MAXX = 38;

  const wire = (el, opt = {}) => {
    const { spin = 0, spring = true, hoverSpin = 0 } = opt;
    let x = 0, y = 0, vx = 0, vy = 0, drag = false, moved = 0, hover = false, vis = true, raf = 0;
    let lx = 0, ly = 0;

    const set = () => {
      el.style.setProperty("--dx", `${x.toFixed(2)}deg`);
      el.style.setProperty("--dy", `${y.toFixed(2)}deg`);
    };

    const tick = () => {
      raf = 0;
      if (!drag) {
        x += vx; y += vy;
        vx *= 0.94; vy *= 0.94;
        if (spin && !reduce) y += hover ? hoverSpin : spin;
        if (spring) {                              // ease the tilt back home
          x *= 0.96;
          if (!spin) {
            y -= Math.round(y / 360) * 360;        // nearest rest angle
            y *= 0.965;
          }
        }
        x = Math.max(-MAXX, Math.min(MAXX, x));
        set();
      }
      const alive = drag || Math.abs(vx) > 0.02 || Math.abs(vy) > 0.02 || Math.abs(x) > 0.05 || Math.abs(y) > 0.05 || (spin && !reduce);
      if (alive && vis) raf = requestAnimationFrame(tick);
    };
    const kick = () => { if (!raf && vis) raf = requestAnimationFrame(tick); };

    el.style.pointerEvents = "auto";
    el.style.cursor = "grab";
    el.style.touchAction = "pan-y";

    el.addEventListener("pointerdown", (e) => {
      drag = true; moved = 0; lx = e.clientX; ly = e.clientY; vx = vy = 0;
      el.classList.add("is-drag"); el.style.cursor = "grabbing";
      el.setPointerCapture(e.pointerId); kick();
    });
    el.addEventListener("pointermove", (e) => {
      if (!drag) return;
      const dx = e.clientX - lx, dy = e.clientY - ly;
      lx = e.clientX; ly = e.clientY;
      moved += Math.abs(dx) + Math.abs(dy);
      y += dx * 0.7; x -= dy * 0.5;
      vy = dx * 0.35; vx = -dy * 0.2;
      x = Math.max(-MAXX, Math.min(MAXX, x));
      set();
    });
    const up = (e) => {
      if (!drag) return;
      drag = false; el.classList.remove("is-drag"); el.style.cursor = "grab";
      if (moved < 5) { vy = 16; vx = -4; el.dispatchEvent(new CustomEvent("poke")); }   // a click gives it a spin
      kick();
    };
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("pointerenter", () => { hover = true; kick(); });
    el.addEventListener("pointerleave", () => { hover = false; });

    new IntersectionObserver(([en]) => { vis = en.isIntersecting; if (vis) kick(); }).observe(el);
    kick();
  };

  document.querySelectorAll(".cube-wrap").forEach((el) => wire(el, { spin: 0.28, hoverSpin: 1.1, spring: true }));
  document.querySelectorAll(".cs, .sc--design, .sc--dev").forEach((el) => wire(el, { spring: true }));
})();
