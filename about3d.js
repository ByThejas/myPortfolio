/* About page 3D scene: three crafts (trade / design / code) standing on one base, with a "TU" mark above.
   Uses the same stage as the trading, design and developer scenes. */
(() => {
  "use strict";
  const row = document.querySelector(".cs--about .cs__row");
  if (!row) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lite = document.documentElement.classList.contains("lite");
  const FACES = '<i class="f"></i><i class="k"></i><i class="l"></i><i class="r"></i><i class="t"></i>';
  const box = (o) => {
    const c = document.createElement("div");
    c.className = "cs__c" + (o.cc ? " " + o.cc : "");
    c.style.cssText = `left:${o.x}px; transform:translateZ(${o.z || 0}px); --col:${o.col}`;
    const b = document.createElement("div");
    b.className = "cs__b " + (o.cls || "");
    b.style.cssText = `--w:${o.w}px; --d:${o.d || o.w}px; --h:${o.h}px; --y:${o.y || 0}px`;
    b.innerHTML = FACES;
    if (o.label) b.querySelector(".f").textContent = o.label;
    c.appendChild(b);
    row.appendChild(c);
    return { c, b };
  };

  // base slab
  box({ x: 0, z: 0, w: 380, d: 120, h: 8, col: "#8e8e93", cls: "cs__b--base" });

  // three pillars
  const P = [
    { x: -120, col: "#30d158", label: "Trade",  h: 70 },
    { x: 0,    col: "#ff375f", label: "Design", h: 100 },
    { x: 120,  col: "#0a84ff", label: "Code",   h: 84 },
  ];
  const pillars = P.map((p) => ({ ...p, ...box({ x: p.x, z: 0, w: 76, d: 76, h: p.h, y: 8, col: p.col, cls: "cs__b--node cs__b--pillar", label: p.label }) }));

  // a candlestick wick on the trading pillar
  const wick = box({ x: -120, z: 0, w: 5, d: 5, h: 30, y: 8 + 70, col: "#30d158" });
  // pixels on the design pillar
  box({ x: -14, z: 0, w: 16, d: 16, h: 16, y: 8 + 100, col: "#ff9f0a", cls: "cs__b--body" });
  box({ x: 14,  z: 14, w: 16, d: 16, h: 16, y: 8 + 100, col: "#ffd60a", cls: "cs__b--body" });
  // brackets on the code pillar
  box({ x: 100, z: 0, w: 8, d: 30, h: 8, y: 8 + 84, col: "#64d2ff" });
  box({ x: 140, z: 0, w: 8, d: 30, h: 8, y: 8 + 84, col: "#64d2ff" });

  // floating TU mark
  const tu = box({ x: 0, z: 0, w: 40, d: 40, h: 40, y: 8 + 100 + 34, col: "#f5f5f7", cls: "cs__b--node cs__tu", label: "TU" });
  tu.c.classList.add("cs__float");
  tu.b.querySelector(".f").style.color = "#111";
  tu.b.querySelector(".f").style.textShadow = "none";

  // poke: the pillars re-grow, the mark spins
  const poke = () => {
    pillars.forEach((p, i) => {
      p.b.style.setProperty("--h", "40px");
      setTimeout(() => p.b.style.setProperty("--h", p.h + "px"), 160 + i * 140);
    });
    tu.c.classList.remove("is-spin"); void tu.c.offsetWidth; tu.c.classList.add("is-spin");
  };
  row.closest(".cs").addEventListener("poke", poke);
  if (!reduce && !lite) setInterval(() => {
    if (document.hidden || row.closest(".cs").classList.contains("is-off")) return;
    const i = Math.floor(Math.random() * 3), p = pillars[i];
    const h = p.h + (Math.random() * 30 - 12);
    p.b.style.setProperty("--h", h.toFixed(0) + "px");
    if (i === 0) wick.b.style.setProperty("--y", (8 + h).toFixed(0) + "px");
  }, 1800);

  // pointer parallax from the header, as on the other pages
  const head = row.closest(".projects__head");
  const cs = row.closest(".cs");
  if (head && !reduce && matchMedia("(hover: hover)").matches) {
    head.addEventListener("pointermove", (e) => {
      const r = head.getBoundingClientRect();
      cs.style.setProperty("--cy", `${(((e.clientX - r.left) / r.width - 0.5) * 14).toFixed(1)}deg`);
      cs.style.setProperty("--cx", `${(-((e.clientY - r.top) / r.height - 0.5) * 8).toFixed(1)}deg`);
    });
  }
})();
