const main = document.querySelector('main'),
  nav = document.querySelector('nav'),
  dialog = document.querySelector('dialog');

function render(focus = true) {
  const [path, query] = location.hash.slice(1).split('?'),
    params = new URLSearchParams(query),
    parts = (path || '/').split('/').slice(1),
    user = current();
  const event = events.find((item) => item.id === parts[1]),
    order =
      parts[0] === 'bookings' && user
        ? read().orders.find((item) => item.reference === parts[1] && item.owner === user.id)
        : null;
  nav.innerHTML =
    '<a href="#/">Home</a><a href="#/events">Explore Events</a><a href="#/tickets">My Tickets</a>' +
    (user
      ? '<a href="#/profile">Profile</a><button class="outline" data-signout>Sign out</button>'
      : link('/sign-in', 'Sign In') + '<a href="#/sign-up">Sign Up</a>');
  nav.querySelectorAll('a').forEach((a) => {
    if (a.getAttribute('href') === '#' + (path || '/')) a.setAttribute('aria-current', 'page');
  });
  let page;
  if (!parts[0]) page = home();
  else if (parts[0] === 'events' && !parts[1]) page = explore(params);
  else if (parts[0] === 'events' && event)
    page = parts[2] === 'tickets' ? selection(event) : details(event);
  else if (parts[0] === 'checkout' && event) page = checkout(event);
  else if (parts[0] === 'tickets') page = myTickets(user);
  else if (parts[0] === 'bookings' && order) page = confirmation(order);
  else if (parts[0] === 'sign-in' || parts[0] === 'sign-up')
    page = auth(parts[0] === 'sign-up', params);
  else if (parts[0] === 'profile') page = profile(user);
  else
    page =
      '<div class="wrap">' +
      empty(
        'Page unavailable',
        'This page may have moved or may require the account used to book.',
        '/events',
        'Explore events',
      ) +
      '</div>';
  main.innerHTML = page;
  if (focus) {
    nav.classList.remove('open');
    document.querySelector('#menu').setAttribute('aria-expanded', 'false');
    window.scrollTo(0, 0);
    main.focus({ preventScroll: true });
  }
document.title = 'MOMENT';  return { event, order, params };
}
function errorMessage(message) {
  const target = document.querySelector('#error');
  if (target) target.textContent = message;
}
function changeQuantity(button, event) {
  const data = read(),
    key = draftKey(event.id, data),
    draft = data.drafts[key] || {},
    tier = event.tiers.find((item) => item.name === button.dataset.tier);
  const next = (draft[tier.name] || 0) + Number(button.dataset.delta);
  if (
    next < 0 ||
    (button.dataset.delta === '1' && (!saleOpen(event) || next > remaining(event, tier, data)))
  )
    return;
  draft[tier.name] = next;
  data.drafts[key] = draft;
  write(data);
  render(false);
  const controls = [...document.querySelectorAll('[data-tier]')].filter(
    (item) => item.dataset.tier === tier.name,
  );
  (
    controls.find((item) => item.dataset.delta === button.dataset.delta && !item.disabled) ||
    controls.find((item) => !item.disabled)
  )?.focus();
}
let state = render(false);
window.addEventListener('hashchange', () => {
  state = render();
});
window.addEventListener('storage', (event) => {
  if (event.key === storageKey) state = render(false);
});
document.querySelector('#year').textContent = new Date().getFullYear();
document.addEventListener('click', async (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  try {
    if (button.id === 'menu') {
      const open = nav.classList.toggle('open');
      button.setAttribute('aria-expanded', String(open));
    }
    if (button.hasAttribute('data-signout')) {
      await transaction(() => {
        const data = read();
        data.session = null;
        write(data);
      });
      location.hash = '/';
      state = render(false);
    }
    if (button.dataset.tier) changeQuantity(button, state.event);
    if (button.hasAttribute('data-print')) window.print();
    if (button.hasAttribute('data-download') && state.order) {
      const file = new Blob(
        [
          '<!doctype html><html lang="en"><meta charset="utf-8"><title>MOMENT ' +
            state.order.reference +
            ('</title><style>body{background:#F3EEE9;color:#705849;font:16px' +
              ' system-ui;margin:32px}.digital{max-width:620px;border:1px solid' +
              ' #705849;padding:24px;display:flex;flex-wrap:wrap;gap:24px;justify-content:spa' +
              'ce-between}.ticket-code{display:grid;text-align:center;gap:8px}svg{width:145px' +
              '}</style>') +
            ticket(state.order) +
            '</html>',
        ],
        { type: 'text/html' },
      );
      const url = URL.createObjectURL(file),
        a = document.createElement('a');
      a.href = url;
      a.download = state.order.reference + '.html';
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 3000);
    }
    if (button.dataset.cancel) {
      const reference = button.dataset.cancel;
      dialog.innerHTML =
        '<form method="dialog" class="form"><h2>Cancel this booking?</h2><p>Your' +
        ' tickets will be released and this action is final.</p><div class="actions">' +
        '<button value="keep" class="outline" autofocus>Keep booking</button><button' +
        ' value="cancel">Cancel booking</button></div></form>';
      dialog.returnValue = 'keep';
      dialog.showModal();
      dialog.addEventListener(
        'close',
        async () => {
          if (dialog.returnValue !== 'cancel') return;
          try {
            await cancel(reference);
            state = render(false);
            document.querySelector('#feedback').textContent =
              'Booking cancelled. Your ticket history has been updated.';
          } catch (error) {
            const feedback = document.querySelector('#feedback');
            if (feedback) feedback.textContent = error.message;
          }
        },
        { once: true },
      );
    }
  } catch (error) {
    errorMessage(error.message);
  }
});
document.addEventListener('submit', async (event) => {
  const form = event.target;
  if (form.closest('dialog')) return;
  event.preventDefault();
  const values = Object.fromEntries(new FormData(form)),
    id = form.id;
  if (id === 'hero-search' || id === 'filters') {
    const params = new URLSearchParams(Object.entries(values).filter(([, value]) => value.trim()));
    location.hash = '/events' + (params.size ? '?' + params : '');
    return;
  }
  const button = form.querySelector('button'),
    original = button.textContent;
  button.disabled = true;
  errorMessage('');
  try {
    const { event: activeEvent, params: activeParams } = state;
    const owner = current(),
      name = values.name?.trim(),
      email = values.email?.trim().toLowerCase(),
      phone = phoneNumber(values.phone || '');
    if (['signup', 'profile', 'checkout'].includes(id) && !name)
      throw Error('Enter your full name.');
    if (id === 'checkout') {
      if (!phone) throw Error('Enter a valid Saudi mobile number.');
      button.textContent = 'Confirming booking…';
      await new Promise((resolve) => setTimeout(resolve, 650));
      const order = await book(activeEvent, { name, email, phone }, owner?.id);
      location.hash = '/bookings/' + order.reference;
    } else if (id === 'profile') {
      if (values.phone && !phone) throw Error('Enter a valid Saudi mobile number.');
      await transaction(() => {
        const data = read(),
          user = current(data);
        if (!user || user.id !== owner?.id) throw Error('Your session changed.');
        if (data.users.some((item) => item.email === email && item.id !== user.id))
          throw Error('That email is already registered.');
        Object.assign(user, { name, email, phone });
        write(data);
      });
      document.querySelector('#feedback').textContent = 'Profile saved.';
    } else if (id === 'signup' || id === 'signin') {
      button.textContent = id === 'signup' ? 'Creating account…' : 'Signing in…';
      const existing = read().users.find((user) => user.email === email);
      if (id === 'signup' && existing) throw Error('An account already uses that email.');
      if (id === 'signin' && !existing) throw Error('Email or password is incorrect.');
      const salt = existing?.salt || randomHex(16),
        hash = await passwordHash(values.password, salt);
      if (id === 'signin' && existing.hash !== hash) throw Error('Email or password is incorrect.');
      const next = activeParams.get('next') || '/';
      await transaction(() => {
        const data = read();
        if (id === 'signup' && data.users.some((user) => user.email === email))
          throw Error('An account already uses that email.');
        const user = existing || { id: randomHex(12), name, email, phone: '', salt, hash };
        if (!existing) data.users.push(user);
        data.session = user.id;
        const checkoutId = next.match(/^\/checkout\/([a-z0-9-]+)$/)?.[1];
        if (checkoutId && data.drafts['guest:' + checkoutId]) {
          data.drafts[draftKey(checkoutId, data)] = data.drafts['guest:' + checkoutId];
          delete data.drafts['guest:' + checkoutId];
        }
        write(data);
      });
      location.hash = /^\/(?:checkout\/[a-z0-9-]+|tickets|profile)?$/.test(next) ? next : '/';
    }
  } catch (error) {
    errorMessage(error.message);
  } finally {
    button.disabled = false;
    button.textContent = original;
  }
});
