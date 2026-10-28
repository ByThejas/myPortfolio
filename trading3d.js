(() => {
  "use strict";
  const row = document.getElementById("cs-row");
  const head = document.querySelector(".desk-head");
  if (!row || !head) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const small = matchMedia("(max-width: 1000px)").matches;
  const N = 15, GAP = small ? 26 : 32, SCALE = small ? 0.95 : 1.05;   // px per unit of price
  const rnd = (a, b) => a + Math.random() * (b - a);

  // random-walk OHLC series
  const series = [];
  let price = 70;
  const next = () => {
    const open = price;
    const close = Math.max(24, Math.min(150, open + rnd(-24, 26)));
    const hi = Math.max(open, close) + rnd(5, 20);
    const lo = Math.max(6, Math.min(open, close) - rnd(5, 18));
    price = close;
    return { o: open, c: close, h: hi, l: lo };
  };
  for (let i = 0; i < N; i++) series.push(next());

  const box = (cls, w) => {
    const b = document.createElement("div");
    b.className = `cs__b ${cls}`;
    b.innerHTML = '<i class="f"></i><i class="k"></i><i class="l"></i><i class="r"></i><i class="t"></i>';
    return b;
  };

  const candles = series.map((_, i) => {
    const c = document.createElement("div");
    c.className = "cs__c";
    c.style.left = `${(i - (N - 1) / 2) * GAP}px`;
    const wick = box("cs__b--wick"), body = box("cs__b--body");
    c.append(wick, body);
    row.appendChild(c);
    return { c, wick, body };
  });

  const paint = () => {
    series.forEach((s, i) => {
      const { c, wick, body } = candles[i];
      c.classList.toggle("is-dn", s.c < s.o);
      const top = Math.max(s.o, s.c) * SCALE, bot = Math.min(s.o, s.c) * SCALE;
      body.style.setProperty("--y", `${bot}px`);
      body.style.setProperty("--h", `${Math.max(6, top - bot)}px`);
      wick.style.setProperty("--y", `${s.l * SCALE}px`);
      wick.style.setProperty("--h", `${(s.h - s.l) * SCALE}px`);
    });
  };
  paint();

  const cs = head.querySelector(".cs");
  if (!reduce) {
    let t = 0;
    const slide = () => { series.shift(); price = series[series.length - 1].c; series.push(next()); series.forEach((s, i) => { if (i) s.o = series[i - 1].c; s.h = Math.max(s.h, s.o, s.c); s.l = Math.min(s.l, s.o, s.c); }); paint(); };
    cs.addEventListener("poke", () => { slide(); slide(); });
    setInterval(() => {
      if (document.hidden || document.documentElement.classList.contains("lite") || head.querySelector(".cs").classList.contains("is-off")) return;
      t++;
      if (t % 3 === 0) {                       // slide the chart: drop oldest, add a new candle
        series.shift();
        const first = series[series.length - 1];
        price = first.c;
        series.push(next());
        // keep the series continuous
        series.forEach((s, i) => { if (i) s.o = series[i - 1].c; s.h = Math.max(s.h, s.o, s.c); s.l = Math.min(s.l, s.o, s.c); });
      } else {                                 // the live candle ticks
        const s = series[series.length - 1];
        s.c = Math.max(24, Math.min(150, s.c + rnd(-14, 14)));
        s.h = Math.max(s.h, s.c, s.o); s.l = Math.min(s.l, s.c, s.o);
        price = s.c;
      }
      paint();
    }, 1300);

    if (matchMedia("(hover: hover)").matches) {
      head.addEventListener("pointermove", (e) => {
        const r = head.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        cs.style.setProperty("--cy", `${(x * 14).toFixed(1)}deg`);
        cs.style.setProperty("--cx", `${(-y * 8).toFixed(1)}deg`);
      });
    }
  }
})();
