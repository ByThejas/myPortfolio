(() => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canHover = window.matchMedia("(hover: hover)").matches;

  /* ---------- Theme toggle ---------- */
  const toggle = document.getElementById("theme-toggle");
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const systemLight = window.matchMedia("(prefers-color-scheme: light)");

  const read = () => { try { return localStorage.getItem("theme"); } catch { return null; } };
  const save = (t) => { try { localStorage.setItem("theme", t); } catch {} };

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    if (toggle) {
      toggle.setAttribute(
        "aria-label",
        theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
      );
    }
    if (themeMeta) themeMeta.setAttribute("content", theme === "dark" ? "#000000" : "#f5f5f7");
  }

  applyTheme(root.getAttribute("data-theme") || "dark");

  if (toggle) {
    toggle.addEventListener("click", () => {
      const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      save(next);
    });
  }

  systemLight.addEventListener("change", (e) => {
    if (!read()) applyTheme(e.matches ? "light" : "dark");
  });

  /* ---------- Scroll reveal ---------- */
  const reveals = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });

    reveals.forEach((el) => revealObserver.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-in"));
  }

  /* ---------- Nav: scrolled state + active link (same-page anchors only) ---------- */
  const nav = document.getElementById("nav");
  if (nav) {
    const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const links = [...nav.querySelectorAll(".nav__links a")];
    const targets = links
      .filter((link) => /^#[\w-]+$/.test(link.getAttribute("href") || ""))
      .map((link) => ({ link, el: document.querySelector(link.getAttribute("href")) }))
      .filter((t) => t.el);

    if ("IntersectionObserver" in window && targets.length) {
      const spy = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const match = targets.find((t) => t.el === entry.target);
          links.forEach((l) => l.classList.toggle("is-active", l === match.link));
        });
      }, { rootMargin: "-40% 0px -55% 0px" });

      targets.forEach((t) => spy.observe(t.el));
    }
  }


  /* ---------- Nav v2: sliding indicator + mobile menu ---------- */
  (function () {
    const nv = document.getElementById("nav");
    const lk = document.getElementById("nav-links");
    const ind = lk && lk.querySelector(".nav__ind");
    const burger = document.getElementById("nav-burger");
    if (!nv || !lk || !ind) return;
    const place = (a) => {
      if (!a || getComputedStyle(ind).display === "none") { if (ind.classList.contains("is-on")) ind.classList.remove("is-on"); return; }
      ind.style.width = a.offsetWidth + "px";
      ind.style.transform = "translateX(" + a.offsetLeft + "px)";
      if (!ind.classList.contains("is-on")) ind.classList.add("is-on");
    };
    const current = () => lk.querySelector("a.is-active");
    const reset = () => place(current());
    lk.querySelectorAll("a").forEach((a) => {
      a.addEventListener("mouseenter", () => place(a));
      a.addEventListener("focus", () => place(a));
    });
    lk.addEventListener("mouseleave", reset);
    lk.addEventListener("focusout", reset);
    new MutationObserver((m) => { if (m.some((r) => r.target !== ind)) reset(); }).observe(lk, { subtree: true, attributes: true, attributeFilter: ["class"] });
    window.addEventListener("resize", reset);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(reset);
    window.addEventListener("load", reset);
    reset();
    if (burger) {
      const set = (o) => { nv.classList.toggle("is-open", o); burger.setAttribute("aria-expanded", o); burger.setAttribute("aria-label", o ? "Close menu" : "Open menu"); };
      burger.addEventListener("click", () => set(!nv.classList.contains("is-open")));
      lk.addEventListener("click", (e) => { if (e.target.closest("a")) set(false); });
      document.addEventListener("keydown", (e) => { if (e.key === "Escape") set(false); });
      document.addEventListener("click", (e) => { if (!nv.contains(e.target)) set(false); });
    }
  })();

  /* ---------- Ambient background: tiny scroll parallax ---------- */
  if (!reduceMotion) {
    let ticking = false;
    window.addEventListener("scroll", () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        root.style.setProperty("--sy", window.scrollY);
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---------- Cursor spotlight on cards ---------- */
  document.addEventListener("pointermove", (e) => {
    const card = e.target.closest(".card");
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    card.style.setProperty("--my", `${e.clientY - rect.top}px`);
  }, { passive: true });

  /* ---------- Count-up numbers ---------- */
  const counters = [...document.querySelectorAll("[data-count]")];

  function animateCount(el) {
    const end = Number(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    const duration = 1400;
    const start = performance.now();

    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(end * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  if (counters.length && "IntersectionObserver" in window && !reduceMotion) {
    counters.forEach((el) => { el.textContent = "0" + (el.dataset.suffix || ""); });

    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        countObserver.unobserve(entry.target);
        animateCount(entry.target);
      });
    }, { threshold: 0.6 });

    counters.forEach((el) => countObserver.observe(el));

    // failsafe: never leave a number stuck at 0 (print view, odd scrolling, screenshots)
    setTimeout(() => {
      counters.forEach((el) => {
        if (el.textContent.replace(/\D/g, "") === "0" && el.dataset.count !== "0") {
          el.textContent = el.dataset.count + (el.dataset.suffix || "");
        }
      });
    }, 6000);
  }

  /* ---------- Design gallery (design.html only) ---------- */
  const gallery = document.getElementById("gallery");
  const tiles = [...document.querySelectorAll(".tile")];

  if (gallery) {
    const grid = document.getElementById("gallery-grid");
    const segBtns = [...gallery.querySelectorAll(".seg__btn")];
    const pill = gallery.querySelector(".seg__pill");

    function placePill() {
      const active = gallery.querySelector(".seg__btn.is-active");
      if (!active || !pill) return;
      pill.style.width = active.offsetWidth + "px";
      pill.style.transform = `translateX(${active.offsetLeft}px)`;
    }
    placePill();
    window.addEventListener("resize", placePill);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(placePill);

    segBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        segBtns.forEach((b) => {
          const on = b === btn;
          b.classList.toggle("is-active", on);
          b.setAttribute("aria-pressed", String(on));
        });
        placePill();

        const filter = btn.dataset.filter;
        grid.classList.toggle("is-filtered", filter !== "all");

        tiles.forEach((tile) => {
          const show = filter === "all" || tile.dataset.cat === filter;
          tile.hidden = !show;
          if (show) {
            tile.classList.add("is-in");
            tile.classList.remove("is-pop");
            void tile.offsetWidth;
            tile.classList.add("is-pop");
          }
        });
      });
    });

    /* 3D tilt + glare */
    if (canHover && !reduceMotion) {
      tiles.forEach((tile) => {
        tile.addEventListener("pointermove", (e) => {
          const r = tile.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width - 0.5;
          const py = (e.clientY - r.top) / r.height - 0.5;
          tile.style.setProperty("--ry", `${px * 8}deg`);
          tile.style.setProperty("--rx", `${-py * 8}deg`);
          tile.style.setProperty("--gx", `${e.clientX - r.left}px`);
          tile.style.setProperty("--gy", `${e.clientY - r.top}px`);
        });
        tile.addEventListener("pointerleave", () => {
          tile.style.setProperty("--rx", "0deg");
          tile.style.setProperty("--ry", "0deg");
        });
      });
    }

    /* Full-screen viewer */
    const lb = document.getElementById("lightbox");

    if (lb && typeof lb.showModal === "function" && tiles.length) {
      const stage = document.getElementById("lb-stage");
      const lbTitle = document.getElementById("lb-title");
      const lbMeta = document.getElementById("lb-meta");
      const TOOLS = { Ps: "Adobe Photoshop", Ai: "Adobe Illustrator" };
      let current = null;

      const visibleTiles = () => tiles.filter((t) => !t.hidden);

      function show(tile) {
        current = tile;
        const w = tile.offsetWidth;
        const h = tile.offsetHeight;
        stage.style.setProperty("--ar", `${w} / ${h}`);
        stage.style.setProperty("--arn", (w / h).toFixed(4));
        stage.replaceChildren();

        const art = tile.querySelector(".tile__art");
        const img = tile.querySelector("img");
        if (art) stage.appendChild(art.cloneNode(true));
        if (img) {
          const clone = img.cloneNode();
          clone.removeAttribute("loading");
          stage.appendChild(clone);
        }

        const tool = tile.querySelector(".tile__tool").textContent.trim();
        lbTitle.textContent = tile.querySelector("strong").textContent;
        lbMeta.textContent = `${tile.querySelector("small").textContent} · ${TOOLS[tool] || tool}`;
      }

      function step(dir) {
        const list = visibleTiles();
        if (list.length < 2) return;
        const i = list.indexOf(current);
        show(list[(i + dir + list.length) % list.length]);
      }

      tiles.forEach((tile) => {
        tile.addEventListener("click", () => {
          show(tile);
          lb.showModal();
        });
      });

      lb.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-lb]");
        if (btn) {
          const action = btn.dataset.lb;
          if (action === "close") lb.close();
          else step(action === "next" ? 1 : -1);
          return;
        }
        if (!e.target.closest(".lightbox__stage, .lightbox__cap")) lb.close();
      });

      lb.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight") step(1);
        if (e.key === "ArrowLeft") step(-1);
      });

      let startX = null;
      stage.addEventListener("pointerdown", (e) => { startX = e.clientX; });
      stage.addEventListener("pointerup", (e) => {
        if (startX === null) return;
        const dx = e.clientX - startX;
        startX = null;
        if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
      });

      lb.addEventListener("close", () => stage.replaceChildren());
    }
  }

  /* ---------- Copy email ---------- */
  const copyBtn = document.getElementById("copy-email");
  if (copyBtn) {
    const label = copyBtn.querySelector("span");
    const email = copyBtn.dataset.email;
    let timer;

    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(email);
      } catch {
        const ta = document.createElement("textarea");
        ta.value = email;
        ta.style.cssText = "position:fixed;opacity:0;";
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); } catch {}
        ta.remove();
      }
      copyBtn.classList.add("is-copied");
      label.textContent = "Copied";
      clearTimeout(timer);
      timer = setTimeout(() => {
        copyBtn.classList.remove("is-copied");
        label.textContent = "Copy email";
      }, 1800);
    });
  }

  /* ---------- Scroll progress bar ---------- */
  (() => {
    const bar = document.createElement("div");
    bar.className = "progress";
    bar.setAttribute("aria-hidden", "true");
    bar.innerHTML = "<i></i>";
    document.body.appendChild(bar);
    const fill = bar.firstChild;
    let tick = false;
    const update = () => {
      const h = document.documentElement.scrollHeight - innerHeight;
      fill.style.transform = `scaleX(${h > 0 ? Math.min(1, scrollY / h) : 0})`;
      tick = false;
    };
    addEventListener("scroll", () => { if (!tick) { tick = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  })();

  /* ---------- Footer year ---------- */
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();