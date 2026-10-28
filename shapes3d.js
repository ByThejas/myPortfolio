/* 3D scenes for the Design and Developer headers.
   Same stage as the trading candlesticks (floor grid, sway, drag), different subject. */
(() => {
  "use strict";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lite = document.documentElement.classList.contains("lite");
  const rnd = (a, b) => a + Math.random() * (b - a);

  const FACES = '<i class="f"></i><i class="k"></i><i class="l"></i><i class="r"></i><i class="t"></i>';
  const box = (row, o) => {
    const c = document.createElement("div");
    c.className = "cs__c";
    c.style.cssText = `left:${o.x}px; transform:translateZ(${o.z || 0}px); --col:${o.col}`;
    const b = document.createElement("div");
    b.className = "cs__b" + (o.cls ? " " + o.cls : "");
    b.style.cssText = `--w:${o.w}px; --d:${o.d || o.w}px; --h:${o.h}px; --y:${o.y || 0}px`;
    b.innerHTML = FACES;
    if (o.label) b.querySelector(".f").textContent = o.label;
    c.appendChild(b);
    row.appendChild(c);
    return { c, b };
  };

  /* ---------------- DESIGN: pixels (voxel grid) in front of a vector curve ---------------- */
  const dRow = document.querySelector(".cs--design .cs__row");
  if (dRow) {
    const COLS = 8, ROWS = 4, GAP = 34;
    const hue = (i) => 345 - (i / (COLS - 1)) * 130 + (i > 4 ? 0 : 0);   // pink -> orange -> blue
    const colour = (i) => ["#ff375f", "#ff4f55", "#ff6b3d", "#ff9f0a", "#ffd60a", "#64d2ff", "#0a84ff", "#5e5ce6"][i];

    // the vector plane (behind): a bezier path with anchors and handles
    const plane = document.createElement("div");
    plane.className = "cs__plane cs__plane--vec";
    plane.innerHTML = `
      <svg viewBox="0 0 420 190" fill="none">
        <defs><linearGradient id="vg" x1="0" x2="1"><stop offset="0" stop-color="#ff375f"/><stop offset=".5" stop-color="#ff9f0a"/><stop offset="1" stop-color="#0a84ff"/></linearGradient></defs>
        <path class="vec__curve" d="M30 150 C 90 20, 160 20, 210 95 S 330 170, 390 40" stroke="url(#vg)" stroke-width="5" stroke-linecap="round"/>
        <g class="vec__handles" stroke="rgba(255,255,255,.45)" stroke-width="1.4">
          <line x1="30" y1="150" x2="90" y2="20"/><line x1="210" y1="95" x2="160" y2="20"/><line x1="210" y1="95" x2="260" y2="170"/><line x1="390" y1="40" x2="330" y2="170"/>
          <circle cx="90" cy="20" r="4" fill="#fff" stroke="none"/><circle cx="160" cy="20" r="4" fill="#fff" stroke="none"/><circle cx="260" cy="170" r="4" fill="#fff" stroke="none"/><circle cx="330" cy="170" r="4" fill="#fff" stroke="none"/>
        </g>
        <g class="vec__anchors" fill="#0b0b10" stroke="#fff" stroke-width="2">
          <rect x="23" y="143" width="14" height="14" rx="2"/><rect x="203" y="88" width="14" height="14" rx="2"/><rect x="383" y="33" width="14" height="14" rx="2"/>
        </g>
      </svg>`;
    dRow.appendChild(plane);

    // the pixel grid (front): extruded blocks whose height ripples
    const cells = [];
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const o = box(dRow, { x: (c - (COLS - 1) / 2) * GAP, z: (r - (ROWS - 1) / 2) * GAP + 30, w: 26, d: 26, h: 20, col: colour(c), cls: "cs__b--body" });
      cells.push({ ...o, c, r });
    }
    let t = 0;
    const wave = (burst) => {
      t += burst ? 2.2 : 0.7;
      cells.forEach(({ b, c, r }) => {
        const h = 16 + 30 * (0.5 + 0.5 * Math.sin(t + c * 0.7 + r * 0.9)) + (burst ? rnd(0, 20) : 0);
        b.style.setProperty("--h", `${h.toFixed(0)}px`);
      });
    };
    wave();
    if (!reduce && !lite) setInterval(() => { if (!document.hidden && !dRow.closest(".cs").classList.contains("is-off")) wave(false); }, 1100);
    dRow.closest(".cs").addEventListener("poke", () => wave(true));
  }

  /* ---------------- DEVELOPER: a request travelling UI -> API -> DB, in front of a code window ---------------- */
  const vRow = document.querySelector(".cs--dev .cs__row");
  if (vRow) {
    const nodes = [
      { x: -150, col: "#0a84ff", label: "UI" },
      { x: 0,    col: "#30d158", label: "API" },
      { x: 150,  col: "#ff9f0a", label: "DB" },
    ];

    const win = document.createElement("div");
    win.className = "cs__plane cs__plane--code";
    win.innerHTML = `
      <div class="code__bar"><i></i><i></i><i></i></div>
      <div class="code__body">
        <p><b style="--w:34%;--c:#bf5af2"></b><b style="--w:22%;--c:#64d2ff"></b></p>
        <p class="in"><b style="--w:48%;--c:#ff9f0a"></b></p>
        <p class="in"><b style="--w:30%;--c:#30d158"></b><b style="--w:26%;--c:#fff"></b></p>
        <p class="in"><b style="--w:42%;--c:#64d2ff"></b></p>
        <p><b style="--w:12%;--c:#bf5af2"></b></p>
      </div>`;
    vRow.appendChild(win);

    nodes.forEach((n) => box(vRow, { x: n.x, z: 30, w: 64, d: 64, h: 46, col: n.col, cls: "cs__b--node", label: n.label }));
    // flat connectors on the floor
    [-75, 75].forEach((x) => box(vRow, { x, z: 30, w: 70, d: 6, h: 3, col: "#ffffff", cls: "cs__b--link" }));

    // the packet that travels between them
    const pk = box(vRow, { x: -150, z: 30, w: 16, d: 16, h: 16, col: "#ffd60a", cls: "cs__b--packet", y: 56 });
    pk.c.classList.add("cs__packet");
    const send = () => { pk.c.classList.remove("is-go"); void pk.c.offsetWidth; pk.c.classList.add("is-go"); };
    send();
    if (!reduce && !lite) setInterval(() => { if (!document.hidden && !vRow.closest(".cs").classList.contains("is-off")) send(); }, 3600);
    vRow.closest(".cs").addEventListener("poke", send);
  }

  /* gentle parallax from the header pointer, as on the trading page */
  if (!reduce && matchMedia("(hover: hover)").matches) {
    document.querySelectorAll(".desk-head").forEach((head) => {
      const cs = head.querySelector(".cs--design, .cs--dev");
      if (!cs) return;
      head.addEventListener("pointermove", (e) => {
        const r = head.getBoundingClientRect();
        cs.style.setProperty("--cy", `${(((e.clientX - r.left) / r.width - 0.5) * 14).toFixed(1)}deg`);
        cs.style.setProperty("--cx", `${(-((e.clientY - r.top) / r.height - 0.5) * 8).toFixed(1)}deg`);
      });
    });
  }
})();
