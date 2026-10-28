(() => {
  "use strict";

  const card = document.getElementById("stack-card");
  if (!card) return;

  const seg = document.getElementById("stack-seg");
  const grid = document.getElementById("stack-grid");
  const countEl = document.getElementById("stack-count");
  const flow = document.getElementById("stack-flow");
  const chips = [...grid.querySelectorAll(".tchip")];
  const btns = [...seg.querySelectorAll(".seg__btn")];
  const pill = seg.querySelector(".seg__pill");

  const CAT_LABEL = { languages: "Languages", frontend: "Frontend", backend: "Backend", databases: "Databases", devops: "DevOps & Tools" };
  const FLOW_LABEL = { interface: "the interface layer", api: "the API layer", data: "the data layer", ship: "shipping and tooling" };

  const state = { cat: "all", hl: null };

  /* counts on the tabs */
  btns.forEach((b) => {
    const cat = b.dataset.filter;
    const n = cat === "all" ? chips.length : chips.filter((c) => c.dataset.cat === cat).length;
    const badge = document.createElement("span");
    badge.className = "seg__n";
    badge.textContent = n;
    b.appendChild(badge);
  });

  function placePill() {
    const active = seg.querySelector(".seg__btn.is-active");
    if (!active || !pill) return;
    pill.style.width = active.offsetWidth + "px";
    pill.style.transform = `translateX(${active.offsetLeft}px)`;
  }

  function render() {
    let shown = 0;
    chips.forEach((chip) => {
      const okCat = state.cat === "all" || chip.dataset.cat === state.cat;
      const okFlow = !state.hl || chip.dataset.flow.split(" ").includes(state.hl);
      const dim = !(okCat && okFlow);
      chip.classList.toggle("is-dim", dim);
      chip.inert = dim;
      if (!dim) shown++;
    });

    let text;
    if (state.hl) text = `<strong>${shown}</strong> used in ${FLOW_LABEL[state.hl]}`;
    else if (state.cat === "all") text = `<strong>${shown}</strong> technologies`;
    else text = `<strong>${shown}</strong> in ${CAT_LABEL[state.cat]}`;
    countEl.innerHTML = text;

    flow.querySelectorAll(".flow__node").forEach((n) => n.classList.toggle("is-on", n.dataset.hl === state.hl));
  }

  btns.forEach((btn) => {
    btn.addEventListener("click", () => {
      btns.forEach((b) => {
        const on = b === btn;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-pressed", String(on));
      });
      state.cat = btn.dataset.filter;
      placePill();
      render();
    });
  });

  /* hover (or tap) a step in the flow to light up its technologies */
  flow.querySelectorAll(".flow__node").forEach((node) => {
    const on = () => { state.hl = node.dataset.hl; render(); };
    const off = () => { state.hl = null; render(); };
    node.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") on(); });
    node.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") off(); });
    node.addEventListener("focus", on);
    node.addEventListener("blur", off);
    node.addEventListener("click", () => { state.hl === node.dataset.hl && document.activeElement !== node ? off() : on(); });
  });

  placePill();
  window.addEventListener("resize", placePill);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(placePill);
  render();
})();
