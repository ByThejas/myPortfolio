(() => {
  "use strict";

  const dlg = document.getElementById("vault");
  const folders = [...document.querySelectorAll(".folder")];
  if (!dlg || !folders.length || typeof dlg.showModal !== "function") return;

  /* EDIT HERE: add a new image by adding a line to the right set (file goes in /designs and /designs/thumbs) */
  const SETS = {
    music:  { title: "Music", acc: "#ff6a1a", works: [
      ["utopia-orange", "Utopia"], ["utopia-pink", "Utopia, poster cut"], ["dawn-fm", "Dawn FM"], ["scaleborn", "Scaleborn"], ["euphoria", "Euphoria"]] },
    greek:  { title: "Greek Gods", acc: "#d9b45a", works: [
      ["apollo", "Apollo"], ["zen", "Zen"], ["hermes", "Hermes"], ["kratos", "Kratos"]] },
    grunge: { title: "Grunge", acc: "#9aa4ae", works: [
      ["requiem", "Requiem"], ["bones-bloodlines", "Bones & Bloodlines"], ["grimcoil", "Grimcoil"]] },
    sacred: { title: "Sacred & Symbols", acc: "#d62839", works: [
      ["nataraja", "Nataraja"], ["new-world-order", "The New World Order"], ["last-supper", "The Last Supper"], ["venom", "Venom"]] },
  };

  const $ = (id) => document.getElementById(id);
  const img = $("vault-img"), cap = $("vault-cap"), setEl = $("vault-set"), countEl = $("vault-count"), thumbs = $("vault-thumbs");
  let cur = null, idx = 0, opener = null;

  function show(i, dir = 1) {
    const s = SETS[cur];
    idx = (i + s.works.length) % s.works.length;
    const [file, title] = s.works[idx];
    img.style.setProperty("--dx", `${dir * 28}px`);
    img.classList.remove("is-swap");
    void img.offsetWidth;
    img.src = `designs/${file}.jpg`;
    img.alt = title;
    img.classList.add("is-swap");
    cap.textContent = title;
    countEl.textContent = `${idx + 1} / ${s.works.length}`;
    [...thumbs.children].forEach((b, k) => b.setAttribute("aria-selected", String(k === idx)));
    const multi = s.works.length > 1;
    $("vault-prev").hidden = $("vault-next").hidden = !multi;
  }

  function open(key, trigger) {
    cur = key; opener = trigger;
    const s = SETS[key];
    dlg.style.setProperty("--acc", s.acc);
    setEl.textContent = s.title;
    thumbs.innerHTML = s.works.map(([f, t], k) =>
      `<button type="button" role="tab" aria-label="${t}" data-k="${k}"><img src="designs/thumbs/${f}.jpg" alt=""></button>`).join("");
    document.body.classList.add("vault-open");
    dlg.showModal();
    show(0, 1);
  }

  function close() { dlg.close(); }
  dlg.addEventListener("close", () => {
    document.body.classList.remove("vault-open");
    img.removeAttribute("src");
    if (opener) opener.focus({ preventScroll: true });
  });

  folders.forEach((f) => f.addEventListener("click", () => open(f.dataset.set, f)));
  $("vault-close").addEventListener("click", close);
  $("vault-prev").addEventListener("click", () => show(idx - 1, -1));
  $("vault-next").addEventListener("click", () => show(idx + 1, 1));
  thumbs.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-k]");
    if (b) { const k = Number(b.dataset.k); show(k, k >= idx ? 1 : -1); }
  });
  dlg.addEventListener("click", (e) => { if (e.target === dlg || e.target.classList.contains("vault__stage")) close(); });
  dlg.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); show(idx - 1, -1); }
    if (e.key === "ArrowRight") { e.preventDefault(); show(idx + 1, 1); }
  });

  /* swipe */
  let x0 = null;
  dlg.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  dlg.addEventListener("touchend", (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
  }, { passive: true });

  /* pointer tilt on folders */
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches && matchMedia("(hover: hover)").matches) {
    folders.forEach((f) => {
      f.addEventListener("pointermove", (e) => {
        const r = f.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
        f.style.transform = `rotateY(${px * 6}deg) rotateX(${-py * 5}deg)`;
      });
      f.addEventListener("pointerleave", () => { f.style.transform = ""; });
    });
  }
})();
