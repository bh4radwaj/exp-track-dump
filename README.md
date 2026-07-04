# Notarium — Frontend

Expense tracker UI built with React, Vite, Tailwind CSS v4, and shadcn/ui-style components.

## Getting started

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env` and point `VITE_API_URL` at your backend once one exists (see [API reference](#api-reference) below):

```bash
cp .env.example .env
```

The app runs at http://localhost:5173.

## API reference

This is a frontend-only build. Nothing below is implemented as a real server —
the dashboard runs on mock state in `src/lib/store.jsx`, persisted to
`localStorage`. This section documents the frontend routes that exist today,
and the backend endpoints a real API would need to expose to replace that
mock layer, so a backend can be built to match.

### Frontend routes (views)

| Route | Page / component | Auth required | Description |
|---|---|---|---|
| `/` | `LandingPage` | No | Marketing page — hero, feature grid, "how it works", FAQ, CTAs into signup/login. |
| `/login` | `AuthPage` (login tab) | No | Email/password login form, plus "Continue with Google". |
| `/signup` | `AuthPage` (signup tab) | No | Name/email/password signup form, plus "Continue with Google". |
| `/dashboard` | `Dashboard` → `dashboard/Home` | Yes | Remaining balance, budget-used progress, add-expense modal, filterable/deletable expense list. |
| `/dashboard/stats` | `Dashboard` → `dashboard/Stats` | Yes | Category breakdown (donut), 6‑month spending trend, largest expenses. |
| `/dashboard/settings` | `Dashboard` → `dashboard/Settings` | Yes | Edit monthly budget, manage categories, toggle notification preferences, reset data. |
| `/dashboard/account` | `Dashboard` → `dashboard/Account` | Yes | View/edit profile (name, email, photo), account summary, sign out. |
| `*` | — | — | Unknown paths redirect to `/` (outside `/dashboard`) or `/dashboard` (inside it). |

`/dashboard/*` routes are guarded only in the sense that they render the app
shell — there's no real session check yet. A backend-connected build should
redirect unauthenticated visitors from any `/dashboard/*` route to `/login`.

### Backend endpoints (contract, not implemented)

All endpoints below are **not implemented in this repo**. They describe the
API a backend would need so the frontend can be wired up for real. Base URL
comes from `VITE_API_URL` (see `.env.example`; copy it to `.env`). Every
request is sent with `credentials: "include"` so a session cookie set by the
backend is stored and replayed automatically — no `Authorization` header is
used by the frontend today.

#### Auth

| Method & path | Headers | Body / params | Description |
|---|---|---|---|
| `POST /auth/signup` | `Content-Type: application/json` | `{ name, email, password }` | Creates an account and starts a session (sets the session cookie). Used by the Sign up form. |
| `POST /auth/login` | `Content-Type: application/json` | `{ email, password }` | Verifies credentials and starts a session. Used by the Login form. |
| `GET /auth/google` | — | — | OAuth entry point. The "Continue with Google" button links here directly (full page navigation, not a fetch call); the backend should redirect to Google, then to its own callback, then back into the app once the session is set. |
| `POST /auth/logout` | Cookie (session) | — | Ends the current session. Should be called from the Account page's "Sign out" button before redirecting to `/login`. |
| `GET /auth/me` | Cookie (session) | — | Returns the current user's profile (see the Profile shape below). Used on app load to check whether a visitor is signed in and to seed the Account page. |

#### Expenses

| Method & path | Headers | Body / params | Description |
|---|---|---|---|
| `GET /expenses` | Cookie (session) | Optional query: `?category=`, `?from=YYYY-MM-DD`, `?to=YYYY-MM-DD` | Lists the signed-in user's expenses, newest first. Powers the Home list and every Stats chart. |
| `POST /expenses` | Cookie (session), `Content-Type: application/json` | `{ description, amount, category, date? }` (`date` defaults to today server-side if omitted) | Creates a new expense. Called when the "Add expense" modal is saved. |
| `DELETE /expenses/:id` | Cookie (session) | Path param `id` | Deletes one expense. Called from the trash icon on each expense row. |

#### Budget

| Method & path | Headers | Body / params | Description |
|---|---|---|---|
| `GET /budget` | Cookie (session) | — | Returns `{ amount }`, the user's monthly budget. Used to compute remaining balance and the budget-used bar. |
| `PUT /budget` | Cookie (session), `Content-Type: application/json` | `{ amount }` | Updates the monthly budget. Called from Settings → Monthly budget. |

#### Categories

| Method & path | Headers | Body / params | Description |
|---|---|---|---|
| `GET /categories` | Cookie (session) | — | Returns the user's category list (defaults: Food, Travel, Bills, Work, Shopping, Health, plus any custom ones). |
| `POST /categories` | Cookie (session), `Content-Type: application/json` | `{ name }` | Adds a custom category. Called from Settings → Categories → Add. |
| `DELETE /categories/:name` | Cookie (session) | Path param `name` | Removes a category. The backend should decide what happens to existing expenses in a removed category (e.g. reassign to "Other" or block deletion if in use). |

#### Profile

| Method & path | Headers | Body / params | Description |
|---|---|---|---|
| `GET /profile` | Cookie (session) | — | Returns `{ name, email, photoUrl, memberSince }`. |
| `PUT /profile` | Cookie (session), `Content-Type: application/json` | `{ name, email }` | Updates display name / email. Called from Account → Profile details → Save changes. |
| `POST /profile/photo` | Cookie (session), `Content-Type: multipart/form-data` | Form field `photo` (image file, suggested 2MB limit) | Uploads/replaces the profile photo and returns `{ photoUrl }`. Called from the camera icon on the Account page avatar. The frontend currently stores the picked image as a local base64 string — a real backend should instead return a hosted URL to store. |
| `DELETE /profile/photo` | Cookie (session) | — | Removes the current profile photo, reverting the UI to initials. Called from "Remove photo". |

#### Preferences

| Method & path | Headers | Body / params | Description |
|---|---|---|---|
| `GET /preferences` | Cookie (session) | — | Returns `{ emailReminders, weeklySummary, budgetAlerts }` (all booleans). |
| `PUT /preferences` | Cookie (session), `Content-Type: application/json` | Partial `{ emailReminders?, weeklySummary?, budgetAlerts? }` | Updates one or more notification toggles. Called immediately whenever a switch on the Settings page is flipped. |

#### Account data

| Method & path | Headers | Body / params | Description |
|---|---|---|---|
| `DELETE /account/data` | Cookie (session) | — | Wipes the user's expenses/budget/categories back to defaults, without deleting the account itself. Called from Settings → Danger zone → Reset all data. |

> Stats (category breakdown, monthly trend, largest expenses) are all derived
> client-side from `GET /expenses` — no dedicated stats endpoint is required,
> though a backend could add one (e.g. `GET /stats/summary`) as an
> optimization once the expense list grows large.

## Stack

- React 19 + Vite
- React Router
- Tailwind CSS v4
- shadcn/ui-style components (Radix primitives + class-variance-authority), in `src/components/ui`
- `xlsx` and `jspdf` / `jspdf-autotable` for the Stats page's Excel/PDF export (lazy-loaded)

## Dashboard

Everything under `/dashboard` runs on mock, frontend-only state kept in
`src/lib/store.jsx` (a small React context) and persisted to
`localStorage` under the `notarium:dashboard:v1` key, so it survives a
refresh without a backend:

- **Home** — remaining balance, budget-used progress, an add-expense modal,
  and a filterable, deletable expense list.
- **Stats** — a category-breakdown donut chart, a 6-month trend chart, a
  largest-expenses list, all computed live from the expense list, and an
  **Export** menu (top right) that generates an `.xlsx` workbook (Overview,
  Monthly trend, and All expenses sheets) or a formatted PDF report
  client-side, using `src/lib/export.js`. Both libraries (`xlsx`, `jspdf` +
  `jspdf-autotable`) are lazy-loaded on first use so they don't add to the
  app's initial bundle.
- **Settings** — toggle dark mode, edit the monthly budget, add/remove
  categories, toggle notification preferences, and reset all data back to
  the sample defaults.
- **Account** — edit your display name/email, upload or remove a profile photo, and sign out.

Reset the demo data any time from Settings → Danger zone, or by clearing
`localStorage` for the site.

### Dark mode

Dark mode covers the authenticated dashboard (shell, Home, Stats, Settings,
Account, and every shared UI primitive). It's implemented as a class-based
Tailwind v4 variant — toggling adds/removes a `dark` class on `<html>` — so
it's an explicit user choice rather than only following the OS setting:

- `src/lib/theme.jsx` — `ThemeProvider`/`useTheme()`. Defaults to the OS
  `prefers-color-scheme` on first visit, then remembers an explicit choice
  in `localStorage` under `notarium:theme` and keeps following the OS
  setting live until the person picks one.
- A small inline script in `index.html` applies the stored/OS theme before
  React mounts, so there's no flash of the wrong theme on load.
- Toggle it from the sun/moon icon at the bottom of the sidebar (desktop) or
  bottom nav (mobile), or from Settings → Appearance.
- The marketing landing page (`/`) and the login/signup page intentionally
  stay light-only, which is a common pattern for public/marketing pages;
  only the authenticated app shell is theme-aware.

### Add-expense modal

The modal (`ExpenseModal` in `src/pages/dashboard/Home.jsx`) is rendered
through a React portal directly into `document.body`, and:

- **Large screens**: it's centered within the visible content area (to the
  right of the fixed icon sidebar) rather than the full viewport, so it no
  longer looks off-center relative to the page content behind it.
- **Small screens**: it slides up from the bottom like a native bottom
  sheet, and sits above the fixed bottom nav bar (rather than covering it)
  via a bottom offset sized to the nav's height plus the device's safe-area
  inset.
- **Focus isolation**: while it's open, the sidebar, bottom nav, and page
  content behind it are marked `inert` (and `aria-hidden`), so mouse clicks,
  touches, and Tab/Shift+Tab keyboard navigation can't reach them — only the
  modal's own fields are reachable, with Tab cycling trapped inside it and
  Escape closing it. Background scrolling is also locked while it's open.

## Project structure

```
src/
  components/
    ui/               # Button, Input, Label, Card, Tabs, Switch
    Toast.jsx          # small toast notification used across the dashboard
  lib/
    utils.js           # cn() class-merging helper
    useInView.js        # scroll-reveal + count-up hooks used on the landing page
    theme.jsx            # dark/light mode context (see "Dark mode" above)
    store.jsx           # dashboard state (expenses/budget/categories/profile) + localStorage
    export.js            # Excel (xlsx) and PDF (jspdf) report generation, used by Stats' Export menu
  pages/
    LandingPage.jsx     # marketing page at "/"
    AuthPage.jsx         # Login / Sign up tabbed card
    Dashboard.jsx         # dashboard shell: sidebar/bottom nav + routes
    dashboard/
      shared.jsx          # currency() + TopBar shared by dashboard pages
      Home.jsx             # money overview, expense list, add-expense modal
      Stats.jsx             # charts and spending breakdowns
      Settings.jsx           # budget, categories, preferences, appearance, reset
      Account.jsx             # profile + sign out
  App.jsx              # routes
  main.jsx             # entry point
```
