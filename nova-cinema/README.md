# Nova Cinema — One Piece Day

A four-page cinema website for a One Piece movie day: **Home**, **Movies**, **Schedule** and **Contact**.
Plain HTML, CSS and JavaScript — no build step.

## Open it

Double-click `index.html`, or serve the folder so every feature (including YouTube embeds) behaves like a real site:

```bash
cd nova-cinema
python3 -m http.server 8000
# then visit http://localhost:8000
```

## What's inside

```
nova-cinema/
├── index.html            Home — animated ocean hero, countdown, film slider, trailer theater,
│                         wanted posters, snack galley, events, reviews
├── pages/
│   ├── movies.html       Film collection (search, genre filters, sort, Treasure Vault votes),
│   │                     details pop-up, theme songs
│   ├── schedule.html     Live clock, timeline chart, departure board table, halls, prices, My Tickets
│   └── contact.html      Den Den Mushi, live opening hours, validated form, treasure map, FAQ
├── css/style.css         All styles and animations (mobile-first, honours reduced-motion)
├── js/data.js            Films, showtimes, halls, snacks and prices — edit content here
├── js/main.js            Shared: nav, page curtains, reveals, toasts, trailer player, booking flow
├── js/home.js · movies.js · schedule.js · contact.js   Page-specific behaviour
├── images/               Your photos (see images/README.md for filenames) + favicon
└── videos/               Your trailer reel (see videos/README.md)
```

## Good to know

- **Showtimes** live in `js/data.js` *and* the table in `pages/schedule.html` — update both together.
- **Booking, newsletter and contact form** are front-end only: tickets, votes and messages are saved in the visitor's browser (`localStorage`). To receive real messages, point the contact form at a form service or your own backend.
- **Trailers and music videos** are embedded from YouTube. If an upload is ever removed or blocks embedding, the player shows an "open on YouTube" link, and the YouTube IDs can be swapped in `js/data.js`.
- **Easter egg:** click the logo five times quickly.
