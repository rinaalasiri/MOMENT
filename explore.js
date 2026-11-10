function explore(params) {
  const get = (key) => params.get(key) || '';
  const q = get('q').trim().toLowerCase();
  const list = events.filter(
    (event) =>
      (!q ||
        q
          .split(/\s+/)
          .every((word) =>
            [event.name, event.city, event.venue, event.category]
              .join(' ')
              .toLowerCase()
              .includes(word),
          )) &&
      (!get('category') || event.category === get('category')) &&
      (!get('city') || event.city === get('city')) &&
      (!get('from') || event.date >= get('from')) &&
      (!get('to') || event.date <= get('to')) &&
      (!get('min') || event.tiers[0].price >= Number(get('min'))) &&
      (!get('max') || event.tiers[0].price <= Number(get('max'))),
  );
  list.sort((a, b) =>
    get('sort') === 'price'
      ? a.tiers[0].price - b.tiers[0].price
      : get('sort') === 'high'
        ? b.tiers[0].price - a.tiers[0].price
        : a.start.localeCompare(b.start),
  );
  return (
    '<div class="wrap">' +
    intro('THE SAUDI EVENT EDIT', 'Explore events', 'Find your next moment across the Kingdom.') +
    '<form id="filters" class="panel filters">' +
    field(
      'Search events, cities or venues',
      'q',
      'search',
      get('q'),
      'placeholder="Try AlUla or live music"',
    ) +
    select(
      'Category',
      'category',
      [['', 'All categories'], ...categories.map(([name]) => [name, name])],
      get('category'),
    ) +
    select(
      'Saudi city',
      'city',
      [['', 'All Saudi cities'], ...cities.map((city) => [city, city])],
      get('city'),
    ) +
    field('From date', 'from', 'date', get('from')) +
    field('To date', 'to', 'date', get('to')) +
    field('Min price (SAR)', 'min', 'number', get('min'), 'min="0"') +
    field('Max price (SAR)', 'max', 'number', get('max'), 'min="0"') +
    select(
      'Sort by',
      'sort',
      [
        ['', 'Soonest first'],
        ['price', 'Lowest price'],
        ['high', 'Highest price'],
      ],
      get('sort'),
    ) +
    '<div class="actions"><button>Apply filters</button>' +
    link('/events', 'Clear filters', 'outline') +
    '</div></form><section><div class="section-head"><h2>' +
    list.length +
    ' ' +
    (list.length === 1 ? 'event' : 'events') +
    ' found</h2></div>' +
    (list.length
      ? grid(list)
      : empty(
          'No events match',
          'Try a different date range, city, or keyword.',
          '/events',
          'Reset filters',
        )) +
    '</section><section><h2>Explore Saudi cities</h2>' +
    cityLinks() +
    '</section></div>'
  );
}
