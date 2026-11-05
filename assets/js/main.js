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

  /* ---------- Events: Upcoming / Recent tabs; old events disappear ---------- */
  const evUp = $("[data-events-upcoming]");
  const evPast = $("[data-events-recent]");
  if ((evUp || evPast) && S.events) {
    const today = todayNZ();
    const recentFrom = iso(new Date(toDate(today) - (S.recentDays || 45) * 864e5));
    const all = S.events.map(e => {
      if (e.repeatWeekly) {
        let d = toDate(e.date);
        const t = toDate(today);
        while (d < t) d.setUTCDate(d.getUTCDate() + 7);
        const next = iso(d);
        return next <= e.end ? { ...e, show: next, last: next } : { ...e, show: e.end, last: e.end };
      }
      return { ...e, show: e.date, last: e.end || e.date };
    });
    const upcoming = all.filter(e => e.last >= today).sort((a, b) => a.show.localeCompare(b.show));
    const recent = all.filter(e => e.last < today && e.last >= recentFrom).sort((a, b) => b.show.localeCompare(a.show));

    const card = (e, past) => `
      <article class="ev-card${past ? " is-past" : ""}">
        <div class="ev-card__media">
          <img src="${esc(e.image)}" alt="${esc(e.alt || "")}" loading="lazy">
          <span class="ev-card__badge">
            <strong>${fmt(e.show, { day: "numeric" })}</strong>${fmt(e.show, { month: "short" })}
          </span>
        </div>
        <div class="ev-card__body">
          <h3>${esc(e.title)}</h3>
          <p class="ev-card__meta">
            <span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
              <time datetime="${e.show}">${fmt(e.show, { weekday: "short", day: "numeric", month: "long" })}</time>${e.repeatWeekly && !past ? " · weekly" : ""}</span>
            ${e.place ? `<span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 22s7-6.3 7-12a7 7 0 0 0-14 0c0 5.7 7 12 7 12Z"/><circle cx="12" cy="10" r="2.5"/></svg>${esc(e.place)}</span>` : ""}
          </p>
          <p>${esc(e.summary)}</p>
          <a class="ev-card__link" href="${esc(e.href)}">${past ? "See what happened" : "Full details"}<span class="sr-only"> – ${esc(e.title)}</span> <span aria-hidden="true">→</span></a>
        </div>
      </article>`;
    const empty = msg => `<p class="ev-empty">${msg}</p>`;
    if (evUp) evUp.innerHTML = upcoming.length ? upcoming.slice(0, 6).map(e => card(e, false)).join("") : empty("Nothing on right now – check back soon.");
    if (evPast) evPast.innerHTML = recent.length ? recent.slice(0, 6).map(e => card(e, true)).join("") : empty("No recent events.");
    if (!upcoming.length && !recent.length) evUp?.closest("section")?.setAttribute("hidden", "");
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
  document.querySelectorAll("[data-since]").forEach(el => { el.dataset.count = new Date().getFullYear() - +el.dataset.since; el.textContent = el.dataset.count; });
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

  /* ---------- Tabs (events, membership) ---------- */
  document.querySelectorAll("[data-tabs]").forEach(group => {
    const tabs = [...group.querySelectorAll('[role="tab"]')];
    const select = tab => tabs.forEach(t => {
      const on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
    });
    tabs.forEach((t, i) => {
      t.addEventListener("click", () => select(t));
      t.addEventListener("keydown", e => {
        const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (d) { const n = tabs[(i + d + tabs.length) % tabs.length]; select(n); n.focus(); }
      });
    });
  });

  /* ---------- Honours slider ---------- */
  document.querySelectorAll("[data-slider]").forEach(sl => {
    const slides = [...sl.querySelectorAll(".slide")];
    const count = sl.querySelector("[data-slide-count]");
    let i = 0;
    const show = n => {
      i = (n + slides.length) % slides.length;
      slides.forEach((s, k) => { s.hidden = k !== i; });
      if (count) count.innerHTML = `<strong>${i + 1}</strong> / ${slides.length}`;
    };
    sl.querySelector("[data-prev]")?.addEventListener("click", () => show(i - 1));
    sl.querySelector("[data-next]")?.addEventListener("click", () => show(i + 1));
    show(0);
  });

  /* ---------- Newsletter (prototype: opens an email to the club) ---------- */
  document.querySelectorAll("[data-newsletter]").forEach(f => f.addEventListener("submit", e => {
    e.preventDefault();
    const email = f.querySelector("input[type=email]").value;
    location.href = `mailto:steve@parnellcricket.co.nz?subject=${encodeURIComponent("Newsletter sign-up")}&body=${encodeURIComponent("Please add " + email + " to the club newsletter.")}`;
  }));

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(el => (el.textContent = new Date().getFullYear()));
})();
