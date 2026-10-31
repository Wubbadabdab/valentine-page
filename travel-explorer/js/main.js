/* ==========================================================================
   TRAVEL EXPLORER — MAIN SCRIPT
   ========================================================================== */

/* --------------------------------------------------------------------------
   SUPABASE SETUP (contact form)
   1. Create a project at https://supabase.com
   2. Run supabase/messages.sql in the SQL editor
   3. Paste your Project URL and anon public key below
      (Project Settings → API). The anon key is safe to use in the browser
      because the table only allows inserts.
   Until these are filled in, the form falls back to opening the visitor's
   email app with the message ready to send.
   -------------------------------------------------------------------------- */
const SUPABASE_URL = 'YOUR_SUPABASE_URL';        // e.g. 'https://abcdefgh.supabase.co'
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

const CONTACT_EMAIL = 'travelexplorer@gmail.com';

/* --------------------------------------------------------------------------
   RESPONSIVE IMAGES (optional)
   If you export resized copies such as kyoto-hero-800.jpg and
   kyoto-hero-1600.jpg, list the widths here and every image will get a
   srcset automatically, e.g. [800, 1600].
   -------------------------------------------------------------------------- */
const RESPONSIVE_WIDTHS = [];

(() => {
  'use strict';

  const D = window.TE_DATA;
  const PAGE = document.body.dataset.page;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = Boolean(navigator.connection && navigator.connection.saveData);
  const canAutoplay = !reduceMotion && !saveData;

  /* ======================================================================
     HELPERS
     ====================================================================== */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const params = new URLSearchParams(location.search);
  const destById = (id) => D.destinations.find((d) => d.id === id);
  const resortById = (id) => D.resorts.find((r) => r.id === id);
  const store = {
    get(key, fallback) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } },
    set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* private mode: ignore */ } }
  };
  const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

  const svg = (body, extra = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"${extra}>${body}</svg>`;
  const ICON = {
    arrow: svg('<path d="M5 12h14M13 6l6 6-6 6"/>', ' class="arrow"'),
    heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-9.3-9.4C1.6 8 3.4 4.5 7 4.5c2 0 3.6 1.1 5 3 1.4-1.9 3-3 5-3 3.6 0 5.4 3.5 4.3 6.6-1.8 4.8-9.3 9.4-9.3 9.4z" stroke-linejoin="round"/></svg>',
    heartLine: svg('<path d="M12 20.5s-7.5-4.6-9.3-9.4C1.6 8 3.4 4.5 7 4.5c2 0 3.6 1.1 5 3 1.4-1.9 3-3 5-3 3.6 0 5.4 3.5 4.3 6.6-1.8 4.8-9.3 9.4-9.3 9.4z"/>'),
    search: svg('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'),
    close: svg('<path d="M18 6 6 18M6 6l12 12"/>'),
    left: svg('<path d="m15 18-6-6 6-6"/>'),
    right: svg('<path d="m9 18 6-6-6-6"/>'),
    play: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.8v14.4a1 1 0 0 0 1.5.86l12-7.2a1 1 0 0 0 0-1.72l-12-7.2A1 1 0 0 0 7 4.8z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>',
    sound: svg('<path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/>'),
    muted: svg('<path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="m22 9-6 6M16 9l6 6"/>'),
    expand: svg('<path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>'),
    pin: svg('<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>'),
    calendar: svg('<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>'),
    wallet: svg('<path d="M20 12V8H6a2 2 0 0 1 0-4h12v4"/><path d="M4 6v12a2 2 0 0 0 2 2h14v-4"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/>'),
    compass: svg('<circle cx="12" cy="12" r="10"/><path d="m16.2 7.8-2.1 6.3-6.3 2.1 2.1-6.3z"/>'),
    tag: svg('<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.5"/>'),
    check: svg('<path d="M20 6 9 17l-5-5"/>'),
    sparkle: svg('<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>'),
    info: svg('<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>'),
    mail: svg('<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>'),
    mapEmpty: svg('<path d="M9 18 3 21V6l6-3 6 3 6-3v15l-6 3-6-3z"/><path d="M9 3v15M15 6v15"/>')
  };

  /* ======================================================================
     MEDIA: images with skeleton → photo, or an elegant placeholder
     ====================================================================== */
  const imgPath = {
    dest: (d, i = 0) => `images/destinations/${d.id}-${i === 0 ? 'hero' : i}.jpg`,
    resort: (r, i = 0) => `images/resorts/${r.id}-${i === 0 ? 'hero' : i}.jpg`
  };

  function phStyle(name) {
    let h = 7;
    for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    return `--ph-angle:${130 + (h % 70)}deg;--ph-x:${15 + (h >>> 3) % 75}%;--ph-y:${85 + (h >>> 7) % 30}%`;
  }

  function srcsetFor(src) {
    if (!RESPONSIVE_WIDTHS.length) return '';
    const base = src.replace(/\.(jpe?g|png|webp)$/i, '');
    const ext = (src.match(/\.(jpe?g|png|webp)$/i) || ['.jpg'])[0];
    return RESPONSIVE_WIDTHS.map((w) => `${base}-${w}${ext} ${w}w`).join(', ');
  }

  /** Markup for one image slot (skeleton → photo, or placeholder if missing). */
  function mediaHTML({ src, alt, name, sub = '', cls = '', eager = false, sizes = '(min-width: 1024px) 33vw, 100vw', w = 1200, h = 900 }) {
    const srcset = srcsetFor(src);
    return `
      <div class="media ${cls}" style="${phStyle(name)}">
        <img src="${src}"${srcset ? ` srcset="${srcset}"` : ''} sizes="${sizes}" alt="${esc(alt)}" width="${w}" height="${h}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">
        <span class="ph" aria-hidden="true"><span class="ph-name">${esc(name)}</span><span class="ph-sub">${esc(sub)}</span></span>
      </div>`;
  }

  function watchMedia(ctx = document) {
    $$('.media > img', ctx).forEach((img) => {
      if (img.dataset.watched) return;
      img.dataset.watched = '1';
      const box = img.parentElement;
      const ok = () => box.classList.add('is-loaded');
      const fail = () => { box.classList.add('is-missing'); img.removeAttribute('srcset'); };
      img.addEventListener('load', ok, { once: true });
      img.addEventListener('error', fail, { once: true });
      if (img.complete) (img.naturalWidth ? ok : fail)();
    });
  }

  /* Background / section videos: autoplay only when allowed, pause off-screen */
  const videoObserver = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (target.dataset.state === 'failed' || target.dataset.userPaused) return;
      if (isIntersecting && canAutoplay) target.play().catch(() => {});
      else target.pause();
    });
  }, { threshold: 0.25 }) : null;

  function setupAutoVideo(video, { onFail } = {}) {
    const fail = () => {
      if (video.dataset.state === 'failed') return;
      video.dataset.state = 'failed';
      video.pause();
      video.hidden = true;
      onFail?.();
    };
    video.addEventListener('error', fail, true); // capture: <source> errors don't bubble
    video.addEventListener('playing', () => video.classList.add('is-playing'));
    if (!canAutoplay) {
      // Reduced motion: never autoplay, but still check the file exists (metadata only).
      // Data saver: load nothing at all — the poster/photo stays.
      if (!saveData) { video.preload = 'metadata'; video.load(); }
      return;
    }
    video.preload = 'metadata';
    video.load();
    videoObserver ? videoObserver.observe(video) : video.play().catch(() => {});
  }

  /* ======================================================================
     TOASTS
     ====================================================================== */
  let toastHost;
  function toast(message, icon = ICON.check) {
    if (!toastHost) {
      toastHost = document.createElement('div');
      toastHost.className = 'toasts';
      toastHost.setAttribute('role', 'status');
      toastHost.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastHost);
    }
    const host = $('dialog[open]') || document.body;
    if (toastHost.parentElement !== host) host.appendChild(toastHost);
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = `${icon}<span>${message}</span>`;
    toastHost.appendChild(el);
    while (toastHost.children.length > 3) toastHost.firstElementChild.remove();
    setTimeout(() => { el.classList.add('is-leaving'); setTimeout(() => el.remove(), 320); }, 3200);
  }

  /* ======================================================================
     SAVED TRIPS (wishlist in localStorage)
     ====================================================================== */
  const saved = {
    KEY: 'te-saved',
    all: () => store.get('te-saved', []),
    has: (key) => saved.all().includes(key),
    toggle(key) {
      const list = saved.all();
      const on = !list.includes(key);
      store.set(saved.KEY, on ? [...list, key] : list.filter((k) => k !== key));
      return on;
    },
    item(key) {
      const [type, id] = key.split(':');
      const data = type === 'd' ? destById(id) : resortById(id);
      return data ? { type, data } : null;
    }
  };

  function saveBtnHTML(type, item) {
    const key = `${type}:${item.id}`;
    const on = saved.has(key);
    return `<button type="button" class="save-btn" data-save="${key}" aria-pressed="${on}" aria-label="${on ? 'Remove' : 'Save'} ${esc(item.name)} ${on ? 'from' : 'to'} saved trips">${ICON.heart}</button>`;
  }

  function updateSavedUI(changedKey) {
    const count = saved.all().length;
    $$('[data-saved-count]').forEach((el) => {
      el.textContent = count;
      el.hidden = count === 0;
      if (changedKey) { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
    });
    $$('[data-saved-open]').forEach((btn) => btn.setAttribute('aria-label', `Saved trips (${count} saved)`));
    $$('[data-save]').forEach((btn) => {
      const on = saved.has(btn.dataset.save);
      const item = saved.item(btn.dataset.save);
      btn.setAttribute('aria-pressed', String(on));
      if (item) btn.setAttribute('aria-label', `${on ? 'Remove' : 'Save'} ${item.data.name} ${on ? 'from' : 'to'} saved trips`);
    });
    if (drawer.isOpen()) drawer.render();
  }

  const drawer = (() => {
    let dlg;
    function ensure() {
      if (dlg) return;
      dlg = document.createElement('dialog');
      dlg.className = 'drawer';
      dlg.setAttribute('aria-labelledby', 'saved-title');
      dlg.innerHTML = `
        <div class="drawer-inner">
          <div class="drawer-head">
            <h2 id="saved-title">Saved trips</h2>
            <button type="button" class="icon-btn" data-drawer-close aria-label="Close saved trips">${ICON.close}</button>
          </div>
          <div class="drawer-body" data-drawer-body></div>
          <div class="drawer-foot"><a class="btn btn--dark btn--block" href="destinations.html">Browse destinations ${ICON.arrow}</a></div>
        </div>`;
      document.body.appendChild(dlg);
      dlg.addEventListener('click', (e) => {
        if (e.target === dlg || e.target.closest('[data-drawer-close]')) close();
      });
      dlg.addEventListener('cancel', (e) => { e.preventDefault(); close(); });
    }
    function render() {
      const items = saved.all().map(saved.item).filter(Boolean);
      const body = $('[data-drawer-body]', dlg);
      if (!items.length) {
        body.innerHTML = `<div class="saved-empty">${ICON.heartLine}<p>No saved trips yet. Tap the heart on any destination or resort to keep it here.</p></div>`;
        return;
      }
      body.innerHTML = `<ul class="saved-list">${items.map(({ type, data }) => {
        const href = type === 'd' ? `destination.html?id=${data.id}` : `resort.html?id=${data.id}`;
        const src = type === 'd' ? imgPath.dest(data) : imgPath.resort(data);
        const sub = type === 'd' ? `${data.country} · Destination` : `${data.location} · Resort`;
        return `
          <li class="saved-item">
            ${mediaHTML({ src, alt: '', name: data.name, sizes: '72px', w: 144, h: 144 })}
            <div><a href="${href}">${esc(data.name)}</a><small>${esc(sub)}</small></div>
            ${saveBtnHTML(type, data)}
          </li>`;
      }).join('')}</ul>`;
      watchMedia(body);
    }
    function open() {
      ensure();
      render();
      dlg._return = document.activeElement;
      dlg.showModal();
      document.body.classList.add('is-locked');
      requestAnimationFrame(() => dlg.classList.add('is-open'));
    }
    function close() {
      dlg.classList.remove('is-open');
      setTimeout(() => {
        dlg.close();
        document.body.classList.remove('is-locked');
        dlg._return?.focus?.();
      }, reduceMotion ? 0 : 400);
    }
    return { open, render, isOpen: () => Boolean(dlg && dlg.open) };
  })();

  /* ======================================================================
     LIGHTBOX (images + videos)
     ====================================================================== */
  const lightbox = (() => {
    let dlg;
    let items = [];
    let index = 0;
    let startX = null;

    function ensure() {
      if (dlg) return;
      dlg = document.createElement('dialog');
      dlg.className = 'lightbox';
      dlg.setAttribute('aria-label', 'Image viewer');
      dlg.innerHTML = `
        <div class="lb-inner">
          <div class="lb-top">
            <span class="lb-counter" data-lb-counter aria-live="polite"></span>
            <button type="button" class="lb-btn" data-lb-close aria-label="Close viewer">${ICON.close}</button>
          </div>
          <div class="lb-stage" data-lb-stage>
            <button type="button" class="lb-btn lb-prev" data-lb-prev aria-label="Previous">${ICON.left}</button>
            <figure class="lb-figure" data-lb-figure></figure>
            <button type="button" class="lb-btn lb-next" data-lb-next aria-label="Next">${ICON.right}</button>
          </div>
          <p class="lb-caption" data-lb-caption></p>
        </div>`;
      document.body.appendChild(dlg);
      dlg.addEventListener('click', (e) => {
        if (e.target.closest('[data-lb-close]')) close();
        else if (e.target.closest('[data-lb-prev]')) go(-1);
        else if (e.target.closest('[data-lb-next]')) go(1);
      });
      dlg.addEventListener('cancel', (e) => { e.preventDefault(); close(); });
      dlg.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
        if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      });
      const stage = $('[data-lb-stage]', dlg);
      stage.addEventListener('pointerdown', (e) => { startX = e.clientX; });
      stage.addEventListener('pointerup', (e) => {
        if (startX === null) return;
        const dx = e.clientX - startX;
        startX = null;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
      });
    }

    function render(direction = 0) {
      const it = items[index];
      const fig = $('[data-lb-figure]', dlg);
      $$('video', fig).forEach((v) => v.pause());
      if (it.type === 'video') {
        fig.innerHTML = `
          ${mediaHTML({ src: it.poster, alt: '', name: it.name, sub: 'Video', sizes: '100vw' })}
          <span class="badge lb-soon" data-soon hidden>Video coming soon</span>`;
        const box = $('.media', fig);
        const video = document.createElement('video');
        Object.assign(video, { muted: true, loop: true, playsInline: true, controls: true, poster: it.poster, preload: 'metadata' });
        video.setAttribute('aria-label', it.caption);
        video.innerHTML = `<source src="${it.src}" type="video/mp4">`;
        video.addEventListener('error', () => { video.remove(); $('[data-soon]', fig).hidden = false; }, true);
        box.appendChild(video);
        video.play().catch(() => {});
      } else {
        fig.innerHTML = mediaHTML({ src: it.src, alt: it.alt, name: it.name, sub: it.sub || '', eager: true, sizes: '100vw', w: 1600, h: 1200 });
      }
      watchMedia(fig);
      fig.classList.remove('is-entering', 'from-left', 'from-right');
      void fig.offsetWidth;
      fig.classList.add('is-entering', direction < 0 ? 'from-left' : direction > 0 ? 'from-right' : 'is-entering');
      $('[data-lb-caption]', dlg).textContent = it.caption || it.alt || '';
      $('[data-lb-counter]', dlg).textContent = items.length > 1 ? `${index + 1} / ${items.length}` : '';
      $('[data-lb-prev]', dlg).hidden = items.length < 2;
      $('[data-lb-next]', dlg).hidden = items.length < 2;
    }

    function go(delta) {
      if (items.length < 2) return;
      index = (index + delta + items.length) % items.length;
      render(delta);
    }

    function open(list, start = 0) {
      ensure();
      items = list;
      index = start;
      dlg._return = document.activeElement;
      render();
      dlg.showModal();
      document.body.classList.add('is-locked');
      requestAnimationFrame(() => dlg.classList.add('is-open'));
      $('[data-lb-close]', dlg).focus();
    }

    function close() {
      $$('video', dlg).forEach((v) => v.pause());
      dlg.classList.remove('is-open');
      setTimeout(() => {
        dlg.close();
        $('[data-lb-figure]', dlg).innerHTML = '';
        document.body.classList.remove('is-locked');
        dlg._return?.focus?.();
      }, reduceMotion ? 0 : 300);
    }

    return { open };
  })();

  /* ======================================================================
     HEADER, MOBILE MENU, SCROLL UI
     ====================================================================== */
  function initHeader() {
    const header = $('[data-header]');
    const toggle = $('.menu-toggle');
    const menu = $('#mobile-menu');
    const progress = $('.progress');
    const toTop = $('.to-top');
    if (!header) return;

    const setMenu = (open) => {
      document.body.classList.toggle('menu-open', open);
      document.body.classList.toggle('is-locked', open);
      toggle?.setAttribute('aria-expanded', String(open));
      toggle?.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      if (menu) menu.inert = !open;
      $$('main, footer').forEach((el) => { el.inert = open; });
      if (open) setTimeout(() => $('a', menu)?.focus(), 50);
    };
    if (menu) menu.inert = true;
    toggle?.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
    menu?.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && document.body.classList.contains('menu-open')) { setMenu(false); toggle?.focus(); }
    });
    window.matchMedia('(min-width: 1024px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });

    let lastY = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - innerHeight;
      const p = max > 0 ? Math.min(1, y / max) : 0;
      header.classList.toggle('is-solid', y > 40);
      // Keep the header in view while a keyboard user is tabbing through it.
      const keyboardInHeader = Boolean(header.querySelector(':focus-visible'));
      if (!document.body.classList.contains('menu-open') && !keyboardInHeader) {
        if (y > lastY + 6 && y > 320) header.classList.add('is-hidden');
        else if (y < lastY - 6 || y < 120) header.classList.remove('is-hidden');
      }
      lastY = y;
      progress?.style.setProperty('--progress', p.toFixed(4));
      toTop?.style.setProperty('--progress', p.toFixed(4));
      toTop?.classList.toggle('is-visible', y > innerHeight * 0.9);
      ticking = false;
    };
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
    onScroll();
    toTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));
  }

  function initParallax() {
    const bg = $('[data-parallax]');
    if (!bg || reduceMotion) return;
    let ticking = false;
    const update = () => {
      const y = window.scrollY;
      if (y < innerHeight * 1.2) bg.style.setProperty('--parallax', `${(y * 0.25).toFixed(1)}px`);
      ticking = false;
    };
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  }

  /* ======================================================================
     REVEALS + COUNTERS
     ====================================================================== */
  const revealObserver = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (!isIntersecting) return;
      target.classList.add('is-in');
      revealObserver.unobserve(target);
      // One-shot: hand the element back to its own hover transitions afterwards.
      const delay = (parseFloat(getComputedStyle(target).transitionDelay) || 0) * 1000;
      setTimeout(() => target.classList.remove('reveal', 'is-in'), 900 + delay);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }) : null;

  function countUp(el) {
    const target = Number(el.dataset.count);
    if (reduceMotion) { el.textContent = target; return; }
    const t0 = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - t0) / 1600);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  const countObserver = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (!isIntersecting) return;
      countUp(target);
      countObserver.unobserve(target);
    });
  }, { threshold: 0.6 }) : null;

  /** Activate media, reveals and counters inside freshly rendered markup. */
  function hydrate(ctx = document) {
    watchMedia(ctx);
    $$('.reveal:not(.is-in)', ctx).forEach((el) => (revealObserver ? revealObserver.observe(el) : el.classList.add('is-in')));
    $$('[data-count]', ctx).forEach((el) => (countObserver ? countObserver.observe(el) : countUp(el)));
  }

  /* ======================================================================
     CAROUSEL + TESTIMONIALS
     ====================================================================== */
  function initCarousel(root) {
    // The arrows live in the section heading, so look for them in the whole section.
    const scope = root.closest('section') || root;
    const track = $('.carousel-track', root);
    const prev = $('[data-carousel-prev]', scope);
    const next = $('[data-carousel-next]', scope);
    const bar = $('.carousel-progress span', root);
    if (!track) return;
    const step = () => (track.firstElementChild?.getBoundingClientRect().width || 300) + 24;
    prev?.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: reduceMotion ? 'auto' : 'smooth' }));
    next?.addEventListener('click', () => track.scrollBy({ left: step(), behavior: reduceMotion ? 'auto' : 'smooth' }));
    const update = () => {
      const max = track.scrollWidth - track.clientWidth;
      const ratio = track.clientWidth / track.scrollWidth;
      const p = max > 0 ? track.scrollLeft / max : 0;
      if (bar) {
        bar.style.setProperty('--w', `${(ratio * 100).toFixed(2)}%`);
        bar.style.setProperty('--x', `${(p * (1 / ratio - 1) * 100).toFixed(2)}%`);
      }
      if (prev) prev.disabled = track.scrollLeft < 8;
      if (next) next.disabled = track.scrollLeft > max - 8;
    };
    track.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  function initTestimonials() {
    const root = $('[data-testimonials]');
    if (!root) return;
    const list = D.testimonials;
    const track = $('.t-track', root);
    const dots = $('.dots', root);
    track.innerHTML = list.map((t, i) => `
      <figure class="t-slide" aria-roledescription="slide" aria-label="${i + 1} of ${list.length}">
        ${t.sample ? '<span class="sample-label">Sample review — replace with a real one</span>' : ''}
        <blockquote class="t-quote">${esc(t.quote)}</blockquote>
        <figcaption class="t-meta"><strong>${esc(t.name)}</strong> · ${esc(t.trip)}</figcaption>
      </figure>`).join('');
    dots.innerHTML = list.map((_, i) => `<button type="button" class="dot" aria-label="Show review ${i + 1}"></button>`).join('');
    const slides = $$('.t-slide', track);
    let i = 0;
    let timer;
    const go = (n) => {
      i = (n + list.length) % list.length;
      track.style.transform = `translateX(-${i * 100}%)`;
      slides.forEach((s, k) => { s.setAttribute('aria-hidden', String(k !== i)); s.inert = k !== i; });
      $$('.dot', dots).forEach((d, k) => d.setAttribute('aria-current', String(k === i)));
    };
    const stop = () => clearInterval(timer);
    const start = () => { stop(); if (!reduceMotion) timer = setInterval(() => go(i + 1), 7000); };
    dots.addEventListener('click', (e) => { const d = e.target.closest('.dot'); if (d) { go($$('.dot', dots).indexOf(d)); start(); } });
    $('[data-t-prev]', root).addEventListener('click', () => { go(i - 1); start(); });
    $('[data-t-next]', root).addEventListener('click', () => { go(i + 1); start(); });
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    root.addEventListener('focusin', stop);
    root.addEventListener('focusout', start);
    let sx = null;
    root.addEventListener('pointerdown', (e) => { sx = e.clientX; });
    root.addEventListener('pointerup', (e) => {
      if (sx === null) return;
      const dx = e.clientX - sx;
      sx = null;
      if (Math.abs(dx) > 50) { go(i + (dx < 0 ? 1 : -1)); start(); }
    });
    go(0);
    start();
  }

  /* ======================================================================
     NEWSLETTER (front-end only — connect your email provider here)
     ====================================================================== */
  function initNewsletter() {
    $$('[data-newsletter]').forEach((form) => {
      form.noValidate = true;
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = $('input[type="email"]', form);
        const note = form.parentElement.querySelector('[data-newsletter-note]');
        if (!isEmail(input.value)) {
          input.setAttribute('aria-invalid', 'true');
          if (note) note.textContent = input.value ? 'That email doesn’t look quite right — please check it.' : 'Please enter your email address.';
          input.focus();
          return;
        }
        input.removeAttribute('aria-invalid');
        // NEWSLETTER: send input.value to your email service (Mailchimp, Buttondown, etc.) here.
        const list = store.get('te-newsletter', []);
        if (!list.includes(input.value.trim())) store.set('te-newsletter', [...list, input.value.trim()]);
        if (note) note.textContent = 'Thanks! You’re on the list for new guides and travel tips.';
        toast('You’re subscribed — welcome aboard.');
        form.reset();
      });
    });
  }

  /* ======================================================================
     CARDS
     ====================================================================== */
  function destCardHTML(d, { stagger = 0 } = {}) {
    return `
      <article class="dest-card">
        ${mediaHTML({ src: imgPath.dest(d), alt: d.alt.hero, name: d.name, sub: d.country, sizes: '(min-width: 1200px) 280px, (min-width: 768px) 45vw, 100vw', w: 800, h: 600 })}
        <div class="card-badges"><span class="badge">${esc(d.region)}</span>${d.video ? `<span class="badge">${ICON.play}Video</span>` : ''}</div>
        ${saveBtnHTML('d', d)}
        <div class="card-body">
          <p class="card-kicker">${esc(d.country)}</p>
          <h3 class="card-title"><a class="card-link" href="destination.html?id=${d.id}">${esc(d.name)}</a></h3>
          <p class="card-text">${esc(d.short)}</p>
          <div class="card-meta">
            <span title="${esc(D.budgets[d.budget])}"><strong>${d.budget}</strong> ${esc(D.budgets[d.budget])}</span>
            <span>${ICON.tag}${d.styles.slice(0, 2).join(' · ')}</span>
          </div>
        </div>
      </article>`;
  }

  function resortCardHTML(r) {
    return `
      <article class="resort-card">
        ${mediaHTML({ src: imgPath.resort(r), alt: r.alt.hero, name: r.name, sub: r.location, sizes: '(min-width: 1024px) 380px, 85vw', w: 900, h: 1200 })}
        ${saveBtnHTML('r', r)}
        <p class="eyebrow eyebrow--light">${esc(r.location)}</p>
        <h3><a class="card-link" href="resort.html?id=${r.id}">${esc(r.name)}</a></h3>
        <p>${esc(r.tagline)}</p>
        <div class="resort-meta">
          <span>Ideal for ${r.idealFor.map((k) => D.idealFor[k].toLowerCase()).join(', ')}</span>
          <span class="price-tier" title="Price tier: luxury">${r.price}<span class="sr-only"> (luxury price tier)</span></span>
        </div>
      </article>`;
  }

  /* ======================================================================
     PAGE: HOME
     ====================================================================== */
  function pageHome() {
    const heroVideo = $('[data-bg-video]');
    if (heroVideo) setupAutoVideo(heroVideo);

    // Stats counted from data.js
    const counts = { destinations: D.destinations.length, resorts: D.resorts.length, regions: D.regions.length, styles: D.styles.length };
    $$('[data-stat]').forEach((el) => { el.dataset.count = counts[el.dataset.stat]; el.textContent = '0'; });

    // Marquee of destination names
    const marquee = $('[data-marquee]');
    if (marquee) {
      const items = D.destinations.map((d) => `<li><a href="destination.html?id=${d.id}">${esc(d.name)}</a></li>`).join('');
      marquee.innerHTML = `<ul class="marquee-list">${items}</ul><ul class="marquee-list" aria-hidden="true">${items.replace(/<a /g, '<a tabindex="-1" ')}</ul>`;
    }

    // Featured destinations (the original four, in their original order)
    const featured = $('[data-featured]');
    if (featured) {
      const ids = ['kyoto', 'cape-town', 'lisbon', 'queenstown'];
      featured.innerHTML = ids.map(destById).filter(Boolean).map((d, i) => `
        <li class="reveal" style="--stagger:${i}">
          <article class="feature-card">
            ${mediaHTML({ src: imgPath.dest(d), alt: d.alt.hero, name: d.name, sub: d.country, sizes: '(min-width: 1024px) 60vw, 100vw', w: 1400, h: 1000 })}
            <span class="feature-num" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
            ${saveBtnHTML('d', d)}
            <p class="eyebrow eyebrow--light">${esc(d.country)}</p>
            <h3><a class="card-link" href="destination.html?id=${d.id}">${esc(d.name)}</a></h3>
            <p>${esc(d.short)}</p>
          </article>
        </li>`).join('');
    }

    // Browse by travel style
    const styleGrid = $('[data-styles]');
    if (styleGrid) {
      const styles = ['Adventure', 'Culture', 'Beach', 'Nature', 'City', 'Food'];
      const alts = {
        Adventure: 'Hiker standing on a rocky ridge above a mountain valley',
        Culture: 'Ornate temple roofs and lanterns in an old town',
        Beach: 'Turquoise water lapping a quiet white-sand beach',
        Nature: 'Glacier-fed lake surrounded by forest and snowy peaks',
        City: 'City skyline glowing at dusk',
        Food: 'Table of colorful local dishes at a street market'
      };
      styleGrid.innerHTML = styles.map((s, i) => {
        const n = D.destinations.filter((d) => d.styles.includes(s)).length;
        return `
          <li class="reveal" style="--stagger:${i}">
            <div class="style-tile">
              ${mediaHTML({ src: `images/ui/style-${s.toLowerCase()}.jpg`, alt: alts[s], name: s, sizes: '(min-width: 1024px) 190px, 45vw', w: 600, h: 800 })}
              <h3><a class="card-link" href="destinations.html?style=${encodeURIComponent(s)}">${s}</a></h3>
              <span>${n} destination${n === 1 ? '' : 's'}</span>
            </div>
          </li>`;
      }).join('');
    }

    // Special resorts carousel
    const track = $('[data-resort-track]');
    if (track) track.innerHTML = D.resorts.map((r) => `<li>${resortCardHTML(r)}</li>`).join('');

    // Image strip between sections
    const strip = $('[data-image-strip]');
    if (strip) {
      const picks = ['santorini', 'petra', 'banff', 'hoi-an', 'rio-de-janeiro', 'zanzibar'];
      strip.innerHTML = picks.map(destById).filter(Boolean).map((d) => `
        <li>
          <a href="destination.html?id=${d.id}">
            ${mediaHTML({ src: imgPath.dest(d, 1), alt: d.alt.gallery[0], name: d.name, sub: d.country, sizes: '(min-width: 1024px) 190px, 60vw', w: 600, h: 800 })}
            <span class="caption">${esc(d.name)}, ${esc(d.country)}</span>
          </a>
        </li>`).join('');
    }

    hydrate();
    $$('[data-carousel]').forEach(initCarousel);
    initTestimonials();
  }

  /* ======================================================================
     PAGE: DESTINATIONS (search, filters, sort, URL state)
     ====================================================================== */
  function pageDestinations() {
    const grid = $('[data-dest-grid]');
    if (!grid) return;
    const state = {
      q: params.get('q') || '',
      region: params.get('region') || 'All',
      style: params.get('style') || 'All',
      budget: params.get('budget') || 'All',
      sort: params.get('sort') || 'az'
    };
    if (state.region !== 'All' && !D.regions.includes(state.region)) state.region = 'All';
    if (state.style !== 'All' && !D.styles.includes(state.style)) state.style = 'All';
    if (state.budget !== 'All' && !D.budgets[state.budget]) state.budget = 'All';
    if (!['az', 'region', 'budget'].includes(state.sort)) state.sort = 'az';

    // Render every card once; filtering shows/hides and re-orders them.
    grid.innerHTML = D.destinations.map((d) => `<li data-id="${d.id}">${destCardHTML(d)}</li>`).join('');
    hydrate(grid);
    const items = $$('li[data-id]', grid);
    const search = $('[data-search]');
    const clear = $('[data-search-clear]');
    const sort = $('[data-sort]');
    const count = $('[data-count-text]');
    const empty = $('[data-empty]');

    const matches = (d, ignore) => {
      const q = state.q.trim().toLowerCase();
      if (q && ![d.name, d.country, d.region, d.short, d.styles.join(' ')].join(' ').toLowerCase().includes(q)) return false;
      if (ignore !== 'region' && state.region !== 'All' && d.region !== state.region) return false;
      if (ignore !== 'style' && state.style !== 'All' && !d.styles.includes(state.style)) return false;
      if (ignore !== 'budget' && state.budget !== 'All' && d.budget !== state.budget) return false;
      return true;
    };

    const groups = {
      region: { el: $('[data-filter="region"]'), values: D.regions, label: (v) => v, test: (d, v) => d.region === v },
      style: { el: $('[data-filter="style"]'), values: D.styles, label: (v) => v, test: (d, v) => d.styles.includes(v) },
      budget: { el: $('[data-filter="budget"]'), values: Object.keys(D.budgets), label: (v) => `${v} · ${D.budgets[v]}`, test: (d, v) => d.budget === v }
    };

    function renderChips() {
      Object.entries(groups).forEach(([key, g]) => {
        const pool = D.destinations.filter((d) => matches(d, key));
        g.el.innerHTML = ['All', ...g.values].map((v) => {
          const n = v === 'All' ? pool.length : pool.filter((d) => g.test(d, v)).length;
          return `<button type="button" class="chip" data-value="${esc(v)}" aria-pressed="${state[key] === v}">${esc(v === 'All' ? 'All' : g.label(v))} <span class="chip-count">${n}</span></button>`;
        }).join('');
      });
    }

    function syncURL() {
      const p = new URLSearchParams();
      if (state.q.trim()) p.set('q', state.q.trim());
      ['region', 'style', 'budget'].forEach((k) => { if (state[k] !== 'All') p.set(k, state[k]); });
      if (state.sort !== 'az') p.set('sort', state.sort);
      const qs = p.toString();
      history.replaceState(null, '', `${location.pathname}${qs ? `?${qs}` : ''}`);
    }

    function apply({ animate = true } = {}) {
      const budgetRank = (d) => d.budget.length;
      const sorters = {
        az: (a, b) => a.name.localeCompare(b.name),
        region: (a, b) => D.regions.indexOf(a.region) - D.regions.indexOf(b.region) || a.name.localeCompare(b.name),
        budget: (a, b) => budgetRank(a) - budgetRank(b) || a.name.localeCompare(b.name)
      };
      const first = new Map(items.map((li) => [li, li.getBoundingClientRect()]));
      const ordered = [...D.destinations].sort(sorters[state.sort]);
      let shown = 0;
      ordered.forEach((d) => {
        const li = items.find((x) => x.dataset.id === d.id);
        const ok = matches(d);
        li.hidden = !ok;
        if (ok) shown += 1;
        grid.appendChild(li);
      });
      // FLIP: glide cards to their new positions; fade in newcomers.
      if (animate && !reduceMotion && Element.prototype.animate) {
        items.filter((li) => !li.hidden).forEach((li, i) => {
          const a = first.get(li);
          const b = li.getBoundingClientRect();
          if (a && a.width) {
            const dx = a.left - b.left;
            const dy = a.top - b.top;
            if (dx || dy) li.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], { duration: 500, easing: 'cubic-bezier(.22,.8,.24,1)' });
          } else {
            li.animate([{ opacity: 0, transform: 'translateY(16px) scale(.98)' }, { opacity: 1, transform: 'none' }], { duration: 450, delay: Math.min(i, 8) * 40, easing: 'cubic-bezier(.22,.8,.24,1)', fill: 'backwards' });
          }
        });
      }
      const active = [];
      if (state.region !== 'All') active.push(state.region);
      if (state.style !== 'All') active.push(state.style);
      if (state.budget !== 'All') active.push(`${state.budget} budget`);
      if (state.q.trim()) active.push(`“${esc(state.q.trim())}”`);
      count.innerHTML = `Showing <strong>${shown}</strong> of ${D.destinations.length} destinations${active.length ? ` · ${active.join(' · ')}` : ''}`;
      empty.hidden = shown > 0;
      grid.hidden = shown === 0;
      clear.hidden = !state.q;
      renderChips();
      syncURL();
    }

    search.value = state.q;
    sort.value = state.sort;
    let debounce;
    search.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => { state.q = search.value; apply(); }, 140);
    });
    $('[data-search-form]')?.addEventListener('submit', (e) => { e.preventDefault(); state.q = search.value; apply(); });
    clear.addEventListener('click', () => { search.value = ''; state.q = ''; apply(); search.focus(); });
    sort.addEventListener('change', () => { state.sort = sort.value; apply(); });
    Object.entries(groups).forEach(([key, g]) => {
      g.el.addEventListener('click', (e) => {
        const chip = e.target.closest('[data-value]');
        if (!chip) return;
        state[key] = chip.dataset.value;
        apply();
        $(`[data-value="${CSS.escape(state[key])}"]`, g.el)?.focus();
      });
    });
    $$('[data-reset]').forEach((btn) => btn.addEventListener('click', () => {
      Object.assign(state, { q: '', region: 'All', style: 'All', budget: 'All', sort: 'az' });
      search.value = '';
      sort.value = 'az';
      apply();
      toast('Filters reset — showing every destination.', ICON.compass);
    }));
    apply({ animate: false });
  }

  /* ======================================================================
     PAGE: DESTINATION DETAIL (destination.html?id=…)
     ====================================================================== */
  function setMeta(title, description) {
    document.title = title;
    $('meta[name="description"]')?.setAttribute('content', description);
    $('meta[property="og:title"]')?.setAttribute('content', title);
    $('meta[property="og:description"]')?.setAttribute('content', description);
  }

  function notFound(main, { kind, listHref, listLabel }) {
    setMeta(`${kind} not found | Travel Explorer`, `We couldn't find that ${kind.toLowerCase()}. Browse all ${listLabel.toLowerCase()} on Travel Explorer.`);
    main.innerHTML = `
      <section class="page-hero page-hero--short">
        <div class="hero-bg">${mediaHTML({ src: 'images/ui/destinations-hero.jpg', alt: '', name: '', cls: 'media--hero', eager: true, sizes: '100vw' })}</div>
        <div class="hero-overlay"></div>
        <div class="container">
          <ol class="breadcrumb"><li><a href="index.html">Home</a></li><li><a href="${listHref}">${listLabel}</a></li><li><span aria-current="page">Not found</span></li></ol>
          <h1 class="hero-title">We couldn’t find that ${kind.toLowerCase()}</h1>
          <p class="hero-lead">The link may be out of date or mistyped. Try a search, or browse everything we cover.</p>
        </div>
      </section>
      <section class="section">
        <div class="container container--narrow not-found-box">
          <form class="search" action="destinations.html" method="get" role="search" style="margin-inline:auto">
            ${ICON.search}<label class="sr-only" for="nf-search">Search destinations</label>
            <input id="nf-search" type="search" name="q" placeholder="Search destinations…">
            <button class="btn btn--accent btn--sm" type="submit">Search</button>
          </form>
          <p><a class="btn btn--dark" href="${listHref}">Browse all ${listLabel.toLowerCase()} ${ICON.arrow}</a></p>
        </div>
      </section>`;
    hydrate(main);
  }

  function factsHTML(facts) {
    return `<dl class="facts reveal">${facts.map((f) => `
      <div class="fact"><span class="fact-icon">${f.icon}</span><div><dt>${f.label}</dt><dd>${f.value}</dd></div></div>`).join('')}</dl>`;
  }

  function galleryHTML(list, cls = '') {
    return `<ul class="gallery ${cls}">${list.map((g, i) => `
      <li class="reveal" style="--stagger:${i}">
        <button type="button" class="gallery-btn" data-gallery-index="${i}" aria-label="Open photo ${i + 1} of ${list.length}: ${esc(g.alt)}">
          ${mediaHTML({ src: g.src, alt: g.alt, name: g.name, sub: g.sub, sizes: i === 0 ? '(min-width: 1024px) 50vw, 100vw' : '(min-width: 1024px) 25vw, 50vw' })}
          <span class="expand" aria-hidden="true">${ICON.expand}</span>
        </button>
      </li>`).join('')}</ul>`;
  }

  function bindGallery(ctx, list) {
    ctx.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-gallery-index]');
      if (btn) lightbox.open(list.map((g) => ({ ...g, caption: g.alt })), Number(btn.dataset.galleryIndex));
    });
  }

  function pageDestination() {
    const main = $('#main');
    const d = destById(params.get('id'));
    if (!d) return notFound(main, { kind: 'Destination', listHref: 'destinations.html', listLabel: 'Destinations' });

    setMeta(`${d.name}, ${d.country} — Travel guide | Travel Explorer`, d.short);
    const gallery = [0, 1, 2, 3].map((i) => ({ src: imgPath.dest(d, i), alt: i === 0 ? d.alt.hero : d.alt.gallery[i - 1], name: d.name, sub: d.country }));
    const resorts = D.resorts.filter((r) => r.destination?.id === d.id);
    const related = d.related.map(destById).filter(Boolean);
    const planHref = `contact.html?subject=${encodeURIComponent('Trip planning')}&destination=${encodeURIComponent(`${d.name}, ${d.country}`)}#contact-form`;
    const videoItem = d.video ? [{ type: 'video', src: d.video, poster: imgPath.dest(d), name: d.name, caption: `${d.name}, ${d.country} — video` }] : null;

    main.innerHTML = `
      <section class="detail-hero">
        <div class="hero-bg" data-parallax>${mediaHTML({ src: imgPath.dest(d), alt: d.alt.hero, name: d.name, cls: 'media--hero kenburns', eager: true, sizes: '100vw', w: 1920, h: 1280 })}</div>
        <div class="hero-overlay"></div>
        <div class="container hero-inner on-dark">
          <ol class="breadcrumb hero-anim" style="--d:0">
            <li><a href="index.html">Home</a></li>
            <li><a href="destinations.html">Destinations</a></li>
            <li><a href="destinations.html?region=${encodeURIComponent(d.region)}">${esc(d.region)}</a></li>
            <li><span aria-current="page">${esc(d.name)}</span></li>
          </ol>
          <p class="eyebrow eyebrow--light hero-anim" style="--d:1">${esc(d.country)} · ${esc(d.region)}</p>
          <h1 class="hero-title hero-anim" style="--d:2">${esc(d.name)}</h1>
          <p class="hero-lead hero-anim" style="--d:3">${esc(d.short)}</p>
          <div class="detail-actions hero-anim" style="--d:4">
            <a class="btn btn--accent btn--lg" href="${planHref}">Plan this trip ${ICON.arrow}</a>
            ${d.video ? `<button type="button" class="play-btn" data-play-video><span class="play-icon">${ICON.play}</span>Watch the video</button>` : ''}
            ${saveBtnHTML('d', d)}
          </div>
        </div>
      </section>

      <div class="container">
        ${factsHTML([
          { icon: ICON.compass, label: 'Region', value: esc(d.region) },
          { icon: ICON.calendar, label: 'Best time to visit', value: esc(d.bestTime) },
          { icon: ICON.wallet, label: 'Budget', value: `${d.budget} · ${esc(D.budgets[d.budget])}` },
          { icon: ICON.tag, label: 'Travel style', value: `<ul class="tags">${d.styles.map((s) => `<li><a class="tag" href="destinations.html?style=${encodeURIComponent(s)}">${s}</a></li>`).join('')}</ul>` }
        ])}
      </div>

      <section class="section" aria-labelledby="about-title">
        <div class="container detail-layout">
          <div class="reveal">
            <p class="eyebrow">The guide</p>
            <h2 class="h2" id="about-title" style="margin-bottom:var(--s-4)">Why go to ${esc(d.name)}</h2>
            <div class="prose">${d.long.map((p) => `<p>${esc(p)}</p>`).join('')}</div>
          </div>
          <aside class="detail-aside reveal" aria-label="Trip summary">
            <div class="aside-card">
              <h2>Plan your trip</h2>
              <dl>
                <div><dt>Best time</dt><dd>${esc(d.bestTime)}</dd></div>
                <div><dt>Budget</dt><dd>${d.budget} · ${esc(D.budgets[d.budget])}</dd></div>
                <div><dt>Great for</dt><dd>${d.styles.join(', ')}</dd></div>
              </dl>
              <a class="btn btn--accent btn--block" href="${planHref}">Plan this trip ${ICON.arrow}</a>
              <a class="btn btn--outline btn--block" href="destinations.html?region=${encodeURIComponent(d.region)}">More in ${esc(d.region)}</a>
            </div>
          </aside>
        </div>
      </section>

      <section class="section section--white" aria-labelledby="things-title">
        <div class="container">
          <div class="section-head reveal"><div><p class="eyebrow">Don’t miss</p><h2 class="h2" id="things-title">Top things to do</h2></div></div>
          <ol class="things-grid">${d.things.map((t, i) => `<li class="thing reveal" style="--stagger:${i}"><h3>${esc(t.title)}</h3><p>${esc(t.text)}</p></li>`).join('')}</ol>
        </div>
      </section>

      <section class="section" aria-labelledby="gallery-title">
        <div class="container">
          <div class="section-head reveal"><div><p class="eyebrow">Gallery</p><h2 class="h2" id="gallery-title">${esc(d.name)} in pictures</h2></div><p class="lead">Tap any photo to open it full screen.</p></div>
          <div data-gallery>${galleryHTML(gallery)}</div>
        </div>
      </section>

      ${d.video ? `
      <section class="section section--tight" aria-labelledby="video-title">
        <div class="container">
          <div class="section-head reveal"><div><p class="eyebrow">Watch</p><h2 class="h2" id="video-title">See ${esc(d.name)} in motion</h2></div></div>
          <button type="button" class="video-feature reveal" data-play-video aria-label="Play video of ${esc(d.name)}">
            ${mediaHTML({ src: imgPath.dest(d), alt: '', name: d.name, sub: 'Video', sizes: '100vw' })}
            <span class="video-play" aria-hidden="true">${ICON.play}</span>
            <span class="video-caption">${esc(d.name)}, ${esc(d.country)}</span>
          </button>
        </div>
      </section>` : ''}

      ${resorts.length ? `
      <section class="section section--white" aria-labelledby="resorts-title">
        <div class="container">
          <div class="section-head reveal"><div><p class="eyebrow">Stay somewhere special</p><h2 class="h2" id="resorts-title">Resorts ${resorts.some((r) => r.destination.relation === 'in') ? 'in' : 'to pair with'} ${esc(d.name)}</h2></div><a class="text-link" href="resorts.html">All special resorts ${ICON.arrow}</a></div>
          <ul class="card-grid">${resorts.map((r, i) => `<li class="reveal" style="--stagger:${i}">${resortCardHTML(r)}</li>`).join('')}</ul>
        </div>
      </section>` : ''}

      <section class="section" aria-labelledby="related-title">
        <div class="container">
          <div class="section-head reveal"><div><p class="eyebrow">Keep exploring</p><h2 class="h2" id="related-title">You might also love</h2></div><a class="text-link" href="destinations.html">All destinations ${ICON.arrow}</a></div>
          <ul class="card-grid">${related.map((r, i) => `<li class="reveal" style="--stagger:${i}">${destCardHTML(r)}</li>`).join('')}</ul>
        </div>
      </section>

      <section class="section section--tight">
        <div class="container">
          <div class="newsletter-cta reveal on-dark">
            <div><p class="eyebrow eyebrow--light">Ready when you are</p><h2 class="h2">Start planning your trip to ${esc(d.name)}</h2></div>
            <div><p>Tell us your dates and travel style, and we’ll reply with ideas within a couple of days.</p><a class="btn btn--accent btn--lg" href="${planHref}">Plan this trip ${ICON.arrow}</a></div>
          </div>
        </div>
      </section>`;

    hydrate(main);
    initParallax();
    bindGallery($('[data-gallery]', main), gallery);
    if (videoItem) $$('[data-play-video]', main).forEach((b) => b.addEventListener('click', () => lightbox.open(videoItem)));
  }

  /* ======================================================================
     PAGE: RESORTS (filter by "ideal for" and region)
     ====================================================================== */
  function pageResorts() {
    const grid = $('[data-resort-grid]');
    if (!grid) return;
    const regions = D.regions.filter((r) => D.resorts.some((x) => x.region === r));
    const state = {
      for: D.idealFor[params.get('for')] ? params.get('for') : 'all',
      region: regions.includes(params.get('region')) ? params.get('region') : 'All'
    };
    grid.innerHTML = D.resorts.map((r) => `<li data-id="${r.id}">${resortCardHTML(r)}</li>`).join('');
    hydrate(grid);
    const items = $$('li[data-id]', grid);
    const forEl = $('[data-filter="for"]');
    const regionEl = $('[data-filter="region"]');
    const count = $('[data-count-text]');
    const empty = $('[data-empty]');

    const ok = (r, ignore) => (ignore === 'for' || state.for === 'all' || r.idealFor.includes(state.for))
      && (ignore === 'region' || state.region === 'All' || r.region === state.region);

    function chips() {
      const forPool = D.resorts.filter((r) => ok(r, 'for'));
      forEl.innerHTML = [['all', 'All'], ...Object.entries(D.idealFor)].map(([k, label]) => {
        const n = k === 'all' ? forPool.length : forPool.filter((r) => r.idealFor.includes(k)).length;
        return `<button type="button" class="chip" data-value="${k}" aria-pressed="${state.for === k}">${label} <span class="chip-count">${n}</span></button>`;
      }).join('');
      const regionPool = D.resorts.filter((r) => ok(r, 'region'));
      regionEl.innerHTML = ['All', ...regions].map((v) => {
        const n = v === 'All' ? regionPool.length : regionPool.filter((r) => r.region === v).length;
        return `<button type="button" class="chip" data-value="${esc(v)}" aria-pressed="${state.region === v}">${esc(v)} <span class="chip-count">${n}</span></button>`;
      }).join('');
    }

    function apply(animate = true) {
      let shown = 0;
      items.forEach((li, i) => {
        const r = resortById(li.dataset.id);
        const visible = ok(r);
        const wasHidden = li.hidden;
        li.hidden = !visible;
        if (visible) {
          shown += 1;
          if (animate && wasHidden && !reduceMotion && li.animate) li.animate([{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], { duration: 450, delay: (i % 6) * 40, fill: 'backwards', easing: 'cubic-bezier(.22,.8,.24,1)' });
        }
      });
      count.innerHTML = `Showing <strong>${shown}</strong> of ${D.resorts.length} special resorts`;
      empty.hidden = shown > 0;
      grid.hidden = shown === 0;
      chips();
      const p = new URLSearchParams();
      if (state.for !== 'all') p.set('for', state.for);
      if (state.region !== 'All') p.set('region', state.region);
      history.replaceState(null, '', `${location.pathname}${p.toString() ? `?${p}` : ''}`);
    }

    [[forEl, 'for'], [regionEl, 'region']].forEach(([el, key]) => el.addEventListener('click', (e) => {
      const chip = e.target.closest('[data-value]');
      if (!chip) return;
      state[key] = chip.dataset.value;
      apply();
      $(`[data-value="${CSS.escape(state[key])}"]`, el)?.focus();
    }));
    $$('[data-reset]').forEach((b) => b.addEventListener('click', () => { state.for = 'all'; state.region = 'All'; apply(); }));
    apply(false);
  }

  /* ======================================================================
     PAGE: RESORT DETAIL (resort.html?id=…)
     ====================================================================== */
  function pageResort() {
    const main = $('#main');
    const r = resortById(params.get('id'));
    if (!r) return notFound(main, { kind: 'Resort', listHref: 'resorts.html', listLabel: 'Special resorts' });

    setMeta(`${r.name}, ${r.location} | Special resorts | Travel Explorer`, `${r.tagline} ${r.writeup[0].slice(0, 110)}…`);
    const gallery = [0, 1, 2, 3, 4].map((i) => ({ src: imgPath.resort(r, i), alt: i === 0 ? r.alt.hero : r.alt.gallery[i - 1], name: r.name, sub: r.location }));
    const linked = r.destination ? destById(r.destination.id) : null;
    const more = D.resorts.filter((x) => x.id !== r.id && (x.region === r.region || x.idealFor.some((k) => r.idealFor.includes(k)))).slice(0, 3);
    const enquire = `contact.html?subject=${encodeURIComponent('Trip planning')}&destination=${encodeURIComponent(`${r.name}, ${r.location}`)}#contact-form`;

    main.innerHTML = `
      <section class="detail-hero">
        <div class="hero-bg" data-parallax>${mediaHTML({ src: imgPath.resort(r), alt: r.alt.hero, name: r.name, cls: 'media--hero kenburns', eager: true, sizes: '100vw', w: 1920, h: 1280 })}</div>
        <div class="hero-overlay"></div>
        <div class="container hero-inner on-dark">
          <ol class="breadcrumb hero-anim" style="--d:0">
            <li><a href="index.html">Home</a></li>
            <li><a href="resorts.html">Special resorts</a></li>
            <li><span aria-current="page">${esc(r.name)}</span></li>
          </ol>
          <p class="eyebrow eyebrow--light hero-anim" style="--d:1">Special resort · ${esc(r.location)}</p>
          <h1 class="hero-title hero-anim" style="--d:2">${esc(r.name)}</h1>
          <p class="hero-lead hero-anim" style="--d:3">${esc(r.tagline)}</p>
          <div class="detail-actions hero-anim" style="--d:4">
            <a class="btn btn--accent btn--lg" href="${enquire}">Enquire about this resort ${ICON.arrow}</a>
            <a class="play-btn" href="#resort-video"><span class="play-icon">${ICON.play}</span>Watch the film</a>
            ${saveBtnHTML('r', r)}
          </div>
        </div>
      </section>

      <div class="container">
        ${factsHTML([
          { icon: ICON.pin, label: 'Location', value: esc(r.location) },
          { icon: ICON.compass, label: 'Region', value: esc(r.region) },
          { icon: ICON.heartLine, label: 'Ideal for', value: r.idealFor.map((k) => D.idealFor[k]).join(', ') },
          { icon: ICON.wallet, label: 'Price tier', value: `${r.price} · Luxury` }
        ])}
      </div>

      <section class="section" aria-labelledby="story-title">
        <div class="container detail-layout">
          <div class="reveal">
            <p class="eyebrow">The stay</p>
            <h2 class="h2" id="story-title" style="margin-bottom:var(--s-4)">${esc(r.tagline)}</h2>
            <div class="prose">${r.writeup.map((p) => `<p>${esc(p)}</p>`).join('')}</div>
          </div>
          <aside class="detail-aside reveal" aria-label="Resort summary">
            <div class="aside-card">
              <h2>At a glance</h2>
              <dl>
                <div><dt>Location</dt><dd>${esc(r.location)}</dd></div>
                <div><dt>Ideal for</dt><dd>${r.idealFor.map((k) => D.idealFor[k]).join(', ')}</dd></div>
                <div><dt>Price tier</dt><dd>${r.price} · Luxury (contact the resort for current rates)</dd></div>
              </dl>
              <a class="btn btn--accent btn--block" href="${enquire}">Enquire about this resort ${ICON.arrow}</a>
              ${linked ? `<a class="btn btn--outline btn--block" href="destination.html?id=${linked.id}">Explore ${esc(linked.name)}</a>` : ''}
            </div>
          </aside>
        </div>
      </section>

      <section class="section section--white" aria-labelledby="exp-title">
        <div class="container">
          <div class="section-head reveal"><div><p class="eyebrow">Signature experiences</p><h2 class="h2" id="exp-title">What makes it special</h2></div></div>
          <ul class="experiences">${r.experiences.map((x, i) => `<li class="reveal" style="--stagger:${i}">${ICON.sparkle}<span>${esc(x)}</span></li>`).join('')}</ul>
        </div>
      </section>

      <section class="section" aria-labelledby="gallery-title">
        <div class="container">
          <div class="section-head reveal"><div><p class="eyebrow">Gallery</p><h2 class="h2" id="gallery-title">Inside ${esc(r.name)}</h2></div><p class="lead">Tap any photo to open it full screen.</p></div>
          <div data-gallery>${galleryHTML(gallery, 'gallery--5')}</div>
        </div>
      </section>

      <section class="section section--tight" id="resort-video" aria-labelledby="video-title">
        <div class="container">
          <div class="section-head reveal"><div><p class="eyebrow">The film</p><h2 class="h2" id="video-title">${esc(r.name)} in motion</h2></div></div>
          <div class="video-feature reveal" data-resort-video>
            ${mediaHTML({ src: imgPath.resort(r), alt: '', name: r.name, sub: r.location, sizes: '100vw' })}
            <!-- VIDEO: add videos/resorts/${r.id}.mp4 — it plays muted and loops while on screen -->
            <video muted loop playsinline preload="none" poster="${imgPath.resort(r)}" aria-label="Video of ${esc(r.name)}"><source src="${r.video}" type="video/mp4"></video>
            <span class="badge video-soon" data-video-soon hidden>Video coming soon</span>
            <div class="video-controls" data-video-controls>
              <button type="button" class="icon-btn" data-video-toggle aria-label="Play video">${ICON.play}</button>
              <button type="button" class="icon-btn" data-video-sound aria-label="Turn sound on" aria-pressed="false">${ICON.muted}</button>
            </div>
          </div>
        </div>
      </section>

      ${linked ? `
      <section class="section section--white" aria-labelledby="linked-title">
        <div class="container">
          <div class="section-head reveal"><div><p class="eyebrow">${r.destination.relation === 'in' ? 'Where it is' : 'Pair it with'}</p><h2 class="h2" id="linked-title">${r.destination.relation === 'in' ? `Explore ${esc(linked.name)}` : `Combine your stay with ${esc(linked.name)}`}</h2></div></div>
          <article class="pair-card reveal">
            ${mediaHTML({ src: imgPath.dest(linked), alt: linked.alt.hero, name: linked.name, sub: linked.country, sizes: '(min-width: 640px) 240px, 100vw', w: 800, h: 500 })}
            <div>
              <p class="card-kicker">${esc(linked.country)} · ${esc(linked.region)}</p>
              <h3><a class="card-link" href="destination.html?id=${linked.id}">${esc(linked.name)}</a></h3>
              <p>${esc(linked.short)}</p>
            </div>
          </article>
        </div>
      </section>` : ''}

      <section class="section" aria-labelledby="more-title">
        <div class="container">
          <div class="section-head reveal"><div><p class="eyebrow">More special resorts</p><h2 class="h2" id="more-title">You might also love</h2></div><a class="text-link" href="resorts.html">All resorts ${ICON.arrow}</a></div>
          <ul class="card-grid">${more.map((x, i) => `<li class="reveal" style="--stagger:${i}">${resortCardHTML(x)}</li>`).join('')}</ul>
        </div>
      </section>`;

    hydrate(main);
    initParallax();
    bindGallery($('[data-gallery]', main), gallery);

    // Resort film: autoplay muted while on screen (if allowed); controls for play/pause and sound.
    const box = $('[data-resort-video]', main);
    const video = $('video', box);
    const toggle = $('[data-video-toggle]', box);
    const sound = $('[data-video-sound]', box);
    const sync = () => {
      toggle.innerHTML = video.paused ? ICON.play : ICON.pause;
      toggle.setAttribute('aria-label', video.paused ? 'Play video' : 'Pause video');
      sound.innerHTML = video.muted ? ICON.muted : ICON.sound;
      sound.setAttribute('aria-pressed', String(!video.muted));
      sound.setAttribute('aria-label', video.muted ? 'Turn sound on' : 'Turn sound off');
    };
    setupAutoVideo(video, { onFail: () => { $('[data-video-soon]', box).hidden = false; $('[data-video-controls]', box).hidden = true; } });
    toggle.addEventListener('click', () => {
      if (video.paused) { delete video.dataset.userPaused; video.play().catch(() => {}); } else { video.dataset.userPaused = '1'; video.pause(); }
    });
    sound.addEventListener('click', () => { video.muted = !video.muted; sync(); });
    ['play', 'pause', 'volumechange'].forEach((ev) => video.addEventListener(ev, sync));
    sync();
  }

  /* ======================================================================
     PAGE: CONTACT (validation + Supabase + mailto fallback)
     ====================================================================== */
  function pageContact() {
    const form = $('[data-contact-form]');
    if (!form) return;
    form.noValidate = true;
    const supabaseReady = /^https:\/\/.+/.test(SUPABASE_URL) && SUPABASE_ANON_KEY && !SUPABASE_ANON_KEY.startsWith('YOUR_');
    const fields = {
      name: $('#cf-name'),
      email: $('#cf-email'),
      subject: $('#cf-subject'),
      destination: $('#cf-destination'),
      message: $('#cf-message')
    };
    const counter = $('[data-char-count]');
    const submit = $('button[type="submit"]', form);
    const status = $('[data-form-status]');
    const MAX = Number(fields.message.getAttribute('maxlength')) || 1000;

    // Destination suggestions from data.js
    const datalist = $('#cf-destinations');
    if (datalist) {
      datalist.innerHTML = [
        ...D.destinations.map((d) => `${d.name}, ${d.country}`),
        ...D.resorts.map((r) => `${r.name}, ${r.location}`)
      ].map((v) => `<option value="${esc(v)}"></option>`).join('');
    }

    // Pre-fill from links like contact.html?subject=Trip%20planning&destination=Kyoto%2C%20Japan
    const subj = params.get('subject');
    if (subj && [...fields.subject.options].some((o) => o.value === subj)) fields.subject.value = subj;
    if (params.get('destination')) fields.destination.value = params.get('destination').slice(0, 120);

    const rules = {
      name: (v) => v.trim().length >= 2 || 'Please tell us your name.',
      email: (v) => isEmail(v) || 'Please enter a valid email address, like name@example.com.',
      subject: (v) => Boolean(v) || 'Please choose what your message is about.',
      destination: (v) => v.length <= 120 || 'Please keep this under 120 characters.',
      message: (v) => (v.trim().length >= 10 ? true : 'Please write a little more — at least 10 characters.')
    };

    const check = (key, show = true) => {
      const input = fields[key];
      const result = rules[key](input.value);
      const ok = result === true;
      const field = input.closest('.field');
      const msg = $(`#${input.id}-msg`);
      if (show) {
        field.classList.toggle('is-invalid', !ok);
        field.classList.toggle('is-valid', ok && input.value.trim() !== '');
        input.setAttribute('aria-invalid', String(!ok));
        if (msg) msg.textContent = ok ? '' : result;
      }
      return ok;
    };

    Object.keys(fields).forEach((key) => {
      const input = fields[key];
      input.addEventListener('blur', () => { if (input.value !== '' || input.dataset.touched) check(key); input.dataset.touched = '1'; });
      input.addEventListener('input', () => { if (input.closest('.field').classList.contains('is-invalid')) check(key); });
      input.addEventListener('change', () => check(key));
    });

    const updateCount = () => {
      const n = fields.message.value.length;
      counter.textContent = `${n} / ${MAX}`;
      counter.classList.toggle('is-near', n > MAX * 0.9);
    };
    fields.message.addEventListener('input', updateCount);
    updateCount();

    const mailtoHref = (data) => `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`[Travel Explorer] ${data.subject}${data.destination ? ` — ${data.destination}` : ''}`)}&body=${encodeURIComponent(`${data.message}\n\n— ${data.name} (${data.email})`)}`;

    const showSuccess = (data, viaEmail) => {
      const card = form.closest('.form-card');
      const first = esc(data.name.split(' ')[0]);
      card.innerHTML = viaEmail ? `
        <div class="form-success" tabindex="-1">
          <span class="success-icon">${ICON.mail}</span>
          <h2 class="h3">Your message is ready, ${first}</h2>
          <p>Tap the button below to send it from your email app — your message is already filled in. You can also write to us at <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>.</p>
          <a class="btn btn--accent btn--lg" href="${mailtoHref(data)}">Open email app ${ICON.arrow}</a>
        </div>` : `
        <div class="form-success" tabindex="-1">
          <span class="success-icon">${ICON.check}</span>
          <h2 class="h3">Message sent — thank you, ${first}!</h2>
          <p>We read every message and try to respond within a couple of days.</p>
          <a class="btn btn--dark" href="destinations.html">Keep exploring ${ICON.arrow}</a>
        </div>`;
      $('.form-success', card).focus();
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const results = Object.keys(fields).map((k) => check(k));
      const firstBad = Object.keys(fields).find((k, i) => !results[i]);
      if (firstBad) {
        fields[firstBad].focus();
        status.textContent = 'Please fix the highlighted fields and try again.';
        return;
      }
      const data = {
        name: fields.name.value.trim(),
        email: fields.email.value.trim(),
        subject: fields.subject.value,
        destination: fields.destination.value.trim() || null,
        message: fields.message.value.trim(),
        page_url: location.href.slice(0, 500)
      };

      if (!supabaseReady) {
        // Fallback: no database configured yet → hand over a ready-made mailto link.
        showSuccess(data, true);
        return;
      }

      submit.classList.add('is-loading');
      submit.disabled = true;
      $('.btn-label', submit).textContent = 'Sending…';
      submit.insertAdjacentHTML('afterbegin', '<span class="spinner" aria-hidden="true"></span>');
      status.textContent = 'Sending your message…';
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);
      try {
        const res = await fetch(`${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/messages`, {
          method: 'POST',
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal'
          },
          body: JSON.stringify(data),
          signal: controller.signal
        });
        if (!res.ok) throw new Error(`Supabase responded ${res.status}`);
        showSuccess(data, false);
        toast('Message sent — we’ll be in touch soon.');
      } catch (err) {
        console.warn('Contact form error:', err);
        submit.classList.remove('is-loading');
        submit.disabled = false;
        $('.spinner', submit)?.remove();
        $('.btn-label', submit).textContent = 'Send message';
        status.innerHTML = `Sorry — we couldn’t send that just now. Please try again, or <a href="${mailtoHref(data)}">send it by email instead</a>.`;
        toast('Message not sent — please try again.', ICON.info);
      } finally {
        clearTimeout(timeout);
      }
    });
  }

  /* ======================================================================
     BOOT
     ====================================================================== */
  initHeader();
  initNewsletter();
  updateSavedUI();

  document.addEventListener('click', (e) => {
    const saveBtn = e.target.closest('[data-save]');
    if (saveBtn) {
      e.preventDefault();
      const key = saveBtn.dataset.save;
      const on = saved.toggle(key);
      const item = saved.item(key);
      $$(`[data-save="${key}"]`).forEach((b) => { b.classList.remove('pop'); void b.offsetWidth; if (on) b.classList.add('pop'); });
      updateSavedUI(key);
      if (item) toast(on ? `Added ${esc(item.data.name)} to saved trips.` : `Removed ${esc(item.data.name)} from saved trips.`, on ? ICON.heartLine : ICON.check);
      return;
    }
    if (e.target.closest('[data-saved-open]')) drawer.open();
  });

  const pages = {
    home: pageHome,
    destinations: pageDestinations,
    destination: pageDestination,
    resorts: pageResorts,
    resort: pageResort,
    contact: pageContact
  };
  pages[PAGE]?.();
  if (!['destination', 'resort'].includes(PAGE)) initParallax();
  hydrate();
})();
