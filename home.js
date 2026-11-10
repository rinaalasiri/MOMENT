function home() {
  const featured = events[0];
  return (
    '<div class="wrap"><section class="hero"><div class="hero-copy"><span' +
    ' class="eyebrow marker">THE SAUDI EVENT EDIT</span><h1>Discover Events' +
    '<br>Worth <em>Remembering.</em></h1><p>From live music in the desert to nights' +
    ' under stadium lights, find your next experience across Saudi Arabia.</p><form' +
    ' id="hero-search" class="search"><label class="sr" for="search-main">Search' +
    ' events</label><input id="search-main" name="q" placeholder="Event, category,' +
    ' or city"><button>Search <span aria-hidden="true">↗</span></button></form><div' +
    ' class="hero-meta" style="visibility: hidden"><span>✦</span> DISCOVER EVENTS. BOOK MOMENTS. MAKE' +
    ' MEMORIES.</div></div><a href="#' +
    eventLink(featured) +
    '" class="hero-image">' +
    image(featured, 1400) +
    '<span class="badge">✦ THE FEATURED MOMENT</span><div><small>ALULA · LIVE MUSIC</small><strong>' +
    featured.name +
    ('</strong><span aria-hidden="true">↗</span></div></a></section><section><div' +
      ' class="section-head"><div><span class="eyebrow">01 / FIND YOUR THING</span>' +
      '<h2>Explore by category</h2></div>') +
    link('/events', 'All events ↗', 'text') +
    '</div><div class="categories">' +
    categories
      .map(
        ([name, icon]) =>
          '<a href="#/events?category=' +
          name +
          '"><span aria-hidden="true">' +
          icon +
          '</span>' +
          name +
          '</a>',
      )
      .join('') +
    ('</div></section><section><div class="section-head"><div><span' +
      ' class="eyebrow">02 / THE MOMENT EDIT</span><h2>Featured events</h2></div>') +
    link('/events', 'Explore events ↗', 'text') +
    '</div>' +
    grid(events.slice(0, 3)) +
    ('</section><section><div class="section-head"><div><span class="eyebrow">03 /' +
      ' SAVE THE DATE</span><h2>Coming up next</h2></div>') +
    link('/events?sort=date', 'All upcoming events ↗', 'text') +
    '</div>' +
    grid(events.slice(3, 6)) +
    ('</section><section><div class="section-head"><div><span class="eyebrow">04 /' +
      ' ACROSS THE KINGDOM</span><h2>Find your city</h2></div></div>') +
    cityLinks() +
    '</section></div>'
  );
}
