/* ==========================================================================
   Nova Cinema — schedule page
   Live clock, the voyage-chart timeline, the departure board (table),
   hall + film filters and the "My tickets" log.
   ========================================================================== */
(() => {
  'use strict';
  const N = window.Nova;
  if (!N) return;
  const { $, $$, data: D, esc } = N;

  const DAY_START = 10 * 60;   // 10:00 AM
  const DAY_END = 23 * 60;     // 11:00 PM
  const SPAN = DAY_END - DAY_START;
  const params = new URLSearchParams(location.search);
  const state = {
    hall: 'all',
    film: N.movieById(params.get('film'))?.status === 'now' ? params.get('film') : 'all'
  };
  const pct = (minutes) => ((minutes - DAY_START) / SPAN) * 100;
  const toMinutes = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };

  /* ---------- Live clock + next departure ---------- */
  function initLive() {
    const clock = $('[data-clock]');
    const nextIn = $('[data-next-in]');
    const nextFilm = $('[data-next-film]');
    const nextLabel = $('[data-next-label]');
    const tick = () => {
      const now = new Date();
      clock.textContent = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' });
      const next = N.nextShowing(now);
      const mins = Math.max(0, Math.round((next.start - now) / 60000));
      const m = N.movieById(next.showing.movie);
      nextLabel.textContent = next.tomorrow ? 'First departure tomorrow' : 'Next departure';
      nextIn.textContent = mins >= 60 ? `in ${Math.floor(mins / 60)}h ${N.pad(mins % 60)}m` : `in ${mins} min`;
      nextFilm.textContent = `${m.title} · ${D.halls[next.showing.hall].name} · ${N.fmtTime(next.showing.time)}`;
    };
    tick();
    setInterval(tick, 1000);
  }

  /* ---------- Voyage chart ---------- */
  function buildTimeline() {
    const wrap = $('[data-timeline]');
    if (!wrap) return;
    let ticks = '';
    let lines = '';
    for (let h = DAY_START / 60; h <= DAY_END / 60; h++) {
      const x = pct(h * 60).toFixed(3);
      ticks += `<span style="--x:${x}">${h % 12 || 12} ${h >= 12 ? 'PM' : 'AM'}</span>`;
      lines += `<span style="--x:${x}"></span>`;
    }
    const lanes = Object.entries(D.halls).map(([num, hall]) => {
      const blocks = D.showtimes.filter((s) => String(s.hall) === num).sort(N.byTime).map((s, i) => {
        const m = N.movieById(s.movie);
        const start = toMinutes(s.time);
        const endLabel = N.fmtClock(new Date(2000, 0, 1, 0, start + m.runtime));
        return `
          <button type="button" class="block" data-book data-showing="${s.id}" data-movie-id="${m.id}"
            style="--start:${pct(start).toFixed(3)};--len:${((m.runtime / SPAN) * 100).toFixed(3)};--accent:${m.accent};--i:${i + Number(num)}"
            aria-label="${esc(m.title)}, ${hall.name}, ${N.fmtTime(s.time)} to ${endLabel}. Book seats.">
            <strong>${esc(m.short)}</strong>
            <small>${N.fmtTime(s.time)} – ${endLabel}</small>
          </button>`;
      }).join('');
      return `
        <div class="lane" data-lane="${num}">
          <span class="lane-label"><strong>${hall.name}</strong><small>${hall.nickname}</small></span>
          ${blocks}
        </div>`;
    }).join('');
    wrap.innerHTML = `
      <div class="hour-ticks" aria-hidden="true">${ticks}</div>
      <div class="hour-lines" aria-hidden="true">${lines}</div>
      <div class="lanes">${lanes}</div>
      <div class="now-line" data-now-line hidden aria-hidden="true"><span></span></div>`;
  }

  /* ---------- Live status for chart + board ---------- */
  function updateStatus() {
    const now = new Date();
    D.showtimes.forEach((s) => {
      const st = N.showingStatus(s, now);
      const row = $(`tr[data-showing="${s.id}"]`);
      if (row) {
        $('.status-cell', row).innerHTML = `<span class="status status--${st.key}">${st.label}${st.key === 'playing' ? ` · ${Math.round(st.progress * 100)}%` : ''}</span>`;
        row.classList.toggle('is-departed', st.key === 'departed');
        const btn = $('.book-cell .btn', row);
        btn.textContent = st.key === 'departed' || st.key === 'playing' ? 'Book tomorrow' : 'Book';
      }
      const block = $(`.block[data-showing="${s.id}"]`);
      if (block) {
        block.classList.toggle('is-departed', st.key === 'departed');
        block.classList.toggle('is-playing', st.key === 'playing');
        block.style.setProperty('--progress', st.key === 'playing' ? st.progress.toFixed(3) : 0);
      }
    });
    const line = $('[data-now-line]');
    if (line) {
      const minutes = now.getHours() * 60 + now.getMinutes();
      const inRange = minutes >= DAY_START && minutes <= DAY_END;
      line.hidden = !inRange;
      if (inRange) {
        line.style.setProperty('--now', pct(minutes).toFixed(3));
        $('span', line).textContent = `Now · ${N.fmtClock(now)}`;
      }
    }
  }

  /* ---------- Filters ---------- */
  function applyFilters() {
    let shown = 0;
    $$('tr[data-showing]').forEach((row) => {
      const hallOk = state.hall === 'all' || row.dataset.hall === state.hall;
      const filmOk = state.film === 'all' || row.dataset.movie === state.film;
      row.classList.toggle('is-hidden', !(hallOk && filmOk));
      row.classList.toggle('is-match', state.film !== 'all' && filmOk);
      if (hallOk && filmOk) shown += 1;
    });
    $$('.lane').forEach((lane) => lane.classList.toggle('is-dimmed', state.hall !== 'all' && lane.dataset.lane !== state.hall));
    $$('.block').forEach((block) => {
      const s = N.showingById(block.dataset.showing);
      const hallOk = state.hall === 'all' || String(s.hall) === state.hall;
      const filmOk = state.film === 'all' || s.movie === state.film;
      block.classList.toggle('is-dimmed', !(hallOk && filmOk));
      block.tabIndex = hallOk && filmOk ? 0 : -1;
    });
    const film = state.film !== 'all' ? N.movieById(state.film) : null;
    $('[data-results]').innerHTML = `Showing <strong>${shown}</strong> of ${D.showtimes.length} screenings`
      + `${state.hall !== 'all' ? ` in <strong>${D.halls[state.hall].name}</strong>` : ''}`
      + `${film ? ` for <strong>${esc(film.title)}</strong>` : ''}`;
  }

  function initFilters() {
    const select = $('[data-film-filter]');
    D.movies.filter((m) => m.status === 'now').forEach((m) => {
      select.insertAdjacentHTML('beforeend', `<option value="${m.id}">${esc(m.title)}</option>`);
    });
    select.value = state.film;
    select.addEventListener('change', () => { state.film = select.value; applyFilters(); });

    const chips = $('[data-hall-filter]');
    chips.addEventListener('click', (e) => {
      const chip = e.target.closest('[data-hall]');
      if (!chip) return;
      state.hall = chip.dataset.hall;
      $$('[data-hall]', chips).forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
      applyFilters();
    });

    N.initSegmented($('[data-view-toggle]'), (view) => {
      $$('[data-view-panel]').forEach((panel) => { panel.hidden = panel.dataset.viewPanel !== view; });
    }, 'view');

    if (state.film !== 'all') {
      N.toast(`Showing times for <strong>${esc(N.movieById(state.film).title)}</strong>.`, { icon: '🎬' });
    }
  }

  /* ---------- My tickets ---------- */
  function renderTickets() {
    const host = $('[data-my-tickets]');
    if (!host) return;
    const list = N.tickets.all();
    if (!list.length) {
      host.innerHTML = `
        <div class="tickets-empty">
          <span class="big" aria-hidden="true">🎟️</span>
          <p>No tickets yet — your next voyage is one click away.</p>
          <button type="button" class="btn btn--gold" data-book>Book tickets</button>
        </div>`;
      return;
    }
    host.innerHTML = `<ul class="my-tickets">${list.map((t) => `
      <li>${N.ticketHTML(t, {
        actions: `<div class="ticket-actions">
          <button type="button" class="btn btn--sm btn--red" data-ics-code="${t.code}">📅 Calendar</button>
          <button type="button" class="btn btn--sm btn--ghost" style="color:#2a1a08;border-color:rgba(42,26,8,.3)" data-cancel="${t.code}">Cancel</button>
        </div>`
      })}</li>`).join('')}</ul>`;
  }

  function initTickets() {
    const host = $('[data-my-tickets]');
    if (!host) return;
    renderTickets();
    document.addEventListener('nova:tickets', renderTickets);
    host.addEventListener('click', (e) => {
      const ics = e.target.closest('[data-ics-code]');
      if (ics) {
        const t = N.tickets.all().find((x) => x.code === ics.dataset.icsCode);
        if (t) N.downloadICS(N.ticketEvent(t));
        return;
      }
      const cancel = e.target.closest('[data-cancel]');
      if (!cancel) return;
      // Two-step confirm so a stray tap can't throw a ticket overboard.
      if (cancel.dataset.armed) {
        N.tickets.remove(cancel.dataset.cancel);
        N.toast('Ticket cancelled. We hope to see you on another voyage!', { icon: '🌊' });
      } else {
        cancel.dataset.armed = '1';
        cancel.textContent = 'Tap again to confirm';
        setTimeout(() => {
          if (!document.contains(cancel)) return;
          delete cancel.dataset.armed;
          cancel.textContent = 'Cancel';
        }, 3500);
      }
    });
  }

  initLive();
  buildTimeline();
  initFilters();
  updateStatus();
  applyFilters();
  setInterval(updateStatus, 30000);
  initTickets();
  N.hydrate($('[data-timeline]'));
})();
