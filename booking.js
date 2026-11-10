const money = (amount) => 'SAR ' + new Intl.NumberFormat('en-SA').format(amount);
const dateText = (value, time = false) =>
  new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Riyadh',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...(time ? { hour: 'numeric', minute: '2-digit', hour12: true } : {}),
  }).format(new Date(value));
const phoneNumber = (value) => {
  const clean = value.replace(/[\s()-]/g, '');
  if (/^05\d{8}$/.test(clean)) return '+966' + clean.slice(1);
  return /^\+9665\d{8}$/.test(clean) ? clean : '';
};
const storageKey = 'moment-demo-v1';
const read = () =>
  JSON.parse(
    localStorage.getItem(storageKey) || '{"users":[],"orders":[],"drafts":{},"session":null}',
  );
const write = (data) => localStorage.setItem(storageKey, JSON.stringify(data));
const current = (data = read()) => data.users.find((user) => user.id === data.session);
const draftKey = (id, data = read()) => (current(data)?.id || 'guest') + ':' + id;
const remaining = (event, tier, data = read()) =>
  Math.max(
    0,
    tier.inventory -
      data.orders
        .filter((order) => order.event.id === event.id && order.status === 'Confirmed')
        .reduce(
          (sum, order) =>
            sum + (order.lines.find((line) => line.name === tier.name)?.quantity || 0),
          0,
        ),
  );
const saleOpen = (event) => event.bookingAvailable && Date.now() < Date.parse(event.start);
const linesFor = (event, draft) =>
  event.tiers
    .map((tier) => ({ ...tier, quantity: draft[tier.name] || 0 }))
    .filter((tier) => tier.quantity > 0);
const totalFor = (lines) => lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
const canCancel = (order) =>
  order.status === 'Confirmed' &&
  order.event.cancellable &&
  Date.parse(order.event.start) - Date.now() >= 86400000;
const randomHex = (length) =>
  Array.from(crypto.getRandomValues(new Uint8Array(length)), (byte) =>
    byte.toString(16).padStart(2, '0'),
  )
    .join('')
    .toUpperCase();
async function passwordHash(password, salt) {
  if (!crypto.subtle) throw Error('Open MOMENT on localhost or HTTPS to use demo accounts.');
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, [
    'deriveBits',
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: encoder.encode(salt), iterations: 150000, hash: 'SHA-256' },
    key,
    256,
  );
  return Array.from(new Uint8Array(bits), (byte) => byte.toString(16).padStart(2, '0')).join('');
}
const transaction = (operation) =>
  navigator.locks ? navigator.locks.request(storageKey, operation) : operation();
function book(event, customer, ownerId) {
  return transaction(() => {
    const data = read(),
      user = current(data),
      key = draftKey(event.id, data);
    if (!user || user.id !== ownerId) throw Error('Your session changed. Sign in again.');
    const lines = linesFor(event, data.drafts[key] || {});
    if (
      !saleOpen(event) ||
      !lines.length ||
      lines.some(
        (line) => !Number.isInteger(line.quantity) || line.quantity > remaining(event, line, data),
      )
    )
      throw Error('Ticket availability changed. Return to ticket selection and update your order.');
    let reference;
    do {
      reference = 'MOM-' + randomHex(5);
    } while (data.orders.some((order) => order.reference === reference));
    const order = {
      reference,
      owner: user.id,
      event,
      customer,
      lines,
      total: totalFor(lines),
      created: new Date().toISOString(),
      status: 'Confirmed',
    };
    data.orders.push(order);
    delete data.drafts[key];
    write(data);
    return order;
  });
}
function cancel(reference) {
  return transaction(() => {
    const data = read(),
      order = data.orders.find(
        (item) => item.reference === reference && item.owner === current(data)?.id,
      );
    if (!order || !canCancel(order)) throw Error('This booking can no longer be cancelled.');
    order.status = 'Cancelled';
    write(data);
  });
}
