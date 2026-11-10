const categories = [
  ['Music', '♫'],
  ['Sports', '⚑'],
  ['Art', '◈'],
  ['Festivals', '✦'],
  ['Entertainment', '◎'],
  ['Workshops', '✎'],
];
const photos = {
  Music: 'images/PHOTO3.jpg',
  Sports: '1579952363873-27f3bade9f55',
  Art: 'images/Art.jpg',
  Festivals: "images/festival.jpg",
  Entertainment: "images/Harmony.jpg",
  Workshops: "images/workshop.jpg",
  Desert: '1509316785289-025f5b846b35',
};
const photo = (key, width = 900) => {
  const source = photos[key]?.trim();
  if (!source) return '';

  if (source.startsWith('images/') || /^https?:\/\//i.test(source)) {
    return source;
  }

  return `https://images.unsplash.com/photo-${source}?auto=format&fit=crop&w=${width}&q=82`;
};
const eventRows = [
  [
    'desert-echoes',
    'Desert Echoes',
    'Music',
    'AlUla',
    'Maraya',
    'Ashar Valley',
    445,
    'An evening of live oud and contemporary arrangements, performed against the' +
      ' dramatic sandstone landscape of Ashar Valley. Arrive early to catch the' +
      ' valley in the last light.',
    'Desert',
  ],
  [
    'riyadh-after-hours',
    'Riyadh After Hours',
    'Music',
    'Riyadh',
    'Mohammed Abdu Arena',
    'Boulevard City',
    380,
    'A late-evening showcase of emerging Saudi vocalists and live bands, moving' +
      ' from acoustic sets to full-stage performances.',
  ],
  [
    'coastal-colors',
    'Coastal Colors',
    'Art',
    'Jeddah',
    'Hayy Jameel',
    'Al Muhammadiyah',
    165,
    'Explore a curated exhibition of photography and installation work reflecting' +
      ' life along the Red Sea coast.',
  ],
  [
    'stadium-nights',
    'Stadium Nights',
    'Sports',
    'Dammam',
    'Prince Mohammed bin Fahd Stadium',
    'Al Shifa',
    95,
    'An evening football exhibition featuring local talent, a pre-match warm-up,' +
      ' and a family-friendly stadium atmosphere.',
  ],
  [
    'oasis-market',
    'Oasis Market Festival',
    'Festivals',
    'Al Ahsa',
    'Qaisariah Souq',
    'Al Hofuf',
    555,
    'Meet local makers, sample dates from the oasis, and discover the craft' +
      ' traditions of Al Ahsa in a guided market experience.',
  ],
  [
    'clay-studio',
    'Clay Studio Sessions',
    'Workshops',
    'Al Khobar',
    'Scitech',
    'Corniche Road',
    180,
    'Learn hand-building techniques and shape a small ceramic vessel with guidance' +
      ' from a local studio instructor.',
  ],
  [
    'mountain-light',
    'Mountain Light',
    'Entertainment',
    'Abha',
    'Art Street',
    'Al Muftaha',
    275,
    'Follow an evening trail of light installations and short performances inspired by the landscapes of Asir.',
  ],
  [
    'rose-workshop',
    'The Taif Rose Workshop',
    'Workshops',
    'Taif',
    'Al Rudaf Park',
    'Al Sadad',
    195,
    'Explore the scent and craft of the Taif rose through a guided blending session' +
      ' and take home your own sample.',
  ],
  [
    'heritage-frames',
    'Heritage in Frames',
    'Art',
    'Madinah',
    'Dar Al Madinah Museum',
    'Knowledge Economic City',
    115,
    'Discover architectural details and urban memory through a guided collection of' +
      ' photographs, models, and stories.',
  ],
  [
    'makkah-makers',
    'Makkah Makers Market',
    'Festivals',
    'Makkah',
    'Makkah Chamber',
    'Al Takhassusi',
   85,
    'Spend an evening browsing ceramics, textiles, and handmade goods while meeting the artisans behind them.',
  ],
  [
    'tabuk-trails',
    'Tabuk Trail Evening',
    'Sports',
    'Tabuk',
    'Prince Fahd bin Sultan Park',
    'Tabuk',
    70,
    'Join a guided group run with a warm-up, marked checkpoints, and a relaxed' +
      ' finish for first-time participants.',
  ],
  [
    'yanbu-harbor',
    'Yanbu Harbor Stories',
    'Entertainment',
    'Yanbu',
    'Yanbu Historic District',
    'Old Town',
    150,
    'Walk through historic lanes with a local storyteller and hear accounts of' +
      ' trade, travel, and life on the waterfront.',
  ],
  [
    'hail-lens',
    'Hail Through the Lens',
    'Art',
    'Hail',
    'A’arif Fort',
    'Central Hail',
    260,
    'A guided photography walk explores the geometry, texture, and changing evening' +
      ' light around the historic fort.',
  ],
  [
    'riyadh-craft',
    'Printmaking in Riyadh',
    'Workshops',
    'Riyadh',
    'JAX District',
    'Diriyah',
    250,
    'Design a small block print, test ink combinations, and produce a numbered print to take home.',
  ],
  [
    'jeddah-corniche',
    'Corniche Family Festival',
    'Festivals',
    'Jeddah',
    'Jeddah Waterfront',
    'Ash Shati',
    155,
    'A family evening of roaming performers, creative activities, and a waterfront stage programme.',
  ],
];
const baseDate = new Date();
const catalogYear = baseDate.getUTCFullYear() + 1;
const events = eventRows.map(
  ([id, name, category, city, venue, district, price, description, image], index) => {
    const day = new Date(Date.UTC(catalogYear, 0, 9 + index * 5)).toISOString().slice(0, 10);
    return {
      id,
      name,
      category,
      city,
      venue,
      address: district + ', ' + city + ', Saudi Arabia',
      country: 'Saudi Arabia',
      description,
      image: image || category,
      date: day,
      start: day + 'T19:00:00+03:00',
      end: day + 'T21:30:00+03:00',
      bookingAvailable: true,
      rules: [
        'Bring your digital ticket for entry.',
        'Doors open 30 minutes before the event.',
        'Children must be accompanied by an adult.',
      ],
      cancellable: index !== 3,
      tiers: [
        { name: 'Standard', price, inventory: 35 },
        { name: 'Premium', price: price + 85, inventory: index === 3 ? 0 : 12 },
      ],
    };
  },
);
const cities = [...new Set(events.map((event) => event.city))].sort();
const featuredCities = [
  'Riyadh',
  'Jeddah',
  'AlUla',
  'Madinah',
  'Makkah',
  'Dammam',
  'Abha',
  'Tabuk',
];
