/* ==========================================================================
   Nova Cinema — home page
   Hero sky + parallax, next-voyage countdown, Now Showing slider,
   the trailer theater, wanted posters, galley snacks and reviews.
   ========================================================================== */
(() => {
  'use strict';
  const N = window.Nova;
  if (!N) return;
  const { $, $$, data: D, esc } = N;

  const CREW = [
    { name: 'Monkey D. Luffy', role: 'Captain', bounty: 3000000000, icon: '👒', tone: '#ff4458', film: 'Film: Red', snack: 'Meat-on-the-Bone ×4', seat: 'Front row. Standing on it.' },
    { name: 'Roronoa Zoro', role: 'Swordsman', bounty: 1111000000, icon: '⚔️', tone: '#3ee08f', film: 'Film: Z', snack: 'Anything with sake', seat: 'Got lost on the way to Hall 2' },
    { name: 'Nami', role: 'Navigator', bounty: 366000000, icon: '🍊', tone: '#ff9f43', film: 'Film: Gold', snack: "Nami's Tangerine Soda", seat: 'Whichever seat is cheapest' },
    { name: 'Usopp', role: 'Sniper', bounty: 500000000, icon: '🎯', tone: '#f4c95d', film: 'Strong World', snack: "Chopper's Cotton Candy", seat: 'Near the exit. Just in case.' },
    { name: 'Vinsmoke Sanji', role: 'Cook', bounty: 1032000000, icon: '🍳', tone: '#ffd166', film: 'Film: Red', snack: 'He brought his own, thanks', seat: 'Next to Nami, ideally' },
    { name: 'Tony Tony Chopper', role: 'Doctor', bounty: 1000, icon: '🦌', tone: '#f9a8d4', film: 'Adventures in Alabasta', snack: 'Cotton candy, obviously', seat: 'Booster cushion, row A' },
    { name: 'Nico Robin', role: 'Archaeologist', bounty: 930000000, icon: '🌸', tone: '#a78bfa', film: 'Stampede', snack: 'Black coffee', seat: 'Back row, reading during trailers' },
    { name: 'Franky', role: 'Shipwright', bounty: 394000000, icon: '🔧', tone: '#35c2e0', film: 'Stampede', snack: 'Cola. SUPER amounts of cola.', seat: 'A recliner he upgraded himself' },
    { name: 'Brook', role: 'Musician', bounty: 383000000, icon: '🎻', tone: '#e5e7eb', film: 'Film: Red', snack: 'A tall glass of milk', seat: 'Anywhere — he is just bones! Yohoho!' },
    { name: 'Jinbe', role: 'Helmsman', bounty: 1100000000, icon: '🌊', tone: '#60a5fa', film: 'Film: Z', snack: 'Green tea', seat: 'Aisle seat, steady as the sea' }
  ];
  const TILTS = [-3, 2, -1.5, 3, -2, 1.5, -2.5, 2.5, -1, 2];

  /* ---------- Sky: stars + rising sparkles ---------- */
  function initSky() {
    const stars = $('[data-stars]');
    if (stars) {
      const frag = document.createDocumentFragment();
      for (let i = 0; i < 110; i++) {
        const s = document.createElement('span');
        s.className = 'star';
        s.style.cssText = `left:${Math.random() * 100}%;top:${Math.random() * 100}%;--s:${(Math.random() * 2 + 0.8).toFixed(1)}px;--d:${(2 + Math.random() * 4).toFixed(1)}s;--delay:${(-Math.random() * 6).toFixed(1)}s`;
        frag.appendChild(s);
      }
      stars.appendChild(frag);
    }
    const sparkles = $('[data-sparkles]');
    if (sparkles && !N.reduceMotion) {
      for (let i = 0; i < 22; i++) {
        const s = document.createElement('span');
        s.className = 'sparkle';
        s.style.cssText = `left:${Math.random() * 100}%;--s:${(Math.random() * 3 + 2).toFixed(1)}px;--d:${(8 + Math.random() * 8).toFixed(1)}s;--delay:${(-Math.random() * 14).toFixed(1)}s;--x:${(Math.random() * 120 - 60).toFixed(0)}px`;
        sparkles.appendChild(s);
      }
    }
  }

  /* ---------- Parallax: layers follow the pointer, copy drifts on scroll ---------- */
  function initParallax() {
    const hero = $('.hero');
    if (!hero || N.reduceMotion) return;
    const layers = $$('[data-depth]', hero);
    const content = $('[data-hero-content]');
    let px = 0;
    let py = 0;
    let frame;
    const apply = () => {
      const y = Math.min(window.scrollY, innerHeight);
      layers.forEach((layer) => {
        const d = parseFloat(layer.dataset.depth);
        layer.style.translate = `${(px * d).toFixed(1)}px ${(py * d + y * d * 0.25).toFixed(1)}px`;
      });
      if (content) {
        content.style.translate = `0 ${(y * 0.22).toFixed(1)}px`;
        content.style.opacity = String(Math.max(0, 1 - y / (innerHeight * 0.85)));
      }
      frame = null;
    };
    const queue = () => { if (!frame) frame = requestAnimationFrame(apply); };
    if (N.finePointer) {
      hero.addEventListener('pointermove', (e) => {
        px = (e.clientX / innerWidth - 0.5) * -40;
        py = (e.clientY / innerHeight - 0.5) * -24;
        queue();
      });
    }
    window.addEventListener('scroll', queue, { passive: true });
  }

  /* ---------- Next voyage countdown ---------- */
  function initCountdown() {
    const box = $('[data-next-voyage]');
    if (!box) return;
    const el = { h: $('[data-h]', box), m: $('[data-m]', box), s: $('[data-s]', box), film: $('[data-nv-film]', box), label: $('[data-nv-label]', box), btn: $('[data-nv-book]', box) };
    let shown = '';
    const set = (node, value) => {
      const text = N.pad(value);
      if (node.textContent === text) return;
      node.textContent = text;
      node.classList.remove('tick');
      void node.offsetWidth;
      node.classList.add('tick');
    };
    const update = () => {
      const now = new Date();
      const next = N.nextShowing(now);
      const key = `${next.showing.id}-${next.tomorrow}`;
      if (key !== shown) {
        shown = key;
        const m = N.movieById(next.showing.movie);
        el.label.textContent = next.tomorrow ? "Tonight's voyages are done — first one tomorrow in" : 'Next voyage departs in';
        el.film.innerHTML = `${esc(m.title)} <span>· ${D.halls[next.showing.hall].name} · ${N.fmtTime(next.showing.time)}${next.tomorrow ? ' tomorrow' : ''}</span>`;
        el.btn.dataset.showing = next.showing.id;
      }
      const diff = Math.max(0, Math.floor((next.start - now) / 1000));
      set(el.h, Math.floor(diff / 3600));
      set(el.m, Math.floor((diff % 3600) / 60));
      set(el.s, diff % 60);
    };
    update();
    setInterval(update, 1000);
  }

  /* ---------- Now Showing slider ---------- */
  function initSlider() {
    const root = $('[data-slider-root]');
    const track = $('[data-now-showing]');
    if (!root || !track) return;
    const films = D.movies.filter((m) => m.status === 'now');
    track.innerHTML = films.map((m, i) => `
      <li class="reveal" style="--i:${i}">
        ${N.movieCardHTML(m, {
          actions: `<button type="button" class="btn btn--outline btn--sm" data-trailer="${m.id}">▶ Trailer</button>
                    <button type="button" class="btn btn--gold btn--sm" data-book data-movie="${m.id}">Book</button>`
        })}
      </li>`).join('');
    N.hydrate(track);

    const slider = $('[data-slider]', root);
    const prev = $('[data-slide="prev"]', root);
    const next = $('[data-slide="next"]', root);
    const bar = $('.slider-progress span', root);
    const step = () => (track.firstElementChild?.getBoundingClientRect().width || 320) + 20;
    const behavior = N.reduceMotion ? 'auto' : 'smooth';
    prev.addEventListener('click', () => slider.scrollBy({ left: -step(), behavior }));
    next.addEventListener('click', () => slider.scrollBy({ left: step(), behavior }));

    const update = () => {
      const max = slider.scrollWidth - slider.clientWidth;
      const ratio = slider.clientWidth / slider.scrollWidth;
      const p = max > 0 ? slider.scrollLeft / max : 0;
      bar.style.setProperty('--w', `${(ratio * 100).toFixed(2)}%`);
      bar.style.setProperty('--x', `${(p * (1 / ratio - 1) * 100).toFixed(2)}%`);
      prev.disabled = slider.scrollLeft < 4;
      next.disabled = slider.scrollLeft > max - 4;
    };
    slider.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
    window.addEventListener('resize', update);
    update();

    // Click-and-drag with a mouse (touch already swipes natively).
    let down = false;
    let moved = false;
    let startX = 0;
    let startLeft = 0;
    slider.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = true;
      moved = false;
      startX = e.clientX;
      startLeft = slider.scrollLeft;
    });
    window.addEventListener('pointermove', (e) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 6) { moved = true; slider.classList.add('is-dragging'); }
      if (moved) slider.scrollLeft = startLeft - dx;
    });
    window.addEventListener('pointerup', () => {
      if (!down) return;
      down = false;
      setTimeout(() => slider.classList.remove('is-dragging'), 0);
    });
    slider.addEventListener('click', (e) => {
      if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; }
    }, true);
  }

  /* ---------- Theater: tabs, curtains, inline trailer ---------- */
  function initTheater() {
    const section = $('[data-theater-section]');
    const stage = $('[data-theater]');
    const tabs = $('[data-theater-tabs]');
    const media = $('[data-screen-media]');
    const info = $('[data-theater-info]');
    if (!stage || !tabs) return;
    const films = D.movies.filter((m) => m.status === 'now');
    let index = 0;

    tabs.innerHTML = films.map((m, i) => `
      <button type="button" class="theater-tab" role="tab" id="tab-${m.id}" aria-controls="theater-panel" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" style="--accent:${m.accent}" data-index="${i}">
        <span class="thumb poster-art" data-icon="${m.icon}" style="--accent:${m.accent}">${N.movieImg(m, { alt: '' })}</span>
        <span><strong>${esc(m.short)}</strong><small>${m.year} · ${N.fmtRuntime(m.runtime)}</small></span>
      </button>`).join('');

    function select(i, focus = false) {
      index = (i + films.length) % films.length;
      const m = films[index];
      $$('.theater-tab', tabs).forEach((tab, k) => {
        tab.setAttribute('aria-selected', String(k === index));
        tab.tabIndex = k === index ? 0 : -1;
      });
      const tab = tabs.children[index];
      if (focus) tab.focus({ preventScroll: true });
      // Centre the chosen tab inside the strip without moving the page.
      const tr = tab.getBoundingClientRect();
      const cr = tabs.getBoundingClientRect();
      tabs.scrollBy({ left: (tr.left + tr.width / 2) - (cr.left + cr.width / 2), behavior: N.reduceMotion ? 'auto' : 'smooth' });
      section.style.setProperty('--accent', m.accent);
      stage.style.setProperty('--accent', m.accent);
      $('#theater-panel').setAttribute('aria-labelledby', `tab-${m.id}`);

      media.innerHTML = `
        <div class="poster-art" data-icon="${m.icon}" style="--accent:${m.accent};position:absolute;inset:0">${N.movieImg(m, { eager: true })}</div>
        <span class="screen-shade"></span>
        <div class="screen-caption"><h3>${esc(m.title)}</h3><p>${esc(m.tagline)}</p></div>
        <button type="button" class="screen-play" data-play aria-label="Play the ${esc(m.title)} trailer">${N.ICONS.play}</button>`;
      media.classList.remove('is-switching');
      void media.offsetWidth;
      media.classList.add('is-switching');
      N.hydrate(media);

      info.innerHTML = `
        <div>
          <h3>${esc(m.title)}</h3>
          <p>${m.year} · ${N.fmtRuntime(m.runtime)} · ${m.genres.join(', ')} · Theme: “${esc(m.themeSong.title)}” by ${esc(m.themeSong.artist)}</p>
        </div>
        <div class="actions">
          ${N.songAction(m)}
          <a class="btn btn--ghost btn--sm" href="${N.yt.watch(m.trailerId)}" target="_blank" rel="noopener">YouTube ↗</a>
          <button type="button" class="btn btn--gold btn--sm" data-book data-movie="${m.id}">Book seats</button>
        </div>`;
    }

    tabs.addEventListener('click', (e) => {
      const tab = e.target.closest('.theater-tab');
      if (tab) select(Number(tab.dataset.index));
    });
    tabs.addEventListener('keydown', (e) => {
      const keys = { ArrowRight: 1, ArrowLeft: -1, Home: -index, End: films.length - 1 - index };
      if (!(e.key in keys)) return;
      e.preventDefault();
      select(index + keys[e.key], true);
    });
    media.addEventListener('click', (e) => {
      if (!e.target.closest('[data-play]')) return;
      const m = films[index];
      stage.classList.add('is-open');
      media.insertAdjacentHTML('beforeend', `<iframe src="${N.yt.embed(m.trailerId)}" title="${esc(m.title)} trailer" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`);
    });

    select(0);

    // Part the curtains once the stage scrolls into view.
    if (N.reduceMotion || !('IntersectionObserver' in window)) {
      stage.classList.add('is-open');
    } else {
      const io = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) { setTimeout(() => stage.classList.add('is-open'), 350); io.disconnect(); }
      }, { threshold: 0.4 });
      io.observe(stage);
    }
  }

  /* ---------- Wanted posters ---------- */
  function initCrew() {
    const grid = $('[data-crew]');
    if (!grid) return;
    grid.innerHTML = CREW.map((c, i) => `
      <li class="wanted reveal" style="--i:${i % 5};--rot:${TILTS[i]}deg;--tone:${c.tone}">
        <div class="wanted-inner">
          <div class="wanted-face">
            <span class="wanted-title" aria-hidden="true">WANTED</span>
            <div class="wanted-photo"><span aria-hidden="true">${c.icon}</span></div>
            <span class="wanted-doa">DEAD OR ALIVE</span>
            <h3 class="wanted-name">${esc(c.name)}</h3>
            <p class="wanted-bounty"><b aria-hidden="true">฿</b><span data-count="${c.bounty}" data-suffix="-" data-duration="2200">0-</span><span class="sr-only"> berries</span></p>
            <span class="wanted-marine" aria-hidden="true">MARINE</span>
          </div>
          <div class="wanted-face wanted-back">
            <h3>Nova notes</h3>
            <dl>
              <div><dt>Role</dt><dd>${esc(c.role)}</dd></div>
              <div><dt>Favorite film</dt><dd>${esc(c.film)}</dd></div>
              <div><dt>Go-to snack</dt><dd>${esc(c.snack)}</dd></div>
              <div><dt>Seat</dt><dd>${esc(c.seat)}</dd></div>
            </dl>
          </div>
        </div>
        <button type="button" class="wanted-flip" aria-pressed="false" aria-label="Flip ${esc(c.name)}'s wanted poster"></button>
      </li>`).join('');
    N.hydrate(grid);
    grid.addEventListener('click', (e) => {
      const btn = e.target.closest('.wanted-flip');
      if (!btn) return;
      const card = btn.closest('.wanted');
      const flipped = card.classList.toggle('is-flipped');
      btn.setAttribute('aria-pressed', String(flipped));
    });
  }

  /* ---------- Galley snacks + pre-order cart ---------- */
  function initGalley() {
    const grid = $('[data-snacks]');
    const bar = $('[data-cart-bar]');
    if (!grid) return;
    grid.innerHTML = D.snacks.map((s, i) => `
      <li class="snack reveal" style="--i:${i % 3}">
        <div class="snack-icon"><span aria-hidden="true">${s.icon}</span></div>
        <div><h3>${esc(s.name)}</h3><p>${esc(s.desc)}</p></div>
        <div class="snack-side">
          <span class="snack-price">${N.money(s.price)}</span>
          <button type="button" class="add-btn" data-add="${s.id}" aria-label="Add ${esc(s.name)} to your order">+</button>
        </div>
      </li>`).join('');
    N.hydrate(grid);

    const renderBar = () => {
      const count = N.cart.count();
      bar.innerHTML = count
        ? `<p>🧺 <strong>${count} treat${count > 1 ? 's' : ''}</strong> · ${N.money(N.cart.total())} — waiting for you at checkout.</p>
           <div class="actions"><button type="button" class="btn btn--gold btn--sm" data-book>Book &amp; check out</button><button type="button" class="btn btn--ghost btn--sm" data-clear-cart>Clear</button></div>`
        : `<p>🧺 Your galley order is empty — add a treat and it'll be ready at checkout.</p>
           <div class="actions"><button type="button" class="btn btn--ghost btn--sm" data-book>Book tickets</button></div>`;
    };
    renderBar();
    document.addEventListener('nova:cart', renderBar);

    grid.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-add]');
      if (!btn) return;
      const snack = D.snacks.find((s) => s.id === btn.dataset.add);
      N.cart.add(snack.id);
      btn.classList.remove('is-added');
      void btn.offsetWidth;
      btn.classList.add('is-added');
      N.toast(`${esc(snack.name)} added to your galley order.`, { icon: snack.icon, type: 'success' });
    });
    bar.addEventListener('click', (e) => {
      if (!e.target.closest('[data-clear-cart]')) return;
      N.cart.set({});
      N.toast('Galley order cleared.', { icon: '🧹' });
    });
  }

  /* ---------- Reviews carousel ---------- */
  function initReviews() {
    const root = $('[data-reviews]');
    if (!root) return;
    const track = $('.reviews-track', root);
    const slides = $$('.review', track);
    const dots = $('[data-dots]', root);
    let current = 0;
    let timer;

    dots.innerHTML = slides.map((_, i) => `<button type="button" class="dot" aria-label="Show review ${i + 1}"></button>`).join('');
    const go = (i) => {
      current = (i + slides.length) % slides.length;
      track.style.transform = `translateX(-${current * 100}%)`;
      slides.forEach((s, k) => s.setAttribute('aria-hidden', String(k !== current)));
      $$('.dot', dots).forEach((d, k) => d.setAttribute('aria-current', String(k === current)));
    };
    const start = () => { if (!N.reduceMotion) { stop(); timer = setInterval(() => go(current + 1), 6500); } };
    const stop = () => clearInterval(timer);

    dots.addEventListener('click', (e) => {
      const dot = e.target.closest('.dot');
      if (dot) { go($$('.dot', dots).indexOf(dot)); start(); }
    });
    $('[data-review="prev"]', root).addEventListener('click', () => { go(current - 1); start(); });
    $('[data-review="next"]', root).addEventListener('click', () => { go(current + 1); start(); });
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    root.addEventListener('focusin', stop);
    root.addEventListener('focusout', start);
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));

    let sx = null;
    root.addEventListener('pointerdown', (e) => { sx = e.clientX; });
    root.addEventListener('pointerup', (e) => {
      if (sx === null) return;
      const dx = e.clientX - sx;
      if (Math.abs(dx) > 50) { go(current + (dx < 0 ? 1 : -1)); start(); }
      sx = null;
    });

    go(0);
    start();
  }

  initSky();
  initParallax();
  initCountdown();
  initSlider();
  initTheater();
  initCrew();
  initGalley();
  initReviews();
})();
