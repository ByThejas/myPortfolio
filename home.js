(() => {
  "use strict";

  const hero = document.getElementById("hero");
  if (!hero) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canHover = window.matchMedia("(hover: hover)").matches;

  /* ---------- Typewriter role line ---------- */
  const out = document.getElementById("role-text");
  const phrases = ["trade markets.", "design brands.", "build software.", "ship things."];

  if (out && !reduce) {
    let i = 0;
    let n = 0;
    let deleting = false;

    const tick = () => {
      const word = phrases[i];
      n += deleting ? -1 : 1;
      out.textContent = word.slice(0, n);

      let wait = deleting ? 38 : 85;
      if (!deleting && n === word.length) { deleting = true; wait = 1700; }
      else if (deleting && n === 0) { deleting = false; i = (i + 1) % phrases.length; wait = 350; }
      setTimeout(tick, wait);
    };
    out.textContent = "";
    setTimeout(tick, 1100); // let the name finish animating first
  }

  /* ---------- Pointer parallax + glow ---------- */
  if (!reduce && canHover) {
    let raf = 0;
    let next = null;

    const apply = () => {
      raf = 0;
      hero.style.setProperty("--px", next.px.toFixed(3));
      hero.style.setProperty("--py", next.py.toFixed(3));
      hero.style.setProperty("--hx", `${next.x}px`);
      hero.style.setProperty("--hy", `${next.y}px`);
    };

    hero.addEventListener("pointermove", (e) => {
      const r = hero.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      next = { px: (x / r.width) * 2 - 1, py: (y / r.height) * 2 - 1, x, y };
      if (!raf) raf = requestAnimationFrame(apply);
    }, { passive: true });

    hero.addEventListener("pointerleave", () => {
      next = { px: 0, py: 0, x: hero.clientWidth * 0.5, y: hero.clientHeight * 0.4 };
      if (!raf) raf = requestAnimationFrame(apply);
    });
  }
})();
