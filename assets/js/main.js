(function () {
  const S = window.SITE || {};
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (t = "") => String(t).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // "Today" in NZ time, as YYYY-MM-DD, so events flip over at NZ midnight.
  const todayNZ = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Pacific/Auckland" }).format(new Date());
  // Work in UTC midnight throughout so dates never shift with the viewer's timezone.
  const toDate = s => new Date(s + "T00:00:00Z");
  const fmt = (s, o) => new Intl.DateTimeFormat("en-NZ", { ...o, timeZone: "UTC" }).format(toDate(s));
  const iso = d => d.toISOString().slice(0, 10);

  /* ---------- Season banner (same on every page) ---------- */
  const bar = $("[data-season]");
  if (bar && S.season) {
    bar.innerHTML = `
      <div class="container season__inner">
        <span class="season__label">${esc(S.season.label)}</span>
        <p class="season__msg">${esc(S.season.message)}</p>
        <a class="season__cta" href="${esc(S.season.cta.href)}">${esc(S.season.cta.text)} <span aria-hidden="true">→</span></a>
      </div>`;
  }

  /* ---------- Events: past ones hide themselves ---------- */
  const evWrap = $("[data-events]");
  if (evWrap && S.events) {
    const today = todayNZ();
    const upcoming = S.events.map(e => {
      if (e.repeatWeekly) {
        // Next occurrence on or after today, within the series.
        let d = toDate(e.date);
        const t = toDate(today);
        while (d < t) d.setUTCDate(d.getUTCDate() + 7);
        const next = iso(d);
        return next <= e.end ? { ...e, show: next, last: next } : null;
      }
      return { ...e, show: e.date, last: e.end || e.date };
    }).filter(e => e && e.last >= today)
      .sort((a, b) => a.show.localeCompare(b.show))
      .slice(0, Number(evWrap.dataset.limit || 3));

    if (!upcoming.length) {
      evWrap.closest("section")?.setAttribute("hidden", "");
    } else {
      evWrap.innerHTML = upcoming.map(e => `
        <article class="event">
          <div class="event__date" aria-hidden="true">
            <span>${fmt(e.show, { weekday: "short" })}</span>
            <strong>${fmt(e.show, { day: "numeric" })}</strong>
            <span>${fmt(e.show, { month: "short" })}</span>
          </div>
          <div class="event__body">
            <h3>${esc(e.title)}</h3>
            <p class="event__meta">
              <time datetime="${e.show}">${fmt(e.show, { weekday: "long", day: "numeric", month: "long" })}</time>
              ${e.repeatWeekly ? " · Every week" : ""}${e.time ? " · " + esc(e.time) : ""}${e.place ? " · " + esc(e.place) : ""}
            </p>
            <p>${esc(e.summary)}</p>
          </div>
          <a class="btn btn--ghost" href="${esc(e.href)}">Details<span class="sr-only"> about ${esc(e.title)}</span></a>
        </article>`).join("");
    }
  }

  /* ---------- News: stale posts drop off the homepage ---------- */
  const newsWrap = $("[data-news]");
  if (newsWrap && S.news) {
    const today = todayNZ();
    const cutoff = new Date(toDate(today) - (S.newsFreshDays || 365) * 864e5);
    const fresh = S.news.filter(n => (n.hideAfter ? n.hideAfter >= today : toDate(n.date) >= cutoff))
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 3);
    if (!fresh.length) {
      newsWrap.closest("section")?.setAttribute("hidden", "");
    } else {
      newsWrap.dataset.count = fresh.length;
      newsWrap.innerHTML = fresh.map(n => `
        <article class="news">
          <a href="${esc(n.href)}" class="news__img"><img src="${esc(n.image)}" alt="${esc(n.alt)}" loading="lazy"></a>
          <div class="news__body">
            <p class="news__meta"><span class="tag">${esc(n.tag)}</span><time datetime="${n.date}">${fmt(n.date, { day: "numeric", month: "long", year: "numeric" })}</time></p>
            <h3><a href="${esc(n.href)}">${esc(n.title)}</a></h3>
            <p>${esc(n.summary)}</p>
          </div>
        </article>`).join("");
    }
  }

  /* ---------- Sponsors: every logo links out ---------- */
  const spWrap = $("[data-sponsors]");
  if (spWrap && S.sponsors) {
    spWrap.innerHTML = S.sponsors.map(s => `
      <li><a href="${esc(s.href)}" target="_blank" rel="noopener">
        ${s.logo ? `<img src="${esc(s.logo)}" alt="${esc(s.name)}" loading="lazy">` : `<span class="wordmark">${esc(s.name)}</span>`}
        <span class="sr-only"> (opens in a new tab)</span>
      </a></li>`).join("");
  }

  /* ---------- Mobile nav ---------- */
  const toggle = $(".nav-toggle");
  const nav = $("#site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("is-open", !open);
      document.body.classList.toggle("nav-open", !open);
    });
  }

  /* ---------- Count-up stats ---------- */
  const counters = document.querySelectorAll("[data-count]");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (counters.length && !reduce && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target, end = +el.dataset.count, t0 = performance.now();
      const step = t => {
        const p = Math.min((t - t0) / 1200, 1);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      io.unobserve(el);
    }), { threshold: 0.6 });
    counters.forEach(c => io.observe(c));
  }

  /* ---------- Reveal on scroll ---------- */
  if (!reduce && "IntersectionObserver" in window) {
    const ro = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("is-in"); ro.unobserve(e.target); }
    }), { threshold: 0.12 });
    document.querySelectorAll(".reveal").forEach(el => ro.observe(el));
  } else {
    document.querySelectorAll(".reveal").forEach(el => el.classList.add("is-in"));
  }

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(el => (el.textContent = new Date().getFullYear()));
})();
