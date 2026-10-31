/* ==========================================================================
   Nova Cinema — shared content
   One source of truth for films, showtimes, halls, snacks and prices.
   Every page reads from here, so a change made once shows up everywhere.
   NOTE: keep `showtimes` in sync with the table in pages/schedule.html.
   ========================================================================== */

window.NOVA_DATA = {
  movies: [
    /* ---------- Now showing (One Piece Day line-up) ---------- */
    {
      id: 'red',
      status: 'now',
      title: 'One Piece Film: Red',
      short: 'Film: Red',
      year: 2022,
      runtime: 115,
      genres: ['Action', 'Adventure', 'Musical'],
      director: 'Gorō Taniguchi',
      tagline: "The world's diva takes the stage.",
      synopsis: "The world's greatest songstress, Uta, takes the stage for her first-ever live concert — but her true identity and hidden past threaten to pull the Straw Hats into her most personal battle yet.",
      image: 'one-piece-film-red1.jpg',
      imageAlt: 'One Piece Film: Red featuring Uta singing on stage',
      trailerId: '0aCT-MyIBBo',
      themeSong: { title: 'New Genesis', artist: 'Ado', videoId: '1FliVTcX8bQ' },
      accent: '#ff3d6e',
      icon: '🎤'
    },
    {
      id: 'gold',
      status: 'now',
      title: 'One Piece Film: Gold',
      short: 'Film: Gold',
      year: 2016,
      runtime: 120,
      genres: ['Action', 'Adventure', 'Comedy'],
      director: 'Hiroaki Miyamoto',
      tagline: 'The house always wins — until the Straw Hats roll in.',
      synopsis: 'The Straw Hats dock at Gran Tesoro, a glittering entertainment city built on gold and gambling, where the charismatic Gild Tesoro hides a sinister plan beneath all the glamour.',
      image: 'one-piece-film-gold2.jpg',
      imageAlt: 'One Piece Film: Gold showing the golden city of Gran Tesoro',
      trailerId: 'HR0aQPNRInQ',
      themeSong: { title: 'Ikari o Kure yo', artist: 'GLIM SPANKY', videoId: null },
      accent: '#ffc83d',
      icon: '🎰'
    },
    {
      id: 'strong-world',
      status: 'now',
      title: 'One Piece Film: Strong World',
      short: 'Strong World',
      year: 2009,
      runtime: 113,
      genres: ['Action', 'Adventure', 'Fantasy'],
      director: 'Munehisa Sakai',
      tagline: 'The Golden Lion roars again.',
      synopsis: 'The legendary pirate Shiki returns from exile with the power to control a floating island, declaring war on the East Blue and forcing the Straw Hats into one of their toughest fights yet.',
      image: 'one-piece-film-strong-world1.jpg',
      imageAlt: 'One Piece Film: Strong World showing Shiki and his floating islands',
      trailerId: 'XhshqTlXkNg',
      themeSong: { title: 'fanfare', artist: 'Mr.Children', videoId: null },
      accent: '#34d399',
      icon: '🦁'
    },
    {
      id: 'stampede',
      status: 'now',
      title: 'One Piece: Stampede',
      short: 'Stampede',
      year: 2019,
      runtime: 101,
      genres: ['Action', 'Adventure', 'Comedy'],
      director: 'Takashi Otsuka',
      tagline: 'Every legend. One festival.',
      synopsis: "The greatest Pirates' Festival in history brings together nearly every major pirate crew, with the mysterious Douglas Bullet hunting for a treasure that could reshape the entire world.",
      image: 'one-piece-film-stampede1.jpg',
      imageAlt: 'One Piece: Stampede showing the Straw Hat crew surrounded by rival pirates',
      trailerId: 'c8HS5ZrMAho',
      themeSong: { title: 'GONG', artist: 'WANIMA', videoId: 'lGDsQ940-3A' },
      accent: '#ff7a1a',
      icon: '🏴‍☠️'
    },
    {
      id: 'z',
      status: 'now',
      title: 'One Piece Film: Z',
      short: 'Film: Z',
      year: 2012,
      runtime: 108,
      genres: ['Action', 'Adventure', 'Drama'],
      director: 'Tatsuya Nagamine',
      tagline: "One Marine's war on the Age of Pirates.",
      synopsis: 'A former Marine admiral named Z seeks to erase the Age of Pirates entirely, using a weapon powerful enough to sink the world — putting him on a collision course with the Straw Hats.',
      image: 'one-piece-film-z1.jpg',
      imageAlt: 'One Piece Film: Z showing the former Marine Z wielding a massive weapon',
      trailerId: 'KmU4MilEG1o',
      themeSong: { title: 'How You Remind Me', artist: 'Avril Lavigne', videoId: null },
      accent: '#8b9dff',
      icon: '⚓'
    },
    {
      id: 'alabasta',
      status: 'now',
      title: 'One Piece: Adventures in Alabasta',
      short: 'Alabasta',
      year: 2007,
      runtime: 90,
      genres: ['Action', 'Adventure'],
      director: 'Takahiro Imamura',
      tagline: 'A princess, a desert, a kingdom on the brink.',
      synopsis: 'The crew helps Princess Vivi protect her kingdom of Alabasta from a scheming conspiracy, battling through sandstorms and sabotage to stop a civil war before it begins.',
      image: 'one-piece-film-alabasta2.jpg',
      imageAlt: 'Adventures in Alabasta showing Princess Vivi standing in the desert',
      trailerId: 'bEtTkgo3jx0',
      themeSong: { title: 'compass', artist: 'Ai Kawashima', videoId: null },
      accent: '#f0b45a',
      icon: '🐪'
    },

    /* ---------- The Treasure Vault (classic films) ---------- */
    {
      id: 'the-movie',
      status: 'vault',
      title: 'One Piece: The Movie',
      year: 2000,
      genres: ['Adventure', 'Comedy'],
      tagline: 'Where the big-screen voyage began.',
      synopsis: 'Fresh out of the East Blue, Luffy, Zoro, Nami and Usopp chase the legendary treasure of the great pirate Woonan — and run straight into El Drago, a ruthless pirate who wants every last coin for himself.',
      accent: '#f59e0b',
      icon: '💰'
    },
    {
      id: 'clockwork-island',
      status: 'vault',
      title: 'Clockwork Island Adventure',
      year: 2001,
      genres: ['Adventure', 'Comedy'],
      tagline: 'Gears, thieves and a stolen ship.',
      synopsis: 'When the Trump Pirates steal the Going Merry with Nami still aboard, the crew storms Clockwork Island — a towering fortress of gears — to win back their ship and their navigator.',
      accent: '#94a3b8',
      icon: '⚙️'
    },
    {
      id: 'choppers-kingdom',
      status: 'vault',
      title: "Chopper's Kingdom on the Island of Strange Animals",
      year: 2002,
      genres: ['Adventure', 'Comedy', 'Fantasy'],
      tagline: 'All hail King Chopper!',
      synopsis: 'Chopper is crowned king of an island full of eccentric animals — just as a greedy count and his hunters arrive to plunder the island\'s legendary treasure.',
      accent: '#f472b6',
      icon: '🦌'
    },
    {
      id: 'dead-end',
      status: 'vault',
      title: 'Dead End Adventure',
      year: 2003,
      genres: ['Action', 'Adventure'],
      tagline: 'One race. No rules.',
      synopsis: 'Strapped for cash, the Straw Hats enter the Dead End — an underground pirate race with a fortune on the line — only to discover it is a trap set by a fallen Marine named Gasparde.',
      accent: '#ef4444',
      icon: '🏁'
    },
    {
      id: 'sacred-sword',
      status: 'vault',
      title: 'The Curse of the Sacred Sword',
      year: 2004,
      genres: ['Action', 'Drama', 'Fantasy'],
      tagline: 'A blade that turns friends into foes.',
      synopsis: "Zoro reunites with Saga, a childhood friend bound to the cursed Seven Star Sword, and turns against his own crew — leaving Luffy to uncover the truth before the blade's curse awakens.",
      accent: '#a78bfa',
      icon: '⚔️'
    },
    {
      id: 'baron-omatsuri',
      status: 'vault',
      title: 'Baron Omatsuri and the Secret Island',
      year: 2005,
      genres: ['Adventure', 'Drama', 'Fantasy'],
      tagline: 'Paradise has a price.',
      synopsis: 'Lured by an ad for a tropical paradise, the crew lands on Omatsuri Island, where cheerful games against the mysterious Baron hide something far darker. Directed by Mamoru Hosoda.',
      accent: '#10b981',
      icon: '🌺'
    },
    {
      id: 'karakuri-castle',
      status: 'vault',
      title: 'The Giant Mechanical Soldier of Karakuri Castle',
      year: 2006,
      genres: ['Action', 'Adventure', 'Comedy'],
      tagline: 'Treasure, traps and a titan of steel.',
      synopsis: "A tale of the legendary Golden Crown leads the Straw Hats to Mecha Island, where the inventor Ratchet and his giant mechanical soldier stand guard over the island's secrets.",
      accent: '#fb923c',
      icon: '🤖'
    },
    {
      id: 'chopper-sakura',
      status: 'vault',
      title: 'Episode of Chopper Plus: Bloom in the Winter, Miracle Sakura',
      year: 2008,
      genres: ['Adventure', 'Drama'],
      tagline: 'Cherry blossoms in the snow.',
      synopsis: "A reimagining of the Drum Island saga — Chopper's journey from outcast to Straw Hat, now with Franky and Robin aboard, a new threat in Wapol's brother Musshuru, and Dr. Hiriluk's miracle sakura.",
      accent: '#f9a8d4',
      icon: '🌸'
    },
    {
      id: 'straw-hat-chase',
      status: 'vault',
      title: 'One Piece 3D: Straw Hat Chase',
      year: 2011,
      genres: ['Action', 'Comedy'],
      tagline: 'Give. Back. The. Hat.',
      synopsis: "The crew's first fully 3D CG adventure — when Luffy's treasured straw hat is snatched away, the Straw Hats launch a breakneck chase across the sea to get it back.",
      accent: '#facc15',
      icon: '👒'
    }
  ],

  /* Today's One Piece Day line-up — mirrors the table in pages/schedule.html */
  showtimes: [
    { id: 's1', movie: 'red',          hall: 1, time: '10:00' },
    { id: 's2', movie: 'gold',         hall: 3, time: '12:30' },
    { id: 's3', movie: 'strong-world', hall: 2, time: '13:00' },
    { id: 's4', movie: 'stampede',     hall: 1, time: '15:30' },
    { id: 's5', movie: 'z',            hall: 2, time: '16:00' },
    { id: 's6', movie: 'alabasta',     hall: 2, time: '18:00' },
    { id: 's7', movie: 'red',          hall: 3, time: '19:00' },
    { id: 's8', movie: 'stampede',     hall: 1, time: '21:00' }
  ],

  halls: {
    1: { name: 'Hall 1', nickname: 'Sunny Hall',     perks: ['Laser 4K', 'Dolby Atmos'] },
    2: { name: 'Hall 2', nickname: 'Merry Hall',     perks: ['All recliners', '7.1 surround'] },
    3: { name: 'Hall 3', nickname: 'Red Force Hall', perks: ['Concert sound', 'Sing-along ready'] }
  },

  snacks: [
    { id: 'popcorn', name: "Sanji's Gourmet Popcorn",   desc: 'Truffle butter & sea salt, tossed to order.',        price: 8.00,  icon: '🍿' },
    { id: 'meat',    name: "Luffy's Meat-on-the-Bone",  desc: 'Smoky BBQ drumstick bigger than your forearm.',      price: 9.50,  icon: '🍖' },
    { id: 'slushie', name: 'Devil Fruit Slushie',       desc: 'Swirled grape & blueberry. No swimming after.',      price: 5.50,  icon: '🍇' },
    { id: 'soda',    name: "Nami's Tangerine Soda",     desc: 'Fresh-squeezed citrus fizz, Cocoyasi style.',        price: 4.50,  icon: '🍊' },
    { id: 'candy',   name: "Chopper's Cotton Candy",    desc: 'A pink cloud of pure joy. Doctor approved.',         price: 4.00,  icon: '🍭' },
    { id: 'combo',   name: 'Thousand Sunny Combo',      desc: 'Large popcorn, two sodas and a cotton candy.',       price: 18.00, icon: '🎁' }
  ],

  prices: {
    standard: 14,      // rows A–F
    recliner: 18,      // rows G–H
    groupSize: 10,     // seats needed for the group discount
    groupDiscount: 0.15
  },

  contact: {
    address: '1 Grand Line Avenue, Nova City',
    phone: '(555) 012-3456',
    phoneHref: 'tel:+15550123456',
    email: 'novacinema@gmail.com'
  }
};
