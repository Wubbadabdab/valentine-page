/* ==========================================================================
   Nova Cinema — movies page
   Trailer-reel hero, the filterable film collection, Treasure Vault votes,
   film details modal and the theme-song list.
   ========================================================================== */
(() => {
  'use strict';
  const N = window.Nova;
  if (!N) return;
  const { $, $$, data: D, esc } = N;

  const state = { tab: 'now', genre: 'All', q: '', sort: 'featured' };
  const votes = new Set(N.store.get('nova-votes', []));
  const grid = $('[data-grid]');
  const empty = $('[data-empty]');
  const results = $('[data-results]');
  const genresEl = $('[data-genres]');
  const search = $('[data-search]');
  const clearBtn = $('[data-search-clear]');
  const sortSel = $('[data-sort]');
  const GENRES = ['All', ...new Set(D.movies.flatMap((m) => m.genres))].sort((a, b) => (a === 'All' ? -1 : b === 'All' ? 1 : a.localeCompare(b)));

  /* ---------- Hero trailer reel ---------- */
  function initHeroVideo() {
    const hero = $('[data-video-hero]');
    const video = $('video', hero);
    if (!video) return;
    const toggle = $('[data-video-toggle]', hero);
    const sound = $('[data-video-sound]', hero);
    const fail = () => hero.classList.add('no-video');
    video.addEventListener('error', fail);
    $('source', video)?.addEventListener('error', fail);
    if (video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) fail();
    if (N.reduceMotion) video.pause();

    const sync = () => {
      const paused = video.paused;
      $('[data-icon-pause]', toggle).hidden = paused;
      $('[data-icon-play]', toggle).hidden = !paused;
      toggle.setAttribute('aria-label', paused ? 'Play background video' : 'Pause background video');
      $('[data-icon-muted]', sound).hidden = !video.muted;
      $('[data-icon-sound]', sound).hidden = video.muted;
      sound.setAttribute('aria-pressed', String(!video.muted));
      sound.setAttribute('aria-label', video.muted ? 'Turn sound on' : 'Turn sound off');
    };
    toggle.addEventListener('click', () => (video.paused ? video.play().catch(fail) : video.pause()));
    sound.addEventListener('click', () => { video.muted = !video.muted; sync(); });
    ['play', 'pause', 'volumechange'].forEach((ev) => video.addEventListener(ev, sync));
    sync();
  }

  /* ---------- Collection ---------- */
  function actionsFor(m) {
    if (m.status === 'now') {
      return `
        <button type="button" class="btn btn--outline btn--sm" data-trailer="${m.id}">▶ Trailer</button>
        <button type="button" class="btn btn--gold btn--sm" data-book data-movie="${m.id}">Book</button>
        <a class="btn btn--ghost btn--sm" href="schedule.html?film=${m.id}#showtimes">Times</a>
        <button type="button" class="btn btn--ghost btn--sm" data-details="${m.id}" aria-label="More about ${esc(m.title)}">Info</button>`;
    }
    const voted = votes.has(m.id);
    return `
      <button type="button" class="btn btn--outline btn--sm vote-btn" data-vote="${m.id}" aria-pressed="${voted}"><span class="vote-icon" aria-hidden="true">⚑</span> <span data-vote-label>${voted ? 'Voted for marathon' : 'Vote for marathon'}</span></button>
      <a class="btn btn--ghost btn--sm" href="${N.yt.search(`One Piece ${m.title} trailer`)}" target="_blank" rel="noopener">Trailer ↗<span class="sr-only"> (opens YouTube in a new tab)</span></a>
      <button type="button" class="btn btn--ghost btn--sm" data-details="${m.id}" aria-label="More about ${esc(m.title)}">Info</button>`;
  }

  const matchesQuery = (m, q) => [m.title, m.tagline, m.synopsis, m.director, m.themeSong?.title, m.themeSong?.artist, m.genres.join(' '), m.year]
    .join(' ').toLowerCase().includes(q);

  function inTab(m) { return state.tab === 'all' || m.status === state.tab; }

  function filtered() {
    const q = state.q.trim().toLowerCase();
    const sorters = {
      featured: () => 0,
      newest: (a, b) => b.year - a.year,
      oldest: (a, b) => a.year - b.year,
      az: (a, b) => a.title.localeCompare(b.title)
    };
    return D.movies
      .filter(inTab)
      .filter((m) => state.genre === 'All' || m.genres.includes(state.genre))
      .filter((m) => !q || matchesQuery(m, q))
      .sort(sorters[state.sort]);
  }

  function renderGenres() {
    const q = state.q.trim().toLowerCase();
    const pool = D.movies.filter(inTab).filter((m) => !q || matchesQuery(m, q));
    genresEl.innerHTML = GENRES.map((g) => {
      const count = g === 'All' ? pool.length : pool.filter((m) => m.genres.includes(g)).length;
      return `<button type="button" class="chip" aria-pressed="${state.genre === g}" data-genre="${g}">${g} <span class="chip-count">${count}</span></button>`;
    }).join('');
  }

  function renderResults(count) {
    const total = D.movies.filter(inTab).length;
    const q = state.q.trim();
    results.innerHTML = `Showing <strong>${count}</strong> of ${total} film${total === 1 ? '' : 's'}`
      + `${state.genre !== 'All' ? ` in <strong>${state.genre}</strong>` : ''}`
      + `${q ? ` matching “${esc(q)}”` : ''}`
      + `${state.tab !== 'now' && votes.size ? ` · ⚑ ${votes.size} marathon vote${votes.size > 1 ? 's' : ''} cast` : ''}`;
  }

  function render() {
    const list = filtered();
    grid.innerHTML = list.map((m, i) => `<li style="--i:${i}">${N.movieCardHTML(m, { withId: true, actions: actionsFor(m) })}</li>`).join('');
    N.hydrate(grid);
    empty.hidden = list.length > 0;
    renderResults(list.length);
    renderGenres();
  }

  function setTab(tab) {
    state.tab = tab;
    tabs.set(tab, false);
  }

  const tabs = N.initSegmented($('[data-tabs]'), (tab) => { state.tab = tab; state.genre = 'All'; render(); }, 'tab');

  function initControls() {
    $$('[data-tab-count]').forEach((el) => {
      const t = el.dataset.tabCount;
      el.textContent = D.movies.filter((m) => t === 'all' || m.status === t).length;
    });

    let debounce;
    search.addEventListener('input', () => {
      clearBtn.hidden = !search.value;
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        state.q = search.value;
        // Searching from "Now showing" should still find vault classics.
        if (state.q && state.tab === 'now' && !filtered().length) setTab('all');
        render();
      }, 160);
    });
    clearBtn.addEventListener('click', () => {
      search.value = '';
      clearBtn.hidden = true;
      state.q = '';
      render();
      search.focus();
    });
    sortSel.addEventListener('change', () => { state.sort = sortSel.value; render(); });
    genresEl.addEventListener('click', (e) => {
      const chip = e.target.closest('[data-genre]');
      if (!chip) return;
      state.genre = chip.dataset.genre;
      render();
      $(`[data-genre="${state.genre}"]`, genresEl)?.focus();
    });
    $('[data-reset]').addEventListener('click', () => {
      Object.assign(state, { genre: 'All', q: '', sort: 'featured' });
      search.value = '';
      sortSel.value = 'featured';
      clearBtn.hidden = true;
      render();
    });

    grid.addEventListener('click', (e) => {
      const voteBtn = e.target.closest('[data-vote]');
      if (voteBtn) return toggleVote(voteBtn);
      const details = e.target.closest('[data-details]');
      if (details) openDetails(N.movieById(details.dataset.details));
    });
  }

  function toggleVote(btn) {
    const id = btn.dataset.vote;
    const m = N.movieById(id);
    if (votes.has(id)) votes.delete(id); else votes.add(id);
    N.store.set('nova-votes', [...votes]);
    const on = votes.has(id);
    btn.setAttribute('aria-pressed', String(on));
    $('[data-vote-label]', btn).textContent = on ? 'Voted for marathon' : 'Vote for marathon';
    if (on) {
      const r = btn.getBoundingClientRect();
      N.confetti(r.left + r.width / 2, r.top, ['⚑', m.icon, '⭐']);
      N.toast(`Vote cast for <strong>${esc(m.title)}</strong> — we'll count it for the next marathon night.`, { icon: '⚑', type: 'success' });
    } else {
      N.toast(`Vote removed for ${esc(m.title)}.`, { icon: '↩️' });
    }
    renderResults(filtered().length);
  }

  /* ---------- Details modal ---------- */
  function openDetails(m) {
    const d = N.getDialog('details-modal', 'details-title', 'modal--details');
    const shows = D.showtimes.filter((s) => s.movie === m.id).sort(N.byTime);
    const showChips = shows.map((s) => {
      const st = N.showingStatus(s);
      return `<button type="button" class="chip" data-book data-showing="${s.id}" ${st.key === 'departed' ? 'title="Departed today — books tomorrow"' : ''}>${N.fmtTime(s.time)} · ${D.halls[s.hall].name}</button>`;
    }).join('');
    d.innerHTML = `
      <div class="modal-panel modal-panel--details" style="--accent:${m.accent}">
        <button type="button" class="modal-close" data-close aria-label="Close details">×</button>
        <div class="details-hero poster-art" data-icon="${m.icon}">${N.movieImg(m, { eager: true })}</div>
        <div class="details-body">
          <p class="eyebrow">${m.status === 'now' ? 'Now showing at Nova' : 'From the Treasure Vault'}</p>
          <h2 id="details-title">${esc(m.title)}</h2>
          <p class="movie-tagline">${esc(m.tagline)}</p>
          <p style="margin-top:1rem;color:#d5dbf2">${esc(m.synopsis)}</p>
          <dl class="details-facts">
            <div><dt>Released</dt><dd>${m.year}</dd></div>
            <div><dt>Runtime</dt><dd>${m.runtime ? N.fmtRuntime(m.runtime) : '—'}</dd></div>
            <div><dt>Director</dt><dd>${esc(m.director || '—')}</dd></div>
            <div><dt>Genres</dt><dd>${m.genres.join(', ')}</dd></div>
          </dl>
          ${m.themeSong ? `<p class="movie-song" style="margin-bottom:1.2rem"><span class="note" aria-hidden="true">♪</span><span>Theme song: <strong>${esc(m.themeSong.title)}</strong> <em>— ${esc(m.themeSong.artist)}</em></span></p>` : ''}
          ${shows.length ? `<p class="booking-label">Today's showtimes</p><div class="chip-row" style="flex-wrap:wrap;margin-bottom:1.2rem">${showChips}</div>` : ''}
          <div class="movie-actions">
            ${m.trailerId ? `<button type="button" class="btn btn--red btn--sm" data-trailer="${m.id}">▶ Watch trailer</button>` : `<a class="btn btn--red btn--sm" href="${N.yt.search(`One Piece ${m.title} trailer`)}" target="_blank" rel="noopener">Find the trailer ↗</a>`}
            ${N.songAction(m)}
            ${m.status === 'now' ? `<button type="button" class="btn btn--gold btn--sm" data-book data-movie="${m.id}">Book seats</button>` : ''}
          </div>
        </div>
      </div>`;
    N.hydrate(d);
    N.openDialog(d);
  }

  // Opening another modal from inside the details modal: close this one first.
  document.addEventListener('click', (e) => {
    const d = document.getElementById('details-modal');
    if (d?.open && d.contains(e.target) && e.target.closest('[data-book], [data-trailer], [data-video]')) N.closeDialog(d);
  }, true);

  /* ---------- Theme songs ---------- */
  function renderSongs() {
    const list = $('[data-songs]');
    if (!list) return;
    list.innerHTML = D.movies.filter((m) => m.themeSong).map((m, i) => `
      <li class="song reveal" style="--i:${i};--accent:${m.accent}">
        <span class="vinyl" aria-hidden="true"></span>
        <div class="song-info">
          <h3>${esc(m.themeSong.title)}</h3>
          <p>${esc(m.themeSong.artist)} · <b>${esc(m.title)}</b> (${m.year})</p>
        </div>
        ${N.songAction(m, undefined, m.themeSong.videoId ? 'Watch the video' : 'Listen on YouTube')}
      </li>`).join('');
    N.hydrate(list);
  }

  /* ---------- "Let the Log Pose pick" ---------- */
  function initLogPose() {
    $('[data-log-pose]')?.addEventListener('click', () => {
      const pool = D.movies.filter((m) => m.status === 'now');
      const pick = pool[Math.floor(Math.random() * pool.length)];
      Object.assign(state, { genre: 'All', q: '' });
      search.value = '';
      clearBtn.hidden = true;
      if (state.tab === 'vault') setTab('now');
      render();
      focusFilm(pick.id);
      N.toast(`The Log Pose points to <strong>${esc(pick.title)}</strong>!`, { icon: '🧭' });
    });
  }

  function focusFilm(id) {
    const card = document.getElementById(`movie-${id}`);
    if (!card) return;
    card.scrollIntoView({ behavior: N.reduceMotion ? 'auto' : 'smooth', block: 'center' });
    card.classList.remove('is-highlighted');
    void card.offsetWidth;
    card.classList.add('is-highlighted');
  }

  /* ---------- Deep links like movies.html#movie-red ---------- */
  function handleHash() {
    const match = location.hash.match(/^#movie-(.+)$/);
    if (!match) return;
    const m = N.movieById(match[1]);
    if (!m) return;
    if (!inTab(m)) { setTab('all'); render(); }
    setTimeout(() => focusFilm(m.id), N.reduceMotion ? 0 : 450);
  }

  initHeroVideo();
  initControls();
  render();
  renderSongs();
  initLogPose();
  handleHash();
  window.addEventListener('hashchange', handleHash);
})();
