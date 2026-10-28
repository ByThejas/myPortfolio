(() => {
  "use strict";

  const root = document.documentElement;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);

  /* ---------- UTC clock ---------- */
  const utcEl = $("#clock-utc");
  function tickClock() {
    if (utcEl) utcEl.textContent = new Date().toLocaleTimeString("en-GB", { hour12: false, timeZone: "UTC" });
  }
  tickClock();
  setInterval(tickClock, 1000);

  /* ---------- Market sessions (approximate local business hours) ---------- */
  const SESSIONS = [
    { name: "Sydney",   tz: "Australia/Sydney", open: 7, close: 16 },
    { name: "Tokyo",    tz: "Asia/Tokyo",       open: 9, close: 18 },
    { name: "London",   tz: "Europe/London",    open: 8, close: 17 },
    { name: "New York", tz: "America/New_York", open: 8, close: 17 },
  ];

  function zoneNow(tz) {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: tz, weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
    }).formatToParts(new Date());
    const get = (t) => parts.find((p) => p.type === t).value;
    return { day: get("weekday"), h: Number(get("hour")), m: Number(get("minute")) };
  }

  const sessionList = $("#sessions");
  const overlapEl = $("#overlap");
  if (sessionList) {
    sessionList.innerHTML = SESSIONS.map((s) => `
      <li class="session">
        <span class="session__dot"></span>
        <div class="session__info"><strong>${s.name}</strong><small>--:--</small></div>
        <span class="session__state">Closed</span>
        <span class="session__bar"><i></i></span>
      </li>`).join("");
    const rows = [...sessionList.children];

    const updateSessions = () => {
      const open = [];
      SESSIONS.forEach((s, i) => {
        const z = zoneNow(s.tz);
        const hrs = z.h + z.m / 60;
        const weekday = !["Sat", "Sun"].includes(z.day);
        const isOpen = weekday && hrs >= s.open && hrs < s.close;
        const row = rows[i];
        row.classList.toggle("is-open", isOpen);
        row.querySelector("small").textContent =
          `${String(z.h).padStart(2, "0")}:${String(z.m).padStart(2, "0")} local`;
        row.querySelector(".session__state").textContent = isOpen ? "Open" : "Closed";
        row.querySelector(".session__bar i").style
          .setProperty("--p", isOpen ? ((hrs - s.open) / (s.close - s.open)).toFixed(3) : "0");
        if (isOpen) open.push(s.name);
      });
      overlapEl.textContent =
        open.length >= 2 ? `${open.join(" × ")} overlap: deeper liquidity.`
        : open.length === 1 ? `Only ${open[0]} is open: thinner liquidity.`
        : "Major sessions are closed (weekend).";
    };
    updateSessions();
    setInterval(updateSessions, 30000);
  }

  /* ---------- Certificate viewer ---------- */
  const box = $("#certbox");
  if (box && typeof box.showModal === "function") {
    const boxImg = $("#certbox-img");
    const boxCap = $("#certbox-cap");

    document.querySelectorAll(".cert").forEach((btn) => {
      btn.addEventListener("click", () => {
        const img = btn.querySelector("img");
        if (!img) return; // no certificate uploaded yet
        boxImg.src = img.currentSrc || img.src;
        boxImg.alt = img.alt;
        boxCap.textContent = btn.dataset.title || img.alt;
        box.showModal();
      });
    });

    $("#certbox-close").addEventListener("click", () => box.close());
    box.addEventListener("click", (e) => { if (e.target === box) box.close(); });
  }
})();