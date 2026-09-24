(() => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  // Nav state, scroll progress, story ink
  const nav = $("[data-nav]");
  const bar = $("[data-progress]");
  const lede = $("[data-ink]");
  let words = [];

  if (lede) {
    const text = lede.textContent.trim();
    lede.setAttribute("aria-label", text);
    lede.innerHTML = text
      .split(/\s+/)
      .map((w) => `<span class="w" aria-hidden="true">${w}</span>`)
      .join(" ");
    words = $$(".w", lede);
  }

  let ticking = false;
  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    nav.classList.toggle("is-scrolled", y > 24);
    bar.parentElement.style.setProperty("--p", max > 0 ? (y / max).toFixed(4) : 0);

    if (words.length && !reduced) {
      const r = lede.getBoundingClientRect();
      const vh = window.innerHeight;
      const t = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
      const lit = Math.round(t * words.length);
      words.forEach((w, i) => w.classList.toggle("on", i < lit));
    }
    ticking = false;
  };
  window.addEventListener("scroll", () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  // Active nav link
  const links = $$(".nav-links a");
  const sections = links.map((a) => $(a.getAttribute("href"))).filter(Boolean);
  const secObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        links.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + e.target.id));
      }
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  sections.forEach((s) => secObs.observe(s));

  // Scroll reveals, staggered within a parent
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const sibs = $$(":scope > .reveal", el.parentElement);
      el.style.setProperty("--rd", `${Math.max(0, sibs.indexOf(el)) * 0.06}s`);
      el.classList.add("is-in");
      revealObs.unobserve(el);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
  $$(".reveal").forEach((el) => revealObs.observe(el));

  // Count-up stats
  const countObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const end = +el.dataset.count;
      countObs.unobserve(el);
      if (reduced) return;
      const dur = 1400 + Math.min(end, 300) * 2;
      const start = performance.now() + 900;
      el.textContent = "0";
      const tick = (now) => {
        const t = Math.min(1, Math.max(0, (now - start) / dur));
        const eased = 1 - Math.pow(1 - t, 4);
        el.textContent = Math.round(end * eased);
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.6 });
  $$("[data-count]").forEach((el) => countObs.observe(el));

  // Track record accordion
  $$("[data-accordion] .rec-head").forEach((btn) => {
    btn.addEventListener("click", () => {
      const li = btn.closest(".rec");
      const open = !li.classList.contains("is-open");
      $$("[data-accordion] .rec.is-open").forEach((o) => {
        if (o !== li) { o.classList.remove("is-open"); $(".rec-head", o).setAttribute("aria-expanded", "false"); }
      });
      li.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", String(open));
    });
  });

  // Pipeline filters
  const filters = $("[data-filters]");
  if (filters) {
    const ink = $(".filter-ink", filters);
    const tabs = $$("button", filters);
    const items = $$("[data-pipe] .prod");
    const moveInk = (tab) => {
      ink.style.width = `${tab.offsetWidth}px`;
      ink.style.transform = `translateX(${tab.offsetLeft}px)`;
    };
    const apply = (tab) => {
      const f = tab.dataset.filter;
      tabs.forEach((t) => t.setAttribute("aria-selected", String(t === tab)));
      moveInk(tab);
      items.forEach((it) => {
        const show = f === "all" || it.dataset.status === f;
        if (show) {
          it.classList.remove("is-hidden");
          it.classList.add("is-leaving");
          requestAnimationFrame(() => requestAnimationFrame(() => it.classList.remove("is-leaving")));
        } else {
          it.classList.add("is-hidden");
        }
      });
    };
    tabs.forEach((t) => t.addEventListener("click", () => apply(t)));
    filters.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const i = tabs.indexOf(document.activeElement);
      if (i < 0) return;
      const next = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
      next.focus();
      apply(next);
    });
    const sync = () => moveInk(tabs.find((t) => t.getAttribute("aria-selected") === "true"));
    window.addEventListener("resize", sync);
    document.fonts?.ready.then(sync);
    sync();
  }

  // Copy email
  $$("[data-copy]").forEach((btn) => {
    const label = $("[data-copy-label]", btn);
    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        btn.classList.add("is-done");
        label.textContent = "Copied";
        setTimeout(() => { btn.classList.remove("is-done"); label.textContent = "Copy"; }, 1800);
      } catch {
        window.location.href = "mailto:" + btn.dataset.copy;
      }
    });
  });

  // Pointer spotlight + magnetic buttons (fine pointers only)
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches && !reduced) {
    const root = document.documentElement;
    window.addEventListener("pointermove", (e) => {
      root.style.setProperty("--mx", `${e.clientX}px`);
      root.style.setProperty("--my", `${e.clientY}px`);
      document.body.classList.add("has-pointer");
    }, { passive: true });

    $$(".magnetic").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.18;
        const y = (e.clientY - r.top - r.height / 2) * 0.3;
        el.style.transform = `translate(${x}px, ${y}px)`;
      });
      el.addEventListener("pointerleave", () => { el.style.transform = ""; });
    });
  }

  const yr = $("[data-year]");
  if (yr) yr.textContent = new Date().getFullYear();
})();
