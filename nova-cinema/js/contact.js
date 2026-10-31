/* ==========================================================================
   Nova Cinema — contact page
   Den Den Mushi, live opening hours, the message-in-a-bottle form
   (validation, phone formatting, guest stepper) and the FAQ accordion.
   ========================================================================== */
(() => {
  'use strict';
  const N = window.Nova;
  if (!N) return;
  const { $, $$, esc } = N;

  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  // Opening hours per weekday (0 = Sunday). 25 means 1 AM the next morning.
  const HOURS = { 0: [11, 22], 1: [10, 23], 2: [10, 23], 3: [10, 23], 4: [10, 23], 5: [10, 25], 6: [10, 25] };
  const fmtHour = (h) => { const hh = h % 24; return `${hh % 12 || 12} ${hh >= 12 ? 'PM' : 'AM'}`; };

  /* ---------- Den Den Mushi ---------- */
  function initDenDen() {
    const snail = $('[data-den-den]');
    if (!snail) return;
    const bubble = $('.den-bubble', snail);
    snail.addEventListener('click', () => {
      if (snail.classList.contains('is-ringing')) return;
      snail.classList.remove('has-answered');
      bubble.textContent = 'Puru puru puru… 📞';
      snail.classList.add('is-ringing');
      setTimeout(() => {
        snail.classList.remove('is-ringing');
        snail.classList.add('has-answered');
        bubble.textContent = 'Gacha! Nova Cinema — how can we help?';
        N.toast('The crew is listening! Call <a href="tel:+15550123456">(555) 012-3456</a> or leave a message below.', { icon: '🐌' });
      }, N.reduceMotion ? 0 : 1800);
    });
  }

  /* ---------- Opening hours ---------- */
  function initHours() {
    const badge = $('[data-open-badge]');
    if (!badge) return;
    const update = () => {
      const now = new Date();
      const day = now.getDay();
      const h = now.getHours() + now.getMinutes() / 60;
      const [open, close] = HOURS[day];
      const [prevOpen, prevClose] = HOURS[(day + 6) % 7];
      let state;
      if (h >= open && h < close) state = { open: true, text: `Open now · closes at ${fmtHour(close)}` };
      else if (h + 24 >= prevOpen && h + 24 < prevClose) state = { open: true, text: `Open late · closes at ${fmtHour(prevClose)}` };
      else if (h < open) state = { open: false, text: `Closed · opens today at ${fmtHour(open)}` };
      else state = { open: false, text: `Closed · opens tomorrow at ${fmtHour(HOURS[(day + 1) % 7][0])}` };
      badge.innerHTML = `<span class="status ${state.open ? 'status--open' : 'status--departed'}">${state.text}</span>`;
      $$('[data-hours] li').forEach((li) => li.classList.toggle('is-today', li.dataset.days.split(',').includes(String(day))));
    };
    update();
    setInterval(update, 60000);
  }

  /* ---------- Message-in-a-bottle form ---------- */
  function initForm() {
    const form = $('[data-contact-form]');
    if (!form) return;
    form.noValidate = true; // we show friendlier messages than the browser defaults
    const card = form.closest('.form-card');
    const success = $('[data-form-success]', card);
    const submit = $('button[type="submit"]', form);
    const phone = $('#phone-number');
    const guests = $('#number-of-guest');
    const message = $('#message');
    const counter = $('[data-char-count]');

    const rules = [
      { el: $('#name'), check: (v) => v.trim().length >= 2 || 'Please tell us your name (at least 2 letters).' },
      { el: $('#email'), check: (v) => EMAIL.test(v.trim()) || 'Please enter a valid email, like janedoe@gmail.com.' },
      {
        el: phone,
        check: (v) => {
          const digits = v.replace(/\D/g, '').length;
          return (digits >= 10 && digits <= 15) || 'Please enter a phone number with 10 to 15 digits.';
        }
      },
      { el: $('#movie'), check: (v) => Boolean(v) || 'Pick the film you are most excited to see.' },
      {
        el: guests,
        wrap: $('[data-guests]'),
        error: $('#guests-error'),
        check: (v) => {
          const n = Number(v);
          return (v !== '' && Number.isInteger(n) && n >= 1 && n <= 30) || 'Group size must be between 1 and 30 guests.';
        }
      }
    ];

    const setState = (rule, result) => {
      const ok = result === true;
      const field = rule.el.closest('.field');
      const error = rule.error || $(`#${rule.el.getAttribute('aria-describedby')}`);
      field.classList.toggle('is-invalid', !ok);
      field.classList.toggle('is-valid', ok);
      rule.wrap?.classList.toggle('is-invalid', !ok);
      rule.el.setAttribute('aria-invalid', String(!ok));
      if (error) error.textContent = ok ? '' : result;
      return ok;
    };
    const validate = (rule) => setState(rule, rule.check(rule.el.value));

    const methodGroup = $('[data-method]');
    const methodError = $('#method-error');
    const validateMethod = () => {
      const ok = Boolean($('input[name="contact-method"]:checked', form));
      methodGroup.classList.toggle('is-invalid', !ok);
      methodError.textContent = ok ? '' : 'Let us know how you would like us to reply.';
      return ok;
    };

    rules.forEach((rule) => {
      rule.el.addEventListener('blur', () => { if (rule.el.value !== '') validate(rule); });
      const live = () => { if (rule.el.closest('.field').classList.contains('is-invalid')) validate(rule); };
      rule.el.addEventListener('input', live);
      rule.el.addEventListener('change', () => validate(rule));
    });
    $$('input[name="contact-method"]', form).forEach((r) => r.addEventListener('change', validateMethod));

    // Format US numbers as (555) 123-4567 while typing; leave +international numbers alone.
    phone.addEventListener('input', () => {
      if (phone.value.trim().startsWith('+')) return;
      const d = phone.value.replace(/\D/g, '').slice(0, 10);
      phone.value = d.length > 6 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`
        : d.length > 3 ? `(${d.slice(0, 3)}) ${d.slice(3)}`
          : d.length ? `(${d}` : '';
    });

    // Guest stepper
    $$('[data-step]', form).forEach((btn) => btn.addEventListener('click', () => {
      const current = Number(guests.value) || 0;
      const next = Math.min(30, Math.max(1, current + Number(btn.dataset.step)));
      guests.value = next;
      validate(rules[4]);
      if (next === 30 && Number(btn.dataset.step) > 0) N.toast('30 is our biggest group voyage — we\'ll reserve a whole block for you!', { icon: '⛵' });
    }));

    // Message character counter
    const updateCounter = () => {
      const len = message.value.length;
      counter.textContent = `${len} / ${message.maxLength}`;
      counter.classList.toggle('is-near', len > message.maxLength * 0.9);
    };
    message.addEventListener('input', updateCounter);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const results = rules.map(validate);
      const methodOk = validateMethod();
      const firstBad = rules.find((_, i) => !results[i])?.el || (!methodOk ? $('input[name="contact-method"]', form) : null);
      if (firstBad) {
        firstBad.focus();
        const shake = firstBad.closest('.field, .choice-group');
        shake.classList.add('shake');
        setTimeout(() => shake.classList.remove('shake'), 500);
        const count = results.filter((r) => !r).length + (methodOk ? 0 : 1);
        N.toast(`${count} detail${count > 1 ? 's need' : ' needs'} a quick fix before the bottle can sail.`, { icon: '⚠️', type: 'error' });
        return;
      }

      submit.classList.add('is-loading');
      const data = Object.fromEntries(new FormData(form));
      const saved = N.store.get('nova-messages', []);
      N.store.set('nova-messages', [...saved, { ...data, sent: Date.now() }]);
      if (data['newsletter-signup']) {
        const list = N.store.get('nova-newsletter', []);
        if (!list.includes(data.email)) N.store.set('nova-newsletter', [...list, data.email]);
      }

      setTimeout(() => {
        submit.classList.remove('is-loading');
        const first = esc(String(data.name).trim().split(/\s+/)[0]);
        const via = { 'phone-call': 'give you a call', email: 'email you', 'either-is-fine': 'reach out' }[data['contact-method']];
        $('[data-success-text]', success).innerHTML = `Thanks, ${first}! Your bottle is riding the currents to our crew — we'll ${via} before the next tide.`;
        success.hidden = false;
        success.focus();
        const r = card.getBoundingClientRect();
        N.confetti(r.left + r.width / 2, Math.max(80, r.top + 120), ['🍾', '🌊', '⭐', '✉️']);
        N.toast('Message sent! Watch your inbox, Nakama.', { icon: '🍾', type: 'success' });
      }, N.reduceMotion ? 200 : 1200);
    });

    const clearStates = () => {
      $$('.field, .group-wrap, .choice-group', form).forEach((el) => el.classList.remove('is-invalid', 'is-valid'));
      $$('.field-error', form).forEach((el) => { el.textContent = ''; });
      $$('[aria-invalid]', form).forEach((el) => el.removeAttribute('aria-invalid'));
    };
    form.addEventListener('reset', () => {
      setTimeout(() => { clearStates(); updateCounter(); }, 0);
      N.toast('Form cleared — start fresh.', { icon: '🧽' });
    });

    $('[data-send-another]', success).addEventListener('click', () => {
      form.reset();
      success.hidden = true;
      $('#name').focus();
    });
  }

  /* ---------- FAQ accordion with smooth height animation ---------- */
  function initAccordion() {
    $$('.acc-item').forEach((item) => {
      const summary = $('summary', item);
      const panel = $('.acc-panel', item);
      summary.addEventListener('click', (e) => {
        if (N.reduceMotion || !panel.animate) return;
        e.preventDefault();
        if (item.open) {
          const anim = panel.animate([{ height: `${panel.offsetHeight}px`, opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 280, easing: 'ease-in' });
          anim.onfinish = () => { item.open = false; };
        } else {
          item.open = true;
          panel.animate([{ height: '0px', opacity: 0 }, { height: `${panel.offsetHeight}px`, opacity: 1 }], { duration: 380, easing: 'cubic-bezier(.2,.8,.2,1)' });
        }
      });
    });
  }

  initDenDen();
  initHours();
  initForm();
  initAccordion();
})();
