const escapeHtml = (value) =>
  String(value ?? '').replace(
    /[&<>"']/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char],
  );
const link = (path, label, style = '') =>
  '<a class="button ' + style + '" href="#' + path + '">' + label + '</a>';
const image = (event, width) =>
  '<img src="' +
  photo(event.image, width) +
  '" alt="" ' +
  (width < 1200 ? 'loading="lazy"' : '') +
  '>';
const intro = (label, title, copy = '') =>
  '<div class="intro"><span class="eyebrow">' +
  label +
  '</span><h1>' +
  title +
  '</h1>' +
  (copy ? '<p>' + copy + '</p>' : '') +
  '</div>';
const eventLink = (event) => '/events/' + event.id;
const categoryIcon = (category) => categories.find((row) => row[0] === category)?.[1] || '✦';
function card(event) {
  return (
    '<article class="card"><a class="card-media" href="#' +
    eventLink(event) +
    '" aria-label="' +
    event.name +
    '">' +
    image(event, 680) +
    '<span class="badge">' +
    event.category +
    '</span></a><div class="card-body"><span class="eyebrow">' +
    dateText(event.start) +
    ' · ' +
    event.city +
    '</span><h3><a href="#' +
    eventLink(event) +
    '">' +
    event.name +
    '</a></h3><p>' +
    event.venue +
    '</p><div class="card-bottom"><div><small>FROM</small><strong>' +
    money(event.tiers[0].price) +
    '</strong></div>' +
    link(eventLink(event), 'View details ↗', 'outline') +
    '</div></div></article>'
  );
}
const grid = (list) => '<div class="grid">' + list.map(card).join('') + '</div>';
const cityLinks = () =>
  '<div class="cities">' +
  featuredCities
    .map(
      (city, index) =>
        '<a href="#/events?city=' +
        encodeURIComponent(city) +
        '"><small>0' +
        (index + 1) +
        '</small><strong>' +
        city +
        '</strong><span aria-hidden="true">↗</span></a>',
    )
    .join('') +
  '</div>';
