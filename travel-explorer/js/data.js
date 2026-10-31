/* ==========================================================================
   TRAVEL EXPLORER — SITE CONTENT
   --------------------------------------------------------------------------
   Every destination and resort on the site lives in this file.
   To add a new one, copy an existing object, give it a unique `id`
   (lowercase-with-hyphens) and fill in the fields. That's it — cards,
   filters, counts and the detail page are all built from this data.

   IMAGES are found automatically from the id:
     Destinations → images/destinations/{id}-hero.jpg, {id}-1.jpg, {id}-2.jpg, {id}-3.jpg
     Resorts      → images/resorts/{id}-hero.jpg, {id}-1.jpg … {id}-4.jpg
   The `alt` texts below describe what each photo should show — if your
   photo is different, update its alt text so screen readers stay accurate.

   VIDEOS: set `video` to a file path, or null for none.

   FACT-CHECKING: lines marked  // <!-- VERIFY -->  contain facts worth
   double-checking against an official source before publishing.
   ========================================================================== */

window.TE_DATA = {
  regions: ['Asia', 'Europe', 'Africa & Middle East', 'Americas', 'Oceania'],

  styles: ['Adventure', 'Culture', 'Beach', 'Nature', 'City', 'Food', 'Romance'],

  budgets: {
    '$': 'Budget-friendly',
    '$$': 'Mid-range',
    '$$$': 'Upscale',
    '$$$$': 'Luxury'
  },

  idealFor: {
    honeymoon: 'Honeymoon',
    family: 'Family',
    solo: 'Solo',
    wellness: 'Wellness'
  },

  /* ======================================================================
     DESTINATIONS (24)
     ====================================================================== */
  destinations: [
    /* ---------------- ASIA ---------------- */
    {
      id: 'kyoto',
      name: 'Kyoto',
      country: 'Japan',
      region: 'Asia',
      featured: true,
      short: 'Ancient temples, bamboo forests, and quiet tea houses — Kyoto is Japan’s cultural heart, best visited in spring for cherry blossoms or autumn for fiery red maples.',
      long: [
        'Kyoto is where ancient tradition meets everyday life. Wander through the bamboo groves of Arashiyama, watch geisha make their way through the lantern-lit streets of Gion, and step inside centuries-old temples like Kinkaku-ji, the Golden Pavilion, glowing against its reflecting pond.',
        'Beyond the postcard views, Kyoto rewards slow travel — quiet tea houses, local izakayas, and neighborhood shrines tucked between modern storefronts. Visit in spring for cherry blossoms or autumn for fiery red maple leaves, when the city feels almost cinematic.',
        'Start early to see the vermilion torii gates of Fushimi Inari before the crowds arrive, then lose yourself in the hillside lanes of Higashiyama, where old wooden townhouses hold pottery studios, sweet shops and tiny cafés. Nishiki Market is a compact, delicious lesson in Kyoto’s food culture.',
        'The city is easy to navigate by bus, train and bicycle, and many of its best moments are unplanned: a moss garden glimpsed through a gate, a temple bell at dusk, a bowl of tofu hot pot on a cold evening. Give it at least three days, and consider a night in a traditional ryokan.'
      ],
      bestTime: 'Late March – early April and November',
      styles: ['Culture', 'Food', 'Nature', 'Romance'],
      budget: '$$$',
      things: [
        { title: 'Fushimi Inari Shrine', text: 'Walk the winding tunnels of vermilion torii gates up the slopes of Mount Inari — go at sunrise for quiet paths.' },
        { title: 'Arashiyama Bamboo Grove', text: 'Hear the hush of towering bamboo, then visit the gardens of nearby Tenryū-ji.' },
        { title: 'Gion at dusk', text: 'Stroll the lantern-lit lanes of Kyoto’s historic geisha district, respecting residents’ privacy.' },
        { title: 'Kinkaku-ji', text: 'See the Golden Pavilion shimmer above its mirror-like reflecting pond.' }
      ],
      alt: {
        hero: 'Wooden temple hall surrounded by red autumn maple trees in Kyoto',
        gallery: [
          'Tunnel of vermilion torii gates along a stone path at Fushimi Inari Shrine',
          'Tall green bamboo stalks lining a walking path in the Arashiyama Bamboo Grove',
          'Lantern-lit wooden teahouses along a narrow street in Gion at dusk'
        ]
      },
      video: 'videos/destinations/kyoto.mp4',
      related: ['hoi-an', 'seoul', 'chiang-mai']
    },
    {
      id: 'bali',
      name: 'Bali',
      country: 'Indonesia',
      region: 'Asia',
      short: 'Lush rice terraces, ancient temples, and world-class surf breaks — Bali blends spiritual calm with vibrant beach town energy.',
      long: [
        'Bali has a way of slowing you down. In the hills around Ubud, emerald rice terraces step down into jungle ravines, and daily offerings of flowers and incense appear on doorsteps and shrines. Hindu temples — from cliff-top Uluwatu to the lake temple of Ulun Danu Beratan — are woven into everyday island life.',
        'On the coast, the mood shifts. Canggu and Uluwatu draw surfers to some of the island’s best-known breaks, while Seminyak trades in beach clubs, boutiques and long sunset dinners. Further east, quieter villages such as Sidemen and Amed offer black-sand beaches, snorkeling and views of Mount Agung.',
        'Bali rewards a mix of both: a few days of yoga, waterfalls and cooking classes inland, followed by surf, seafood and sunsets by the sea. Hire a local driver to explore, dress respectfully at temples, and leave time for doing very little at all.'
      ],
      bestTime: 'April – October (dry season)',
      styles: ['Beach', 'Culture', 'Nature', 'Romance'],
      budget: '$$',
      things: [
        { title: 'Tegallalang rice terraces', text: 'Walk the emerald terraces north of Ubud early in the morning, before the heat.' },
        { title: 'Uluwatu Temple at sunset', text: 'Watch the sun drop into the ocean from a cliff-top temple, followed by a traditional Kecak dance.' },
        { title: 'Sunrise on Mount Batur', text: 'Hike up an active volcano in the dark to watch the sun rise over the island.' },
        { title: 'Surf lesson in Canggu', text: 'Catch your first waves on the beginner-friendly beach breaks of the west coast.' }
      ],
      alt: {
        hero: 'Green rice terraces curving down a hillside surrounded by palm trees in Bali',
        gallery: [
          'Balinese temple gate silhouetted against an orange sunset sky',
          'Surfer carrying a board along a wide sandy beach at low tide',
          'Woman placing a small flower offering on a stone step'
        ]
      },
      video: 'videos/destinations/bali.mp4',
      related: ['zanzibar', 'chiang-mai', 'hoi-an']
    },
    {
      id: 'hoi-an',
      name: 'Hoi An',
      country: 'Vietnam',
      region: 'Asia',
      short: 'Lantern-lit lanes, tailor shops and riverside cafés — Hoi An’s beautifully preserved old town is one of Southeast Asia’s most charming places to linger.',
      long: [
        // <!-- VERIFY --> UNESCO World Heritage listing of Hoi An Ancient Town
        'Hoi An’s Ancient Town feels like a living museum: mustard-yellow merchant houses, Chinese assembly halls and the Japanese Covered Bridge line streets that glow with silk lanterns after dark. Once a busy trading port, the old town is now a UNESCO World Heritage Site and one of the most atmospheric places in Vietnam.',
        'Food is a highlight. Try cao lầu noodles, crispy bánh xèo and the town’s much-loved bánh mì, then take a cooking class that starts with a market visit. By day, cycle out through rice paddies to An Bang Beach, or take a basket-boat ride through the coconut palms.',
        'Come for the slow pace. Have clothes made by a local tailor, float a paper lantern on the Thu Bồn River, and stay long enough to see the old town in the quiet early morning before the day-trippers arrive.'
      ],
      bestTime: 'February – April',
      styles: ['Culture', 'Food', 'Beach', 'Romance'],
      budget: '$',
      things: [
        { title: 'Ancient Town walk', text: 'Explore merchant houses, assembly halls and the Japanese Covered Bridge on foot.' },
        { title: 'Market-to-table cooking class', text: 'Shop for herbs and noodles with a local cook, then make Vietnamese classics yourself.' },
        { title: 'Lanterns on the Thu Bồn', text: 'Take an evening boat ride and float a paper lantern on the river.' },
        { title: 'Cycle to An Bang Beach', text: 'Pedal past rice paddies and water buffalo to a relaxed beach with seafood shacks.' }
      ],
      alt: {
        hero: 'Colorful silk lanterns glowing above a street of yellow shophouses in Hoi An at night',
        gallery: [
          'Wooden boats on the Thu Bồn River beside old town buildings',
          'Round bamboo basket boats floating among coconut palms',
          'Bowl of cao lầu noodles topped with herbs and sliced pork'
        ]
      },
      video: null,
      related: ['kyoto', 'chiang-mai', 'bali']
    },
    {
      id: 'chiang-mai',
      name: 'Chiang Mai',
      country: 'Thailand',
      region: 'Asia',
      short: 'Golden temples, night markets and misty mountains — Chiang Mai is northern Thailand’s laid-back cultural capital.',
      long: [
        'Ringed by an old moat and crumbling city walls, Chiang Mai’s old town is dotted with temples, from the ruined chedi of Wat Chedi Luang to the gilded halls of Wat Phra Singh. Saffron-robed monks, small coffee roasters and leafy guesthouses share the same quiet lanes.',
        'Evenings belong to the markets. The Sunday Walking Street and the Night Bazaar overflow with handicrafts, street food and khao soi, the region’s rich curry noodle soup. On the mountain above the city, the golden temple of Doi Suthep is best reached for sunset.',
        'Beyond the city, the mountains invite slower adventures: jungle treks, hill villages, waterfalls and ethical elephant sanctuaries where you observe rather than ride. Many travelers come for a few days and end up staying for weeks.'
      ],
      bestTime: 'November – February (cool, dry season)',
      styles: ['Culture', 'Food', 'Nature', 'Adventure'],
      budget: '$',
      things: [
        { title: 'Wat Phra That Doi Suthep', text: 'Climb the naga staircase to the golden mountain temple overlooking the city.' },
        { title: 'Sunday Walking Street', text: 'Graze your way through the old town’s biggest weekly market.' },
        { title: 'Farm cooking class', text: 'Pick ingredients in an organic garden and cook a feast of northern Thai dishes.' },
        { title: 'Ethical elephant sanctuary', text: 'Spend a day observing rescued elephants in a no-riding sanctuary.' }
      ],
      alt: {
        hero: 'Golden temple spire at Doi Suthep glowing in warm evening light',
        gallery: [
          'Ancient brick chedi of Wat Chedi Luang against a blue sky',
          'Crowded night market lit by hanging lights and food stalls',
          'Misty green mountains and forest in northern Thailand'
        ]
      },
      video: null,
      related: ['hoi-an', 'bali', 'kyoto']
    },
    {
      id: 'seoul',
      name: 'Seoul',
      country: 'South Korea',
      region: 'Asia',
      short: 'Royal palaces, neon-lit markets and late-night food streets — Seoul moves fast, but its history is never far away.',
      long: [
        'Seoul is a city of contrasts. Joseon-era palaces such as Gyeongbokgung sit beneath glass towers, and traditional hanok houses in Bukchon line the hills above some of Asia’s most fashionable neighborhoods. Few capitals blend old and new quite so confidently.',
        'Eat your way through it. Gwangjang Market serves sizzling mung-bean pancakes and fresh kimbap, Korean barbecue fills the evenings, and cafés and street stalls keep the city going well past midnight. In between, browse the streets of Myeongdong, Hongdae and Seongsu.',
        'When the pace gets too much, Seoul has escape hatches: walk sections of the Seoul City Wall, hike in Bukhansan National Park on the city’s edge, or follow the restored Cheonggyecheon stream through downtown. Spring blossoms and autumn leaves make both seasons especially lovely.'
      ],
      bestTime: 'April – May and September – November',
      styles: ['City', 'Food', 'Culture'],
      budget: '$$',
      things: [
        { title: 'Gyeongbokgung Palace', text: 'Tour the grandest of Seoul’s royal palaces and catch the gate guard ceremony.' },
        { title: 'Bukchon Hanok Village', text: 'Wander hilly lanes of traditional wooden houses — quietly, as people live here.' },
        { title: 'Gwangjang Market', text: 'Pull up a stool for mung-bean pancakes, kimbap and noodles.' },
        { title: 'Hike Bukhansan', text: 'Climb granite peaks for sweeping views back over the city.' }
      ],
      alt: {
        hero: 'Traditional palace gate in Seoul with modern skyscrapers rising behind it',
        gallery: [
          'Rooftops of traditional hanok houses in Bukchon with the city skyline beyond',
          'Busy food stalls inside Gwangjang Market with steam rising from pans',
          'City lights of Seoul seen at night from a mountain viewpoint'
        ]
      },
      video: null,
      related: ['kyoto', 'hoi-an', 'chiang-mai']
    },

    /* ---------------- EUROPE ---------------- */
    {
      id: 'lisbon',
      name: 'Lisbon',
      country: 'Portugal',
      region: 'Europe',
      featured: true,
      short: 'Pastel buildings, rattling trams, and fresh seafood by the water — an affordable, walkable city with easy day trips to Sintra and Cascais.',
      long: [
        'Lisbon’s hills, pastel buildings, and rattling yellow trams give it a charm that’s hard to replicate. Spend mornings wandering the narrow lanes of Alfama, catch a sunset from one of the city’s many miradouros, and end the day with fresh seafood and a glass of vinho verde.',
        'The city is walkable, affordable compared to much of Western Europe, and close enough to day-trip to Sintra’s fairy-tale palaces or the beaches of Cascais. It’s a favorite for first-time visitors to Europe and repeat travelers alike.',
        'Head west to Belém for the grand Jerónimos Monastery and a warm pastel de nata. At night, the bars of Bairro Alto spill into the streets, while small taverns in Alfama and Mouraria fill with the sound of fado.',
        'Wear comfortable shoes — Lisbon’s cobbled hills are steep — and use the trams, funiculars and the Santa Justa Lift to save your legs. Spring and early autumn bring warm days and fewer crowds.'
      ],
      bestTime: 'March – May and September – October',
      styles: ['City', 'Food', 'Culture', 'Romance'],
      budget: '$$',
      things: [
        { title: 'Tram 28 through Alfama', text: 'Ride the classic yellow tram through the city’s oldest, steepest lanes.' },
        { title: 'Belém & pastéis de nata', text: 'Visit the Jerónimos Monastery, then taste custard tarts still warm from the oven.' },
        { title: 'Day trip to Sintra', text: 'Explore romantic palaces and misty forest gardens in the hills west of the city.' },
        { title: 'A night of fado', text: 'Listen to Portugal’s soulful songs in an intimate Alfama tavern.' }
      ],
      alt: {
        hero: 'Yellow tram climbing a narrow street of pastel buildings in Lisbon',
        gallery: [
          'Terracotta rooftops of Alfama stretching down to the Tagus River',
          'Ornate stone cloister of the Jerónimos Monastery in Belém',
          'Plate of golden custard tarts dusted with cinnamon'
        ]
      },
      video: null,
      related: ['santorini', 'dubrovnik', 'marrakech']
    },
    {
      id: 'reykjavik',
      name: 'Reykjavik',
      country: 'Iceland',
      region: 'Europe',
      short: 'Gateway to glaciers, hot springs, and the Northern Lights — a small capital surrounded by some of the most dramatic landscapes on Earth.',
      long: [
        'Reykjavik is a capital on a human scale: colorful tin-clad houses, harbor-side seafood shacks and the soaring concrete spire of Hallgrímskirkja watching over it all. It’s easy to explore on foot in a day — but the real draw lies beyond the city limits.',
        'A short drive away is the Golden Circle — the rift valley of Þingvellir, the erupting Strokkur geyser and the thundering Gullfoss waterfall. Further along the south coast, black-sand beaches, glacier tongues and waterfalls you can walk behind make for unforgettable road trips.',
        'The seasons shape everything here. Summer brings the midnight sun and endless hiking light; winter brings short days, ice caves and the chance of the Northern Lights dancing overhead. Whenever you come, end the day the Icelandic way — soaking in a geothermal pool.'
      ],
      bestTime: 'June – August for long days; September – March for Northern Lights',
      styles: ['Nature', 'Adventure'],
      budget: '$$$$',
      things: [
        { title: 'Drive the Golden Circle', text: 'See tectonic rifts, spouting geysers and a mighty waterfall in a single day.' },
        { title: 'Soak in a geothermal lagoon', text: 'Relax in naturally warm water surrounded by lava fields.' },
        { title: 'Hunt the Northern Lights', text: 'Head away from city lights on a clear winter night for the aurora.' },
        { title: 'South Coast waterfalls', text: 'Walk behind Seljalandsfoss and stand on the black sands near Vík.' }
      ],
      alt: {
        hero: 'Green Northern Lights swirling over a snowy landscape near Reykjavik',
        gallery: [
          'Colorful houses and the tall spire of Hallgrímskirkja church in Reykjavik',
          'Huge waterfall plunging into a misty canyon on the Golden Circle',
          'People bathing in a steaming milky-blue geothermal lagoon'
        ]
      },
      video: 'videos/destinations/reykjavik.mp4',
      related: ['banff', 'patagonia', 'edinburgh']
    },
    {
      id: 'santorini',
      name: 'Santorini',
      country: 'Greece',
      region: 'Europe',
      short: 'Whitewashed villages on volcanic cliffs and sunsets over the caldera — Santorini is the Aegean’s most romantic island.',
      long: [
        'Santorini is what remains of an ancient volcano, and you feel it everywhere: in the sheer caldera cliffs, the dark volcanic beaches and the mineral-rich soil that grows the island’s Assyrtiko grapes. Along the rim, villages like Oia, Fira and Imerovigli tumble down the cliffs in a cascade of white walls and blue domes.',
        // <!-- VERIFY --> Akrotiri is a Bronze Age (Minoan-era) settlement
        'Watch the sun sink into the caldera from Oia — or find a quieter terrace in Imerovigli — then dine on fresh fish, fava and tomato fritters. By day, sail to the volcanic islets and warm springs, swim at the island’s colorful beaches, or wander the excavated Bronze Age town of Akrotiri.',
        'Summer is hot and busy, especially when cruise ships are in port. Visit in late spring or early autumn for warm water, softer light and calmer lanes, and stay a night on the caldera if your budget allows — the view at dawn is worth it.'
      ],
      bestTime: 'May – June and September – October',
      styles: ['Romance', 'Beach', 'Food'],
      budget: '$$$',
      things: [
        { title: 'Sunset in Oia', text: 'Find your spot early to watch the sun melt into the caldera.' },
        { title: 'Caldera sailing trip', text: 'Sail to the volcanic islets, swim in warm springs and snorkel in clear water.' },
        { title: 'Volcanic wine tasting', text: 'Taste crisp Assyrtiko at a local winery with views over the sea.' },
        { title: 'Ancient Akrotiri', text: 'Walk through a remarkably preserved prehistoric town buried by ash.' }
      ],
      alt: {
        hero: 'White houses and blue-domed churches on a cliff above the sea in Oia, Santorini',
        gallery: [
          'Sailboat on the deep blue caldera beneath steep volcanic cliffs',
          'Rows of vines growing low to the ground in volcanic soil',
          'Narrow whitewashed lane with steps and bougainvillea'
        ]
      },
      video: 'videos/destinations/santorini.mp4',
      related: ['amalfi-coast', 'dubrovnik', 'lisbon']
    },
    {
      id: 'dubrovnik',
      name: 'Dubrovnik',
      country: 'Croatia',
      region: 'Europe',
      short: 'Marble streets and mighty walls on the Adriatic — Dubrovnik’s Old Town is a medieval masterpiece by the sea.',
      long: [
        'Dubrovnik’s Old Town is wrapped in towering medieval walls, and walking their full circuit is the best introduction to the city: terracotta rooftops on one side, the shimmering Adriatic on the other. Inside, the polished limestone of the Stradun leads past baroque churches, monasteries and tiny stepped alleys.',
        // <!-- VERIFY --> Game of Thrones filming locations in Dubrovnik
        'Take the cable car up Mount Srđ for a sweeping view at sunset, swim from the rocks below the walls, or hop on a short boat ride to leafy Lokrum Island. Fans of Game of Thrones will recognize plenty of filming locations around town.',
        'The Old Town gets very crowded in high summer. Explore early in the morning or in the evening, travel in the shoulder seasons, and use Dubrovnik as a base for trips to the Elaphiti Islands or the vineyards of the Pelješac peninsula.'
      ],
      bestTime: 'May – June and September',
      styles: ['Culture', 'Beach', 'Romance', 'City'],
      budget: '$$$',
      things: [
        { title: 'Walk the City Walls', text: 'Circle the Old Town on its ramparts for views over rooftops and sea.' },
        { title: 'Cable car up Mount Srđ', text: 'Ride up at golden hour for the classic view of the walled city.' },
        { title: 'Kayak to Lokrum', text: 'Paddle around the walls and across to a peaceful island nature reserve.' },
        { title: 'Elaphiti Islands day trip', text: 'Hop between small islands for beaches, villages and seafood lunches.' }
      ],
      alt: {
        hero: 'Walled Old Town of Dubrovnik with orange rooftops beside the blue Adriatic Sea',
        gallery: [
          'Polished limestone street of the Stradun lined with stone buildings',
          'Kayakers paddling beneath the city walls of Dubrovnik',
          'View over the Old Town at sunset from the top of Mount Srđ'
        ]
      },
      video: null,
      related: ['santorini', 'amalfi-coast', 'prague']
    },
    {
      id: 'amalfi-coast',
      name: 'Amalfi Coast',
      country: 'Italy',
      region: 'Europe',
      short: 'Pastel villages clinging to cliffs above a sparkling sea — the Amalfi Coast is Italy at its most glamorous.',
      long: [
        'Few drives are as famous as the road that twists along the Amalfi Coast, hairpin after hairpin, above a sea so blue it barely looks real. Positano spills down the hillside in shades of pink and peach, Amalfi gathers around its striking cathedral, and Ravello floats high above it all with gardens and sweeping views.',
        'Life here is about long lunches and slow afternoons: fresh seafood, lemon-scented everything — including limoncello — and swims from small pebble beaches. Hike the Path of the Gods for cliff-top views, or rent a boat to explore grottoes and hidden coves from the water.',
        'Ferries and buses connect the villages, which is often easier than driving in summer traffic. Spring and early autumn are ideal: warm enough to swim, but calmer than July and August. Stay in Ravello or a smaller village for quiet evenings after the day-trippers leave.'
      ],
      bestTime: 'May – June and September',
      styles: ['Romance', 'Beach', 'Food'],
      budget: '$$$$',
      things: [
        { title: 'Hike the Path of the Gods', text: 'Follow an old mule track high above Positano with jaw-dropping coastal views.' },
        { title: 'Boat trip along the coast', text: 'See the villages from the water and swim in hidden coves.' },
        { title: 'Gardens of Ravello', text: 'Wander the terraces of Villa Rufolo and Villa Cimbrone above the sea.' },
        { title: 'Lemon & limoncello tasting', text: 'Visit a terraced lemon grove and taste the coast’s famous liqueur.' }
      ],
      alt: {
        hero: 'Pastel houses of Positano stacked on a steep hillside above the sea',
        gallery: [
          'Small boats moored in a turquoise cove on the Amalfi Coast',
          'Hiking trail along a cliff edge high above the coastline',
          'Basket of bright yellow lemons on a terrace overlooking the sea'
        ]
      },
      video: null,
      related: ['santorini', 'dubrovnik', 'lisbon']
    },
    {
      id: 'edinburgh',
      name: 'Edinburgh',
      country: 'Scotland',
      region: 'Europe',
      short: 'A castle on an ancient volcano, cobbled closes and wild hills inside the city — Edinburgh is history with a lively soul.',
      long: [
        'Edinburgh is built for dramatic entrances. Its castle crowns an extinct volcano, the Royal Mile runs down through the medieval Old Town to the Palace of Holyroodhouse, and narrow closes lead off into hidden courtyards. Across the gardens, the Georgian New Town offers a more elegant, orderly kind of beauty.',
        'Climb Arthur’s Seat for a view over the whole city and out to the sea, then warm up in a wood-paneled pub. Visit in August and the city transforms during festival season, when performers fill the streets, theaters and every available space.',
        'Beyond the city, Edinburgh is a gateway to Scotland: day trips run to the Highlands, Loch Lomond and the coastal villages of East Lothian. Pack layers — the weather can change several times in a day — and save time for a whisky tasting.'
      ],
      bestTime: 'May – September (August for festivals)',
      styles: ['City', 'Culture', 'Nature'],
      budget: '$$$',
      things: [
        { title: 'Edinburgh Castle', text: 'Explore the fortress on Castle Rock and its views over the city.' },
        { title: 'Hike Arthur’s Seat', text: 'Climb the city’s ancient volcano for a panoramic view.' },
        { title: 'The Royal Mile & closes', text: 'Duck into narrow alleys and courtyards off the Old Town’s main street.' },
        { title: 'Highlands day trip', text: 'Head north for lochs, glens and moody mountain scenery.' }
      ],
      alt: {
        hero: 'Edinburgh Castle on a rocky hill above the city at sunset',
        gallery: [
          'Steep cobbled street in the Old Town lined with stone buildings',
          'Grassy summit of Arthur’s Seat looking over Edinburgh',
          'Misty Highland glen with a winding road and mountains'
        ]
      },
      video: null,
      related: ['reykjavik', 'prague', 'dubrovnik']
    },
    {
      id: 'prague',
      name: 'Prague',
      country: 'Czech Republic',
      region: 'Europe',
      short: 'Gothic spires, a castle on the hill and a bridge lined with statues — Prague is a fairy tale you can walk through.',
      long: [
        'Prague’s skyline of spires and domes has survived remarkably intact, and the city still feels wonderfully storybook. Cross the statue-lined Charles Bridge at dawn, climb up to Prague Castle, and get lost in the tangle of lanes around Old Town Square and its famous astronomical clock.',
        'Every neighborhood has its own mood: the baroque palaces and gardens of Malá Strana, the historic Jewish Quarter of Josefov, and the cafés and beer gardens of Vinohrady and Letná. Czech beer is a point of national pride, and hearty dishes are best enjoyed in an old-school pub.',
        'Prague is compact, walkable and good value for a European capital. Visit in spring or autumn for gentler crowds, or in December, when Christmas markets fill the squares with mulled wine and wooden stalls.'
      ],
      bestTime: 'April – May, September – October and December',
      styles: ['City', 'Culture', 'Romance'],
      budget: '$$',
      things: [
        { title: 'Charles Bridge at sunrise', text: 'Cross the historic bridge before the crowds, with the castle glowing above.' },
        { title: 'Prague Castle', text: 'Explore the castle complex and the soaring St. Vitus Cathedral.' },
        { title: 'Old Town Square', text: 'Watch the astronomical clock put on its show on the hour.' },
        { title: 'Letná beer garden', text: 'Join locals for a cold beer with one of the best views of the bridges.' }
      ],
      alt: {
        hero: 'Charles Bridge and Prague Castle across the river at sunrise',
        gallery: [
          'Gothic towers and pastel facades around Old Town Square in Prague',
          'Detailed face of the medieval astronomical clock',
          'Christmas market stalls lit up in a city square at night'
        ]
      },
      video: null,
      related: ['edinburgh', 'dubrovnik', 'lisbon']
    },

    /* ---------------- AFRICA & MIDDLE EAST ---------------- */
    {
      id: 'cape-town',
      name: 'Cape Town',
      country: 'South Africa',
      region: 'Africa & Middle East',
      featured: true,
      short: 'Table Mountain, dramatic coastlines, and nearby Winelands make Cape Town one of the most scenic cities in the world, rich in history and natural beauty.',
      long: [
        'Few cities pack in as much natural drama as Cape Town. Table Mountain rises dramatically over the skyline, offering hikers panoramic views that stretch to the Atlantic. Nearby, the Cape Peninsula winds past penguin colonies, dramatic cliffs, and some of the world’s most scenic coastal drives.',
        'The city itself blends vibrant markets, world-class dining, and a complex, layered history that’s essential to understanding South Africa today. Pair a city stay with a short trip to the Winelands for a fuller picture of the region.',
        // <!-- VERIFY --> Robben Island tours led by former political prisoners
        'Take the ferry to Robben Island, where Nelson Mandela was imprisoned, for a moving tour often guided by former political prisoners. Then explore the colorful houses of Bo-Kaap, browse the V&A Waterfront, and watch the sun set from Signal Hill.',
        'Hire a car to drive Chapman’s Peak and meet the African penguins at Boulders Beach, then spend a day or two tasting wine in Stellenbosch or Franschhoek. Summer brings long, sunny days; winter is greener, quieter and good value.'
      ],
      bestTime: 'November – March (summer)',
      styles: ['Nature', 'Adventure', 'Food', 'City'],
      budget: '$$',
      things: [
        { title: 'Table Mountain', text: 'Hike or ride the cable car to the flat-topped summit for views over the city and ocean.' },
        { title: 'Boulders Beach penguins', text: 'Watch a colony of African penguins waddle along the sand.' },
        { title: 'Robben Island', text: 'Learn about South Africa’s struggle for freedom on a guided island tour.' },
        { title: 'The Winelands', text: 'Taste wines among the mountain-ringed vineyards of Stellenbosch and Franschhoek.' }
      ],
      alt: {
        hero: 'Flat-topped Table Mountain rising above Cape Town and its harbor',
        gallery: [
          'African penguins standing on large granite boulders at Boulders Beach',
          'Brightly painted houses on a cobbled street in Bo-Kaap',
          'Rows of vineyards in a valley surrounded by mountains'
        ]
      },
      video: 'videos/destinations/cape-town.mp4',
      related: ['zanzibar', 'marrakech', 'lagos']
    },
    {
      id: 'marrakech',
      name: 'Marrakech',
      country: 'Morocco',
      region: 'Africa & Middle East',
      // <!-- VERIFY --> "at the edge of the Sahara": the Atlas Mountains lie between Marrakech and the Sahara
      short: 'Bustling souks, ornate palaces, and the scent of spices in the air — Marrakech is a sensory-rich stop at the edge of the Sahara.',
      long: [
        'Marrakech is a city that engages every sense. In the medina, a maze of souks sells everything from hand-woven rugs and brass lanterns to leather slippers and saffron, while mint tea is poured from great heights in tiny cafés. At its heart, Jemaa el-Fnaa square becomes an open-air theater of food stalls, musicians and storytellers at dusk.',
        'Behind the bustle lies remarkable calm. The carved cedar and tilework of the Bahia Palace, the serene Ben Youssef Madrasa and the cobalt-blue Jardin Majorelle offer quiet moments, as do the city’s riads — traditional courtyard houses turned into intimate guesthouses.',
        'Use Marrakech as a base for the Atlas Mountains, where Berber villages and valley hikes are an easy day trip, or travel further to the desert on a multi-day tour. Spring and autumn are the most comfortable seasons; summer can be extremely hot.'
      ],
      bestTime: 'March – May and September – November',
      styles: ['Culture', 'Food', 'City'],
      budget: '$$',
      things: [
        { title: 'Jemaa el-Fnaa at dusk', text: 'Watch the main square fill with food stalls, music and storytellers.' },
        { title: 'Jardin Majorelle', text: 'Stroll a cobalt-blue villa and cactus garden in the new town.' },
        { title: 'Bahia Palace', text: 'Admire carved ceilings, painted doors and peaceful courtyards.' },
        { title: 'Atlas Mountains day trip', text: 'Visit Berber villages and hike through green valleys beneath the peaks.' }
      ],
      alt: {
        hero: 'Colorful lanterns and rugs hanging in a narrow souk in Marrakech',
        gallery: [
          'Smoke rising from food stalls in Jemaa el-Fnaa square at dusk',
          'Bright cobalt-blue walls and cactus garden at Jardin Majorelle',
          'Tiled courtyard with a fountain and orange trees inside a riad'
        ]
      },
      video: null,
      related: ['cairo', 'petra', 'lisbon']
    },
    {
      id: 'zanzibar',
      name: 'Zanzibar',
      country: 'Tanzania',
      region: 'Africa & Middle East',
      short: 'Spice-scented alleys in Stone Town and powder-white beaches lapped by turquoise water — Zanzibar is the Indian Ocean at its most enchanting.',
      long: [
        'Zanzibar’s Stone Town is a labyrinth of narrow alleys, carved wooden doors and old merchant houses that tell the story of centuries of Swahili, Arab, Indian and European influence. Get deliberately lost, then follow the scent of grilled seafood to the Forodhani Gardens night market.',
        // <!-- VERIFY --> Tide patterns on the north coast and kitesurfing in Paje
        'Beyond town, the island is ringed with white-sand beaches. The north coast around Nungwi and Kendwa is popular for swimming, while the east coast’s Paje is a hub for kitesurfing. Snorkel the reefs, sail on a traditional dhow at sunset, or visit a spice farm to see where cloves, nutmeg and cinnamon grow.',
        'Zanzibar pairs beautifully with a mainland safari in Tanzania. The long dry season is the most popular time to visit; dress modestly in Stone Town and villages, as the island is predominantly Muslim.'
      ],
      bestTime: 'June – October and January – February',
      styles: ['Beach', 'Culture', 'Food', 'Romance'],
      budget: '$$',
      things: [
        { title: 'Stone Town walking tour', text: 'Discover carved doors, old forts and hidden courtyards with a local guide.' },
        { title: 'Spice farm visit', text: 'Smell, taste and learn about the spices that made the island famous.' },
        { title: 'Snorkel the reefs', text: 'Take a boat out to coral reefs teeming with tropical fish.' },
        { title: 'Sunset dhow cruise', text: 'Sail on a traditional wooden boat as the sky turns gold.' }
      ],
      alt: {
        hero: 'White sand beach with a wooden dhow boat on turquoise water in Zanzibar',
        gallery: [
          'Ornately carved wooden door in a Stone Town alley',
          'Handful of cloves, cinnamon sticks and nutmeg at a spice farm',
          'Traditional dhow sailing at sunset off the Zanzibar coast'
        ]
      },
      video: null,
      related: ['cape-town', 'bali', 'lagos']
    },
    {
      id: 'petra',
      name: 'Petra',
      country: 'Jordan',
      region: 'Africa & Middle East',
      short: 'A rose-red city carved into desert cliffs — walking through the Siq to the Treasury is one of travel’s great moments.',
      long: [
        // <!-- VERIFY --> Nabataean origins and approximate age of the Treasury
        'Nothing quite prepares you for your first sight of Petra. You walk through the Siq, a narrow canyon whose sandstone walls rise high on either side, until it opens onto the Treasury — Al-Khazneh — its facade carved directly into the rose-colored rock by the Nabataeans some two thousand years ago.',
        // <!-- VERIFY --> Petra by Night schedule
        'The Treasury is only the beginning. Paths lead past royal tombs, a theater cut into the hillside and up hundreds of rock-cut steps to the Monastery, where the view across the desert rewards the climb. Allow at least two days, and look out for Petra by Night, when the Siq is lit by candlelight.',
        'Combine Petra with a night under the stars in the red desert of Wadi Rum and a float in the Dead Sea for a classic Jordan journey. Spring and autumn offer the best walking weather; start early to beat both the heat and the crowds.'
      ],
      bestTime: 'March – May and September – November',
      styles: ['Culture', 'Adventure'],
      budget: '$$',
      things: [
        { title: 'Walk the Siq', text: 'Follow the winding canyon to the first view of the Treasury.' },
        { title: 'Climb to the Monastery', text: 'Tackle the rock-cut steps to one of Petra’s grandest monuments and its desert views.' },
        { title: 'Petra by Night', text: 'See the Treasury lit by candles on selected evenings.' },
        { title: 'Overnight in Wadi Rum', text: 'Sleep under the stars in a desert camp among red sandstone mountains.' }
      ],
      alt: {
        hero: 'Rose-colored Treasury facade carved into a cliff at Petra',
        gallery: [
          'Narrow sandstone canyon of the Siq with towering curved walls',
          'Monastery facade carved into a mountainside under a blue sky',
          'Red desert landscape and rock formations in Wadi Rum'
        ]
      },
      video: null,
      related: ['cairo', 'marrakech', 'machu-picchu']
    },
    {
      id: 'cairo',
      name: 'Cairo',
      country: 'Egypt',
      region: 'Africa & Middle East',
      short: 'The Pyramids of Giza, the city of a thousand minarets and the endless energy of the Nile — Cairo is where ancient history comes to life.',
      long: [
        // <!-- VERIFY --> Grand Egyptian Museum opening status and galleries
        'Cairo is loud, chaotic and utterly unforgettable. On the city’s edge, the Pyramids of Giza and the Great Sphinx have drawn travelers for thousands of years, and standing before them is still breathtaking. The Grand Egyptian Museum nearby showcases extraordinary treasures from the age of the pharaohs.',
        'In Islamic Cairo, medieval mosques, madrasas and city gates crowd the streets around the Khan el-Khalili bazaar, where copper lanterns, spices and perfume bottles spill out of tiny shops. Coptic Cairo shelters some of the city’s oldest churches.',
        'Take a felucca out on the Nile at sunset, eat koshari from a busy local spot, and plan onward travel to Luxor and Aswan for the temples of Upper Egypt. The cooler months from autumn to spring are the most comfortable time to visit.'
      ],
      bestTime: 'October – April',
      styles: ['Culture', 'City', 'Food'],
      budget: '$',
      things: [
        { title: 'Pyramids of Giza', text: 'Stand before the last surviving wonder of the ancient world and the Great Sphinx.' },
        { title: 'Grand Egyptian Museum', text: 'Explore a vast collection of pharaonic treasures.' },
        { title: 'Khan el-Khalili', text: 'Haggle for lanterns and spices in the historic bazaar.' },
        { title: 'Sunset felucca', text: 'Drift along the Nile on a traditional sailboat as the city lights come on.' }
      ],
      alt: {
        hero: 'Great Pyramids of Giza rising from the desert under a hazy sky',
        gallery: [
          'Stone face of the Great Sphinx with a pyramid behind it',
          'Glowing brass lanterns for sale in the Khan el-Khalili bazaar',
          'White-sailed felucca boat on the Nile at sunset'
        ]
      },
      video: null,
      related: ['petra', 'marrakech', 'lagos']
    },
    {
      id: 'lagos',
      name: 'Lagos',
      country: 'Nigeria',
      region: 'Africa & Middle East',
      short: 'Afrobeats, art galleries and beach weekends — Lagos is West Africa’s boldest, most creative megacity.',
      long: [
        'Lagos runs on energy. Nigeria’s commercial capital is a sprawling city of islands and lagoons where traffic, music and ambition never seem to switch off. It’s also one of Africa’s most exciting creative hubs, home to a booming music scene, bold fashion and contemporary art.',
        // <!-- VERIFY --> Nike Art Gallery and Lekki Conservation Centre canopy walkway details
        'Start at the Nike Art Gallery in Lekki, packed floor to ceiling with Nigerian art, then explore the galleries and restaurants of Ikoyi and Victoria Island. Walk the canopy walkway at the Lekki Conservation Centre, and in the evening catch live music at one of the city’s famous venues.',
        'Weekends are for the water: take a boat from Victoria Island to the beaches of Tarkwa Bay or Ilashe. Eat jollof rice, suya and pepper soup wherever locals are queuing, and visit in the drier months around December, when the city’s social calendar is at its liveliest.'
      ],
      bestTime: 'November – February (dry season)',
      styles: ['City', 'Food', 'Culture', 'Beach'],
      budget: '$$',
      things: [
        { title: 'Nike Art Gallery', text: 'Browse floors of paintings, textiles and sculpture by Nigerian artists.' },
        { title: 'Lekki Conservation Centre', text: 'Walk above the forest canopy and spot monkeys and birdlife.' },
        { title: 'Beach day by boat', text: 'Ride out to Tarkwa Bay for sand, sea and grilled fish.' },
        { title: 'Live music night', text: 'Dance to Afrobeats and highlife at one of the city’s music venues.' }
      ],
      alt: {
        hero: 'Lagos skyline and the Lekki-Ikoyi Link Bridge lit up at dusk',
        gallery: [
          'Colorful paintings and textiles displayed in an art gallery in Lagos',
          'Wooden canopy walkway winding through green forest treetops',
          'Plate of smoky jollof rice with grilled chicken and plantain'
        ]
      },
      video: null,
      related: ['cape-town', 'zanzibar', 'cairo']
    },

    /* ---------------- AMERICAS ---------------- */
    {
      id: 'banff',
      name: 'Banff',
      country: 'Canada',
      region: 'Americas',
      short: 'Turquoise lakes, snow-capped peaks, and endless hiking trails — Banff National Park is one of the most breathtaking corners of the Canadian Rockies.',
      long: [
        // <!-- VERIFY --> Banff is Canada's oldest national park
        'Banff is Canada’s oldest national park, and it still feels like a postcard come to life. Glacier-fed lakes such as Lake Louise and Moraine Lake glow an almost impossible turquoise, framed by jagged peaks and dense pine forest. The mountain town of Banff makes a cozy base, with hot springs, cafés and wildlife wandering the edge of town.',
        'Summer is for hiking — to the Lake Agnes Tea House above Lake Louise, along the catwalks of Johnston Canyon to its waterfalls, or up to alpine meadows bursting with wildflowers. Drive the Icefields Parkway toward Jasper for glaciers, waterfalls and one of the most scenic roads anywhere.',
        'Winter brings skiing on the surrounding mountains, frozen waterfalls and skating on Lake Louise. Whatever the season, keep an eye out for elk, bighorn sheep and bears — and carry bear spray on the trails.'
      ],
      bestTime: 'June – September for hiking; December – March for skiing',
      styles: ['Nature', 'Adventure'],
      budget: '$$$',
      things: [
        { title: 'Lake Louise & Moraine Lake', text: 'Arrive early to see the turquoise water at its calmest.' },
        { title: 'Johnston Canyon', text: 'Follow catwalks along a limestone gorge to two waterfalls.' },
        { title: 'Icefields Parkway', text: 'Drive past glaciers, peaks and lakes on a spectacular mountain road.' },
        { title: 'Banff Upper Hot Springs', text: 'Soak in warm mineral water with mountain views.' }
      ],
      alt: {
        hero: 'Turquoise Moraine Lake surrounded by snowy mountain peaks in Banff National Park',
        gallery: [
          'Wooden canoes on Lake Louise with a glacier in the background',
          'Metal catwalk along a narrow gorge with a waterfall in Johnston Canyon',
          'Elk grazing in a meadow with pine-covered mountains behind'
        ]
      },
      video: 'videos/destinations/banff.mp4',
      related: ['patagonia', 'reykjavik', 'queenstown']
    },
    {
      id: 'machu-picchu',
      name: 'Machu Picchu & Cusco',
      country: 'Peru',
      region: 'Americas',
      short: 'An Inca citadel in the clouds and a colonial city built on Inca stone — Peru’s most iconic journey.',
      long: [
        // <!-- VERIFY --> Cusco altitude (approx. 3,400 m)
        'Cusco was the capital of the Inca Empire, and its history is written in its walls: Spanish colonial churches and mansions rest on foundations of perfectly fitted Inca stonework. The city sits at high altitude, so take a day or two to acclimatize — easily done wandering its plazas, markets and the hillside lanes of San Blas.',
        // <!-- VERIFY --> Machu Picchu built in the 15th century
        'From Cusco, the Sacred Valley unfolds with terraced hillsides, Andean villages and ruins such as Pisac and Ollantaytambo. Then comes Machu Picchu, the 15th-century Inca citadel perched on a mountain ridge above the Urubamba River. Arrive by train, or earn your first view the classic way on the multi-day Inca Trail.',
        // <!-- VERIFY --> Permit and ticket limits for the Inca Trail and Machu Picchu
        'Permits for the Inca Trail and entry tickets for Machu Picchu are limited and can sell out well in advance, so plan early. The dry season brings clearer skies, while the shoulder months offer greener landscapes and fewer visitors.'
      ],
      bestTime: 'May – September (dry season)',
      styles: ['Adventure', 'Culture', 'Nature'],
      budget: '$$',
      things: [
        { title: 'Hike the Inca Trail', text: 'Trek through cloud forest and mountain passes to arrive through the Sun Gate.' },
        { title: 'Sunrise at Machu Picchu', text: 'Catch the first light spilling over the citadel and Huayna Picchu.' },
        { title: 'The Sacred Valley', text: 'Explore Inca terraces, markets and the fortress of Ollantaytambo.' },
        { title: 'Cusco’s San Blas', text: 'Wander the artisan quarter’s steep streets, workshops and cafés.' }
      ],
      alt: {
        hero: 'Stone ruins of Machu Picchu on a green mountain ridge wrapped in clouds',
        gallery: [
          'Colonial cathedral and plaza in Cusco with mountains behind',
          'Hikers on a stone stairway along the Inca Trail',
          'Green agricultural terraces curving around a hillside in the Sacred Valley'
        ]
      },
      video: 'videos/destinations/machu-picchu.mp4',
      related: ['patagonia', 'petra', 'rio-de-janeiro']
    },
    {
      id: 'tulum',
      name: 'Tulum',
      country: 'Mexico',
      region: 'Americas',
      short: 'Mayan ruins above a turquoise sea, jungle cenotes and barefoot beach bars — Tulum is the free spirit of the Riviera Maya.',
      long: [
        'Tulum’s most famous view is also its most unusual: a walled Mayan city perched on a limestone cliff above the Caribbean, its ruins framed by palm trees and turquoise water. Arrive early to explore before the heat and crowds, then swim at the beach below.',
        // <!-- VERIFY --> Current rules for visiting and climbing at Cobá
        'Inland, the jungle hides cenotes — natural sinkholes filled with clear, cool water that are perfect for swimming and snorkeling. Many are easy to reach by bike or car, and the ruins of Cobá, set deep in the forest, make a great day trip.',
        // <!-- VERIFY --> Sargassum (seaweed) season along the Caribbean coast
        'Along the beach road, eco-chic hotels, yoga studios and candlelit restaurants set a laid-back tone, and the Sian Ka’an Biosphere Reserve protects lagoons, mangroves and wildlife nearby. The winter months bring the driest weather; check seaweed forecasts if beach time matters most.'
      ],
      bestTime: 'November – April (dry season)',
      styles: ['Beach', 'Culture', 'Romance', 'Nature'],
      budget: '$$$',
      things: [
        { title: 'Tulum ruins by the sea', text: 'Explore cliff-top Mayan temples overlooking the Caribbean.' },
        { title: 'Swim in a cenote', text: 'Float in crystal-clear water inside a jungle sinkhole.' },
        { title: 'Sian Ka’an boat trip', text: 'Glide through lagoons and mangrove channels looking for wildlife.' },
        { title: 'Cycle to Cobá', text: 'Explore jungle-covered ruins and pyramids by bike.' }
      ],
      alt: {
        hero: 'Mayan ruins on a cliff above a turquoise Caribbean beach in Tulum',
        gallery: [
          'Swimmer floating in the clear blue water of a cave cenote',
          'Palm trees leaning over white sand and calm turquoise water',
          'Stone pyramid rising above the jungle canopy at Cobá'
        ]
      },
      video: null,
      related: ['rio-de-janeiro', 'zanzibar', 'bali']
    },
    {
      id: 'rio-de-janeiro',
      name: 'Rio de Janeiro',
      country: 'Brazil',
      region: 'Americas',
      short: 'Golden beaches, samba rhythms and mountains rising from the sea — Rio is one of the world’s most spectacular cities.',
      long: [
        'Rio de Janeiro has one of the most dramatic settings of any city on Earth. Granite peaks rise straight out of the ocean, rainforest covers the hills, and long golden beaches curve between them. From the summit of Corcovado, Christ the Redeemer looks out over it all.',
        'Life here moves to the rhythm of the beach. Copacabana and Ipanema are city institutions, where locals play beach volleyball, sip coconut water and applaud the sunset from Arpoador rock. Ride the cable car up Sugarloaf Mountain, wander the hilltop lanes and murals of Santa Teresa, and find live samba in the bars of Lapa.',
        // <!-- VERIFY --> Carnival dates change every year
        'Hike in the Tijuca Forest, a vast rainforest inside the city, for waterfalls and viewpoints. Carnival, usually held in February or early March, is the biggest party of the year — book well ahead if you want to join in.'
      ],
      bestTime: 'Year-round; December – March for beach season and Carnival',
      styles: ['City', 'Beach', 'Adventure', 'Food'],
      budget: '$$',
      things: [
        { title: 'Christ the Redeemer', text: 'Ride up Corcovado for the city’s most famous view.' },
        { title: 'Sugarloaf cable car', text: 'Ascend the granite peak in two stages for sunset over the bay.' },
        { title: 'Ipanema & Arpoador', text: 'Spend a day on the beach and join the applause at sunset.' },
        { title: 'Samba in Lapa', text: 'Dance the night away to live samba beneath the old aqueduct.' }
      ],
      alt: {
        hero: 'Sugarloaf Mountain rising above Guanabara Bay and Rio de Janeiro at sunset',
        gallery: [
          'Statue of Christ the Redeemer on Corcovado above the clouds',
          'Long curve of Copacabana beach with umbrellas and high-rise buildings',
          'Colorful mosaic tile steps in the Santa Teresa neighborhood'
        ]
      },
      video: null,
      related: ['tulum', 'machu-picchu', 'lagos']
    },
    {
      id: 'patagonia',
      name: 'Patagonia',
      country: 'Chile & Argentina',
      region: 'Americas',
      short: 'Granite towers, blue glaciers and endless wind-swept steppe — Patagonia is one of the last great wildernesses.',
      long: [
        'Patagonia stretches across the southern tip of South America, shared between Chile and Argentina — a land of jagged peaks, vast ice fields and skies that seem to go on forever. Towns are few and far between, which is exactly the point.',
        'In Chile, Torres del Paine National Park is a hiker’s dream, with the famous W Trek circling granite towers, turquoise lakes and hanging glaciers. Across the border in Argentina, El Calafate is the gateway to the Perito Moreno Glacier, where walls of blue ice crack and crash into the lake, and El Chaltén offers trails to the foot of Mount Fitz Roy.',
        'The hiking season runs through the southern summer, when days are long — but the weather is famously changeable, with strong winds at any time. Pack layers, book refuges and park accommodation early, and leave spare days in your itinerary.'
      ],
      bestTime: 'November – March (southern summer)',
      styles: ['Adventure', 'Nature'],
      budget: '$$$',
      things: [
        { title: 'Hike the W Trek', text: 'Spend several days walking between the highlights of Torres del Paine.' },
        { title: 'Perito Moreno Glacier', text: 'Watch huge blocks of ice break from the glacier front.' },
        { title: 'Fitz Roy from El Chaltén', text: 'Hike to Laguna de los Tres for the classic view of the peaks.' },
        { title: 'Wildlife spotting', text: 'Look for guanacos, condors and foxes across the open steppe.' }
      ],
      alt: {
        hero: 'Granite towers of Torres del Paine glowing pink above a blue lake at sunrise',
        gallery: [
          'Wall of blue ice at the front of the Perito Moreno Glacier',
          'Hiker on a trail with the jagged Fitz Roy massif ahead',
          'Herd of guanacos grazing on golden Patagonian grassland'
        ]
      },
      video: 'videos/destinations/patagonia.mp4',
      related: ['banff', 'queenstown', 'machu-picchu']
    },

    /* ---------------- OCEANIA ---------------- */
    {
      id: 'queenstown',
      name: 'Queenstown',
      country: 'New Zealand',
      region: 'Oceania',
      featured: true,
      short: 'Set on Lake Wakatipu against the Southern Alps, Queenstown is New Zealand’s adventure capital — skydiving, hiking, and jet boating year-round.',
      long: [
        // <!-- VERIFY --> Queenstown as the birthplace of commercial bungee jumping
        'Set against the Southern Alps on the edge of Lake Wakatipu, Queenstown is built for adventure. It’s the birthplace of commercial bungee jumping and a hub for skydiving, jet boating, and hiking trails that open onto some of the most dramatic scenery in the world.',
        'But it’s not all adrenaline — nearby wineries, relaxed lakeside cafés, and scenic drives through Fiordland make it easy to slow down between activities. Visit in winter for skiing or summer for hiking and water sports.',
        'Take the gondola up Bob’s Peak for a view over the lake and mountains, then ride the luge back down. Day trips run to Milford Sound, where waterfalls pour down sheer cliffs into the fiord, and the vineyards of Gibbston Valley are close by for wine tasting.',
        'Nearby Arrowtown, a former gold-rush settlement, is especially lovely in autumn, when its trees turn gold. Whatever your pace, Queenstown makes it easy to balance big thrills with long lunches and lake views.'
      ],
      bestTime: 'December – February for summer; June – August for skiing',
      styles: ['Adventure', 'Nature', 'Food'],
      budget: '$$$',
      things: [
        { title: 'Kawarau Bridge bungee', text: 'Take the plunge above a river gorge just outside town.' },
        { title: 'Milford Sound', text: 'Cruise beneath waterfalls and towering cliffs in Fiordland.' },
        { title: 'Skyline gondola & luge', text: 'Ride up Bob’s Peak for sweeping views, then race back down.' },
        { title: 'Gibbston Valley wineries', text: 'Taste local wines in a valley ringed by mountains.' }
      ],
      alt: {
        hero: 'Queenstown on the shore of Lake Wakatipu with the Remarkables mountains behind',
        gallery: [
          'Person bungee jumping from a bridge over a turquoise river gorge',
          'Steep green cliffs and a waterfall rising from the water at Milford Sound',
          'Golden autumn trees along the main street of Arrowtown'
        ]
      },
      video: null,
      related: ['banff', 'patagonia', 'reykjavik']
    }
  ],

  /* ======================================================================
     SPECIAL RESORTS (12)
     `destination` links a resort to a destination page:
       relation 'in'   → the resort is in that destination
       relation 'pair' → a destination that pairs well on the same trip
     Prices are intentionally shown only as a tier ($$$$) — never as amounts.
     ====================================================================== */
  resorts: [
    {
      id: 'soneva-jani',
      name: 'Soneva Jani',
      location: 'Noonu Atoll, Maldives',
      country: 'Maldives',
      region: 'Asia',
      destination: null,
      tagline: 'Barefoot luxury on a private world floating in the Indian Ocean.',
      writeup: [
        'There are luxury resorts, and then there’s Soneva Jani — a place that feels less like a hotel and more like a private world floating on the Indian Ocean. Scattered across a lagoon in the Noonu Atoll, its overwater villas are connected by winding wooden walkways, each one private enough that you could go days without seeing another guest unless you wanted to.',
        'What makes Soneva Jani genuinely special isn’t just the water villas with retractable roofs that slide open to reveal the night sky from bed — though that alone is reason enough to visit. It’s the quiet philosophy behind the whole resort: barefoot luxury, minimal noise, minimal waste, maximum presence. Staff go barefoot. Shoes are optional everywhere. The pace of the place forces you to slow down, whether you’re gliding down a private waterslide straight into the lagoon or paddleboarding out at sunrise while the water is still glass.',
        // <!-- VERIFY --> "one of the largest telescopes in the Indian Ocean"
        'Beyond the villas, the resort runs an observatory with one of the largest telescopes in the Indian Ocean, a cinema that screens films on a giant outdoor screen over the water, and a “chocolate room” that’s exactly as indulgent as it sounds. Meals lean into sustainability as much as flavor — much of the produce comes from the resort’s own gardens, and the seafood is sourced with a level of care that’s rare even among high-end properties.',
        'It’s not a cheap trip, and it’s not meant to be. Soneva Jani sells an experience of total disconnection — no crowds, no noise, nothing but water, sky, and time. For travelers chasing a once-in-a-lifetime stay rather than just another beach vacation, it’s hard to find anywhere quite like it.'
      ],
      experiences: [
        'Overwater villas with retractable roofs for stargazing from bed',
        'Private waterslides straight into the lagoon',
        'An observatory for guided stargazing',
        'Outdoor cinema on a giant screen over the water',
        'The famously indulgent Chocolate Room',
        'Sunrise paddleboarding on glassy water'
      ],
      idealFor: ['honeymoon', 'family', 'wellness'],
      price: '$$$$',
      alt: {
        hero: 'Overwater villas connected by curving wooden walkways over a turquoise lagoon at Soneva Jani',
        gallery: [
          'Waterslide curving from a villa deck down into clear lagoon water',
          'Villa bedroom open to the night sky through a retractable roof',
          'Outdoor cinema screen set up over the water at dusk',
          'Paddleboarder gliding across a calm lagoon at sunrise'
        ]
      },
      video: 'videos/resorts/soneva-jani.mp4'
    },
    {
      id: 'the-brando',
      name: 'The Brando',
      location: 'Tetiaroa, French Polynesia',
      country: 'French Polynesia',
      region: 'Oceania',
      destination: null,
      tagline: 'Marlon Brando’s private atoll, reimagined as an eco-luxury hideaway.',
      writeup: [
        // <!-- VERIFY --> Brando's connection to Tetiaroa and location north of Tahiti
        'The Brando sits on Tetiaroa, a ring of small islands around a turquoise lagoon north of Tahiti that the actor Marlon Brando fell in love with decades ago. He dreamed of a place where people could reconnect with nature and Polynesian culture — and that vision lives on in one of the most secluded resorts in the South Pacific.',
        'Guests stay in private villas tucked among the palms, each with its own plunge pool, outdoor living space and a few steps to a white-sand beach. Days drift between snorkeling in the lagoon, cycling between the beaches and slow afternoons at the spa, set among the trees.',
        // <!-- VERIFY --> Seawater air-conditioning system and partnership with the Tetiaroa Society
        'What sets The Brando apart is its commitment to the atoll itself. The resort was designed with sustainability at its core, including a seawater air-conditioning system, and works alongside the Tetiaroa Society, which leads conservation and research on the island. Guests can visit Bird Island, learn about sea turtles and meet the people working to protect them.',
        // <!-- VERIFY --> Access by private flight from Tahiti
        'It’s a stay for travelers who want true remoteness without giving up comfort — and who care about leaving a place as beautiful as they found it. Reached by a short private flight from Tahiti, The Brando feels like your own corner of the Pacific.'
      ],
      experiences: [
        'Private villas with plunge pools steps from the beach',
        'Snorkeling in a protected lagoon',
        'Guided visits to Bird Island',
        'Conservation talks with the Tetiaroa Society',
        'Polynesian-inspired spa treatments among the trees'
      ],
      idealFor: ['honeymoon', 'family', 'wellness'],
      price: '$$$$',
      alt: {
        hero: 'Thatched villa on a white-sand beach beside a turquoise lagoon on Tetiaroa',
        gallery: [
          'Aerial view of a ring of palm-covered islets around a lagoon',
          'Private plunge pool surrounded by tropical plants',
          'Snorkeler swimming above coral in clear shallow water',
          'Seabirds nesting among the trees on Bird Island'
        ]
      },
      video: 'videos/resorts/the-brando.mp4'
    },
    {
      id: 'four-seasons-bora-bora',
      name: 'Four Seasons Bora Bora',
      location: 'Bora Bora, French Polynesia',
      country: 'French Polynesia',
      region: 'Oceania',
      destination: null,
      tagline: 'Overwater bungalows facing the most famous mountain in the South Pacific.',
      writeup: [
        // <!-- VERIFY --> Resort location on a motu facing Mount Otemanu
        'Bora Bora’s lagoon is a spectrum of blues, from pale aquamarine to deep sapphire, and the Four Seasons sits on a motu — a small islet on the reef — looking straight across the water to the volcanic peak of Mount Otemanu. It’s the view that made Bora Bora famous, framed from the deck of your own bungalow.',
        'The overwater bungalows are the heart of the stay, with steps leading straight into the lagoon and plenty of space to do nothing at all. Beachfront villas offer more room for families and longer stays.',
        // <!-- VERIFY --> Ruahatu Lagoon Sanctuary and marine biology programme
        'The resort’s lagoon sanctuary is a place to snorkel among coral gardens and learn about the efforts to protect them from resident marine experts. The spa draws on Polynesian traditions, with treatments inspired by island ingredients.',
        'Days are made of canoe breakfasts, sunset sails and dinners by the water. For honeymooners especially, it’s the South Pacific of the imagination — made effortlessly real.'
      ],
      experiences: [
        'Overwater bungalows with steps into the lagoon',
        'Snorkeling in the resort’s lagoon sanctuary',
        'Breakfast delivered by outrigger canoe',
        'Sunset sailing with views of Mount Otemanu',
        'Polynesian-inspired spa rituals'
      ],
      idealFor: ['honeymoon', 'family'],
      price: '$$$$',
      alt: {
        hero: 'Row of overwater bungalows on a blue lagoon facing the peak of Mount Otemanu',
        gallery: [
          'Bungalow deck with steps leading down into clear turquoise water',
          'Outrigger canoe carrying a breakfast tray across the lagoon',
          'Colorful fish swimming around coral in a shallow lagoon',
          'Catamaran sailing past Bora Bora at sunset'
        ]
      },
      video: 'videos/resorts/four-seasons-bora-bora.mp4'
    },
    {
      id: 'amanpuri',
      name: 'Amanpuri',
      location: 'Phuket, Thailand',
      country: 'Thailand',
      region: 'Asia',
      destination: { id: 'chiang-mai', relation: 'pair' },
      tagline: 'Aman’s original sanctuary, among the coconut palms of Phuket’s west coast.',
      writeup: [
        // <!-- VERIFY --> Amanpuri as the first Aman resort, meaning of the name, and Pansea Beach location
        'Amanpuri — often translated as “place of peace” — was the very first Aman resort, and many say it remains the purest expression of the brand’s quiet, unhurried style. Set on a coconut-palm headland on Phuket’s west coast, it looks out over the Andaman Sea above a sheltered beach.',
        'Thai-style pavilions are scattered through the gardens, connected by paths and steps, while larger villas with private pools sit further along the headland. The architecture is low, open and calm, with dark timber, steep pitched roofs and views framed through the palms.',
        // <!-- VERIFY --> Wellness programmes and boat charters offered
        'The resort has a strong wellness focus, with a spa set into the hillside and programs that combine treatments, movement and nutrition. Out on the water, guests can charter boats to explore the islands of the Andaman Sea.',
        'It’s a place to slow down completely: swim in the central pool, read on the beach and watch the sky turn gold over the sea. For travelers who value privacy and serenity over spectacle, Amanpuri endures.'
      ],
      experiences: [
        'Thai pavilions among coconut palms',
        'Wellness immersions at the hillside spa',
        'Island-hopping by boat in the Andaman Sea',
        'Sunsets over the sea from the headland',
        'Quiet days on a sheltered beach'
      ],
      idealFor: ['honeymoon', 'wellness', 'family'],
      price: '$$$$',
      alt: {
        hero: 'Thai-style pavilion with a steep roof among coconut palms above the Andaman Sea',
        gallery: [
          'Dark-tiled swimming pool lined with palm trees',
          'Spa treatment room open to tropical gardens',
          'Wooden boat anchored near limestone islands',
          'Sheltered sandy beach below a palm-covered headland'
        ]
      },
      video: 'videos/resorts/amanpuri.mp4'
    },
    {
      id: 'nihi-sumba',
      name: 'Nihi Sumba',
      location: 'Sumba, Indonesia',
      country: 'Indonesia',
      region: 'Asia',
      destination: { id: 'bali', relation: 'pair' },
      tagline: 'Wild, untamed luxury on an island few travelers ever reach.',
      writeup: [
        'Sumba lies east of Bali, but it feels like another world: rolling savannah, traditional villages with towering thatched roofs, and empty beaches pounded by Indian Ocean surf. Nihi Sumba sits on one of those beaches, a remote retreat built to celebrate the island rather than escape it.',
        // <!-- VERIFY --> Villa types and limited guest access to the surf break
        'Villas are scattered along the coast and hillside, many with private pools and open-air bathrooms. Horses canter along the sand at sunset, and surfers come for a renowned left-hand reef break just offshore, where the number of surfers is kept deliberately small.',
        // <!-- VERIFY --> "Spa Safari" experience and the resort's community foundation work
        'The signature experience is the Spa Safari, a journey across the island’s hills and villages to a cliff-top spa where an entire day is devoted to relaxation. The resort also supports community projects on the island, and guests can visit nearby villages with local guides.',
        'Nihi Sumba is for travelers who want adventure and soul alongside comfort — where the luxury is space, wildness and a genuine connection to place. It’s remote, and that’s precisely its magic.'
      ],
      experiences: [
        'The all-day Spa Safari',
        'Horse riding along the beach at sunset',
        'Surfing a famous left-hand reef break',
        'Village visits with local guides',
        'Private pool villas above the ocean'
      ],
      idealFor: ['honeymoon', 'solo', 'wellness'],
      price: '$$$$',
      alt: {
        hero: 'Thatched villa above a wild beach with crashing surf on Sumba',
        gallery: [
          'Horses galloping along a beach at sunset',
          'Surfer riding a long left-hand wave over a reef',
          'Cliff-top spa pavilion overlooking the ocean',
          'Traditional Sumba village houses with tall thatched roofs'
        ]
      },
      video: 'videos/resorts/nihi-sumba.mp4'
    },
    {
      id: 'hoshinoya-kyoto',
      name: 'Hoshinoya Kyoto',
      location: 'Arashiyama, Kyoto, Japan',
      country: 'Japan',
      region: 'Asia',
      destination: { id: 'kyoto', relation: 'in' },
      tagline: 'A riverside retreat in Arashiyama, reached by wooden boat.',
      writeup: [
        // <!-- VERIFY --> Arrival by private boat along the river
        'Hoshinoya Kyoto begins with a journey: a short boat ride along the river, away from the crowds of Arashiyama and into a forested gorge where the only sounds are water and birdsong. The inn feels hidden in plain sight, just minutes from one of Kyoto’s busiest areas.',
        'Rooms blend traditional elements — tatami, sliding paper screens and deep wooden tubs — with quiet modern comfort, and windows frame the river and wooded hills. The changing seasons are the main event, from spring blossoms to the fiery maples of autumn.',
        // <!-- VERIFY --> Kaiseki dining and cultural activities offered
        'Dinner is a seasonal multi-course kaiseki meal, beautifully composed and presented. Guests can take part in traditional cultural activities, or simply sit by the garden and watch the light change on the water.',
        'Stay here and Kyoto takes on a different rhythm: early mornings in the bamboo grove before the crowds, slow afternoons by the river and evenings in near-silence. It’s a gentle, deeply Japanese kind of luxury.'
      ],
      experiences: [
        'Arrival by boat along the river',
        'Seasonal kaiseki dinner',
        'Traditional cultural activities',
        'Early-morning walks to the Arashiyama bamboo grove',
        'River-view rooms that change with the seasons'
      ],
      idealFor: ['honeymoon', 'solo', 'wellness'],
      price: '$$$$',
      alt: {
        hero: 'Traditional wooden building beside a river in a forested gorge in Arashiyama',
        gallery: [
          'Small wooden boat on a calm river surrounded by autumn trees',
          'Tatami room with sliding screens opening onto a river view',
          'Beautifully arranged seasonal kaiseki dishes on lacquer trays',
          'Raked gravel and moss garden beside the river'
        ]
      },
      video: 'videos/resorts/hoshinoya-kyoto.mp4'
    },
    {
      id: 'singita-lebombo',
      name: 'Singita Lebombo Lodge',
      location: 'Kruger National Park, South Africa',
      country: 'South Africa',
      region: 'Africa & Middle East',
      destination: { id: 'cape-town', relation: 'pair' },
      tagline: 'Glass-walled suites on a cliff above the African bush.',
      writeup: [
        // <!-- VERIFY --> Private concession within Kruger and the N'wanetsi River location
        'Singita Lebombo Lodge perches on a cliff above the N’wanetsi River in a private area of Kruger National Park, with suites that feel like treehouses made of glass and steel. Wake to a view over the river, where animals come down to drink.',
        'Game drives with expert guides and trackers explore a landscape rich in wildlife, from big cats to elephant and buffalo. Walking safaris offer a slower, more intimate way to read the bush.',
        // <!-- VERIFY --> Dining, wine cellar and spa facilities
        'The lodge’s design is light and minimal, letting the landscape take center stage. Meals focus on fresh, seasonal ingredients, South African wines feature proudly, and the spa looks straight out into the bush.',
        // <!-- VERIFY --> Singita's conservation and community programmes
        'Conservation and community work are central to Singita’s philosophy, so a stay supports the protection of the land you’re exploring. Combine it with a few days in Cape Town and the Winelands for a classic South African journey.'
      ],
      experiences: [
        'Game drives with expert guides and trackers',
        'Guided walking safaris',
        'Glass-walled suites above the river',
        'South African wine tastings',
        'Spa treatments overlooking the bush'
      ],
      idealFor: ['honeymoon', 'family', 'solo'],
      price: '$$$$',
      alt: {
        hero: 'Glass-walled lodge suite on a cliff overlooking a river and the African bush',
        gallery: [
          'Elephants drinking from a river at golden hour',
          'Open safari vehicle on a dirt track through the bush',
          'Lion resting in long golden grass',
          'Outdoor deck with loungers overlooking the bush at sunset'
        ]
      },
      video: 'videos/resorts/singita-lebombo.mp4'
    },
    {
      id: 'six-senses-zighy-bay',
      name: 'Six Senses Zighy Bay',
      location: 'Musandam Peninsula, Oman',
      country: 'Oman',
      region: 'Africa & Middle East',
      destination: null,
      tagline: 'A secluded bay between mountains and sea — arrive by paraglider if you dare.',
      writeup: [
        // <!-- VERIFY --> Design inspired by a traditional village
        'Six Senses Zighy Bay hides in a dramatic cove on Oman’s Musandam Peninsula, where rugged mountains plunge down to a long sandy beach. Inspired by a traditional village, its stone-and-timber pool villas sit right on the sand or on the slopes above.',
        // <!-- VERIFY --> Paragliding arrival option
        'The arrival is legendary: guests can choose to paraglide down from the mountain to the beach with an instructor, arrive by speedboat or take the winding mountain road. However you come, the feeling of seclusion is immediate.',
        // <!-- VERIFY --> Spa traditions and mountain-top restaurant
        'Days are spent snorkeling, diving and kayaking in clear water, hiking mountain trails or relaxing in the spa. For dinner, a restaurant perched high on the mountain looks out over the whole bay.',
        'It’s a place that balances adventure with deep rest — ideal for couples, families and anyone curious about a quieter, wilder side of the Arabian Peninsula.'
      ],
      experiences: [
        'Tandem paragliding arrival',
        'Private pool villas on the beach',
        'Mountain-top dining above the bay',
        'Snorkeling, diving and kayaking',
        'Six Senses spa journeys'
      ],
      idealFor: ['honeymoon', 'family', 'wellness'],
      price: '$$$$',
      alt: {
        hero: 'Stone villas along a sandy bay beneath rugged mountains in Oman',
        gallery: [
          'Paraglider descending toward a beach between mountains',
          'Private plunge pool in a stone courtyard villa',
          'Restaurant terrace high on a mountain overlooking a bay at dusk',
          'Kayak floating on clear turquoise water near rocky cliffs'
        ]
      },
      video: 'videos/resorts/six-senses-zighy-bay.mp4'
    },
    {
      id: 'royal-mansour',
      name: 'Royal Mansour',
      location: 'Marrakech, Morocco',
      country: 'Morocco',
      region: 'Africa & Middle East',
      destination: { id: 'marrakech', relation: 'in' },
      tagline: 'A private medina of riads, crafted by Morocco’s finest artisans.',
      writeup: [
        // <!-- VERIFY --> Location within the medina walls and rooftop plunge pools in each riad
        'Royal Mansour is less a hotel than a medina of its own, just inside the old city walls of Marrakech. Instead of rooms, guests stay in private riads — multi-level houses arranged around courtyards, many with a plunge pool on the roof.',
        // <!-- VERIFY --> Royal commission and the underground service tunnels
        'Created as a showcase of Moroccan craftsmanship, every surface tells a story: carved cedar, hand-cut tiles, intricate plasterwork and brass lanterns made by master artisans. Staff move discreetly through passages beneath the gardens, so the calm above is rarely disturbed.',
        'Lush gardens surround a spa that is a sanctuary in itself, with traditional hammam rituals at its heart. Dining ranges from refined Moroccan cuisine to international menus, served in courtyards and candlelit salons.',
        'Step outside and the souks and squares of the medina are minutes away; step back in and the noise dissolves. For a stay that captures the artistry of Morocco in its most refined form, there are few places like it.'
      ],
      experiences: [
        'Private riads with rooftop terraces',
        'Traditional hammam rituals',
        'Moroccan dining in courtyards and salons',
        'Strolls through landscaped gardens',
        'Easy access to the medina and its souks'
      ],
      idealFor: ['honeymoon', 'family', 'wellness'],
      price: '$$$$',
      alt: {
        hero: 'Riad courtyard with intricate tilework, carved arches and a central fountain',
        gallery: [
          'Rooftop terrace with a plunge pool overlooking Marrakech',
          'Detailed carved plaster and cedar wood ceiling',
          'Candlelit hammam with arched marble walls',
          'Garden path lined with palms and flowering plants'
        ]
      },
      video: 'videos/resorts/royal-mansour.mp4'
    },
    {
      id: 'belmond-hotel-caruso',
      name: 'Belmond Hotel Caruso',
      location: 'Ravello, Amalfi Coast, Italy',
      country: 'Italy',
      region: 'Europe',
      destination: { id: 'amalfi-coast', relation: 'in' },
      tagline: 'A historic palace with an infinity pool high above the Amalfi Coast.',
      writeup: [
        // <!-- VERIFY --> 11th-century origins of the palace
        'High above the sea in Ravello, Belmond Hotel Caruso occupies a palace whose origins date back to the 11th century. From its terraces, the view sweeps down over lemon groves and village rooftops to the Gulf of Salerno far below.',
        'The hotel’s infinity pool, seemingly suspended at the edge of the cliff, is one of the coast’s most memorable places for a swim. Inside, frescoed ceilings, vaulted halls and antique details mix with light, elegant rooms, many with sea views.',
        // <!-- VERIFY --> Ravello's music festival and activities offered by the hotel
        'Ravello is known for its gardens and its long tradition of music, and the hotel’s own gardens are a pleasure to wander, with pergolas, flowers and secluded corners. Guests can explore the coast by boat, take cooking classes, or walk to nearby Villa Rufolo and Villa Cimbrone.',
        'Staying up in Ravello means quieter evenings than the busy towns below — just church bells, sea air and long dinners on the terrace. It’s the Amalfi Coast at its most graceful.'
      ],
      experiences: [
        'Infinity pool above the Gulf of Salerno',
        'Private boat trips along the coast',
        'Italian cooking classes',
        'Walks to the gardens of Villa Rufolo and Villa Cimbrone',
        'Terrace dining at sunset'
      ],
      idealFor: ['honeymoon', 'wellness', 'solo'],
      price: '$$$$',
      alt: {
        hero: 'Infinity pool at the edge of a cliff overlooking the Amalfi Coast',
        gallery: [
          'Frescoed ceiling above an elegant hotel lounge',
          'Garden pergola draped with flowers above the sea',
          'Wooden boat cruising along the Amalfi coastline',
          'Candlelit terrace table with a view of the coast at dusk'
        ]
      },
      video: 'videos/resorts/belmond-hotel-caruso.mp4'
    },
    {
      id: 'fogo-island-inn',
      name: 'Fogo Island Inn',
      location: 'Fogo Island, Newfoundland, Canada',
      country: 'Canada',
      region: 'Americas',
      destination: null,
      tagline: 'A striking inn on the edge of the North Atlantic, rooted in island community.',
      writeup: [
        // <!-- VERIFY --> Architect Todd Saunders and ocean views from every room
        'Fogo Island Inn stands on stilts at the edge of the North Atlantic, a bold white building designed by Newfoundland-born architect Todd Saunders that looks out over rocky shores to the open ocean. Floor-to-ceiling windows frame icebergs in spring and wild storms in winter.',
        // <!-- VERIFY --> Ownership by Shorefast and reinvestment of profits in the community
        'The inn is run by Shorefast, a charitable organization dedicated to the island’s future, with profits reinvested in the community. Furniture, quilts and textiles are made by local craftspeople, and community hosts introduce guests to island life and traditions.',
        // <!-- VERIFY --> The island's "seasons" and dining philosophy
        'The island has seasons all its own — from iceberg season and summer berries to dramatic late-autumn storms. Meals celebrate local ingredients such as cod, wild berries and foraged plants, with menus shaped by what the land and sea offer.',
        'It’s a place for hiking coastal trails, visiting artists’ studios dotted around the island and watching the weather roll in from a window seat. Remote, thoughtful and deeply human, it redefines what a luxury stay can mean.'
      ],
      experiences: [
        'Ocean-view rooms with floor-to-ceiling windows',
        'Island tours with community hosts',
        'Iceberg watching in season',
        'Coastal hiking trails',
        'Seasonal Newfoundland cuisine'
      ],
      idealFor: ['honeymoon', 'solo', 'wellness'],
      price: '$$$$',
      alt: {
        hero: 'White inn on stilts on a rocky shoreline beside the North Atlantic',
        gallery: [
          'Iceberg floating offshore beyond a rugged coastline',
          'Guest room with floor-to-ceiling windows facing the ocean',
          'Colorful handmade quilt on a wooden bed',
          'Hiking trail along rocky headlands under a dramatic sky'
        ]
      },
      video: 'videos/resorts/fogo-island-inn.mp4'
    },
    {
      id: 'amangiri',
      name: 'Amangiri',
      location: 'Canyon Point, Utah, USA',
      country: 'USA',
      region: 'Americas',
      destination: null,
      tagline: 'A desert sanctuary set into the canyon country of the American Southwest.',
      writeup: [
        // <!-- VERIFY --> Location near the Utah–Arizona border and building materials
        'Amangiri lies in a remote valley in southern Utah, close to the Arizona border, surrounded by sandstone mesas, plateaus and slot canyons. Built in earthy tones that echo the desert, the resort seems to grow out of the landscape rather than sit on top of it.',
        // <!-- VERIFY --> Pool built around a rock outcrop and Camp Sarika tented pavilions
        'Suites are minimalist and calm, with walls of glass framing the desert, and the central pool wraps around a dramatic rock outcrop. Nearby, a tented camp offers pavilions with private plunge pools for an even closer connection to the land.',
        // <!-- VERIFY --> Via ferrata route and spa inspirations
        'The canyon country around it is endlessly explorable: hikes through slot canyons, scenic flights over the surrounding plateaus and a via ferrata climbing route on nearby cliffs. The spa draws inspiration from the desert and its traditions.',
        'At night, the desert falls silent and the sky fills with stars. Amangiri is a place for reflection as much as adventure — an extraordinary stay in one of America’s most spectacular landscapes.'
      ],
      experiences: [
        'Hikes into slot canyons',
        'Via ferrata climbing on sandstone cliffs',
        'A pool wrapped around desert rock',
        'Desert-inspired spa rituals',
        'Stargazing under dark desert skies'
      ],
      idealFor: ['honeymoon', 'solo', 'wellness'],
      price: '$$$$',
      alt: {
        hero: 'Minimalist resort pool wrapped around a sandstone rock formation in the Utah desert',
        gallery: [
          'Light filtering into a narrow, curving slot canyon',
          'Climber on a via ferrata route along a red rock cliff',
          'Suite with glass walls looking out on desert mesas',
          'Milky Way stretching over desert rock formations at night'
        ]
      },
      video: 'videos/resorts/amangiri.mp4'
    }
  ],

  /* ======================================================================
     TESTIMONIALS — SAMPLE CONTENT
     These are placeholders so the slider has something to show.
     Replace them with real reviews (with permission), then set
     `sample: false` to remove the "Sample review" label on the site.
     ====================================================================== */
  testimonials: [
    { sample: true, quote: 'The Kyoto guide helped us plan three days that felt unhurried and full at the same time. We used the “go at sunrise” tips every single morning.', name: 'Sample reviewer', trip: 'Kyoto, Japan' },
    { sample: true, quote: 'I’d never have thought of pairing Cape Town with the Winelands. That suggestion turned into the best two days of our whole trip.', name: 'Sample reviewer', trip: 'Cape Town, South Africa' },
    { sample: true, quote: 'Clear, honest and practical — exactly what I needed to plan my first solo trip to Lisbon without feeling overwhelmed.', name: 'Sample reviewer', trip: 'Lisbon, Portugal' }
  ]
};
