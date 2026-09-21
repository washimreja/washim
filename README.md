# washim
Are bhai is my first Git
<br>
Author -washim reja

---

# SkySense ⛅ — Weather that thinks ahead

A full-featured weather SaaS built with React 18 + TypeScript + Vite + Tailwind CSS.

## Features

- **Real-time conditions** — temperature, feels-like, wind, gusts, humidity, pressure, visibility, UV (Open-Meteo, no API key needed)
- **7-day & hourly forecasts** — hourly detail with precipitation probability, cloud cover, sunrise/sunset
- **Smart alerts** — storm, gust, frost, heat, UV and washout detection derived from the forecast
- **Personal intelligence engine** — on-device scoring that blends live conditions with your comfort thresholds and activity interests; every recommendation ships with plain-language reasons
- **Planner with social sharing** — create plans, get best-hour suggestions, share to X / WhatsApp / Facebook / email, or copy a public plan link (`/plan/:id`)
- **Favorites & location search** — 40,000+ cities via geocoding, plus GPS locate

## Getting started

```bash
bun install
bun run dev      # start dev server
bun run build    # production build to dist/
bun run typecheck
bun run test     # vitest unit tests (src/lib/**)
```

Demo account: `demo@skysense.app` / `demo1234` (auto-seeded locally on first visit).

## Architecture

```
src/
  lib/         weather client (Open-Meteo), alerts, personalization engine, local store
  hooks/       useWeather (cached fetch), useScrolled
  context/     AuthContext (demo auth, local persistence)
  components/  ui primitives, WeatherIcon (animated SVGs), LocationSearch, Navbar
  pages/       Landing, Auth, SharedPlan, dashboard/ (Overview, Insights, Planner, Settings)
```

Weather data by [Open-Meteo](https://open-meteo.com).
