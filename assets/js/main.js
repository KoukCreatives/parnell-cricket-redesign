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
        <p class="season__msg"><span class="season__long">${esc(S.season.message)}</span><span class="season__short">${esc(S.season.short || S.season.message)}</span></p>
        <a class="season__cta" href="${esc(S.season.cta.href)}">${esc(S.season.cta.text)} <span aria-hidden="true">→</span></a>
      </div>`;
  }

  /* ---------- Events: Upcoming / Recent tabs; old events disappear ---------- */
  const evAll = $("[data-events-all]");
  if (evAll && S.events) {
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
        </div>
        <div class="ev-card__body">
          <div class="ev-card__top">
            <span class="ev-card__badge"><strong>${fmt(e.show, { day: "numeric" })}</strong>${fmt(e.show, { month: "short" })}</span>
            ${past ? `<span class="ev-card__past">Past event</span>` : `<span class="ev-card__soon">Upcoming</span>`}
          </div>
          <h3>${esc(e.title)}</h3>
          <p class="ev-card__meta">
            <span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
              <time datetime="${e.show}">${fmt(e.show, { weekday: "short", day: "numeric", month: "long" })}</time>${e.repeatWeekly && !past ? " · weekly" : ""}</span>
            ${e.place ? `<span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 22s7-6.3 7-12a7 7 0 0 0-14 0c0 5.7 7 12 7 12Z"/><circle cx="12" cy="10" r="2.5"/></svg>${esc(e.place)}</span>` : ""}${e.time ? `<span>${esc(e.time)}</span>` : ""}
          </p>
          <p>${esc(e.summary)}</p>
          <a class="ev-card__link" href="${esc(e.href)}">${past ? "See what happened" : "Full details"}<span class="sr-only"> – ${esc(e.title)}</span> <span aria-hidden="true">→</span></a>
        </div>
      </article>`;
    const list = upcoming.map(e => card(e, false)).concat(recent.map(e => card(e, true))).slice(0, 6);
    if (list.length) evAll.innerHTML = list.join("");
    else evAll.closest("section")?.setAttribute("hidden", "");
  }

  /* ---------- News: stale posts drop off the homepage ---------- */
  const newsWrap = $("[data-news]");
  if (newsWrap && S.news) {
    const today = todayNZ();
    const cutoff = new Date(toDate(today) - (S.newsFreshDays || 365) * 864e5);
    const all = !!newsWrap.dataset.limit;
    const fresh = S.news.filter(n => all || (n.hideAfter ? n.hideAfter >= today : toDate(n.date) >= cutoff))
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, Number(newsWrap.dataset.limit || 3));
    if (!fresh.length) {
      newsWrap.closest("section")?.setAttribute("hidden", "");
    } else {
      newsWrap.dataset.items = fresh.length;
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

  /* ---------- Sponsors: big linked logo cards + marquee ---------- */
  const host = u => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch (e) { return ""; } };
  const spWrap = $("[data-sponsors]");
  if (spWrap && S.sponsors) {
    spWrap.innerHTML = S.sponsors.map(s => `
      <li><a class="sponsor" href="${esc(s.href)}" target="_blank" rel="noopener">
        <span class="sponsor__logo">${s.knockout ? `<img data-knockout="${esc(s.knockout)}" alt="" hidden><span class="wordmark">${esc(s.name)}</span>` : s.logo ? `<img src="${esc(s.logo)}" alt="" loading="lazy">`
          : s.logoTile ? `<img class="is-tile" src="${esc(s.logoTile)}" alt="" loading="lazy">`
          : `<span class="wordmark">${esc(s.name)}</span>`}</span>
        <span class="sponsor__meta"><strong>${esc(s.name)}</strong><span>${esc(host(s.href))}</span></span>
        <span class="sponsor__go" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M7 17 17 7M8 7h9v9"/></svg></span>
        <span class="sr-only"> (opens in a new tab)</span>
      </a></li>`).join("") + `
      <li><a class="sponsor sponsor--you" href="https://www.parnellcricket.co.nz/sponsors">
        <span class="sponsor__logo"><span class="you__plus" aria-hidden="true">+</span></span>
        <span class="sponsor__meta"><strong>Your brand here</strong><span>Become a partner</span></span>
        <span class="sponsor__go" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M7 17 17 7M8 7h9v9"/></svg></span>
      </a></li>`;
  }

  /* Knock out a coloured logo's background so it matches the white logos */
  document.querySelectorAll("img[data-knockout]").forEach(async img => {
    try {
      const bmp = await createImageBitmap(await (await fetch(img.dataset.knockout, { mode: "cors" })).blob());
      const W = bmp.width, H = bmp.height, c = document.createElement("canvas"); c.width = W; c.height = H;
      const x = c.getContext("2d"); x.drawImage(bmp, 0, 0);
      const p = x.getImageData(0, 0, W, H).data;
      const isBg = i => p[i + 2] > p[i] + 40 && p[i + 2] > p[i + 1] + 20;
      let x0 = W, y0 = H, x1 = 0, y1 = 0, r = 0, g = 0, b = 0, n = 0;
      for (let y = 0; y < H; y++) for (let X = 0; X < W; X++) { const i = (y * W + X) * 4; if (isBg(i)) { x0 = Math.min(x0, X); x1 = Math.max(x1, X); y0 = Math.min(y0, y); y1 = Math.max(y1, y); r += p[i]; g += p[i + 1]; b += p[i + 2]; n++; } }
      if (!n) return;
      r /= n; g /= n; b /= n;
      const out = x.createImageData(W, H), o = out.data;
      let a0 = W, b0 = H, a1 = 0, b1 = 0;
      for (let y = y0 + 4; y <= y1 - 4; y++) for (let X = x0 + 4; X <= x1 - 4; X++) {
        const i = (y * W + X) * 4, a = Math.max(0, Math.min(1, (Math.hypot(p[i] - r, p[i + 1] - g, p[i + 2] - b) - 35) / 90));
        if (a > 0) { o[i] = o[i + 1] = o[i + 2] = 255; o[i + 3] = a * 255; if (a > .3) { a0 = Math.min(a0, X); a1 = Math.max(a1, X); b0 = Math.min(b0, y); b1 = Math.max(b1, y); } }
      }
      const c2 = document.createElement("canvas"); c2.width = a1 - a0 + 9; c2.height = b1 - b0 + 9;
      c2.getContext("2d").putImageData(out, 4 - a0, 4 - b0);
      img.src = c2.toDataURL("image/png"); img.hidden = false;
      img.nextElementSibling?.remove();
    } catch (e) { /* keep the text wordmark */ }
  });

  /* Nav labels: duplicate the text so it can roll on hover */
  document.querySelectorAll(".nav > a:not(.btn)").forEach(a => {
    const t = a.textContent.trim();
    a.innerHTML = `<span class="roll"><span>${esc(t)}</span><span aria-hidden="true">${esc(t)}</span></span>`;
  });

  /* ---------- Mobile nav ---------- */
  const toggle = $(".nav-toggle");
  const nav = $("#site-nav");
  if (toggle && nav) {
    nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => { if (toggle.getAttribute("aria-expanded") === "true") toggle.click(); }));
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("is-open", !open);
      document.body.classList.toggle("nav-open", !open);
      toggle.querySelector(".sr-only").textContent = open ? "Menu" : "Close menu";
    });
  }

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasIO = "IntersectionObserver" in window;
  document.documentElement.classList.toggle("motion", !reduce);

  /* ---------- Odometer counters (digits roll into place, like Goal) ---------- */
  document.querySelectorAll("[data-since]").forEach(el => { el.dataset.count = new Date().getFullYear() - +el.dataset.since; });
  document.querySelectorAll("[data-count]").forEach(el => {
    const val = String(el.dataset.count);
    if (reduce) { el.textContent = val; return; }
    el.classList.add("odo");
    el.innerHTML = `<span class="sr-only">${val}</span>` + [...val].map((d, i) =>
      `<span class="odo__col" aria-hidden="true"><span class="odo__strip" style="--n:${+d + 10};--d:${i * 120}ms">${"0123456789".repeat(2).split("").map(n => `<span>${n}</span>`).join("")}</span></span>`
    ).join("");
  });

  /* ---------- Slide in from bottom (Goal's slideInBottom on ~150 elements) ---------- */
  const revealSel = [
    ".section-head > *", ".center-head > *", ".statement", ".arc", ".showcase", ".stats .stat", ".quick-grid > *",
    ".players__copy > *", ".match", ".ev-card", ".community", ".pass", ".fineprint",
    ".sponsor-grid li", ".slide", ".news", ".center .btn",
    ".photo-grid li", ".faq-card", ".faq details", ".brand__photos img", ".footer__news > *", ".footer__top > div",
    ".facts .fact", ".ages .age", ".cards > *", ".people li", ".datecard", ".block__head > *", ".moment", ".lib-group", ".steps li", ".checklist li", ".split > div > .h2", ".split > .h2"
  ].join(",");
  document.querySelectorAll(revealSel).forEach(el => {
    if (el.closest(".hero")) return;
    el.classList.add("reveal");
    const sibs = [...el.parentElement.children].filter(c => c.matches(revealSel));
    el.style.setProperty("--d", Math.min(sibs.indexOf(el), 6) * 90 + "ms");
  });
  if (!reduce && hasIO) {
    const ro = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("is-in"); ro.unobserve(e.target); }
    }), { threshold: 0.1, rootMargin: "0px 0px -6% 0px" });
    document.querySelectorAll(".reveal, .odo").forEach(el => ro.observe(el));
  } else {
    document.querySelectorAll(".reveal, .odo").forEach(el => el.classList.add("is-in"));
  }

  /* ---------- Scroll-linked parallax (arc photos, player cards, partner photos) ---------- */
  const px = [...document.querySelectorAll("[data-parallax]")];
  if (px.length && !reduce && matchMedia("(min-width: 861px)").matches) {
    let ticking = false;
    const update = () => {
      const vh = innerHeight;
      px.forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        const off = (r.top + r.height / 2 - vh / 2);
        el.style.setProperty("--py", (off * +el.dataset.parallax).toFixed(1) + "px");
        if (el.dataset.rotate) el.style.setProperty("--pr", (+el.dataset.rotate + off * 0.012).toFixed(2) + "deg");
      });
      ticking = false;
    };
    addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    addEventListener("resize", update);
    update();
  }

  /* ---------- FAQ: smooth open/close ---------- */
  document.querySelectorAll(".faq details").forEach(d => {
    const sum = d.querySelector("summary");
    const body = d.querySelector("summary + *");
    if (!body || reduce) return;
    sum.addEventListener("click", e => {
      e.preventDefault();
      if (d.open) {
        const anim = body.animate([{ height: body.offsetHeight + "px", opacity: 1 }, { height: "0px", opacity: 0 }], { duration: 300, easing: "ease" });
        d.classList.remove("is-open");
        anim.onfinish = () => { d.open = false; };
      } else {
        d.open = true; d.classList.add("is-open");
        body.animate([{ height: "0px", opacity: 0 }, { height: body.offsetHeight + "px", opacity: 1 }], { duration: 380, easing: "cubic-bezier(.25,.46,.45,.94)" });
      }
    });
  });

  /* ---------- Gallery: custom "Drag" cursor + drag to scroll ---------- */
  document.querySelectorAll(".gallery-wrap").forEach(w => {
    const g = w.querySelector(".gallery"), cur = w.querySelector(".drag-cursor");
    if (matchMedia("(pointer: fine)").matches && !reduce) {
      w.addEventListener("pointermove", e => {
        const r = w.getBoundingClientRect();
        cur.style.transform = `translate(${e.clientX - r.left}px, ${e.clientY - r.top}px)`;
      });
      w.addEventListener("pointerenter", () => w.classList.add("cursor-on"));
      w.addEventListener("pointerleave", () => w.classList.remove("cursor-on"));
    }
    let down = false, x0 = 0, s0 = 0;
    g.addEventListener("pointerdown", e => { if (e.pointerType !== "mouse") return; down = true; x0 = e.clientX; s0 = g.scrollLeft; g.classList.add("is-drag"); });
    addEventListener("pointerup", () => { down = false; g.classList.remove("is-drag"); });
    g.addEventListener("pointermove", e => { if (down) g.scrollLeft = s0 - (e.clientX - x0); });
    g.addEventListener("dragstart", e => e.preventDefault());
  });

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
      slides.forEach((s, k) => { s.hidden = false; s.classList.toggle("is-active", k === i); s.setAttribute("aria-hidden", String(k !== i)); s.inert = k !== i; });
      if (count) count.innerHTML = `<strong>${i + 1}</strong> / ${slides.length}`;
    };
    sl.querySelector("[data-prev]")?.addEventListener("click", () => show(i - 1));
    sl.querySelector("[data-next]")?.addEventListener("click", () => show(i + 1));
    show(0);
    if (!reduce) {
      let t = setInterval(() => show(i + 1), 6000);
      sl.addEventListener("pointerenter", () => clearInterval(t));
      sl.addEventListener("focusin", () => clearInterval(t));
      sl.addEventListener("pointerleave", () => { clearInterval(t); t = setInterval(() => show(i + 1), 6000); });
    }
  });

  /* ---------- Newsletter (prototype: opens an email to the club) ---------- */
  document.querySelectorAll("[data-newsletter]").forEach(f => f.addEventListener("submit", e => {
    e.preventDefault();
    const email = f.querySelector("input[type=email]").value;
    location.href = `mailto:steve@parnellcricket.co.nz?subject=${encodeURIComponent("Newsletter sign-up")}&body=${encodeURIComponent("Please add " + email + " to the club newsletter.")}`;
  }));

  /* ---------- Spline 3D scenes (trophy + crest), loaded only when near the screen ---------- */
  const splines = [...document.querySelectorAll("[data-spline]")];
  if (splines.length && !reduce && "IntersectionObserver" in window) {
    const SRC = "https://unpkg.com/@splinetool/viewer@2.0.80/build/spline-viewer.js";
    let loading;
    const loadLib = () => loading || (loading = new Promise((res, rej) => {
      const s = document.createElement("script"); s.type = "module"; s.src = SRC; s.onload = res; s.onerror = rej; document.head.appendChild(s);
    }));
    const io2 = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      io2.unobserve(e.target);
      const box = e.target;
      loadLib().then(() => {
        const v = document.createElement("spline-viewer");
        v.setAttribute("url", box.dataset.spline);
        v.setAttribute("loading-anim-type", "none");
        v.setAttribute("aria-hidden", "true");
        v.addEventListener("load-complete", () => box.classList.add("is-live"));
        box.appendChild(v);
        // Safety net: if the scene never reports in, keep the photo.
        setTimeout(() => { if (!box.classList.contains("is-live") && v.shadowRoot && v.shadowRoot.querySelector("canvas")) box.classList.add("is-live"); }, 6000);
      }).catch(() => {});
    }), { rootMargin: "300px 0px" });
    splines.forEach(s => io2.observe(s));
  }

  /* ---------- History: pinned horizontal timeline ---------- */
  document.querySelectorAll("[data-history]").forEach(sec => {
    const track = sec.querySelector(".history__track"), bar = sec.querySelector(".history__progress");
    const moments = [...sec.querySelectorAll(".moment")];
    const wide = matchMedia("(min-width: 861px)");
    let dist = 0, top = 0, on = false;
    const measure = () => {
      on = wide.matches && !reduce;
      sec.classList.toggle("history--static", !on);
      if (!on) { sec.style.height = ""; track.style.removeProperty("--hx"); moments.forEach(m => m.classList.add("is-active")); return; }
      moments.forEach(m => m.classList.remove("is-active"));
      dist = Math.max(0, track.scrollWidth - innerWidth);
      sec.style.height = (dist + innerHeight) + "px";
      top = sec.getBoundingClientRect().top + scrollY;
      tick();
    };
    const tick = () => {
      if (!on) return;
      const p = Math.min(1, Math.max(0, (scrollY - top) / (dist || 1)));
      track.style.setProperty("--hx", (-p * dist).toFixed(1) + "px");
      bar.style.setProperty("--hp", (p * 100).toFixed(2) + "%");
      const mid = innerWidth * .55;
      moments.forEach(m => { const r = m.getBoundingClientRect(); m.classList.toggle("is-active", r.left < mid && r.right > innerWidth * .2); });
    };
    let raf = 0;
    addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; tick(); }); }, { passive: true });
    addEventListener("resize", measure);
    addEventListener("load", measure);
    wide.addEventListener?.("change", measure);
    measure();
  });

  /* ---------- Wordmark band drifts with the scroll ---------- */
  const bands = [...document.querySelectorAll("[data-wordband] .wordband__row")];
  if (bands.length && !reduce) {
    let raf2 = 0;
    const move = () => {
      raf2 = 0;
      bands.forEach(row => {
        const r = row.getBoundingClientRect();
        if (r.bottom < -100 || r.top > innerHeight + 100) return;
        row.style.setProperty("--wx", ((r.top - innerHeight) * +row.dataset.speed).toFixed(1) + "px");
      });
    };
    addEventListener("scroll", () => { if (!raf2) raf2 = requestAnimationFrame(move); }, { passive: true });
    move();
  }

  /* ---------- Club Library: archive lists + search ---------- */
  const libNews = $("[data-lib-news]"), libEv = $("[data-lib-events]");
  const fmtD = s => new Intl.DateTimeFormat("en-NZ", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(s + "T00:00:00Z"));
  if (libNews && S.news) libNews.innerHTML = [...S.news].sort((a, b) => b.date.localeCompare(a.date)).map(n => `<li><a href="${esc(n.href)}"><span class="t">${esc(n.title)}</span><span class="m">${fmtD(n.date)}</span></a></li>`).join("");
  if (libEv && S.events) {
    const t0 = new Intl.DateTimeFormat("en-CA", { timeZone: "Pacific/Auckland" }).format(new Date());
    const past = S.events.filter(e => !e.repeatWeekly && (e.end || e.date) < t0).sort((a, b) => b.date.localeCompare(a.date));
    libEv.innerHTML = past.length ? past.map(e => `<li><a href="${esc(e.href)}"><span class="t">${esc(e.title)}</span><span class="m">${fmtD(e.date)}</span></a></li>`).join("") : `<li><span class="lib-row"><span class="t">No past events yet</span></span></li>`;
  }
  const q = $("[data-lib-search]");
  if (q) {
    const groups = [...document.querySelectorAll("[data-lib] .lib-group")], empty = $("[data-lib-empty]");
    q.addEventListener("input", () => {
      const v = q.value.trim().toLowerCase(); let any = false;
      groups.forEach(g => {
        let n = 0;
        g.querySelectorAll("li").forEach(li => { const hit = !v || li.textContent.toLowerCase().includes(v); li.hidden = !hit; if (hit) n++; });
        g.hidden = !n; if (n) any = true;
      });
      empty.hidden = any;
    });
  }

  /* ---------- Jump links: highlight the section in view ---------- */
  const jumpLinks = [...document.querySelectorAll(".jump a")];
  if (jumpLinks.length && "IntersectionObserver" in window) {
    const map = new Map(jumpLinks.map(a => [a.getAttribute("href").slice(1), a]));
    const jo = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      jumpLinks.forEach(a => a.classList.remove("is-current"));
      map.get(e.target.id)?.classList.add("is-current");
    }), { rootMargin: "-40% 0px -55% 0px" });
    map.forEach((a, id) => { const el = document.getElementById(id); if (el) jo.observe(el); });
  }

  /* ---------- Sticky header: follows the page, logo shrinks after the first scroll ---------- */
  const hdr = $(".header"), seasonBar = $(".season");
  if (hdr) {
    let rafH = 0;
    const setH = () => {
      rafH = 0;
      const bh = seasonBar ? seasonBar.offsetHeight : 0;
      hdr.style.setProperty("--ht", Math.max(0, bh - scrollY) + "px");
      hdr.classList.toggle("is-scrolled", scrollY > 40);
    };
    addEventListener("scroll", () => { if (!rafH) rafH = requestAnimationFrame(setH); }, { passive: true });
    addEventListener("resize", setH);
    setH();
  }

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(el => (el.textContent = new Date().getFullYear()));
})();
