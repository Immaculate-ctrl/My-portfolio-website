/* =========================================================================
   Gift Thabanyane — Portfolio interactions
   Vanilla JS, no build step. Everything renders from window.PORTFOLIO
   (js/data.js), so adding a project = adding an object there.
   ========================================================================= */
(() => {
  "use strict";

  const D = window.PORTFOLIO;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const esc = (s = "") => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const pad = (n) => String(n).padStart(2, "0");

  const fine = matchMedia("(pointer: fine)").matches;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const desktop = matchMedia("(min-width: 901px)");

  /* Short lines that stitch one chapter to the next — the "voice" of the story. */
  const BRIDGES = {
    mark: "A symbol is a promise. <em>Packaging</em> is where the promise is kept.",
    object: "One object is a product. A hundred touchpoints is <em>a brand.</em>",
    system: "Once a brand can speak, it needs <em>pages</em> to say something worth reading.",
    page: "Paper became pixels — and the story learned to <em>scroll.</em>",
    screen: "Screens are private. Billboards are <em>public.</em>",
    street: "Still images shout. <em>Moving</em> ones get remembered.",
    motion: "None of it works without an eye for <em>light.</em>",
    lens: "That's the finished work. Now see <em>how it got there.</em>",
  };

  /* ---------------------------------------------------------------------
     Lightbox registry
     --------------------------------------------------------------------- */
  const groups = {};
  const addGroup = (key, list) => (groups[key] = list);
  const processes = {}; // case studies, opened in the scrolling process view

  /* ---------------------------------------------------------------------
     Templates
     --------------------------------------------------------------------- */
  // small copies (max 800px) in thumbs/, mirroring each image's path — used wherever an image shows small
  const thumb = (src) => window.ASSET_BASE + "thumbs/" + src.slice(window.ASSET_BASE.length);
  const frame = (src, title, extra = "") =>
    `<div class="frame" data-title="${esc(title)}" ${extra}><img src="${esc(src)}" alt="${esc(title)}" loading="lazy" decoding="async" /></div>`;
  const badge = (it) => (it.thread ? `<span class="thread-badge">The thread</span>` : "");
  const itemAttrs = (it, group, i) => `data-item ${it.thread ? 'class-thread="1"' : ""} data-lb="${group}" data-lb-index="${i}"`;

  const layouts = {
    rail(ch) {
      addGroup(ch.id, ch.items.map((it) => ({ src: it.img, title: it.title })));
      return `
      <div class="rail"><div class="rail__sticky"><div class="rail__track">
        ${ch.items.map((it, i) => `
          <button class="mark-card" ${itemAttrs(it, ch.id, i)} data-cursor="View" type="button">
            <span class="mark-card__idx">${pad(i + 1)}/${pad(ch.items.length)}</span>
            ${badge(it)}${frame(thumb(it.img), it.title, `style="--d:${(i % 4) * 0.08}s"`)}
            <span class="mark-card__info"><strong>${esc(it.title)}</strong><span class="tag">${esc(it.tag)}</span></span>
            <span class="mark-card__text">${esc(it.text)}</span>
          </button>`).join("")}
        <p class="rail__end">Eleven symbols. <em>Eleven stories</em> waiting to be told ↓</p>
      </div><div class="rail__progress"><i></i></div></div></div>`;
    },

    feature(ch) {
      return `<div class="features">${ch.items.map((it, i) => {
        const key = `${ch.id}-${i}`;
        addGroup(key, it.gallery.map((src, n) => ({ src, title: `${it.title} — ${n + 1}` })));
        return `
        <article class="feature" data-item ${it.thread ? 'class-thread="1"' : ""}>
          <div class="feature__visual" data-reveal>
            <button class="feature__tilt" type="button" data-lb="${key}" data-lb-index="0" data-cursor="Open">
              <span class="feature__glare"></span>${frame(it.img, it.title)}
            </button>
          </div>
          <div class="feature__copy">
            <span class="feature__no" data-reveal>0${i + 1}</span>
            <h3 class="feature__title split">${esc(it.title)}</h3>
            <span class="tag" data-reveal>${esc(it.tag)}</span>
            <p class="feature__text" data-reveal style="--d:.1s">${esc(it.text)}</p>
            <div class="thumbs" data-reveal style="--d:.2s">
              ${it.gallery.map((src, n) => `<button type="button" data-lb="${key}" data-lb-index="${n}" data-cursor="View" aria-label="${esc(it.title)} image ${n + 1}"><img src="${esc(thumb(src))}" alt="" loading="lazy" /></button>`).join("")}
            </div>
          </div>
        </article>`;
      }).join("")}</div>`;
    },

    stack(ch) {
      return `<div class="stack">${ch.items.map((it, i) => {
        const key = `${ch.id}-${i}`;
        addGroup(key, it.gallery.map((src, n) => ({ src, title: `${it.title} — ${n + 1}` })));
        return `
        <article class="stack-card" style="--i:${i}" data-item ${it.thread ? 'class-thread="1"' : ""}>
          <button type="button" data-lb="${key}" data-lb-index="0" data-cursor="Open" style="position:relative">${badge(it)}${frame(it.img, it.title)}</button>
          <div class="stack-card__body">
            <div><span class="tag">${pad(i + 1)} — ${esc(it.tag)}</span><h3>${esc(it.title)}</h3></div>
            <p>${esc(it.text)}</p>
            <div>
              <div class="thumbs">${it.gallery.slice(0, 6).map((src, n) => `<button type="button" data-lb="${key}" data-lb-index="${n}" data-cursor="View" aria-label="${esc(it.title)} image ${n + 1}"><img src="${esc(thumb(src))}" alt="" loading="lazy" /></button>`).join("")}</div>
              <button type="button" class="btn-line" data-lb="${key}" data-lb-index="0">See all ${it.gallery.length} touchpoints →</button>
            </div>
          </div>
        </article>`;
      }).join("")}</div>`;
    },

    index(ch) {
      addGroup(ch.id, ch.items.map((it) => ({ src: it.img, title: it.title })));
      return `<ol class="index">${ch.items.map((it, i) => `
        <li data-item ${it.thread ? 'class-thread="1"' : ""}>
          <button type="button" data-lb="${ch.id}" data-lb-index="${i}" data-peek="${esc(thumb(it.img))}" data-cursor="View">
            <span class="index__no">${pad(i + 1)}</span>
            <span class="index__title">${esc(it.title)}${it.thread ? ` <em style="color:var(--accent);font-size:.5em">✦</em>` : ""}</span>
            <span class="tag">${esc(it.tag)}</span>
            <span class="index__thumb"><img src="${esc(thumb(it.img))}" alt="" loading="lazy" /></span>
          </button>
        </li>`).join("")}</ol>`;
    },

    browser(ch) {
      addGroup(ch.id, ch.items.map((it) => ({ src: it.img, title: it.title })));
      return `<div class="browsers">${ch.items.map((it, i) => `
        <article class="browser" data-item ${it.thread ? 'class-thread="1"' : ""} data-reveal>
          <div class="browser__bar"><i></i><i></i><i></i><span>${esc(it.title.toLowerCase().replace(/[^a-z0-9]+/g, ""))}.co.za</span></div>
          <button type="button" class="browser__view" data-lb="${ch.id}" data-lb-index="${i}" data-cursor="View">${badge(it)}<img src="${esc(it.img)}" alt="${esc(it.title)}" loading="lazy" /></button>
          <div class="browser__cap"><h3>${esc(it.title)}</h3><span class="tag">${esc(it.tag)}</span></div>
        </article>`).join("")}</div>`;
    },

    masonry(ch) {
      addGroup(ch.id, ch.items.map((it) => ({ src: it.img, title: `${it.title} — ${it.tag}` })));
      const words = `<span>Seen on</span><span><em>the street</em></span><span>Seen on</span><span><em>the street</em></span>`;
      return `
      <div class="shout" aria-hidden="true"><div class="shout__track">${words}${words}</div></div>
      <div class="masonry">${ch.items.map((it, i) => `
        <button type="button" class="ad ${it.wide ? "ad--wide" : ""}" data-item ${it.thread ? 'class-thread="1"' : ""} data-lb="${ch.id}" data-lb-index="${i}" data-cursor="View">
          ${badge(it)}${frame(it.img, it.title, `style="--d:${(i % 3) * 0.1}s"`)}
          <span class="ad__cap"><strong>${esc(it.title)}</strong><span class="tag">${esc(it.tag)}</span></span>
        </button>`).join("")}</div>`;
    },

    reel(ch) {
      addGroup(ch.id, ch.items.map((it) => ({ src: it.img, title: it.title, video: it.video })));
      const clip = (it, i) => `
        <button type="button" class="clip" data-lb="${ch.id}" data-lb-index="${i}" data-cursor="Play">
          <div class="frame in" data-title="${esc(it.title)}"><img src="${esc(thumb(it.img))}" alt="${esc(it.title)}" loading="lazy" /><span class="clip__play"></span></div>
          <span class="clip__cap"><span>${esc(it.title)}</span><span class="tag">${esc(it.tag)}</span></span>
        </button>`;
      const half = Math.ceil(ch.items.length / 2);
      const rowA = ch.items.slice(0, half).map((it, i) => clip(it, i)).join("");
      const rowB = ch.items.slice(half).map((it, i) => clip(it, i + half)).join("");
      return `<div class="reel">
        <div class="film-holes"></div>
        <div class="reel__row"><div class="reel__track">${rowA}${rowA}${rowA}</div></div>
        <div class="reel__row reel__row--b"><div class="reel__track">${rowB}${rowB}${rowB}</div></div>
        <div class="film-holes"></div>
      </div>`;
    },

    drag(ch) {
      addGroup(ch.id, ch.items.map((it) => ({ src: it.img, title: it.title })));
      return `
      <div class="drag" data-cursor="Drag"><div class="drag__track">${ch.items.map((it, i) => `
        <button type="button" class="photo" data-lb="${ch.id}" data-lb-index="${i}">
          ${frame(it.img, it.title, `style="--d:${(i % 4) * 0.08}s"`)}
          <span class="photo__cap"><span class="mono">${pad(i + 1)}</span>${esc(it.title)}</span>
        </button>`).join("")}</div></div>
      <p class="drag-hint mono">← Drag / swipe through the light →</p>`;
    },

    cases(ch) {
      return `<div class="cases">${ch.items.map((it, i) => {
        const key = `${ch.id}-${i}`;
        processes[key] = it;
        const cover = Math.max(0, it.gallery.findIndex((g) => g.src === it.img));
        const facts = it.facts?.length
          ? `<details class="case__brief"><summary>Read the brief <span class="mono">${it.facts.length} notes</span></summary>
              <dl>${it.facts.map((f) => `<div><dt class="mono">${esc(f.label)}</dt><dd>${esc(f.text)}</dd></div>`).join("")}</dl></details>`
          : "";
        return `
        <article class="case" data-item ${it.thread ? 'class-thread="1"' : ""}>
          <button type="button" class="case__cover" data-process="${key}" data-step="${cover}" data-cursor="Open">${badge(it)}${frame(it.img, it.title)}</button>
          <div class="case__copy">
            <span class="case__no" data-reveal>${pad(i + 1)}</span>
            <h3 class="case__title split">${esc(it.title)}</h3>
            <span class="tag" data-reveal>${esc(it.tag)} · ${it.gallery.length} images</span>
            <p class="case__text" data-reveal style="--d:.1s">${esc(it.text)}</p>
            ${facts}
            <button type="button" class="btn-line" data-process="${key}" data-step="0">Walk through the process ↓</button>
          </div>
          <div class="case__strip drag" data-cursor="Drag"><div class="drag__track">${it.gallery.map((g, n) => `
            <button type="button" class="case__shot" data-process="${key}" data-step="${n}">
              <span class="case__img"><img src="${esc(thumb(g.src))}" alt="${esc(g.title)}" loading="lazy" decoding="async" /></span>
              <span class="case__cap"><span class="mono">${pad(n + 1)}</span>${esc(g.title)}${g.note ? " ✦" : ""}</span>
            </button>`).join("")}</div></div>
        </article>`;
      }).join("")}</div>`;
    },
  };

  /* ---------------------------------------------------------------------
     Render
     --------------------------------------------------------------------- */
  function render() {
    const story = $("#story");
    story.innerHTML = D.chapters.map((ch, idx) => {
      const head = `
        <header class="ch-head">
          <span class="ch-num" data-reveal>${ch.num}</span>
          <p class="ch-kicker mono" data-reveal><span>Chapter ${ch.num}</span><span>${esc(ch.kicker)}</span><span>${ch.items.length} works</span></p>
          <h2 class="ch-title split">${esc(ch.title)}</h2>
          <p class="ch-line split">${esc(ch.line)}</p>
        </header>`;
      const bridge = BRIDGES[ch.id] && idx < D.chapters.length - 1
        ? `<div class="interlude" data-tone='${JSON.stringify(ch.tone)}'><span class="mono">${ch.num} → ${D.chapters[idx + 1].num}</span><p class="split">${BRIDGES[ch.id]}</p></div>`
        : "";
      return `<section class="chapter" id="chapter-${ch.id}" data-layout="${ch.layout}" data-tone='${JSON.stringify(ch.tone)}' data-chapter="${idx}">
        ${head}${layouts[ch.layout](ch)}</section>${bridge}`;
    }).join("");

    // mark thread items with a real class (kept attribute-free above for readability)
    $$("[class-thread]").forEach((n) => { n.classList.add("is-thread"); n.removeAttribute("class-thread"); });

    // hero
    const P = D.person;
    const chars = (word) => [...word].map((c, i) => `<span class="ch-mask"><span class="ch" style="--i:${i}">${esc(c)}</span></span>`).join("");
    $('[data-word="first"]').innerHTML = chars(P.first);
    $('[data-word="last"]').innerHTML = chars(P.last);
    $$(".hero__row .ch").forEach((c, i) => c.style.setProperty("--i", i));
    $(".hero__intro").textContent = P.intro;

    // toc marquee
    const toc = D.chapters.map((c) => `<span><b>${c.num}</b>${esc(c.title)}</span>`).join("");
    $(".toc__track").innerHTML = toc + toc;

    // menu
    $(".menu__list").innerHTML = D.chapters.map((c) =>
      `<li><a href="#chapter-${c.id}"><span>${c.num}</span>${esc(c.title)}<small>${esc(c.kicker)}</small></a></li>`).join("");
    $$(".menu__list a").forEach((a, i) => (a.style.transitionDelay = `${0.15 + i * 0.05}s`));

    // epilogue + footer
    $(".epilogue__mail-txt").textContent = P.email;
    Object.assign($(".email-link"), { href: `mailto:${P.email}`, textContent: P.email });
    Object.assign($(".phone-link"), { href: `tel:${P.tel}`, textContent: P.phone });
    $(".socials").innerHTML = P.socials.map((s) => `<li><a class="link" href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)} ↗</a></li>`).join("");
    const foot = `<span>Gift Thabanyane</span><span>designs at dawn</span>`;
    $(".foot__track").innerHTML = foot + foot + foot + foot;
    $(".year").textContent = new Date().getFullYear();

    // missing-image fallback (e.g. assets not copied yet)
    $$("img").forEach((img) => img.addEventListener("error", () => img.closest(".frame")?.classList.add("is-missing"), { once: true }));
  }

  /* ---------------------------------------------------------------------
     Split text into masked words
     --------------------------------------------------------------------- */
  function splitText() {
    let n = 0;
    $$(".split").forEach((el) => {
      n = 0;
      const out = [];
      el.childNodes.forEach((node) => {
        const isEm = node.nodeType === 1;
        const words = node.textContent.split(/(\s+)/);
        words.forEach((w) => {
          if (!w) return;
          if (/^\s+$/.test(w)) return out.push(" ");
          const inner = isEm ? `<em>${esc(w)}</em>` : esc(w);
          out.push(`<span class="w"><span style="--i:${n++}">${inner}</span></span>`);
        });
      });
      el.innerHTML = out.join("");
    });
  }

  /* ---------------------------------------------------------------------
     Reveal on scroll
     --------------------------------------------------------------------- */
  function reveals() {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    $$(".split, [data-reveal], .frame").forEach((el) => io.observe(el));
  }

  /* ---------------------------------------------------------------------
     Day cycle: tone changes per chapter + HUD
     --------------------------------------------------------------------- */
  function tones() {
    const root = document.documentElement;
    const meta = $('meta[name="theme-color"]');
    const hud = $(".hud");
    const set = (t) => {
      root.style.setProperty("--bg", t.bg);
      root.style.setProperty("--fg", t.fg);
      root.style.setProperty("--accent", t.accent);
      meta.setAttribute("content", t.bg);
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        set(JSON.parse(e.target.dataset.tone));
        const idx = e.target.dataset.chapter;
        if (idx !== undefined) {
          const ch = D.chapters[idx];
          $(".hud__num").textContent = `Ch. ${ch.num}`;
          $(".hud__title").textContent = ch.title;
          hud.classList.add("is-on");
        } else if (!e.target.classList.contains("interlude")) {
          hud.classList.remove("is-on");
        }
      });
    }, { rootMargin: "-48% 0px -48% 0px" });
    $$("[data-tone]").forEach((s) => io.observe(s));
  }

  /* ---------------------------------------------------------------------
     Scroll-linked effects (one rAF loop)
     --------------------------------------------------------------------- */
  const rails = [];
  function setupRails() {
    $$(".rail").forEach((rail) => {
      const track = $(".rail__track", rail);
      const o = { rail, track, bar: $(".rail__progress", rail), dist: 0, top: 0 };
      const measure = () => {
        if (!desktop.matches) { rail.style.height = ""; o.dist = 0; return; }
        o.dist = Math.max(0, track.scrollWidth - innerWidth);
        rail.style.height = `${o.dist + innerHeight}px`;
        o.top = rail.getBoundingClientRect().top + scrollY;
      };
      o.measure = measure;
      rails.push(o);
      $$("img", track).forEach((img) => img.addEventListener("load", measure, { once: true }));
      measure();
    });
  }

  function setupBrowsers() {
    $$(".browser").forEach((b) => {
      const view = $(".browser__view", b), img = $("img", view);
      const measure = () => b.style.setProperty("--travel", `${Math.min(0, view.clientHeight - img.clientHeight)}px`);
      img.complete ? measure() : img.addEventListener("load", measure, { once: true });
      addEventListener("resize", measure);
    });
    if (!fine) {
      const io = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle("autoscroll", e.isIntersecting)), { threshold: 0.6 });
      $$(".browser").forEach((b) => io.observe(b));
    }
  }

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const y = scrollY, vh = innerHeight;

      // sunrise in the hero
      $(".hero").style.setProperty("--rise", vh * 0.38 + y * 0.55);

      // horizontal rail
      rails.forEach((o) => {
        if (!o.dist) return;
        const p = clamp((y - o.top) / o.dist);
        o.track.style.transform = `translate3d(${-p * o.dist}px,0,0)`;
        o.bar.style.setProperty("--p", p);
      });

      // stacking cards
      $$(".stack").forEach((stack) => {
        const cards = $$(".stack-card", stack);
        cards.forEach((card, i) => {
          const next = cards[i + 1];
          if (!next) return;
          const p = clamp((vh - next.getBoundingClientRect().top) / (vh * 0.85));
          card.style.setProperty("--s", 1 - p * 0.06);
          card.style.setProperty("--b", 1 - p * 0.4);
        });
      });

      // shouting marquee follows scroll
      $$(".shout__track").forEach((t) => {
        const r = t.parentElement.getBoundingClientRect();
        const p = clamp((vh - r.top) / (vh + r.height));
        t.style.transform = `translate3d(${-p * 40}%,0,0)`;
      });

      // HUD progress within current chapter
      const cur = $$(".chapter").find((c) => { const r = c.getBoundingClientRect(); return r.top <= vh / 2 && r.bottom >= vh / 2; });
      if (cur) {
        const r = cur.getBoundingClientRect();
        $(".hud__bar").style.setProperty("--p", clamp((vh / 2 - r.top) / r.height));
      }
    });
  }

  /* ---------------------------------------------------------------------
     Hero: letters breathe toward the cursor (or a slow wave on touch)
     --------------------------------------------------------------------- */
  function heroType() {
    const chars = $$(".hero__row .ch");
    const hero = $(".hero");
    let mx = -9999, my = -9999, visible = true;
    new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(hero);
    addEventListener("pointermove", (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });

    const loop = (t) => {
      if (visible && !reduced) {
        chars.forEach((c, i) => {
          let w;
          if (fine) {
            const r = c.getBoundingClientRect();
            const d = Math.hypot(mx - (r.left + r.width / 2), my - (r.top + r.height / 2));
            w = 400 + 400 * clamp(1 - d / 380);
          } else {
            w = 600 + 200 * Math.sin(t / 700 + i * 0.6);
          }
          const prev = parseFloat(c.dataset.w || 420);
          const nw = lerp(prev, w, 0.12);
          c.dataset.w = nw;
          c.style.setProperty("--w", nw.toFixed(0));
        });
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);

    // role swap
    const roles = D.person.role, el = $(".role-swap");
    let r = 0;
    el.textContent = roles[0];
    if (!reduced) setInterval(() => {
      el.classList.add("is-out");
      setTimeout(() => { r = (r + 1) % roles.length; el.textContent = roles[r]; el.classList.remove("is-out"); }, 350);
    }, 2400);

    // local clock
    const clock = $(".hero__clock");
    const tick = () => {
      const t = new Intl.DateTimeFormat("en-ZA", { hour: "2-digit", minute: "2-digit", timeZone: D.person.timezone || "Africa/Johannesburg" }).format(new Date());
      clock.textContent = `${D.person.city || "South Africa"} · ${t}`;
    };
    tick(); setInterval(tick, 30000);
  }

  /* ---------------------------------------------------------------------
     Cursor, magnetic buttons, hover peek, 3D tilt
     --------------------------------------------------------------------- */
  function pointerFx() {
    if (!fine) return;
    const cur = $(".cursor"), dot = $(".cursor__dot"), ring = $(".cursor__ring"), label = $(".cursor__label");
    const peek = $(".peek"), peekImg = $("img", peek);
    let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y, px = x, py = y;

    addEventListener("pointermove", (e) => {
      x = e.clientX; y = e.clientY;
      const t = e.target.closest?.("[data-cursor]");
      cur.classList.toggle("has-label", !!t);
      if (t) label.textContent = t.dataset.cursor;
      const pk = e.target.closest?.("[data-peek]");
      if (pk) { if (peekImg.getAttribute("src") !== pk.dataset.peek) peekImg.src = pk.dataset.peek; peek.classList.add("is-on"); }
      else peek.classList.remove("is-on");
    }, { passive: true });
    addEventListener("pointerdown", () => cur.classList.add("is-down"));
    addEventListener("pointerup", () => cur.classList.remove("is-down"));
    document.addEventListener("mouseleave", () => (cur.style.opacity = 0));
    document.addEventListener("mouseenter", () => (cur.style.opacity = 1));

    const loop = () => {
      rx = lerp(rx, x, 0.18); ry = lerp(ry, y, 0.18);
      px = lerp(px, x, 0.1); py = lerp(py, y, 0.1);
      dot.style.transform = `translate3d(${x}px,${y}px,0)`;
      ring.style.transform = `translate3d(${rx}px,${ry}px,0)`;
      peek.style.transform = `translate3d(${px + 30}px,${py - 160}px,0) ${peek.classList.contains("is-on") ? "scale(1)" : "scale(.85)"}`;
      requestAnimationFrame(loop);
    };
    loop();

    // magnetic
    $$("[data-magnetic]").forEach((m) => {
      m.addEventListener("pointermove", (e) => {
        const r = m.getBoundingClientRect();
        m.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.3}px,${(e.clientY - r.top - r.height / 2) * 0.4}px)`;
      });
      m.addEventListener("pointerleave", () => (m.style.transform = ""));
    });

    // tilt + glare on packaging
    $$(".feature__visual").forEach((v) => {
      const tilt = $(".feature__tilt", v), glare = $(".feature__glare", v);
      v.addEventListener("pointermove", (e) => {
        const r = v.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width, ny = (e.clientY - r.top) / r.height;
        tilt.style.transform = `rotateY(${(nx - 0.5) * 14}deg) rotateX(${(0.5 - ny) * 12}deg)`;
        glare.style.setProperty("--gx", `${nx * 100}%`);
        glare.style.setProperty("--gy", `${ny * 100}%`);
      });
      v.addEventListener("pointerleave", () => (tilt.style.transform = ""));
    });
  }

  /* ---------------------------------------------------------------------
     Drag gallery with momentum
     --------------------------------------------------------------------- */
  function dragGallery() {
    $$(".drag").forEach((el) => {
      let down = false, startX = 0, startScroll = 0, v = 0, last = 0, moved = 0;
      el.addEventListener("pointerdown", (e) => {
        if (e.pointerType !== "mouse") return; // touch scrolls natively
        down = true; moved = 0; startX = last = e.clientX; startScroll = el.scrollLeft; v = 0;
      });
      addEventListener("pointermove", (e) => {
        if (!down) return;
        const dx = e.clientX - startX;
        moved = Math.max(moved, Math.abs(dx));
        if (moved > 6) el.classList.add("is-dragging");
        el.scrollLeft = startScroll - dx;
        v = e.clientX - last; last = e.clientX;
      });
      addEventListener("pointerup", () => {
        if (!down) return;
        down = false;
        setTimeout(() => el.classList.remove("is-dragging"), 0);
        const glide = () => { if (Math.abs(v) < 0.4) return; el.scrollLeft -= v; v *= 0.94; requestAnimationFrame(glide); };
        if (!reduced) glide();
      });
      // block the click that ends a drag
      el.addEventListener("click", (e) => { if (moved > 6) { e.stopPropagation(); e.preventDefault(); } }, true);
    });
  }

  /* ---------------------------------------------------------------------
     Lightbox (images + optional video, keyboard + swipe)
     --------------------------------------------------------------------- */
  function lightbox() {
    const lb = $(".lightbox"), media = $(".lightbox__media"), title = $(".lightbox__title"), count = $(".lightbox__count");
    let list = [], i = 0, lastFocus = null;

    const show = () => {
      const it = list[i];
      media.innerHTML = it.video
        ? `<video src="${esc(it.video)}" poster="${esc(it.src)}" controls autoplay playsinline></video>`
        : `<img src="${esc(it.src)}" alt="${esc(it.title)}" />`;
      title.textContent = it.title;
      count.textContent = `${pad(i + 1)} / ${pad(list.length)}`;
      $$(".lightbox__nav", lb).forEach((b) => (b.hidden = list.length < 2));
    };
    const open = (key, idx) => {
      list = groups[key] || []; i = idx; if (!list.length) return;
      lastFocus = document.activeElement;
      lb.hidden = false; requestAnimationFrame(() => lb.classList.add("is-open"));
      document.body.style.overflow = "hidden";
      show(); $(".lightbox__close").focus();
    };
    const close = () => {
      lb.classList.remove("is-open");
      setTimeout(() => { lb.hidden = true; media.innerHTML = ""; }, 400);
      document.body.style.overflow = "";
      lastFocus?.focus?.();
    };
    const go = (d) => { i = (i + d + list.length) % list.length; show(); };

    document.addEventListener("click", (e) => {
      const t = e.target.closest("[data-lb]");
      if (t) { e.preventDefault(); open(t.dataset.lb, +t.dataset.lbIndex); }
    });
    $(".lightbox__close").addEventListener("click", close);
    $(".lightbox__prev").addEventListener("click", () => go(-1));
    $(".lightbox__next").addEventListener("click", () => go(1));
    lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
    addEventListener("keydown", (e) => {
      if (lb.hidden) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    });
    let sx = 0;
    lb.addEventListener("touchstart", (e) => (sx = e.touches[0].clientX), { passive: true });
    lb.addEventListener("touchend", (e) => { const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1); });
  }

  /* ---------------------------------------------------------------------
     Process view: a case study read top to bottom — the step's text stays
     pinned on the left while its images scroll past on the right
     --------------------------------------------------------------------- */
  function processView() {
    const pv = $(".process"), scroller = $(".process__scroll"), body = $(".process__body");
    const bar = $(".process__bar"), count = $(".process__count");
    let io = null, fio = null, lastFocus = null, total = 0;

    // consecutive images with the same heading and no notes read as one step
    const toSteps = (gallery) => gallery.reduce((steps, g, n) => {
      const prev = steps[steps.length - 1];
      if (prev && !g.note && !prev.note && prev.title === g.title) prev.shots.push({ ...g, n });
      else steps.push({ title: g.title, note: g.note, shots: [{ ...g, n }] });
      return steps;
    }, []);

    const open = (key, step) => {
      const it = processes[key];
      if (!it) return;
      const steps = toSteps(it.gallery);
      total = steps.length;
      $(".process__kicker").textContent = `${it.tag} · ${it.gallery.length} images`;
      $(".process__title").textContent = it.title;
      body.innerHTML = `
        <section class="pstep pstep--intro">
          <div class="pstep__text"><span class="mono">The brief</span><p class="pstep__lead">${esc(it.text)}</p></div>
          <div class="pstep__facts">${(it.facts || []).map((f) => `<div><h4 class="mono">${esc(f.label)}</h4><p>${esc(f.text)}</p></div>`).join("")}</div>
        </section>
        ${steps.map((s, k) => `
        <section class="pstep" data-k="${k}">
          <div class="pstep__text">
            <span class="pstep__no mono">Step ${pad(k + 1)} / ${pad(steps.length)}</span>
            <h3>${esc(s.title)}</h3>
            ${s.note ? `<p>${esc(s.note)}</p>` : ""}
          </div>
          <div class="pstep__media">${s.shots.map((g) => `
            <figure data-n="${g.n}"><img src="${esc(g.src)}" alt="${esc(g.title)}" loading="lazy" decoding="async" /></figure>`).join("")}
          </div>
        </section>`).join("")}
        <p class="pstep__end mono">End of ${esc(it.title)} — <button type="button" class="link process__done">back to the portfolio</button></p>`;

      lastFocus = document.activeElement;
      pv.hidden = false;
      document.body.style.overflow = "hidden";
      count.textContent = `01 / ${pad(total)}`;
      const target = step > 0 && $(`figure[data-n="${step}"]`, body);
      scroller.scrollTop = 0;
      if (target) target.closest(".pstep").scrollIntoView({ block: "start" });

      // step counter in the header, and images rising in as they scroll into view
      io?.disconnect(); fio?.disconnect();
      io = new IntersectionObserver((es) => es.forEach((e) => {
        if (e.isIntersecting) count.textContent = `${pad(+e.target.dataset.k + 1)} / ${pad(total)}`;
      }), { rootMargin: "-35% 0px -45% 0px" });
      $$(".pstep[data-k]", body).forEach((s) => io.observe(s));
      fio = new IntersectionObserver((es) => es.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("in"); fio.unobserve(e.target); }
      }), { threshold: 0.12 });
      $$("figure", body).forEach((f) => fio.observe(f));
      pv.classList.add("fx");
      requestAnimationFrame(() => pv.classList.add("is-open"));
      $(".process__close").focus({ preventScroll: true });
    };
    const close = () => {
      pv.classList.remove("is-open");
      document.body.style.overflow = "";
      setTimeout(() => { pv.hidden = true; body.innerHTML = ""; io?.disconnect(); fio?.disconnect(); }, 500);
      lastFocus?.focus?.({ preventScroll: true });
    };

    document.addEventListener("click", (e) => {
      const t = e.target.closest("[data-process]");
      if (t) { e.preventDefault(); open(t.dataset.process, +t.dataset.step); }
      if (e.target.closest(".process__done")) close();
    });
    $(".process__close").addEventListener("click", close);
    addEventListener("keydown", (e) => { if (e.key === "Escape" && !pv.hidden) close(); });
    scroller.addEventListener("scroll", () => {
      const max = scroller.scrollHeight - scroller.clientHeight;
      bar.style.setProperty("--p", max > 0 ? scroller.scrollTop / max : 0);
    }, { passive: true });
  }

  /* ---------------------------------------------------------------------
     Menu
     --------------------------------------------------------------------- */
  function menu() {
    const btn = $(".menu-toggle"), nav = $(".menu");
    const set = (open) => {
      btn.setAttribute("aria-expanded", open);
      btn.textContent = open ? "Close" : "Chapters";
      if (open) { nav.hidden = false; requestAnimationFrame(() => nav.classList.add("is-open")); document.body.style.overflow = "hidden"; }
      else { nav.classList.remove("is-open"); document.body.style.overflow = ""; setTimeout(() => (nav.hidden = !nav.classList.contains("is-open")), 900); }
    };
    btn.addEventListener("click", () => set(btn.getAttribute("aria-expanded") !== "true"));
    nav.addEventListener("click", (e) => { if (e.target.closest("a")) set(false); });
    addEventListener("keydown", (e) => { if (e.key === "Escape" && !nav.hidden) set(false); });
  }

  /* ---------------------------------------------------------------------
     "Follow one idea" — trace the Youth Day Art Festival across chapters
     --------------------------------------------------------------------- */
  function thread() {
    const btn = $(".thread-toggle"), nav = $(".threadnav"), cnt = $(".threadnav__count");
    const items = $$(".is-thread");
    let k = -1;

    const scrollToItem = (el) => {
      const rail = el.closest(".rail");
      const o = rails.find((r) => r.rail === rail);
      if (o && o.dist) {
        o.measure();
        const x = el.offsetLeft + el.offsetWidth / 2 - innerWidth / 2;
        scrollTo({ top: o.top + clamp(x / o.dist) * o.dist, behavior: "smooth" });
      } else {
        el.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
      }
    };
    const go = (d) => {
      k = (k + d + items.length) % items.length;
      cnt.textContent = `${k + 1} / ${items.length}`;
      scrollToItem(items[k]);
    };

    btn.addEventListener("click", () => {
      const on = document.body.classList.toggle("thread-on");
      btn.setAttribute("aria-pressed", on);
      $(".thread-toggle__txt").textContent = on ? "Show everything" : "Follow one idea";
      nav.hidden = !on;
      if (on) { k = -1; go(1); }
    });
    $(".threadnav__next").addEventListener("click", () => go(1));
    $(".threadnav__prev").addEventListener("click", () => go(-1));
  }

  /* ---------------------------------------------------------------------
     Epilogue: copy email
     --------------------------------------------------------------------- */
  function contact() {
    const btn = $(".epilogue__mail"), note = $(".epilogue__mail-note");
    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(D.person.email);
        note.textContent = "Copied — talk soon ✦";
      } catch {
        location.href = `mailto:${D.person.email}`;
      }
      setTimeout(() => (note.textContent = "Click to copy"), 2200);
    });
  }

  /* ---------------------------------------------------------------------
     Preloader → dawn
     --------------------------------------------------------------------- */
  function preload() {
    const loader = $(".loader"), count = $(".loader__count");
    const dur = reduced ? 200 : 1600;
    const t0 = performance.now();
    requestAnimationFrame(() => loader.classList.add("is-rising"));
    const step = (t) => {
      const p = clamp((t - t0) / dur);
      count.textContent = String(Math.round(p * 100)).padStart(3, "0");
      if (p < 1) return requestAnimationFrame(step);
      (document.fonts?.ready || Promise.resolve()).then(() => {
        loader.classList.add("is-done");
        document.body.classList.remove("is-loading");
        document.body.classList.add("is-ready");
        rails.forEach((o) => o.measure());
        setTimeout(() => loader.remove(), 1300);
      });
    };
    requestAnimationFrame(step);
  }

  /* ---------------------------------------------------------------------
     Boot
     --------------------------------------------------------------------- */
  render();
  splitText();
  reveals();
  tones();
  setupRails();
  setupBrowsers();
  heroType();
  pointerFx();
  dragGallery();
  lightbox();
  processView();
  menu();
  thread();
  contact();
  preload();

  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", () => { rails.forEach((o) => o.measure()); onScroll(); });
  desktop.addEventListener?.("change", () => { rails.forEach((o) => o.measure()); onScroll(); });
  addEventListener("load", () => { rails.forEach((o) => o.measure()); onScroll(); });
  onScroll();
})();
