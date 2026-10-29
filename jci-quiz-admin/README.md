# JCI Uniben Quiz Admin — admin website (frontend only)

The website JCI Uniben administrators use to create, publish, manage and grade quizzes.
It is **only the admin frontend**: plain HTML, CSS and JavaScript (ES modules), no frameworks and no build step.
The backend (database, APIs, login, grading, image storage) and the student section are built by other developers.

**Current status: Stage 1 of 11 — Foundation.** See [Build stages](#build-stages).

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

## What Stage 1 includes

- **Design tokens** for Dark Mode and Light Mode (`css/tokens.css`), plus base, layout, component, motion and page styles.
- **Theme switch** (sidebar, mobile drawer, login page, Settings page). The choice is saved as `jci-admin-theme`; a first visit follows the device setting. A tiny inline script in every page applies it before anything paints, so there's never a flash of the wrong theme (`js/theme-init.js` is the master copy — `tests.html` checks every page matches it).
- **Page shell**: sidebar (desktop), collapsible icon sidebar with tooltips (tablet), top bar + navigation drawer (phones), skip link, demo banner, offline banner, toasts, dialogs.
- **API layer**: `client.js` (the one fetch wrapper: base URL, cookies, JSON, timeouts, cancelling, friendly error messages), `endpoints.js` (real backend), `adapters.js` (field-name mapping), and the mock API with the same functions.
- **Login** with validation, error summary, show/hide password, Caps Lock warning, loading state, no double submits, clear error messages, and a safe "return to the page you wanted" link.
- **Session check** on every protected page (`GET /auth/me`) before any content is shown. Not signed in → login; no permission → `no-access.html`; server unreachable → an error with Retry.
- **Settings page** (complete): Dark Mode / Light Mode cards, rows per page, account details and Sign out.
- **404** and **no-access** pages.
- **Placeholder pages** for Dashboard, Quizzes, Question Bank and Results that honestly say which stage builds them (no fake features).
- **tests.html** with 25 automated checks.

---

## File structure (so far)

```
index.html  login.html  dashboard.html  quizzes.html  question-bank.html  results.html
settings.html  no-access.html  404.html  tests.html  README.md
assets/   logo.svg (PLACEHOLDER — replace with the authorised logo)  favicon.svg
css/      tokens.css  base.css  layout.css  components.css  motion.css  pages.css
js/
  config.js          settings (API URL, demo mode, page sizes, upload limits, auth)
  theme-init.js      master copy of the inline theme script
  types.js           JSDoc data shapes (Quiz, Question, Option, Appearance, …)
  icons.js           inline SVG icons
  core/              dom, storage (preferences only), a11y, validate, motion, theme, session
  api/               client, endpoints, adapters, index (mock or real), mock/
  components/        shell, theme-switch, button, toast, dialog, states, form-feedback
  pages/             index, login, settings, no-access, stage-placeholder (temporary)
  tests/             harness + test files used by tests.html
```

Files from the planned structure that aren't here yet (tables, toolbar, menus, tabs, badges, the quiz editor, etc.) arrive in the stage that first uses them.
`js/pages/stage-placeholder.js` is temporary and goes away as each page is built.

---

## Build stages

| Stage | What | Status |
| --- | --- | --- |
| 1 | Foundation: tokens, shell, theme, API client, mock, login, session check, 404/no-access, README | **Done** |
| 2 | Quiz list: search, filters, sorting, pagination, URL state, action menus, New quiz, confirmations | Next |
| 3 | Quiz workspace: tabs, Details, save status, autosave, conflict and session handling | |
| 4 | Question builder: type registry, four types, options, correct answers, marks, images, undo, reordering | |
| 5 | Appearance: quiz-wide panel, per-question overrides, presets, color picker, contrast warnings, renderer.js | |
| 6 | Settings tab, Review & Publish, Preview page, locking rules | |
| 7 | Duplication, archive, restore and delete flows | |
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

All other values match the brief exactly. Contrast was checked with the WCAG formula.

---

## Risks and things to settle early

1. **Cookies across domains** (see "Switching to the real backend"): put the admin site and API on the same site, or sign-in may fail on Safari/iOS.
2. **Autosave and conflicts (before Stage 3):** the proposed API saves questions with separate calls but detects conflicts with one quiz `version`. Rapid autosaves could race each other. I'll queue saves so only one runs at a time, but please agree with the backend developer whether each question call also checks and returns the quiz `version` — or whether one "save draft" call for the whole quiz is simpler.
3. **Upload progress (Stage 4):** `fetch` can't report upload progress, so image uploads will use `XMLHttpRequest`, kept inside `js/api/client.js` (still the only place that talks to the network).
4. **Time zones (Stage 6):** times are shown in the admin's device time zone with its label (e.g. WAT). If every admin is in Nigeria, showing everything in WAT regardless of device would avoid confusion when someone travels — say if you'd prefer that.
5. **Unpublished quizzes with attempts:** they return to Draft but stay locked (the lock follows attempts, not status). Worth confirming with the backend developer.
6. **Text formatting:** bold, italic and underline apply to a whole question (as specified), not to selected words. Word-level formatting would need a safe rich-text format agreed with the student developer.

---

## Testing

### Automated: `tests.html`

Open `tests.html` through the local server. It currently runs 25 checks: validation rules, the API client's error handling (with a fake network), adapters, the safe return link after login, theme logic, that the mock and real API have the same functions, that text can never be inserted as HTML, and that every page's inline theme script matches `js/theme-init.js`. Later stages add publish checks, appearance inheritance, contrast, URL state and CSV checks.

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

**Quiz management, question builder, Question Bank, Results, integration** — added in Stages 2–11 (see the brief, section 33).

Browsers to check: Chrome (desktop and Android), Firefox, Safari (iOS) and Edge. Page-change animations use View Transitions where supported (Chrome, Edge, recent Safari); other browsers simply load pages normally.

---

## Security notes (frontend side)

- No secrets, keys or passwords in the code. Demo credentials are fake and only work in demo mode.
- All text from the API or from users is inserted with `textContent` — never as HTML.
- localStorage holds **preferences only** (`jci-admin-theme`, `jci-admin-rows`, `jci-admin-sidebar`). In demo mode the mock also keeps its fake session there (`jci-mock:session`).
- The "return to" link after login only accepts this site's own pages, so it can't be used to send admins to another website.
- The browser never decides scores or permissions — the backend does.
