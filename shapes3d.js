(() => {
  "use strict";
  const faces = (cls, n) => Array.from({ length: n }, (_, i) => `<i class="${cls}" style="--k:${i}"></i>`).join("");

  /* ---------- Design: sphere, torus, pyramid and a stack of artboards ---------- */
  const d = document.querySelector(".sc--design .sc__scene");
  if (d) {
    d.innerHTML = `
      <div class="sc__item sc__stack">
        <span class="art" style="--z:0;  --a:#ff375f; --b:#ff9f0a"></span>
        <span class="art" style="--z:30px; --a:#bf5af2; --b:#ff375f"></span>
        <span class="art" style="--z:60px; --a:#0a84ff; --b:#5e5ce6"></span>
        <span class="art art--top" style="--z:90px; --a:#64d2ff; --b:#30d158"><b>Ai</b></span>
      </div>
      <div class="sc__item sc__torus">${faces("ring", 14)}</div>
      <div class="sc__item sc__pyr">${faces("pf", 4)}<i class="pb"></i></div>
      <div class="sc__item sc__sphere"></div>
      <div class="sc__item sc__dot"></div>`;
  }

  /* ---------- Developer: isometric stack of layers ---------- */
  const v = document.querySelector(".sc--dev .sc__scene");
  if (v) {
    const layers = [
      ["Data",      "#ffd60a", "#ff9f0a"],
      ["API",       "#30d158", "#64d2ff"],
      ["Interface", "#0a84ff", "#bf5af2"],
    ];
    v.innerHTML = `<div class="iso">` + layers.map(([n, a, b], i) => `
      <div class="slab" style="--z:${i * 62}px; --a:${a}; --b:${b}; --i:${i}">
        <i class="s-top"><b>${n}</b></i><i class="s-f"></i><i class="s-r"></i><i class="s-l"></i><i class="s-k"></i>
      </div>`).join("") + `
      <div class="glyph" style="--z:230px"><span>&lt;/&gt;</span></div>
      <div class="pin" style="--z:0"></div></div>`;
  }
})();
