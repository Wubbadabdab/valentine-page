# Travel Explorer

A multi-page travel website built with plain HTML, CSS and vanilla JavaScript — no frameworks, no build step.
Open `index.html` in a browser, or upload the whole folder to any static host (GitHub Pages, Netlify, Vercel, cPanel…).

> Tip: for local testing, run `python3 -m http.server` inside this folder and visit `http://localhost:8000` — it behaves exactly like a real host.

---

## Pages

| File | What it is |
| --- | --- |
| `index.html` | Home — video hero, search, stats, featured destinations, travel styles, resorts carousel, tips, testimonials, newsletter |
| `destinations.html` | All destinations with live search, region / style / budget filters and sorting (filters are saved in the URL, so views can be shared) |
| `destination.html?id=kyoto` | One template for every destination |
| `resorts.html` | All special resorts, filterable by "ideal for" and region |
| `resort.html?id=soneva-jani` | One template for every resort |
| `about.html` | Who we are, mission, values, how we choose destinations |
| `contact.html` | Contact details and the message form (Supabase or email fallback) |
| `404.html` | Friendly "page not found" with search |
| `travelpages/Maldives.html` | Redirects old links to `resort.html?id=soneva-jani` (also `travelpages/destination.html` and `travelpages/contact.html`) |

```
css/style.css        Design system and every component style
js/data.js           ALL content: 24 destinations, 12 resorts, sample testimonials
js/main.js           All behaviour (+ Supabase keys at the very top)
supabase/messages.sql  Database table for the contact form
images/destinations/ images/resorts/ images/ui/   Your photos
videos/  videos/destinations/  videos/resorts/    Your videos
```

---

## Images the site expects

All images are `.jpg`, named in **lowercase-with-hyphens** (no spaces or commas).
If a file is missing, the site shows an elegant gradient placeholder with the place name instead of a broken image — so you can add photos gradually.

Each photo's description (alt text) lives in `js/data.js`. If your photo shows something different, update its alt text.

### Site / UI images — `images/ui/`

| File | Used for | Suggested size |
| --- | --- | --- |
| `home-hero.jpg` | Home hero (and video poster) | 1920 × 1080 |
| `destinations-hero.jpg` | Destinations page hero | 1920 × 1080 |
| `resorts-hero.jpg` | Resorts page hero | 1920 × 1080 |
| `about-hero.jpg` | About page hero | 1920 × 1080 |
| `about-1.jpg`, `about-2.jpg` | About page sections | 900 × 1125 (portrait) |
| `contact-hero.jpg` | Contact page hero | 1920 × 1080 |
| `contact-1.jpg` | Contact page side image | 900 × 675 |
| `style-adventure.jpg`, `style-culture.jpg`, `style-beach.jpg`, `style-nature.jpg`, `style-city.jpg`, `style-food.jpg` | Home "Browse by travel style" tiles | 600 × 800 (portrait) |
| `og-image.jpg` | Preview image when the site is shared on social media | 1200 × 630 |
| `favicon.svg` | Browser tab icon (already included) | — |

### Destinations — `images/destinations/` (4 per destination: 1 hero + 3 gallery, about 1600 × 1200)

| Destination | Files |
| --- | --- |
| Kyoto | `kyoto-hero.jpg`, `kyoto-1.jpg`, `kyoto-2.jpg`, `kyoto-3.jpg` |
| Bali | `bali-hero.jpg`, `bali-1.jpg`, `bali-2.jpg`, `bali-3.jpg` |
| Hoi An | `hoi-an-hero.jpg`, `hoi-an-1.jpg`, `hoi-an-2.jpg`, `hoi-an-3.jpg` |
| Chiang Mai | `chiang-mai-hero.jpg`, `chiang-mai-1.jpg`, `chiang-mai-2.jpg`, `chiang-mai-3.jpg` |
| Seoul | `seoul-hero.jpg`, `seoul-1.jpg`, `seoul-2.jpg`, `seoul-3.jpg` |
| Lisbon | `lisbon-hero.jpg`, `lisbon-1.jpg`, `lisbon-2.jpg`, `lisbon-3.jpg` |
| Reykjavik | `reykjavik-hero.jpg`, `reykjavik-1.jpg`, `reykjavik-2.jpg`, `reykjavik-3.jpg` |
| Santorini | `santorini-hero.jpg`, `santorini-1.jpg`, `santorini-2.jpg`, `santorini-3.jpg` |
| Dubrovnik | `dubrovnik-hero.jpg`, `dubrovnik-1.jpg`, `dubrovnik-2.jpg`, `dubrovnik-3.jpg` |
| Amalfi Coast | `amalfi-coast-hero.jpg`, `amalfi-coast-1.jpg`, `amalfi-coast-2.jpg`, `amalfi-coast-3.jpg` |
| Edinburgh | `edinburgh-hero.jpg`, `edinburgh-1.jpg`, `edinburgh-2.jpg`, `edinburgh-3.jpg` |
| Prague | `prague-hero.jpg`, `prague-1.jpg`, `prague-2.jpg`, `prague-3.jpg` |
| Cape Town | `cape-town-hero.jpg`, `cape-town-1.jpg`, `cape-town-2.jpg`, `cape-town-3.jpg` |
| Marrakech | `marrakech-hero.jpg`, `marrakech-1.jpg`, `marrakech-2.jpg`, `marrakech-3.jpg` |
| Zanzibar | `zanzibar-hero.jpg`, `zanzibar-1.jpg`, `zanzibar-2.jpg`, `zanzibar-3.jpg` |
| Petra | `petra-hero.jpg`, `petra-1.jpg`, `petra-2.jpg`, `petra-3.jpg` |
| Cairo | `cairo-hero.jpg`, `cairo-1.jpg`, `cairo-2.jpg`, `cairo-3.jpg` |
| Lagos | `lagos-hero.jpg`, `lagos-1.jpg`, `lagos-2.jpg`, `lagos-3.jpg` |
| Banff | `banff-hero.jpg`, `banff-1.jpg`, `banff-2.jpg`, `banff-3.jpg` |
| Machu Picchu & Cusco | `machu-picchu-hero.jpg`, `machu-picchu-1.jpg`, `machu-picchu-2.jpg`, `machu-picchu-3.jpg` |
| Tulum | `tulum-hero.jpg`, `tulum-1.jpg`, `tulum-2.jpg`, `tulum-3.jpg` |
| Rio de Janeiro | `rio-de-janeiro-hero.jpg`, `rio-de-janeiro-1.jpg`, `rio-de-janeiro-2.jpg`, `rio-de-janeiro-3.jpg` |
| Patagonia | `patagonia-hero.jpg`, `patagonia-1.jpg`, `patagonia-2.jpg`, `patagonia-3.jpg` |
| Queenstown | `queenstown-hero.jpg`, `queenstown-1.jpg`, `queenstown-2.jpg`, `queenstown-3.jpg` |

### Resorts — `images/resorts/` (5 per resort: 1 hero + 4 gallery, about 1600 × 1200)

| Resort | Files |
| --- | --- |
| Soneva Jani | `soneva-jani-hero.jpg`, `soneva-jani-1.jpg` … `soneva-jani-4.jpg` |
| The Brando | `the-brando-hero.jpg`, `the-brando-1.jpg` … `the-brando-4.jpg` |
| Four Seasons Bora Bora | `four-seasons-bora-bora-hero.jpg`, `four-seasons-bora-bora-1.jpg` … `-4.jpg` |
| Amanpuri | `amanpuri-hero.jpg`, `amanpuri-1.jpg` … `amanpuri-4.jpg` |
| Nihi Sumba | `nihi-sumba-hero.jpg`, `nihi-sumba-1.jpg` … `nihi-sumba-4.jpg` |
| Hoshinoya Kyoto | `hoshinoya-kyoto-hero.jpg`, `hoshinoya-kyoto-1.jpg` … `hoshinoya-kyoto-4.jpg` |
| Singita Lebombo Lodge | `singita-lebombo-hero.jpg`, `singita-lebombo-1.jpg` … `singita-lebombo-4.jpg` |
| Six Senses Zighy Bay | `six-senses-zighy-bay-hero.jpg`, `six-senses-zighy-bay-1.jpg` … `-4.jpg` |
| Royal Mansour | `royal-mansour-hero.jpg`, `royal-mansour-1.jpg` … `royal-mansour-4.jpg` |
| Belmond Hotel Caruso | `belmond-hotel-caruso-hero.jpg`, `belmond-hotel-caruso-1.jpg` … `-4.jpg` |
| Fogo Island Inn | `fogo-island-inn-hero.jpg`, `fogo-island-inn-1.jpg` … `fogo-island-inn-4.jpg` |
| Amangiri | `amangiri-hero.jpg`, `amangiri-1.jpg` … `amangiri-4.jpg` |

### Renaming your existing photos

| Old file (in `images/`) | New name |
| --- | --- |
| `Kyoto Japan.jpg` | `images/destinations/kyoto-hero.jpg` |
| `Capetown South Africa.jpg` | `images/destinations/cape-town-hero.jpg` |
| `Lisbon Portugal.jpg` | `images/destinations/lisbon-hero.jpg` |
| `Queenstown New Zealand.jpg` | `images/destinations/queenstown-hero.jpg` |
| `Bali, Indonesia.jpg` | `images/destinations/bali-hero.jpg` |
| `Reykjavik, Iceland.jpg` | `images/destinations/reykjavik-hero.jpg` |
| `Marrakech, Morocco.jpg` | `images/destinations/marrakech-hero.jpg` |
| `Banff, Canada.jpg` | `images/destinations/banff-hero.jpg` |
| `Soneva Jani, Maldives.jpg` | `images/resorts/soneva-jani-hero.jpg` |
| `Soneva Jani, Maldives1.jpg` | `images/resorts/soneva-jani-1.jpg` |
| `Soneva Jani, Maldives2.jpg` | `images/resorts/soneva-jani-2.jpg` |
| `travel explorer.jpg` (old logo) | No longer needed — the logo is now built into the page. You could reuse it as `images/ui/og-image.jpg`. |

### Responsive images (optional)

Every `<img>` already has `width`, `height` and `sizes`. If you export smaller copies (for example `kyoto-hero-800.jpg` and `kyoto-hero-1600.jpg`), list the widths in `RESPONSIVE_WIDTHS` at the top of `js/main.js` — e.g. `[800, 1600]` — and every image gets a `srcset` automatically.

---

## Videos the site expects

All videos are `.mp4` (H.264), ideally short (10–30 s) and under ~8 MB. They play **muted and looping**, pause when scrolled off-screen, and don't autoplay when a visitor has "reduce motion" or data saver turned on (the photo is shown instead). If a file is missing, the site shows "Video coming soon" or simply keeps the photo.

| File | Where it plays |
| --- | --- |
| `videos/home-hero.mp4` | Full-screen background of the home hero |
| `videos/destinations/kyoto.mp4`, `bali.mp4`, `reykjavik.mp4`, `santorini.mp4`, `cape-town.mp4`, `banff.mp4`, `machu-picchu.mp4`, `patagonia.mp4` | "Watch the video" button + lightbox on those destination pages |
| `videos/resorts/soneva-jani.mp4`, `the-brando.mp4`, `four-seasons-bora-bora.mp4`, `amanpuri.mp4`, `nihi-sumba.mp4`, `hoshinoya-kyoto.mp4`, `singita-lebombo.mp4`, `six-senses-zighy-bay.mp4`, `royal-mansour.mp4`, `belmond-hotel-caruso.mp4`, `fogo-island-inn.mp4`, `amangiri.mp4` | Video section on each resort page |

To give another destination a video, set its `video` field in `js/data.js` (e.g. `video: 'videos/destinations/petra.mp4'`) and add the file.

Only use photos and videos you have the rights to use (your own, licensed stock, or press material the resort allows you to publish).

---

## Adding a destination or resort

Everything is driven by `js/data.js` — cards, counts, filters, search, detail pages and related links update automatically.

**New destination:** copy any object in the `destinations` list and change:

```js
{
  id: 'oaxaca',                    // lowercase-with-hyphens — becomes the URL: destination.html?id=oaxaca
  name: 'Oaxaca',
  country: 'Mexico',
  region: 'Americas',              // one of the 5 regions at the top of data.js
  short: 'One or two lines for cards…',
  long: ['Paragraph 1…', 'Paragraph 2…', 'Paragraph 3…'],
  bestTime: 'October – April',
  styles: ['Culture', 'Food'],     // from the styles list at the top
  budget: '$$',                    // '$', '$$', '$$$' or '$$$$'
  things: [ { title: '…', text: '…' }, /* 4 items */ ],
  alt: { hero: 'Describe the hero photo', gallery: ['Photo 1', 'Photo 2', 'Photo 3'] },
  video: null,                     // or 'videos/destinations/oaxaca.mp4'
  related: ['tulum', 'machu-picchu'] // ids of other destinations
}
```

Then add `oaxaca-hero.jpg`, `oaxaca-1.jpg`, `oaxaca-2.jpg`, `oaxaca-3.jpg` to `images/destinations/`.

**New resort:** copy an object in the `resorts` list. Set `destination` to `{ id: 'kyoto', relation: 'in' }` if the resort is in one of your destinations, `{ id: '…', relation: 'pair' }` if it pairs well with one, or `null`. Add five images named `{id}-hero.jpg` and `{id}-1.jpg` … `{id}-4.jpg` to `images/resorts/`, and optionally `videos/resorts/{id}.mp4`.

---

## Contact form: Supabase setup

Until you complete these steps, the form still works: after validation it gives the visitor a ready-made **"Open email app"** link addressed to travelexplorer@gmail.com.

1. Create a free project at [supabase.com](https://supabase.com).
2. In the dashboard open **SQL Editor → New query**, paste the contents of `supabase/messages.sql` and click **Run**. This creates the `messages` table, which the public can **insert into but never read**.
3. Open **Project Settings → API** and copy the **Project URL** and the **anon public** key.
4. Paste them into the two placeholders at the very top of `js/main.js`:
   ```js
   const SUPABASE_URL = 'https://your-project.supabase.co';
   const SUPABASE_ANON_KEY = 'your-anon-public-key';
   ```
5. Send a test message from `contact.html`, then check **Table Editor → messages**.

The anon key is designed to be public; security comes from the Row Level Security policy in `messages.sql`. Never put your `service_role` key in the website.

---

## Other things to personalise

- **Social links** — in every page footer, marked `<!-- SOCIAL LINKS -->` (they currently point to each platform's home page).
- **Testimonials** — the three reviews in `js/data.js` are clearly labelled **sample content**. Replace them with real reviews (with permission) and set `sample: false`.
- **Newsletter** — the signup forms validate and confirm, but don't send anywhere yet. Connect your email provider where `main.js` says `NEWSLETTER:`.
- **Fact-checking** — search `js/data.js` for `VERIFY` to find facts worth double-checking before you publish (opening dates, landmarks, resort features). No prices, awards or statistics have been invented; resorts show a price tier (`$$$$`) only.
- **Social sharing image** — once the site is live, change `og:image` in each page `<head>` to a full URL such as `https://your-domain.com/images/ui/og-image.jpg`.
- **404 page** — most hosts use `404.html` automatically. Its links are relative, so it works best when the site lives at the root of its domain.
