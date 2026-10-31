/* ==========================================================================
   Nova Cinema — shared behaviour (every page)
   Navigation, page transitions, reveals, image fallbacks, toasts, the
   trailer player and the box-office booking flow. Page scripts use the
   public API exposed at the bottom as `window.Nova`.
   ========================================================================== */
(() => {
  'use strict';

  const D = window.NOVA_DATA;
  const ROOT = document.body.dataset.root || '';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- Small helpers ---------- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const pad = (n) => String(n).padStart(2, '0');
  const esc = (str = '') => String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const store = {
    get(key, fallback) {
      try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable — the site still works */ }
    }
  };

  const movieById = (id) => D.movies.find((m) => m.id === id);
  const showingById = (id) => D.showtimes.find((s) => s.id === id);
  const byTime = (a, b) => a.time.localeCompare(b.time);

  /* ---------- Formatting ---------- */
  function fmtTime(hhmm) {
    const [h, m] = hhmm.split(':').map(Number);
    return `${h % 12 || 12}:${pad(m)} ${h >= 12 ? 'PM' : 'AM'}`;
  }
  function fmtClock(date) {
    return fmtTime(`${pad(date.getHours())}:${pad(date.getMinutes())}`);
  }
  const fmtRuntime = (min) => `${Math.floor(min / 60)}h ${pad(min % 60)}m`;
  const money = (n) => `$${n.toFixed(2)}`;
  const dayKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parseDay = (key) => { const [y, m, d] = key.split('-').map(Number); return new Date(y, m - 1, d); };
  const fmtDate = (d, opts = { weekday: 'short', month: 'short', day: 'numeric' }) => d.toLocaleDateString('en-US', opts);

  /* ---------- Showtime logic ---------- */
  function startOf(showing, day = new Date()) {
    const [h, m] = showing.time.split(':').map(Number);
    const d = new Date(day);
    d.setHours(h, m, 0, 0);
    return d;
  }

  function showingStatus(showing, now = new Date()) {
    const start = startOf(showing, now);
    const end = new Date(start.getTime() + movieById(showing.movie).runtime * 60000);
    if (now >= end) return { key: 'departed', label: 'Departed', start, end, progress: 1 };
    if (now >= start) return { key: 'playing', label: 'Now playing', start, end, progress: (now - start) / (end - start) };
    if (start - now <= 60 * 60000) return { key: 'boarding', label: 'Boarding', start, end, progress: 0 };
    return { key: 'scheduled', label: 'Scheduled', start, end, progress: 0 };
  }

  function nextShowing(now = new Date()) {
    const sorted = [...D.showtimes].sort(byTime);
    const today = sorted.find((s) => startOf(s, now) > now);
    if (today) return { showing: today, start: startOf(today, now), tomorrow: false };
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return { showing: sorted[0], start: startOf(sorted[0], tomorrow), tomorrow: true };
  }

  /* ---------- YouTube + images ---------- */
  const yt = {
    thumb: (id, quality = 'maxresdefault') => `https://i.ytimg.com/vi/${id}/${quality}.jpg`,
    watch: (id) => `https://www.youtube.com/watch?v=${id}`,
    embed: (id) => `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`,
    search: (q) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`
  };

  // Your own photo first, then the trailer thumbnail, then the CSS poster art.
  function movieSources(m) {
    const list = [];
    if (m.image) list.push(`${ROOT}images/${m.image}`);
    if (m.trailerId) list.push(yt.thumb(m.trailerId), yt.thumb(m.trailerId, 'hqdefault'));
    return list;
  }

  function movieImg(m, { alt, eager = false } = {}) {
    const srcs = movieSources(m);
    if (!srcs.length) return '';
    const altText = alt ?? m.imageAlt ?? m.title;
    return `<img src="${srcs[0]}" data-fallback="${srcs.slice(1).join('|')}" alt="${esc(altText)}" loading="${eager ? 'eager' : 'lazy'}" decoding="async">`;
  }

  function nextFallback(img) {
    const list = (img.dataset.fallback || '').split('|').filter(Boolean);
    if (list.length) {
      img.dataset.fallback = list.slice(1).join('|');
      img.src = list[0];
    } else {
      img.hidden = true; // reveal the designed art behind it
    }
  }

  function watchImage(img) {
    if (img.dataset.watched) return;
    img.dataset.watched = '1';
    const onLoad = () => {
      // YouTube serves a tiny grey placeholder when a size doesn't exist.
      if (img.src.includes('ytimg.com') && img.naturalWidth <= 120) nextFallback(img);
      else img.classList.add('is-loaded');
    };
    img.addEventListener('load', onLoad);
    img.addEventListener('error', () => nextFallback(img));
    if (img.complete) {
      if (img.naturalWidth === 0) nextFallback(img);
      else onLoad();
    }
  }

  const ICONS = {
    play: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg>'
  };

  /** Theme-song action: embedded video when we have one, otherwise a YouTube search. */
  function songAction(m, cls = 'btn btn--outline btn--sm', label = m.themeSong?.title) {
    const song = m.themeSong;
    if (!song) return '';
    if (song.videoId) {
      return `<button type="button" class="${cls}" data-video="${song.videoId}" data-title="${esc(`${song.title} — ${song.artist}`)}" data-kicker="${esc(`Theme song · ${m.title}`)}" aria-label="Play ${esc(song.title)} by ${esc(song.artist)}"><span class="equalizer" aria-hidden="true"><i></i><i></i><i></i></span>${esc(label)}</button>`;
    }
    return `<a class="${cls}" href="${yt.search(`${song.title} ${song.artist} ${m.title}`)}" target="_blank" rel="noopener">♪ ${esc(label)} <span aria-hidden="true">↗</span><span class="sr-only">(${esc(song.title)} by ${esc(song.artist)} — opens YouTube in a new tab)</span></a>`;
  }

  /** One film card, shared by the home slider and the movies grid. */
  function movieCardHTML(m, { withId = false, actions = '' } = {}) {
    const isNow = m.status === 'now';
    const shows = D.showtimes.filter((s) => s.movie === m.id).length;
    const song = m.themeSong;
    return `
      <article class="movie-card spotlight${isNow ? '' : ' movie-card--vault'}"${withId ? ` id="movie-${m.id}"` : ''} style="--accent:${m.accent}" data-tilt>
        <div class="movie-media poster-art" data-icon="${m.icon}">
          ${movieImg(m)}
          <span class="media-shade"></span>
          <div class="movie-badges">
            ${isNow
              ? `<span class="badge badge--accent">Now showing</span><span class="badge badge--live">${shows} show${shows > 1 ? 's' : ''} today</span>`
              : '<span class="badge">💎 Treasure vault</span>'}
          </div>
          ${m.trailerId ? `<button type="button" class="play-btn" data-trailer="${m.id}" aria-label="Play trailer: ${esc(m.title)}">${ICONS.play}</button>` : ''}
        </div>
        <div class="movie-body">
          <p class="movie-meta"><span>${m.year}</span>${m.runtime ? `<span>⏱ ${fmtRuntime(m.runtime)}</span>` : ''}${m.director ? `<span>🎬 ${esc(m.director)}</span>` : ''}</p>
          <h3 class="movie-title">${esc(m.title)}</h3>
          <p class="movie-tagline">${esc(m.tagline)}</p>
          <p class="movie-synopsis">${esc(m.synopsis)}</p>
          <ul class="tag-list" aria-label="Genres">${m.genres.map((g) => `<li>${g}</li>`).join('')}</ul>
          ${song ? `<p class="movie-song"><span class="note" aria-hidden="true">♪</span><span>${esc(song.title)} <em>— ${esc(song.artist)}</em></span></p>` : ''}
          <div class="movie-actions">${actions}</div>
        </div>
      </article>`;
  }

  /* ---------- Reveal on scroll + counters ---------- */
  const revealObserver = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        el.classList.add('is-visible');
        revealObserver.unobserve(el);
        // The entrance is one-shot: hand the element back to its own hover transforms afterwards.
        const delay = (parseFloat(getComputedStyle(el).transitionDelay) || 0) * 1000;
        setTimeout(() => el.classList.remove('reveal', 'reveal--left', 'reveal--right', 'reveal--zoom', 'is-visible'), 1100 + delay);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' })
    : null;

  function animateCount(el) {
    const target = parseFloat(el.dataset.count);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const format = (n) => Math.round(n).toLocaleString('en-US');
    if (reduceMotion) { el.textContent = prefix + format(target) + suffix; return; }
    const duration = Number(el.dataset.duration) || 1800;
    const t0 = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - t0) / duration);
      el.textContent = prefix + format(target * (1 - Math.pow(1 - p, 4))) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  const countObserver = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCount(entry.target);
        countObserver.unobserve(entry.target);
      });
    }, { threshold: 0.6 })
    : null;

  /* ---------- Pointer effects: spotlight + 3D tilt ---------- */
  function bindPointerFx(el) {
    if (el.dataset.fxBound) return;
    el.dataset.fxBound = '1';
    const tilt = el.hasAttribute('data-tilt') && finePointer && !reduceMotion;
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      el.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
      el.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
      if (tilt) {
        el.classList.add('is-tilting');
        el.style.setProperty('--ry', `${((x - 0.5) * 9).toFixed(2)}deg`);
        el.style.setProperty('--rx', `${((0.5 - y) * 9).toFixed(2)}deg`);
      }
    });
    el.addEventListener('pointerleave', () => {
      el.classList.remove('is-tilting');
      el.style.setProperty('--rx', '0deg');
      el.style.setProperty('--ry', '0deg');
    });
  }

  /** Wire up behaviour for freshly rendered markup. */
  function hydrate(ctx = document) {
    $$('img[data-fallback]', ctx).forEach(watchImage);
    $$('.reveal:not(.is-visible)', ctx).forEach((el) => (revealObserver ? revealObserver.observe(el) : el.classList.add('is-visible')));
    $$('[data-count]', ctx).forEach((el) => (countObserver ? countObserver.observe(el) : animateCount(el)));
    $$('[data-tilt], .spotlight', ctx).forEach(bindPointerFx);
  }

  /** Pill toggle group with a sliding indicator. Calls onChange(value). */
  function initSegmented(group, onChange, attr = 'value') {
    if (!group) return { set() {} };
    const indicator = $('.segmented-indicator', group);
    const buttons = $$('button', group);
    const place = () => {
      const active = buttons.find((b) => b.getAttribute('aria-pressed') === 'true') || buttons[0];
      indicator?.style.setProperty('--x', `${active.offsetLeft}px`);
      indicator?.style.setProperty('--w', `${active.offsetWidth}px`);
    };
    const set = (value, notify = true) => {
      buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset[attr] === value)));
      place();
      if (notify) onChange(value);
    };
    group.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (btn && btn.getAttribute('aria-pressed') !== 'true') set(btn.dataset[attr]);
    });
    window.addEventListener('resize', place);
    document.fonts?.ready.then(place);
    place();
    return { set };
  }

  /* ---------- Toasts ---------- */
  let toastHost;
  function toast(message, { icon = '⚓', type = 'info', timeout = 3600 } = {}) {
    if (!toastHost) {
      toastHost = document.createElement('div');
      toastHost.className = 'toasts';
      toastHost.setAttribute('role', 'status');
      toastHost.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastHost);
    }
    // Keep toasts visible above an open modal (top layer).
    const openModal = $('dialog[open]');
    const host = openModal || document.body;
    if (toastHost.parentElement !== host) host.appendChild(toastHost);

    const el = document.createElement('div');
    el.className = `toast toast--${type}`;
    el.innerHTML = `<span class="toast-icon" aria-hidden="true">${icon}</span><span>${message}</span>`;
    toastHost.appendChild(el);
    while (toastHost.children.length > 3) toastHost.firstElementChild.remove();
    setTimeout(() => {
      el.classList.add('is-leaving');
      setTimeout(() => el.remove(), reduceMotion ? 0 : 350);
    }, timeout);
  }

  /* ---------- Confetti ---------- */
  function confetti(x = innerWidth / 2, y = innerHeight / 2, emojis = ['👒', '⭐', '🏴‍☠️', '🍖', '✨', '🎉', '🍊']) {
    if (reduceMotion || !Element.prototype.animate) return;
    const host = $('dialog[open]') || document.body;
    for (let i = 0; i < 38; i++) {
      const s = document.createElement('span');
      s.className = 'confetti';
      s.textContent = emojis[i % emojis.length];
      s.style.left = `${x}px`;
      s.style.top = `${y}px`;
      s.style.margin = '-.5em 0 0 -.5em';
      host.appendChild(s);
      const angle = Math.random() * Math.PI * 2;
      const dist = 120 + Math.random() * 280;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist - 140;
      s.animate([
        { transform: 'translate(0, 0) scale(.3)', opacity: 1 },
        { transform: `translate(${dx}px, ${dy}px) rotate(${Math.random() * 540 - 270}deg) scale(1)`, opacity: 1, offset: 0.65 },
        { transform: `translate(${dx * 1.1}px, ${dy + 220}px) rotate(${Math.random() * 720}deg) scale(.7)`, opacity: 0 }
      ], { duration: 1500 + Math.random() * 800, easing: 'cubic-bezier(.2,.8,.2,1)' }).onfinish = () => s.remove();
    }
  }

  /* ---------- Calendar (.ics) downloads ---------- */
  function downloadICS({ title, start, end, description = '', filename = 'nova-cinema.ics' }) {
    const stamp = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const clean = (s) => String(s).replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n');
    const ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Nova Cinema//One Piece Day//EN', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT',
      `UID:${Date.now()}-${Math.random().toString(36).slice(2)}@novacinema`,
      `DTSTAMP:${stamp(new Date())}`,
      `DTSTART:${stamp(start)}`,
      `DTEND:${stamp(end)}`,
      `SUMMARY:${clean(title)}`,
      `LOCATION:${clean(`Nova Cinema, ${D.contact.address}`)}`,
      `DESCRIPTION:${clean(description)}`,
      'END:VEVENT', 'END:VCALENDAR'
    ].join('\r\n');
    const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    toast('Calendar invite downloaded — see you at the docks!', { icon: '📅', type: 'success' });
  }

  /* ---------- Snack cart (shared with the booking flow) ---------- */
  const cart = {
    get: () => store.get('nova-cart', {}),
    set(items) {
      const clean = Object.fromEntries(Object.entries(items).filter(([, q]) => q > 0));
      store.set('nova-cart', clean);
      document.dispatchEvent(new CustomEvent('nova:cart', { detail: clean }));
    },
    add(id) { const items = cart.get(); items[id] = (items[id] || 0) + 1; cart.set(items); },
    count: () => Object.values(cart.get()).reduce((a, b) => a + b, 0),
    total: (items = cart.get()) => Object.entries(items).reduce((sum, [id, q]) => sum + (D.snacks.find((s) => s.id === id)?.price || 0) * q, 0)
  };

  /* ---------- Dialog helpers (native <dialog> for focus + Esc handling) ---------- */
  function getDialog(id, labelId, extraClass = '') {
    let d = document.getElementById(id);
    if (d) return d;
    d = document.createElement('dialog');
    d.id = id;
    d.className = `modal ${extraClass}`.trim();
    d.setAttribute('aria-labelledby', labelId);
    document.body.appendChild(d);
    d.addEventListener('click', (e) => {
      if (e.target === d || e.target.closest('[data-close]')) closeDialog(d);
    });
    d.addEventListener('cancel', (e) => { e.preventDefault(); closeDialog(d); });
    return d;
  }

  function openDialog(d) {
    d._returnFocus = document.activeElement;
    if (!d.open) d.showModal();
    document.documentElement.classList.add('modal-open');
    requestAnimationFrame(() => d.classList.add('is-open'));
  }

  function closeDialog(d) {
    if (!d.open || d.classList.contains('is-closing')) return;
    d.classList.remove('is-open');
    d.classList.add('is-closing');
    setTimeout(() => {
      d.classList.remove('is-closing');
      d.close();
      if (!$('dialog[open]')) document.documentElement.classList.remove('modal-open');
      d.dispatchEvent(new Event('nova:closed'));
      if (d._returnFocus && document.contains(d._returnFocus)) d._returnFocus.focus({ preventScroll: true });
    }, reduceMotion ? 0 : 260);
  }

  /* ---------- Video player (trailers + theme songs) ---------- */
  function openVideo({ id, title, kicker = 'Now playing' }) {
    if (!id) return;
    const d = getDialog('video-modal', 'video-title', 'modal--video');
    d.innerHTML = `
      <div class="modal-panel">
        <header class="modal-head">
          <div><p class="eyebrow">${esc(kicker)}</p><h2 id="video-title">${esc(title)}</h2></div>
          <button type="button" class="modal-close" data-close aria-label="Close video">×</button>
        </header>
        <div class="video-frame">
          <div class="video-loading">Loading the reel…</div>
          <iframe src="${yt.embed(id)}" title="${esc(title)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>
        </div>
        <p class="video-note">Video not playing? Some uploads can only be watched on YouTube itself — <a href="${yt.watch(id)}" target="_blank" rel="noopener">open it on YouTube ↗</a></p>
      </div>`;
    d.addEventListener('nova:closed', () => { d.innerHTML = ''; }, { once: true });
    openDialog(d);
  }

  function openTrailer(movieId) {
    const m = movieById(movieId);
    if (!m) return;
    if (m.trailerId) openVideo({ id: m.trailerId, title: m.title, kicker: `Official trailer · ${m.year}` });
    else window.open(yt.search(`${m.title} trailer`), '_blank', 'noopener');
  }

  /* ---------- Tickets ---------- */
  const tickets = {
    all: () => store.get('nova-tickets', []),
    save(list) { store.set('nova-tickets', list); document.dispatchEvent(new CustomEvent('nova:tickets')); },
    add(t) { tickets.save([t, ...tickets.all()]); },
    remove(code) { tickets.save(tickets.all().filter((t) => t.code !== code)); }
  };

  function barcode(code) {
    let bars = '<i style="--w:2px"></i><i style="--w:1px"></i>';
    for (const ch of code) {
      const c = ch.charCodeAt(0);
      bars += `<i style="--w:${(c & 3) + 1}px"></i><i style="--w:${((c >> 2) & 1) + 1}px;opacity:0"></i><i style="--w:${((c >> 3) & 3) + 1}px"></i>`;
    }
    return `${bars}<i style="--w:1px"></i><i style="--w:2px"></i>`;
  }

  function ticketEvent(t) {
    const m = movieById(t.movie);
    const start = startOf({ time: t.time }, parseDay(t.date));
    return {
      title: `${m.title} — Nova Cinema`,
      start,
      end: new Date(start.getTime() + (m.runtime || 120) * 60000),
      description: `${D.halls[t.hall].name} (${D.halls[t.hall].nickname}) · Seats ${t.seats.join(', ')} · Booking ${t.code}`,
      filename: `nova-${t.code}.ics`
    };
  }

  function ticketHTML(t, { isNew = false, actions = '' } = {}) {
    const m = movieById(t.movie);
    const hall = D.halls[t.hall];
    return `
      <article class="ticket${isNew ? ' ticket--new' : ''}" style="--accent:${m.accent}" aria-label="Ticket for ${esc(m.title)}">
        <div class="ticket-main">
          <div class="ticket-brand"><span>Nova Cinema · Admit ${t.seats.length}</span><span aria-hidden="true">${m.icon}</span></div>
          <h3 class="ticket-title">${esc(m.title)}</h3>
          <dl class="ticket-facts">
            <div><dt>Date</dt><dd>${fmtDate(parseDay(t.date))}</dd></div>
            <div><dt>Time</dt><dd>${fmtTime(t.time)}</dd></div>
            <div><dt>Hall</dt><dd>${hall.name}</dd></div>
            <div><dt>Seats</dt><dd>${t.seats.join(', ')}</dd></div>
            <div><dt>Name</dt><dd>${esc(t.name)}</dd></div>
            <div><dt>Total</dt><dd>${money(t.total)}</dd></div>
          </dl>
          ${actions}
        </div>
        <div class="ticket-stub">
          <div class="barcode" aria-hidden="true">${barcode(t.code)}</div>
          <span class="ticket-code">${t.code}</span>
        </div>
      </article>`;
  }

  /* ---------- Booking flow ---------- */
  const booking = (() => {
    const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const RECLINER_ROWS = ['G', 'H'];
    const PER_ROW = 12;
    const MAX_SEATS = 10;
    const DAYS = 7;
    let dialog;
    let state;

    const dateFor = (offset) => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + offset); return d; };
    const seatPrice = (seat) => (RECLINER_ROWS.includes(seat[0]) ? D.prices.recliner : D.prices.standard);

    function bookable(showing, offset) {
      if (offset > 0) return true;
      const key = showingStatus(showing).key;
      return key === 'scheduled' || key === 'boarding';
    }

    // Deterministic "already sold" seats so a showing always looks the same.
    function takenSeats(seed) {
      let h = 2166136261;
      for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
      let a = h >>> 0;
      const rand = () => {
        a = (a + 0x6D2B79F5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
      const taken = new Set();
      ROWS.forEach((r) => { for (let n = 1; n <= PER_ROW; n++) if (rand() < 0.3) taken.add(r + n); });
      return taken;
    }

    function totals() {
      const tickets = state.seats.reduce((sum, s) => sum + seatPrice(s), 0);
      const discount = state.seats.length >= D.prices.groupSize ? tickets * D.prices.groupDiscount : 0;
      const snacks = cart.total(state.snacks);
      return { tickets, discount, snacks, total: tickets - discount + snacks };
    }

    function ensureDialog() {
      if (dialog) return;
      dialog = getDialog('booking-modal', 'booking-title', 'modal--booking');
      dialog.innerHTML = `
        <div class="modal-panel">
          <header class="modal-head">
            <div><p class="eyebrow">Nova box office</p><h2 id="booking-title">Book your voyage</h2></div>
            <button type="button" class="modal-close" data-close aria-label="Close booking">×</button>
          </header>
          <ol class="steps" aria-label="Booking progress">
            <li><span class="step-num"></span><span class="step-name">Showing</span></li>
            <li><span class="step-num"></span><span class="step-name">Seats</span></li>
            <li><span class="step-num"></span><span class="step-name">Galley &amp; details</span></li>
            <li><span class="step-num"></span><span class="step-name">Ticket</span></li>
          </ol>
          <div class="booking-body" data-booking-body></div>
          <footer class="booking-foot" data-booking-foot></footer>
        </div>`;
      dialog.addEventListener('click', onClick);
      dialog.addEventListener('keydown', onKeydown);
    }

    function open({ movie, showing } = {}) {
      ensureDialog();
      const profile = store.get('nova-profile', {});
      state = {
        step: 1,
        offset: 0,
        showingId: null,
        seats: [],
        snacks: { ...cart.get() },
        filterMovie: movie && D.showtimes.some((s) => s.movie === movie) ? movie : null,
        name: profile.name || '',
        email: profile.email || ''
      };
      const s = showing && showingById(showing);
      if (s) {
        state.showingId = s.id;
        state.step = 2;
        if (!bookable(s, 0)) {
          state.offset = 1;
          setTimeout(() => toast("Today's showing has already set sail — we've opened tomorrow's instead.", { icon: '⛵' }), 400);
        }
      }
      render();
      openDialog(dialog);
    }

    function render() {
      $$('.steps li', dialog).forEach((li, i) => {
        li.classList.toggle('is-done', i + 1 < state.step);
        li.classList.toggle('is-current', i + 1 === state.step);
        if (i + 1 === state.step) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
      });
      const body = $('[data-booking-body]', dialog);
      const foot = $('[data-booking-foot]', dialog);
      const views = [null, stepShowing, stepSeats, stepDetails, stepTicket];
      const view = views[state.step]();
      body.innerHTML = view.body;
      foot.innerHTML = view.foot;
      foot.hidden = !view.foot;
      hydrate(body);
      $('.modal-panel', dialog).scrollTop = 0;
    }

    /* Step 1 — choose date + showing */
    function stepShowing() {
      const dates = Array.from({ length: DAYS }, (_, i) => dateFor(i)).map((d, i) => `
        <button type="button" class="date-chip" role="radio" aria-checked="${i === state.offset}" tabindex="${i === state.offset ? 0 : -1}" data-offset="${i}">
          <small>${i === 0 ? 'Today' : fmtDate(d, { weekday: 'short' })}</small>
          <strong>${d.getDate()}</strong>
          <small>${fmtDate(d, { month: 'short' })}</small>
        </button>`).join('');

      const list = D.showtimes.filter((s) => !state.filterMovie || s.movie === state.filterMovie).sort(byTime);
      const anyOpen = list.some((s) => bookable(s, state.offset));
      const options = list.map((s) => {
        const m = movieById(s.movie);
        const hall = D.halls[s.hall];
        const st = state.offset === 0 ? showingStatus(s) : { key: 'scheduled', label: 'On sale' };
        const disabled = !bookable(s, state.offset);
        return `
          <li>
            <button type="button" class="showing-option" aria-pressed="${state.showingId === s.id}" data-showing="${s.id}" style="--accent:${m.accent}" ${disabled ? 'disabled' : ''}>
              <span class="thumb poster-art" data-icon="${m.icon}" style="--accent:${m.accent}">${movieImg(m, { alt: '' })}</span>
              <span><strong>${esc(m.title)}</strong><small>${hall.name} · ${hall.nickname} · ${fmtRuntime(m.runtime)}</small></span>
              <span class="showing-time">${fmtTime(s.time)}<span class="status status--${st.key}">${st.label}</span></span>
            </button>
          </li>`;
      }).join('');

      const filterNote = state.filterMovie
        ? `<p class="filter-note">Showing <strong>${esc(movieById(state.filterMovie).title)}</strong> only · <button type="button" class="text-btn" data-action="all-films">Show every film</button></p>`
        : '';
      const sailed = !anyOpen ? `<p class="filter-note">⛵ Today's voyages have all set sail — pick another day above.</p>` : '';

      const chosen = state.showingId && showingById(state.showingId);
      return {
        body: `
          <p class="booking-label" id="date-label">Pick a day</p>
          <div class="date-strip" role="radiogroup" aria-labelledby="date-label">${dates}</div>
          <p class="booking-label">Pick a showing</p>
          ${filterNote}${sailed}
          <ul class="showing-list">${options}</ul>`,
        foot: `
          <p class="summary">${chosen ? `<strong>${esc(movieById(chosen.movie).short)}</strong> · ${fmtTime(chosen.time)} · ${fmtDate(dateFor(state.offset))}` : 'Choose a showing to continue'}</p>
          <div class="actions"><button type="button" class="btn btn--gold" data-action="next" ${chosen ? '' : 'disabled'}>Choose seats →</button></div>`
      };
    }

    /* Step 2 — seat map */
    function stepSeats() {
      const s = showingById(state.showingId);
      const m = movieById(s.movie);
      const taken = takenSeats(`${dayKey(dateFor(state.offset))}-${s.id}`);
      const rows = ROWS.map((r) => {
        const recliner = RECLINER_ROWS.includes(r);
        let seats = '';
        for (let n = 1; n <= PER_ROW; n++) {
          const id = r + n;
          const isTaken = taken.has(id);
          const picked = state.seats.includes(id);
          if (n === 4 || n === 10) seats += '<span class="aisle" aria-hidden="true"></span>';
          seats += `<button type="button" class="seat${recliner ? ' seat--recliner' : ''}" data-seat="${id}" aria-pressed="${picked}" aria-label="Row ${r}, seat ${n}, ${recliner ? 'recliner' : 'standard'}, ${isTaken ? 'taken' : money(seatPrice(id))}" ${isTaken ? 'disabled' : ''}></button>`;
        }
        return `<div class="seat-row${recliner && r === RECLINER_ROWS[0] ? ' seat-row--recliner' : ''}"><span class="row-label" aria-hidden="true">${r}</span>${seats}<span class="row-label" aria-hidden="true">${r}</span></div>`;
      }).join('');

      return {
        body: `
          <p class="booking-label">${esc(m.title)} · ${D.halls[s.hall].name} · ${fmtTime(s.time)} · ${fmtDate(dateFor(state.offset))}</p>
          <div class="seat-stage">
            <div class="screen-arc" aria-hidden="true">SCREEN</div>
            <div class="seat-map" role="group" aria-label="Seat map — choose up to ${MAX_SEATS} seats">${rows}</div>
          </div>
          <ul class="seat-legend">
            <li><span class="seat" aria-hidden="true"></span> Standard ${money(D.prices.standard)}</li>
            <li><span class="seat seat--recliner" aria-hidden="true"></span> Sunny recliner ${money(D.prices.recliner)}</li>
            <li><span class="seat is-demo-picked" aria-hidden="true"></span> Your pick</li>
            <li><span class="seat is-demo-taken" aria-hidden="true"></span> Taken</li>
          </ul>`,
        foot: seatFoot()
      };
    }

    function seatFoot() {
      const { tickets } = totals();
      return `
        <p class="summary">${state.seats.length ? `<strong>${state.seats.length} seat${state.seats.length > 1 ? 's' : ''}</strong> · ${state.seats.join(', ')}` : 'Tap seats to select them'}</p>
        <span class="total">${money(tickets)}</span>
        <div class="actions">
          <button type="button" class="btn btn--ghost" data-action="back">← Back</button>
          <button type="button" class="btn btn--gold" data-action="next" ${state.seats.length ? '' : 'disabled'}>Continue →</button>
        </div>`;
    }

    /* Step 3 — snacks, details, price */
    function stepDetails() {
      const snacks = D.snacks.map((sn) => {
        const q = state.snacks[sn.id] || 0;
        return `
          <li class="snack-row">
            <span class="emoji" aria-hidden="true">${sn.icon}</span>
            <span><strong>${esc(sn.name)}</strong><small>${money(sn.price)}</small></span>
            <span class="qty">
              <button type="button" data-snack="${sn.id}" data-delta="-1" aria-label="Remove one ${esc(sn.name)}" ${q ? '' : 'disabled'}>−</button>
              <output aria-live="polite" aria-label="${esc(sn.name)} quantity">${q}</output>
              <button type="button" data-snack="${sn.id}" data-delta="1" aria-label="Add one ${esc(sn.name)}">+</button>
            </span>
          </li>`;
      }).join('');

      return {
        body: `
          <div class="booking-grid">
            <div>
              <p class="booking-label">The galley (optional)</p>
              <ul class="snack-picker">${snacks}</ul>
            </div>
            <div>
              <p class="booking-label">Who's sailing?</p>
              <form class="form-grid" data-details novalidate style="grid-template-columns:1fr">
                <div class="field">
                  <input type="text" id="bk-name" name="name" placeholder="Monkey D. Luffy" autocomplete="name" required value="${esc(state.name)}">
                  <label for="bk-name">Full name</label>
                  <p class="field-error" id="bk-name-error"></p>
                </div>
                <div class="field">
                  <input type="email" id="bk-email" name="email" placeholder="you@example.com" autocomplete="email" required value="${esc(state.email)}">
                  <label for="bk-email">Email for your tickets</label>
                  <p class="field-error" id="bk-email-error"></p>
                </div>
              </form>
              <p class="booking-label">Your voyage</p>
              <ul class="price-lines" data-price-lines>${priceLines()}</ul>
            </div>
          </div>`,
        foot: `
          <p class="summary"><strong>${state.seats.length} seat${state.seats.length > 1 ? 's' : ''}</strong> · ${state.seats.join(', ')}</p>
          <span class="total" data-total>${money(totals().total)}</span>
          <div class="actions">
            <button type="button" class="btn btn--ghost" data-action="back">← Back</button>
            <button type="button" class="btn btn--gold" data-action="confirm">Confirm booking</button>
          </div>`
      };
    }

    function priceLines() {
      const t = totals();
      const recl = state.seats.filter((s) => RECLINER_ROWS.includes(s[0])).length;
      const std = state.seats.length - recl;
      return `
        ${std ? `<li><span>${std} × Standard</span><span>${money(std * D.prices.standard)}</span></li>` : ''}
        ${recl ? `<li><span>${recl} × Sunny recliner</span><span>${money(recl * D.prices.recliner)}</span></li>` : ''}
        ${t.discount ? `<li class="discount"><span>Crew discount (${D.prices.groupDiscount * 100}%)</span><span>−${money(t.discount)}</span></li>` : ''}
        ${t.snacks ? `<li><span>Galley snacks</span><span>${money(t.snacks)}</span></li>` : ''}
        <li class="grand"><span>Total</span><span>${money(t.total)}</span></li>`;
    }

    /* Step 4 — the ticket */
    function stepTicket() {
      const t = state.ticket;
      return {
        body: `
          <div class="booking-done">
            <p class="eyebrow eyebrow--plain">Booking confirmed</p>
            <h3>You're on the crew list, ${esc(t.name.split(' ')[0])}! 🏴‍☠️</h3>
            <p class="text-muted">Show this ticket at the door. We've saved it under <strong>My Tickets</strong> on the schedule page.</p>
            ${ticketHTML(t, {
              isNew: true,
              actions: `<div class="ticket-actions">
                <button type="button" class="btn btn--sm btn--red" data-ics-ticket="${t.code}">📅 Add to calendar</button>
                <a class="btn btn--sm btn--ghost" style="color:#2a1a08;border-color:rgba(42,26,8,.3)" href="${ROOT}pages/schedule.html#my-tickets" data-close>My tickets</a>
              </div>`
            })}
          </div>`,
        foot: `<div class="actions"><button type="button" class="btn btn--gold" data-close>Done — set sail!</button></div>`
      };
    }

    function validateDetails() {
      const name = $('#bk-name', dialog);
      const email = $('#bk-email', dialog);
      const checks = [
        [name, name.value.trim().length >= 2, 'Please tell us your name (at least 2 letters).'],
        [email, /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim()), 'Please enter a valid email so we can send your tickets.']
      ];
      let firstBad = null;
      checks.forEach(([input, ok, msg]) => {
        const field = input.closest('.field');
        field.classList.toggle('is-invalid', !ok);
        field.classList.toggle('is-valid', ok);
        input.setAttribute('aria-invalid', String(!ok));
        input.setAttribute('aria-describedby', `${input.id}-error`);
        $(`#${input.id}-error`, dialog).textContent = ok ? '' : msg;
        if (!ok && !firstBad) firstBad = input;
      });
      if (firstBad) {
        firstBad.focus();
        firstBad.closest('.field').classList.add('shake');
        setTimeout(() => firstBad.closest('.field').classList.remove('shake'), 500);
        return false;
      }
      state.name = name.value.trim();
      state.email = email.value.trim();
      return true;
    }

    function confirm() {
      if (!validateDetails()) return;
      const s = showingById(state.showingId);
      const code = `NOVA-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      state.ticket = {
        code,
        movie: s.movie,
        showing: s.id,
        hall: s.hall,
        time: s.time,
        date: dayKey(dateFor(state.offset)),
        seats: [...state.seats].sort((a, b) => a[0].localeCompare(b[0]) || parseInt(a.slice(1)) - parseInt(b.slice(1))),
        snacks: state.snacks,
        total: totals().total,
        name: state.name,
        email: state.email,
        created: Date.now()
      };
      tickets.add(state.ticket);
      store.set('nova-profile', { name: state.name, email: state.email });
      cart.set({});
      state.step = 4;
      render();
      const r = $('.ticket', dialog)?.getBoundingClientRect();
      setTimeout(() => confetti(r ? r.left + r.width / 2 : innerWidth / 2, r ? r.top + 40 : innerHeight / 3), 250);
    }

    function onClick(e) {
      const t = e.target;
      const action = t.closest('[data-action]')?.dataset.action;

      const dateBtn = t.closest('[data-offset]');
      if (dateBtn) {
        state.offset = Number(dateBtn.dataset.offset);
        const chosen = state.showingId && showingById(state.showingId);
        if (chosen && !bookable(chosen, state.offset)) state.showingId = null;
        render();
        $(`[data-offset="${state.offset}"]`, dialog)?.focus();
        return;
      }
      const option = t.closest('.showing-option');
      if (option && !option.disabled) {
        state.showingId = option.dataset.showing;
        state.seats = [];
        render();
        $(`[data-showing="${state.showingId}"]`, dialog)?.focus();
        return;
      }
      const seat = t.closest('.seat[data-seat]');
      if (seat && !seat.disabled) {
        const id = seat.dataset.seat;
        if (state.seats.includes(id)) state.seats = state.seats.filter((x) => x !== id);
        else if (state.seats.length >= MAX_SEATS) { toast(`Max ${MAX_SEATS} seats per booking — bigger crews can message us on the Contact page.`, { icon: '🧭' }); return; }
        else state.seats.push(id);
        seat.setAttribute('aria-pressed', String(state.seats.includes(id)));
        $('[data-booking-foot]', dialog).innerHTML = seatFoot();
        return;
      }
      const snackBtn = t.closest('[data-snack]');
      if (snackBtn) {
        const id = snackBtn.dataset.snack;
        const q = Math.max(0, Math.min(20, (state.snacks[id] || 0) + Number(snackBtn.dataset.delta)));
        state.snacks = { ...state.snacks, [id]: q };
        const row = snackBtn.closest('.snack-row');
        $('output', row).textContent = q;
        $('[data-delta="-1"]', row).disabled = q === 0;
        $('[data-price-lines]', dialog).innerHTML = priceLines();
        $('[data-total]', dialog).textContent = money(totals().total);
        return;
      }
      const icsBtn = t.closest('[data-ics-ticket]');
      if (icsBtn) { downloadICS(ticketEvent(state.ticket)); return; }

      if (action === 'all-films') { state.filterMovie = null; render(); }
      if (action === 'next') { state.step += 1; render(); }
      if (action === 'back') { state.step -= 1; render(); }
      if (action === 'confirm') confirm();
    }

    // Arrow keys move through the date radio group.
    function onKeydown(e) {
      const chip = e.target.closest('.date-chip');
      if (!chip || !['ArrowRight', 'ArrowLeft'].includes(e.key)) return;
      e.preventDefault();
      const next = (state.offset + (e.key === 'ArrowRight' ? 1 : -1) + DAYS) % DAYS;
      $(`[data-offset="${next}"]`, dialog).click();
    }

    return { open };
  })();

  /* ---------- Header, mobile menu, scroll UI ---------- */
  function initHeader() {
    const header = $('.site-header');
    const toggle = $('.nav-toggle');
    if (!header) return;
    const outside = $$('main, footer');

    const setMenu = (open) => {
      document.body.classList.toggle('nav-open', open);
      toggle?.setAttribute('aria-expanded', String(open));
      toggle?.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      outside.forEach((el) => { el.inert = open; });
    };
    toggle?.addEventListener('click', () => setMenu(!document.body.classList.contains('nav-open')));
    $$('.main-nav a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && document.body.classList.contains('nav-open')) { setMenu(false); toggle?.focus(); }
    });
    window.matchMedia('(min-width: 960px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });

    let lastY = window.scrollY;
    const progress = $('.scroll-progress');
    const toTop = $('.to-top');
    let ticking = false;
    const onScroll = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - innerHeight;
      const p = max > 0 ? Math.min(1, y / max) : 0;
      header.classList.toggle('is-scrolled', y > 24);
      if (!document.body.classList.contains('nav-open') && !header.contains(document.activeElement)) {
        if (y > lastY + 8 && y > 420) header.classList.add('is-hidden');
        else if (y < lastY - 8) header.classList.remove('is-hidden');
      }
      lastY = y;
      progress?.style.setProperty('--progress', p.toFixed(4));
      toTop?.style.setProperty('--progress', p.toFixed(4));
      toTop?.classList.toggle('is-visible', y > 700);
      ticking = false;
    };
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
    onScroll();
    toTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));
  }

  /* ---------- Curtain page transitions ---------- */
  function initCurtain() {
    const curtain = $('.page-curtain');
    if (!curtain || reduceMotion) return;
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href]');
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if ((a.target && a.target !== '_self') || a.hasAttribute('download')) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || !/\.html?$|\/$/.test(url.pathname)) return;
      if (url.pathname === location.pathname) return; // same page (hash links scroll normally)
      e.preventDefault();
      curtain.classList.add('is-closing');
      setTimeout(() => { location.href = url.href; }, 520);
    });
    // Coming back via the back button restores the page from cache — reopen.
    window.addEventListener('pageshow', (e) => { if (e.persisted) curtain.classList.remove('is-closing'); });
  }

  /* ---------- Newsletter (footer) ---------- */
  function initNewsletter() {
    $$('[data-newsletter]').forEach((form) => {
      form.noValidate = true;
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = $('input[type="email"]', form);
        const msg = $('.form-msg', form);
        const value = input.value.trim();
        const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
        input.setAttribute('aria-invalid', String(!ok));
        msg.className = `form-msg ${ok ? 'is-success' : 'is-error'}`;
        if (!ok) {
          msg.textContent = value ? "That address doesn't look quite right." : 'Please enter your email address.';
          input.focus();
          return;
        }
        const list = store.get('nova-newsletter', []);
        if (!list.includes(value)) store.set('nova-newsletter', [...list, value]);
        msg.textContent = "You're on the crew list! New voyages will reach you first.";
        toast('Welcome to the crew — newsletter signup saved.', { icon: '🏴‍☠️', type: 'success' });
        form.reset();
      });
    });
  }

  /* ---------- Global click actions ---------- */
  function initActions() {
    document.addEventListener('click', (e) => {
      const book = e.target.closest('[data-book]');
      if (book) {
        e.preventDefault();
        booking.open({ movie: book.dataset.movie, showing: book.dataset.showing });
        return;
      }
      const trailer = e.target.closest('[data-trailer]');
      if (trailer) {
        e.preventDefault();
        openTrailer(trailer.dataset.trailer);
        return;
      }
      const video = e.target.closest('[data-video]');
      if (video) {
        e.preventDefault();
        openVideo({ id: video.dataset.video, title: video.dataset.title, kicker: video.dataset.kicker });
        return;
      }
      const ics = e.target.closest('[data-ics]');
      if (ics) {
        e.preventDefault();
        downloadICS({
          title: ics.dataset.title,
          start: new Date(ics.dataset.start),
          end: new Date(ics.dataset.end),
          description: ics.dataset.desc || '',
          filename: `${ics.dataset.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.ics`
        });
      }
    });
  }

  /* ---------- Easter egg: tap the logo five times ---------- */
  function initEasterEgg() {
    const mark = $('.site-header .brand-mark');
    if (!mark) return;
    let taps = 0;
    let timer;
    mark.closest('a').addEventListener('click', (e) => {
      taps += 1;
      clearTimeout(timer);
      timer = setTimeout(() => { taps = 0; }, 900);
      if (taps >= 5) {
        e.preventDefault();
        taps = 0;
        const r = mark.getBoundingClientRect();
        confetti(r.left + r.width / 2, r.top + r.height / 2, ['👒', '🍖', '🍖', '👒', '⭐']);
        toast('Gomu Gomu no… popcorn! You found the hidden treasure.', { icon: '👒' });
      }
    });
  }

  /* ---------- Boot ---------- */
  initHeader();
  initCurtain();
  initNewsletter();
  initActions();
  initEasterEgg();
  hydrate();

  window.Nova = {
    data: D, root: ROOT, reduceMotion, finePointer,
    $, $$, esc, store, pad,
    movieById, showingById, byTime,
    fmtTime, fmtClock, fmtRuntime, fmtDate, money, dayKey, parseDay,
    startOf, showingStatus, nextShowing,
    yt, ICONS, movieImg, movieSources, watchImage, hydrate, songAction, movieCardHTML, initSegmented,
    toast, confetti, downloadICS, cart, tickets, ticketHTML, ticketEvent,
    getDialog, openDialog, closeDialog, openVideo, openTrailer,
    openBooking: booking.open
  };
})();
