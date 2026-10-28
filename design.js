(() => {
  "use strict";

  const lab = document.getElementById("lab-card");
  if (!lab) return;

  const hueEl = document.getElementById("lab-hue");
  const hueVal = document.getElementById("lab-hue-val");
  const swatchesEl = document.getElementById("lab-swatches");
  const modeBtns = [...document.querySelectorAll(".lab__mode")];
  const shuffle = document.getElementById("lab-shuffle");

  /* [hue offset, saturation, lightness] for 5 swatches */
  const MODES = {
    analogous:     [[-40, 70, 30], [-20, 75, 45], [0, 80, 56], [20, 85, 68], [40, 88, 82]],
    complementary: [[0, 70, 24], [0, 78, 52], [0, 82, 80], [180, 75, 48], [180, 82, 80]],
    triadic:       [[0, 75, 46], [0, 62, 82], [120, 62, 42], [240, 72, 56], [240, 60, 86]],
    mono:          [[0, 68, 16], [0, 70, 36], [0, 74, 54], [0, 78, 72], [0, 84, 90]],
  };

  let mode = "analogous";

  const hslToHex = (h, s, l) => {
    h = ((h % 360) + 360) % 360;
    s /= 100; l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = (n) => {
      const k = (n + h / 30) % 12;
      const c = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
      return Math.round(255 * c).toString(16).padStart(2, "0");
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  const textOn = (hex) => {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
      .map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return lum > 0.5 ? "#0b0b0f" : "#ffffff";
  };

  swatchesEl.innerHTML = Array.from({ length: 5 }, () => '<button type="button" class="sw"></button>').join("");
  const sw = [...swatchesEl.children];

  function paint() {
    const hue = Number(hueEl.value);
    hueVal.textContent = `${hue}°`;
    const colors = MODES[mode].map(([dh, s, l]) => hslToHex(hue + dh, s, l));

    colors.forEach((hex, i) => {
      sw[i].style.setProperty("--sw", hex);
      sw[i].style.setProperty("--swt", textOn(hex));
      sw[i].dataset.hex = hex;
      sw[i].textContent = hex;
      sw[i].setAttribute("aria-label", `Copy ${hex}`);
      lab.style.setProperty(`--p${i + 1}`, hex);
    });
    lab.style.setProperty("--ptext", textOn(colors[0]));
  }

  hueEl.addEventListener("input", paint);

  modeBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      mode = btn.dataset.mode;
      modeBtns.forEach((b) => {
        b.classList.toggle("is-active", b === btn);
        b.setAttribute("aria-pressed", String(b === btn));
      });
      paint();
    });
  });

  shuffle.addEventListener("click", () => {
    hueEl.value = String(Math.floor(Math.random() * 360));
    const keys = Object.keys(MODES);
    mode = keys[Math.floor(Math.random() * keys.length)];
    modeBtns.forEach((b) => {
      const on = b.dataset.mode === mode;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", String(on));
    });
    paint();
  });

  /* tap a swatch to copy its hex */
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.setAttribute("role", "status");
  document.body.appendChild(toast);
  let timer;

  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.cssText = "position:fixed;opacity:0;";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); } catch {}
      ta.remove();
    }
  }

  swatchesEl.addEventListener("click", async (e) => {
    const btn = e.target.closest(".sw");
    if (!btn) return;
    await copy(btn.dataset.hex);
    toast.textContent = `Copied ${btn.dataset.hex}`;
    toast.classList.add("is-on");
    sw.forEach((s) => s.classList.toggle("is-copied", s === btn));
    clearTimeout(timer);
    timer = setTimeout(() => {
      toast.classList.remove("is-on");
      btn.classList.remove("is-copied");
    }, 1600);
  });

  paint();
})();
