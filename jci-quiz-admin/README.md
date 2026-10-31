# JCI Uniben Quiz Admin — admin website (frontend only)

The website JCI Uniben administrators use to create, publish, manage and grade quizzes.
It is **only the admin frontend**: plain HTML, CSS and JavaScript (ES modules), no frameworks and no build step.
The backend (database, APIs, login, grading, image storage) and the student section are built by other developers.

**Current status: Stage 2 of 11 — Quiz list.** See [Build stages](#build-stages).

---

## Running it locally

Because the JavaScript uses ES modules (`<script type="module">`), browsers refuse to load it from a file you double-click.
Open the folder through a small local web server instead — any one of these works:

| Tool | How |
| --- | --- |
| VS Code | Install **Live Server**, right-click `index.html` → *Open with Live Server* |
| Acode (Android) | Open the folder and use the built-in preview/server |
| Node.js | `npx serve .` inside this folder, then open the address it prints |
| Python | `python -m http.server 8000` inside this folder, then open http://localhost:8000 |

Start at `index.html`: it sends you to the dashboard if you're signed in, or to the login page if you're not.

### Demo mode (no backend yet)

`js/config.js` has `USE_MOCK: true`, so the site uses a **mock API** (`js/api/mock/`) and shows this banner on every page:

> **Demo mode:** data is stored in this browser only and is not saved to the server.

Demo sign-in: **any email and any password of 8 or more characters**. To see each error message, use one of these passwords:

| Password | Shows |
| --- | --- |
| `wrong-password` | "Email or password is incorrect." |
| `too-many` | "Too many attempts. Please wait a moment." |
| `server-error` | "Something went wrong on our side. Please try again." |
| `offline` | "Can't reach the server. Check your connection and try again." |

Mock login is **not security** — it only demonstrates the screen. Real protection comes from the backend.

**Demo quizzes.** The mock comes with 12 sample quizzes covering every state: drafts, published (open, scheduled, closing soon, no close date, closed), archived, a draft that students already took (locked), an unfinished draft that fails the publish checks, and an empty "Untitled quiz". Changes you make are kept in this browser (`jci-mock:quizzes`) so you can try every action; **Settings → Demo data → Reset demo data** brings the originals back.

To see the quiz list's error state, search for one of these on the Quizzes page:

| Search for | Shows |
| --- | --- |
| `simulate:server-error` | "Something went wrong on our side. Please try again." with Try again |
| `simulate:offline` | "Can't reach the server. Check your connection and try again." with Try again |

Turning your device's Wi-Fi off works too: the offline banner appears and list requests fail with the network message.

### Switching to the real backend

1. In `js/config.js` set `USE_MOCK: false` and `API_BASE_URL` to the backend's address.
2. If the backend uses CSRF protection, set `AUTH.csrfCookieName` (and `csrfHeaderName` if different).
3. If admins sign in with a username instead of an email, set `AUTH.identifier: 'username'`.
4. If the backend's field names differ from the proposed contract, change **only** `js/api/adapters.js` (and the paths in `js/api/endpoints.js`).

> **Important for cookie sessions:** host the admin site and the API on the **same site** — for example `admin.jciuniben.org` and `api.jciuniben.org`, or proxy `/api` through the admin site's host. Browsers (especially Safari and iOS) block login cookies sent between unrelated domains, which would make sign-in fail.

### Deploying

Upload the whole folder to any static host (Netlify, Vercel, GitHub Pages, cPanel). `404.html` is used automatically by most hosts.
The pages tell search engines not to index them (`noindex`).

---

## What Stage 2 includes

**Quizzes page (`quizzes.html`)**
- **Search** by title and description, debounced (300 ms), with a spinner while it searches, a clear (×) button and a <kbd>/</kbd> shortcut. Outdated requests are cancelled, so a slow answer can never overwrite a newer one.
- **Filters**: status (All active, Draft, Published, Archived) and availability (Scheduled, Open, Closed — published quizzes only; it's disabled, with a screen-reader note, for drafts and archived quizzes). Archived quizzes are hidden from "All active".
- **Sorting** from a menu or by clicking the Title, Attempts and Last updated headers (`aria-sort` tells screen readers the order).
- **Pagination**: 10, 20 or 50 rows (the same preference as Settings), "Showing 21–40 of 134", page links that also work with a middle-click, and "Page 2 of 5" on phones.
- **Everything is in the URL** (`?q=bio&status=published&sort=title:asc&page=2`), so refresh, Back/Forward and shared links all work — even through the login page.
- **Active filters as chips** you can remove one by one, plus **Clear filters**.
- **Table on wide screens, cards on narrow ones.** The list adapts to its own width (CSS container queries): less important columns move into a line under the title on tablets.
- **Status badges** always show an icon and a word. Quizzes closing within 3 days are flagged "Closes in 2 days". A lock icon marks quizzes students have already taken. Times show the time zone (e.g. "17:00 WAT").
- **Row actions (⋯)** — only the ones allowed for that quiz, with full keyboard support (arrow keys, Home/End, type-ahead, Esc):
  - *Edit / View*, *Preview*
  - *Duplicate* → a new draft "Copy of …" (or "Copy of … (2)") with no attempts and cleared dates; the copy is highlighted and a toast offers **Open copy**
  - *Publish…* → quick checks first (no questions, no marks), then a confirmation that repeats the key facts (questions, marks, opens, closes, attempts, time limit). If the server finds problems, they're listed with **Open quiz**.
  - *Unpublish…* → explains that attempts in progress can finish, and that locked quizzes stay locked
  - *Archive…* → explains it becomes hidden and read-only, results are kept, and it can be restored; toast offers **View archived**
  - *Restore* → back to Drafts
  - *Delete…* → drafts with no attempts only (Cancel is focused first). For a draft students already took, the dialog explains why and offers **Archive instead**.
- **New quiz**: a dialog asks for a title (required, up to 120 characters, live counter), creates the draft and opens it.
- **Every state**: loading skeleton, quiet background refresh (a thin bar, rows dim slightly), three different empty states (nothing yet / nothing in this filter / no matches), an error state with Try again, 401 → sign in again and come back, 404 → "That quiz no longer exists".
- **Motion**: rows fade up on first load only; rows glide to new positions after sorting or changes; removed rows fade out and the gap closes; menus grow from their button; a changed row flashes softly and a newly published badge pops in; chips pop in. All of it turns off with "reduce motion".

**Also new**
- `quiz-edit.html` and `quiz-preview.html` — **temporary** read-only pages (real data from the API: summary, question outline, lock/archived notices) so links from the list already work. The real editor arrives in Stage 3 and Preview in Stage 6; both pages say so.
- **Settings → Demo data** (demo mode only): reset the sample quizzes.
- Quiz endpoints in `endpoints.js` and the mock, quiz adapters, shared quiz rules (`js/quiz/quiz-rules.js`), list URL state, a tiny store, date formatting, and reusable menu, badge, pagination and form-dialog components.
- `tests.html` now runs **42 checks** (17 new: URL state, pagination maths, quiz rules, availability wording, date wording, quiz adapters, demo data, sort options).

---

## What Stage 1 includes

- **Design tokens** for Dark Mode and Light Mode (`css/tokens.css`), plus base, layout, component, motion and page styles.
- **Theme switch** (sidebar, mobile drawer, login page, Settings page). The choice is saved as `jci-admin-theme`; a first visit follows the device setting. A tiny inline script in every page applies it before anything paints, so there's never a flash of the wrong theme (`js/theme-init.js` is the master copy — `tests.html` checks every page matches it).
- **Page shell**: sidebar (desktop), collapsible icon sidebar with tooltips (tablet), top bar + navigation drawer (phones), skip link, demo banner, offline banner, toasts, dialogs.
- **API layer**: `client.js` (the one fetch wrapper: base URL, cookies, JSON, timeouts, cancelling, friendly error messages), `endpoints.js` (real backend), `adapters.js` (field-name mapping), and the mock API with the same functions.
- **Login** with validation, error summary, show/hide password, Caps Lock warning, loading state, no double submits, clear error messages, and a safe "return to the page you wanted" link.
- **Session check** on every protected page (`GET /auth/me`) before any content is shown. Not signed in → login; no permission → `no-access.html`; server unreachable → an error with Retry.
- **Settings page** (complete): Dark Mode / Light Mode cards, rows per page, account details and Sign out.
- **404** and **no-access** pages.
- **Placeholder pages** for Dashboard, Question Bank and Results that honestly say which stage builds them (no fake features).
- **tests.html** with 25 automated checks.

---

## File structure (so far)

```
index.html  login.html  dashboard.html  quizzes.html  quiz-edit.html  quiz-preview.html
question-bank.html  results.html  settings.html  no-access.html  404.html  tests.html  README.md
assets/   logo.svg (PLACEHOLDER — replace with the authorised logo)  favicon.svg
css/      tokens.css  base.css  layout.css  components.css  motion.css  pages.css
js/
  config.js          settings (API URL, demo mode, page sizes, upload limits, auth)
  theme-init.js      master copy of the inline theme script
  types.js           JSDoc data shapes (Quiz, QuizSummary, Question, Option, Appearance, …)
  icons.js           inline SVG icons
  core/              dom, storage (preferences only), a11y, validate, motion, theme, session,
                     list-state (URL state), store, format (dates/numbers), flash (one-time messages)
  api/               client, endpoints, adapters, index (mock or real),
                     mock/ (mock-api, mock-data, mock-store — demo mode only)
  quiz/              quiz-rules (allowed actions, badges, availability wording)
  components/        shell, theme-switch, button, toast, dialog (incl. form dialog), states,
                     form-feedback, menu, badge, pagination
  pages/             index, login, quizzes, settings, no-access,
                     quiz-placeholder + stage-placeholder (temporary)
  tests/             harness + test files used by tests.html
```

Files from the planned structure that aren't here yet (tabs, the quiz editor, renderer, etc.) arrive in the stage that first uses them.
`js/pages/stage-placeholder.js` and `js/pages/quiz-placeholder.js` are temporary and go away as those pages are built.

---

## Build stages

| Stage | What | Status |
| --- | --- | --- |
| 1 | Foundation: tokens, shell, theme, API client, mock, login, session check, 404/no-access, README | **Done** |
| 2 | Quiz list: search, filters, sorting, pagination, URL state, action menus, New quiz, confirmations | **Done** |
| 3 | Quiz workspace: tabs, Details, save status, autosave, conflict and session handling | Next |
| 4 | Question builder: type registry, four types, options, correct answers, marks, images, undo, reordering | |
| 5 | Appearance: quiz-wide panel, per-question overrides, presets, color picker, contrast warnings, renderer.js | |
| 6 | Settings tab, Review & Publish, Preview page, locking rules | |
| 7 | Duplication, archive, restore and delete flows (the list side is already done in Stage 2; Stage 7 adds them inside the editor, and Duplicate opening the copy straight away) | |
| 8 | Question Bank: list, editor, versions, picker, Save to bank, Review update | |
| 9 | Results: results list, attempts, attempt page, manual grading, CSV (if approved) | |
| 10 | Dashboard (built last so it uses real data) | |
| 11 | Switch to the real API, run tests, accessibility and responsive pass, final README | |

---

## Pending decisions (defaults used until agreed)

**With the backend developer**

| # | Decision | Default in the code |
| --- | --- | --- |
| 1 | How admin login works (cookie or token; email or username), the API base URL and endpoints | Cookie session, email, `/api`, endpoints below |
| 2 | Checkbox scoring | All-or-nothing |
| 3 | What can be edited after students start | Section 19 rules |
| 4 | Which score counts with several attempts | Highest |
| 5 | Auto-submit when time runs out | Yes, enforced by the server |
| 6 | Admin override of auto-graded marks | Hidden unless supported |
| 7 | CSV export: included? server or browser? | Browser-side, from API data |
| 8 | Admin roles | One admin role, full access |
| 9 | Password reset | Not shown |

**With the student developer**

| # | Decision | Default |
| --- | --- | --- |
| 10 | When students see results | Admin chooses per quiz; default "after the quiz closes" |
| 11 | Student details shown in results | Name, matric number, email |
| 12 | Who can take a quiz | Every signed-in student |
| 13 | One question per page or all on one page | All on one page, with a toggle in Preview |
| 14 | Reusing `renderer.js` and `appearance.js` so quizzes look identical | Offer them both files |

### Needed from the backend developer for Stage 1

- `POST /auth/login` with `{ "email", "password" }` (or `username`) → sets the session cookie and returns the admin (`{ id, name, email, role }`, optionally wrapped in `{ "admin": … }`).
- `POST /auth/logout` → ends the session.
- `GET /auth/me` → the signed-in admin, or **401** if not signed in, **403** if the account isn't an admin.
- Errors in the agreed format: `{ "error": { "code", "message", "fieldErrors" } }`, and **429** for too many login attempts.
- CORS with credentials allowed for the admin site's origin (if the API is on a different subdomain), and the CSRF cookie/header names if CSRF protection is used.

### Needed from the backend developer for Stage 2

- `GET /admin/quizzes?q=&status=&availability=&sort=&page=&pageSize=` → `{ "items": [...], "page", "pageSize", "total" }`. Each item needs `id, title, description, status, availability, settings.opensAt, settings.closesAt, settings.maxAttempts, settings.durationMinutes, questionCount, totalMarks, attemptCount, createdAt, updatedAt`.
  - `sort` is `field:direction` with fields `updatedAt`, `title`, `createdAt`, `attemptCount`.
  - **No `status` means "draft and published"** (archived quizzes are hidden from active lists). Please confirm, or tell me the parameter for "all except archived".
  - `availability` is worked out by the server from its own clock, and only for published quizzes.
- `GET /admin/quizzes/{id}` → the full quiz (used by the temporary quiz pages now, the editor in Stage 3).
- `POST /admin/quizzes` with `{ "title" }` → the new draft (422 with `fieldErrors.title` if the title is invalid).
- `POST /admin/quizzes/{id}/publish`, `/unpublish`, `/archive`, `/restore`, `/duplicate` → the updated (or new) quiz.
- `DELETE /admin/quizzes/{id}` → 204; drafts with no attempts only.
- When a publish is refused, **422 with `code: "PUBLISH_BLOCKED"`** and one plain-language message per problem in `fieldErrors` (the list shows them all). Other refused actions: 422 with a plain message.
- The server must enforce the same rules as the menus (who can publish, delete, etc.) — the menus are only guidance.

The full proposed data model and endpoint list are in the project brief (section 30) and in `js/types.js`.

---

## Token additions (please approve or change)

These aren't in the brief's token list but were needed to keep everything readable and meet WCAG AA. Each one is a single line in `css/tokens.css`.

| Token | Dark | Light | Why |
| --- | --- | --- | --- |
| `--input-border` | `#67638C` | `#80869A` | Form fields need an outline of at least **3:1** (WCAG 1.4.11). The brief's `--border-strong` is about 1.55:1, so it's kept for cards and dividers, and fields use this instead (3.5:1 dark, 3.6:1 light). |
| `--on-danger` | `#130F2D` | `#FFFFFF` | Text on red buttons (6.7:1 dark, 6.5:1 light). |
| `--success-soft`, `--warning-soft`, `--danger-soft` | 10–12% tints | 8–10% tints | Backgrounds for banners and alerts. Text on them is always `--text`; the status color is used only for icons and borders. |
| `--scrim`, `--skeleton`, `--skeleton-shine`, `--tooltip-*` | | | Dialog backdrops, loading skeletons, tooltips. |
| `--jci-blue`, `--jci-black`, `--jci-white`, `--jci-white-muted` | fixed | fixed | The login brand panel stays JCI Black in both themes. |
| `--z-menu` | `60` | `60` | Stage 2: keeps action menus above the page, below toasts. |

Stage 2 adds no new colors: badges, chips and highlights mix existing tokens (e.g. `color-mix(in srgb, var(--success) 40%, transparent)` for a badge border).

All other values match the brief exactly. Contrast was checked with the WCAG formula.

---

## Risks and things to settle early

1. **Cookies across domains** (see "Switching to the real backend"): put the admin site and API on the same site, or sign-in may fail on Safari/iOS.
2. **Autosave and conflicts (before Stage 3):** the proposed API saves questions with separate calls but detects conflicts with one quiz `version`. Rapid autosaves could race each other. I'll queue saves so only one runs at a time, but please agree with the backend developer whether each question call also checks and returns the quiz `version` — or whether one "save draft" call for the whole quiz is simpler.
3. **Upload progress (Stage 4):** `fetch` can't report upload progress, so image uploads will use `XMLHttpRequest`, kept inside `js/api/client.js` (still the only place that talks to the network).
4. **Time zones (Stage 6):** times are shown in the admin's device time zone with its label (e.g. WAT). If every admin is in Nigeria, showing everything in WAT regardless of device would avoid confusion when someone travels — say if you'd prefer that.
5. **Unpublished quizzes with attempts:** they return to Draft but stay locked (the lock follows attempts, not status). Worth confirming with the backend developer.
6. **Text formatting:** bold, italic and underline apply to a whole question (as specified), not to selected words. Word-level formatting would need a safe rich-text format agreed with the student developer.
7. **"All active" in the quiz list (Stage 2):** the list asks for draft + published by leaving `status` out. If the backend treats "no status" as "everything including archived", archived quizzes would show up there — one line in `adapters.js` changes it.
8. **Demo data in localStorage:** in demo mode only, the mock keeps its sample quizzes in `jci-mock:quizzes` so you can try actions. The demo banner says data stays in the browser; with `USE_MOCK: false` nothing of the sort is stored.

---

## Testing

### Automated: `tests.html`

Open `tests.html` through the local server. It currently runs 42 checks: validation rules, the API client's error handling (with a fake network), adapters (auth and quizzes), the safe return link after login, theme logic, that the mock and real API have the same functions, that text can never be inserted as HTML, that every page's inline theme script matches `js/theme-init.js`, list URL state, pagination maths, quiz rules (allowed actions, delete rules, publish blockers, availability wording), date wording, the demo data and the sort options. Later stages add publish checks, appearance inheritance, contrast and CSV checks.

### Manual acceptance checklist

Stage 1 items are ready to check now; the rest arrive with their stages.

**Admin access (Stage 1)**
- [ ] Opening any page while signed out goes to login, and signing in returns you to that page.
- [ ] Empty or invalid fields show messages under each field and a summary with links at the top.
- [ ] Each demo error password shows the right message; the button shows a spinner and can't be double-submitted.
- [ ] Show/hide password works; a Caps Lock warning appears when Caps Lock is on.
- [ ] Opening the login page while signed in skips to the dashboard.
- [ ] Sign out (sidebar, drawer or Settings) returns to login; protected pages then redirect again.

**Themes and responsiveness (Stage 1 parts)**
- [ ] Dark Mode and Light Mode switch from the sidebar, the drawer, the login page and Settings, stay in sync, and persist after reload.
- [ ] No flash of the wrong theme when pages load.
- [ ] 360px: top bar + drawer (Esc and the backdrop close it, focus returns to the menu button). 768–1199px: icon sidebar with tooltips and an expand button. 1200px+: full sidebar.
- [ ] No sideways scrolling at 360, 768, 1024 and 1440px.
- [ ] Everything works with the keyboard only; the first Tab reaches "Skip to main content".
- [ ] With "reduce motion" turned on in the device settings, nothing slides or zooms.

**Quiz management (Stage 2)**
- [ ] Search finds quizzes by title or description; the spinner shows while it searches; × and Esc clear it; <kbd>/</kbd> jumps to it.
- [ ] Status and availability filters, sorting (menu and column headers) and page links all update the list **and the address bar**; refresh, Back/Forward and a copied link reproduce the same view.
- [ ] Chips show each active filter; removing one or pressing Clear filters works.
- [ ] Rows per page (list footer or Settings) is remembered on this device.
- [ ] The three empty states appear correctly: no quizzes yet, nothing in a filter (e.g. Archived after restoring everything), and no matches (search `zzz`). `simulate:server-error` shows an error with Try again.
- [ ] Draft, Published and Archived badges and Scheduled / Open / Closed availability display correctly, with icons; "Closes in …" appears for quizzes closing within 3 days.
- [ ] The ⋯ menu shows only allowed actions (draft / published / archived differ) and works with the keyboard.
- [ ] Publish: "Untitled quiz" is stopped before the dialog (no questions); "Effective Meetings" is refused by the server with a list of problems; "Project Management 101" publishes after a confirmation that repeats its key facts.
- [ ] Unpublish, Archive, Restore and Delete each explain the consequences first; "Community Impact Projects" can't be deleted (students took it) and offers Archive instead.
- [ ] Duplicate creates "Copy of …" as a draft with 0 attempts; duplicating again gives "(2)".
- [ ] New quiz: an empty or too-long title shows a message; a valid title creates the draft and opens it.
- [ ] At 360px the list turns into cards, dialogs become bottom sheets, and nothing scrolls sideways.

**Question builder, Question Bank, Results, integration** — added in Stages 3–11 (see the brief, section 33).

Browsers to check: Chrome (desktop and Android), Firefox, Safari (iOS) and Edge. Page-change animations use View Transitions where supported (Chrome, Edge, recent Safari); other browsers simply load pages normally.

---

## Security notes (frontend side)

- No secrets, keys or passwords in the code. Demo credentials are fake and only work in demo mode.
- All text from the API or from users is inserted with `textContent` — never as HTML.
- localStorage holds **preferences only** (`jci-admin-theme`, `jci-admin-rows`, `jci-admin-sidebar`). In demo mode the mock also keeps its fake session (`jci-mock:session`) and sample quizzes (`jci-mock:quizzes`) there — clearly labelled demo data, never used with the real backend.
- sessionStorage holds at most one short UI message between pages (`jci-admin-flash`, e.g. "Draft created"), never quiz content.
- The "return to" link after login only accepts this site's own pages, so it can't be used to send admins to another website.
- The browser never decides scores or permissions — the backend does.
