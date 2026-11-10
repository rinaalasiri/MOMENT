const empty = (title, copy, path, label) =>
  '<div class="panel empty"><span aria-hidden="true">✦</span><h2>' +
  title +
  '</h2><p>' +
  copy +
  '</p>' +
  link(path, label) +
  '</div>';
const facts = (event) =>
  '<div class="facts"><div><small>DATE & TIME · RIYADH TIME</small><strong>' +
  dateText(event.start, true) +
  '</strong></div><div><small>VENUE</small><strong>' +
  event.venue +
  '</strong><span>' +
  event.address +
  '</span></div></div>';
const policy = (event) =>
  event.cancellable
    ? 'Cancel up to 24 hours before the event starts.'
    : 'This event does not offer booking cancellations.';
function details(event) {
  return (
    '<div class="wrap"><div class="crumb"><a href="#/events">Explore events</a> / ' +
    event.name +
    '</div><div class="detail-cover">' +
    image(event, 1500) +
    '<span class="badge">' +
    event.category +
    ' · ' +
    event.city +
    '</span></div><div class="split"><article>' +
    intro('THE EVENT', event.name) +
    facts(event) +
    '<h2>About the event</h2><p>' +
    event.description +
    '</p><p>Event ends ' +
    dateText(event.end, true) +
    ' Riyadh time.</p><h2>Before you go</h2><ul>' +
    event.rules.map((rule) => '<li>' + rule + '</li>').join('') +
    '</ul><h2>Cancellation policy</h2><p>' +
    policy(event) +
    '</p></article><aside class="panel"><span class="eyebrow">GENERAL ADMISSION</span><h2>Book tickets</h2>' +
    event.tiers
      .map(
        (tier) =>
          '<div class="line"><span>' +
          tier.name +
          '<small>' +
          remaining(event, tier) +
          ' available</small></span><strong>' +
          money(tier.price) +
          '</strong></div>',
      )
      .join('') +
    (saleOpen(event) && event.tiers.some((tier) => remaining(event, tier))
      ? link(eventLink(event) + '/tickets', 'Book tickets ↗')
      : '<p>Booking is closed or sold out.</p>') +
    '</aside></div></div>'
  );
}
const summary = (event, lines) =>
  '<span class="eyebrow">ORDER SUMMARY</span><h2>' +
  event.name +
  '</h2><p>' +
  dateText(event.start, true) +
  ' · ' +
  event.city +
  '</p>' +
  (lines.length
    ? lines
        .map(
          (line) =>
            '<div class="line"><span>' +
            line.name +
            ' × ' +
            line.quantity +
            '<small>' +
            money(line.price) +
            ' each</small></span><strong>' +
            money(line.price * line.quantity) +
            '</strong></div>',
        )
        .join('')
    : '<p>Select a ticket to get started.</p>') +
  '<div class="line"><span>Subtotal</span><span>' +
  money(totalFor(lines)) +
  '</span></div><div class="line"><span>Fees</span><span>' +
  money(0) +
  '</span></div><div class="line total"><strong>Total</strong><strong>' +
  money(totalFor(lines)) +
  '</strong></div>';
function selection(event) {
  const data = read(),
    draft = data.drafts[draftKey(event.id, data)] || {},
    lines = linesFor(event, draft);
  return (
    '<div class="wrap narrow"><div class="crumb"><a href="#' +
    eventLink(event) +
    '">' +
    event.name +
    '</a> / Tickets</div>' +
    intro('STEP 01 / TICKETS', 'Choose your tickets', 'Select your general admission tickets.') +
    '<div class="split"><div id="tiers">' +
    event.tiers
      .map((tier) => {
        const available = saleOpen(event) ? remaining(event, tier) : 0,
          qty = draft[tier.name] || 0;
        return (
          '<div class="panel tier"><div><h3>' +
          tier.name +
          '</h3><p>' +
          money(tier.price) +
          ' · ' +
          (available ? available + ' available' : 'Unavailable') +
          '</p></div><div class="stepper"><button class="outline" data-tier="' +
          tier.name +
          '" data-delta="-1" aria-label="Remove one ' +
          tier.name +
          ' ticket" ' +
          (!qty ? 'disabled' : '') +
          '>−</button><output aria-live="polite">' +
          qty +
          '</output><button class="outline" data-tier="' +
          tier.name +
          '" data-delta="1" aria-label="Add one ' +
          tier.name +
          ' ticket" ' +
          (qty >= available ? 'disabled' : '') +
          '>+</button></div></div>'
        );
      })
      .join('') +
    '<p id="error" role="alert"></p></div><aside class="panel">' +
    summary(event, lines) +
    (lines.length && saleOpen(event)
      ? link('/checkout/' + event.id, 'Continue to checkout ↗')
      : '') +
    '</aside></div></div>'
  );
}
function checkout(event) {
  const data = read(),
    user = current(data),
    key = draftKey(event.id, data);
  const lines = linesFor(event, data.drafts[key] || {});
  if (!lines.length || !saleOpen(event))
    return (
      '<div class="wrap">' +
      empty(
        'Select available tickets',
        'Choose your tickets before continuing to checkout.',
        eventLink(event) + '/tickets',
        'Choose tickets',
      ) +
      '</div>'
    );
  if (!user)
    return (
      '<div class="wrap">' +
      empty(
        'Sign in to continue',
        'Your ticket selection will be carried into your account.',
        '/sign-in?next=' + encodeURIComponent('/checkout/' + event.id),
        'Sign in',
      ) +
      '</div>'
    );
  return (
    '<div class="wrap narrow"><div class="crumb"><a href="#' +
    eventLink(event) +
    '/tickets">Edit tickets</a> / Checkout</div>' +
    intro(
      'STEP 02 / CHECKOUT',
      'Complete your booking',
      'Your ticket will be available as soon as the demo booking is confirmed.',
    ) +
    '<div class="split"><form class="panel form" id="checkout"><h2>Customer information</h2>' +
    field('Full name', 'name', 'text', user.name, 'required autocomplete="name" maxlength="100"') +
    field('Email address', 'email', 'email', user.email, 'required autocomplete="email"') +
    field(
      'Saudi mobile number',
      'phone',
      'tel',
      user.phone,
      'required autocomplete="tel" placeholder="+9665XXXXXXXX"',
    ) +
    ('<small>Use +9665XXXXXXXX or 05XXXXXXXX.</small><p class="notice">Simulated' +
      ' payment · No card details required</p><p id="error" role="alert"></p>' +
      '<button>Confirm booking</button></form><aside class="panel">') +
    summary(event, lines) +
    '</aside></div></div>'
  );
}
function ticket(order) {
  return (
    '<article class="digital"><div><span class="eyebrow">MOMENT · DIGITAL TICKET</span><h2>' +
    escapeHtml(order.event.name) +
    '</h2><p>' +
    dateText(order.event.start, true) +
    ' · Riyadh time</p><p>' +
    escapeHtml(order.event.venue) +
    ' · ' +
    escapeHtml(order.event.city) +
    '</p><p>' +
    escapeHtml(order.customer.name) +
    '</p><p>' +
    order.lines.map((line) => escapeHtml(line.name) + ' × ' + line.quantity).join(' · ') +
    '</p><p><strong>' +
    money(order.total) +
    '</strong> · ' +
    escapeHtml(order.status) +
    '</p></div><div class="ticket-code">' +
    qrSvg(order.reference) +
    '<strong>' +
    order.reference +
    '</strong></div></article>'
  );
}
function confirmation(order) {
  return (
    '<div class="wrap narrow">' +
    intro(
      'STEP 03 / DIGITAL TICKET',
      order.status === 'Confirmed' ? 'Booking confirmed' : 'Booking cancelled',
      'Reference ' + order.reference + ' · Booked ' + dateText(order.created),
    ) +
    '<div class="detail-cover compact">' +
    image(order.event, 1200) +
    '</div>' +
    ticket(order) +
    ('<div class="actions ticket-actions"><button data-download>Download ticket' +
      '</button><button class="outline" data-print>Print ticket</button>') +
    link('/tickets', 'View My Tickets', 'outline') +
    (canCancel(order)
      ? '<button class="outline" data-cancel="' + order.reference + '">Cancel booking</button>'
      : '') +
    '</div><p id="feedback" role="status"></p></div>'
  );
}
function myTickets(user) {
  if (!user)
    return (
      '<div class="wrap">' +
      empty(
        'Your tickets live here',
        'Sign in to view and manage your bookings.',
        '/sign-in?next=%2Ftickets',
        'Sign in',
      ) +
      '</div>'
    );
  const orders = read()
    .orders.filter((order) => order.owner === user.id)
    .sort((a, b) => b.created.localeCompare(a.created));
  const group = (title, items) =>
    '<section class="ticket-group"><h2>' +
    title +
    '</h2>' +
    (items.length
      ? items
          .map(
            (order) =>
              '<article class="panel order"><div><span class="eyebrow">' +
              order.status +
              ' · ' +
              order.reference +
              '</span><h3>' +
              escapeHtml(order.event.name) +
              '</h3><p>' +
              dateText(order.event.start, true) +
              ' · ' +
              escapeHtml(order.event.city) +
              '</p><p>' +
              order.lines.map((line) => escapeHtml(line.name) + ' × ' + line.quantity).join(' · ') +
              ' · Booked ' +
              dateText(order.created) +
              '</p></div>' +
              link('/bookings/' + order.reference, 'View ticket ↗', 'outline') +
              '</article>',
          )
          .join('')
      : '<p>No bookings in this section.</p>') +
    '</section>';
  return (
    '<div class="wrap narrow">' +
    intro('YOUR ACCOUNT', 'My tickets', 'View your digital tickets and manage your bookings.') +
    (orders.length
      ? group(
          'Upcoming',
          orders.filter(
            (order) => order.status === 'Confirmed' && Date.parse(order.event.start) >= Date.now(),
          ),
        ) +
        group(
          'Past and cancelled',
          orders.filter(
            (order) => order.status !== 'Confirmed' || Date.parse(order.event.start) < Date.now(),
          ),
        )
      : empty(
          'No bookings yet',
          'Discover an event and your tickets will appear here.',
          '/events',
          'Explore events',
        )) +
    '</div>'
  );
}
