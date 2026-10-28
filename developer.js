(() => {
  "use strict";

  /* ============================================================
     CHANGE THIS to your GitHub username (the part after github.com/)
     ============================================================ */
  const GITHUB_USER = "ByThejas";

  const root = document.getElementById("gh");
  if (!root) return;

  const graph = document.getElementById("gh-graph");
  const monthsEl = document.getElementById("gh-months");
  const totalEl = document.getElementById("gh-total");
  const metaEl = document.getElementById("gh-meta");
  const linkEl = document.getElementById("gh-link");
  const statsEl = document.getElementById("gh-stats");
  const scroller = document.getElementById("gh-scroll");

  const isPlaceholder = !GITHUB_USER || GITHUB_USER === "your-username";
  linkEl.href = `https://github.com/${isPlaceholder ? "" : GITHUB_USER}`;
  linkEl.querySelector("span").textContent = isPlaceholder ? "github.com" : `@${GITHUB_USER}`;

  const fmtDate = (s) =>
    new Date(s + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

  /* Last 53 weeks of empty days, used before a real username is set or if loading fails */
  function emptyYear() {
    const days = [];
    const end = new Date();
    end.setUTCHours(0, 0, 0, 0);
    for (let i = 364; i >= 0; i--) {
      const d = new Date(end.getTime() - i * 864e5);
      days.push({ date: d.toISOString().slice(0, 10), count: 0, level: 0 });
    }
    return days;
  }

  function render(days, { showCounts }) {
    graph.replaceChildren();
    monthsEl.replaceChildren();

    const lead = new Date(days[0].date + "T00:00:00Z").getUTCDay(); // Sunday = 0
    for (let i = 0; i < lead; i++) {
      const pad = document.createElement("i");
      pad.className = "gh__cell is-pad";
      graph.appendChild(pad);
    }

    let lastMonth = -1;
    days.forEach((d, i) => {
      const cell = document.createElement("i");
      cell.className = `gh__cell l${d.level}`;
      const col = Math.floor((i + lead) / 7);
      cell.style.setProperty("--d", `${Math.min(col * 14, 700)}ms`);
      cell.title = showCounts
        ? `${d.count} contribution${d.count === 1 ? "" : "s"} on ${fmtDate(d.date)}`
        : fmtDate(d.date);
      graph.appendChild(cell);

      const m = new Date(d.date + "T00:00:00Z").getUTCMonth();
      const dayOfMonth = Number(d.date.slice(8, 10));
      if (m !== lastMonth && dayOfMonth <= 7) {
        // label the first full week of each month
        const label = document.createElement("span");
        label.textContent = new Date(d.date + "T00:00:00Z").toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" });
        label.style.setProperty("--col", col);
        monthsEl.appendChild(label);
        lastMonth = m;
      } else if (m !== lastMonth) {
        lastMonth = m;
      }
    });

    const cols = Math.ceil((days.length + lead) / 7);
    root.style.setProperty("--cols", cols);
    requestAnimationFrame(() => root.classList.add("is-ready"));
    if (scroller) scroller.scrollLeft = scroller.scrollWidth; // show the most recent weeks first on small screens
  }

  function renderStats(days) {
    const total = days.reduce((a, d) => a + d.count, 0);
    const active = days.filter((d) => d.count > 0).length;
    const best = days.reduce((a, d) => (d.count > a.count ? d : a), days[0]);

    // current streak: count back from today (allow today to be empty)
    let streak = 0;
    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i].count > 0) streak++;
      else if (i === days.length - 1) continue;
      else break;
    }

    totalEl.textContent = total.toLocaleString("en-US");
    metaEl.textContent = "contributions in the last year";
    statsEl.innerHTML = `
      <div><strong>${active}</strong><span>Active days</span></div>
      <div><strong>${best.count}</strong><span>Best day${best.count ? `, ${fmtDate(best.date)}` : ""}</span></div>
      <div><strong>${streak}</strong><span>Current streak</span></div>`;
  }

  function showFallback(message) {
    render(emptyYear(), { showCounts: false });
    totalEl.textContent = "-";
    metaEl.textContent = message;
    statsEl.innerHTML = "";
    root.classList.add("is-empty");
  }

  async function load() {
    if (isPlaceholder) {
      showFallback("Add your GitHub username in developer.js to show your activity.");
      return;
    }
    try {
      const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(GITHUB_USER)}?y=last`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const days = (data.contributions || []).slice().sort((a, b) => a.date.localeCompare(b.date));
      if (!days.length) throw new Error("No data");
      render(days, { showCounts: true });
      renderStats(days);
    } catch (err) {
      console.error("GitHub calendar failed:", err);
      showFallback("Couldn't load GitHub activity right now. Open the profile instead.");
    }
  }

  load();
})();
