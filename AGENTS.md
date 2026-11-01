# AGENTS.md

Operating guide for AI coding agents working in this repository (`pi-web`).

## Project overview

React + TypeScript + Vite frontend for the PI (festa junina) stock & voucher application,
consumed against the Django backend in the sibling repository `/Users/motokiyo/pi-back`.

## Tech stack

- React 18, TypeScript, Vite 5, SCSS (`sass`), react-router-dom v6, axios, recharts, papaparse, react-icons, react-activity
- Tests: Vitest + @testing-library/react + jsdom
- Lint: ESLint 9 (`eslint .`)

## Commands

```bash
npm install
cp .env.example .env
npm run dev       # Vite dev server
npm run build     # tsc -b && vite build
npm run lint
npm run test      # vitest run
npm run preview
```

## Environment variables

`.env.example`:

- `VITE_API_BASE_URL` – backend base URL (keep trailing slash, e.g. `https://motokiyo.pythonanywhere.com/`)
- `VITE_DEBUG` – enable axios debug logging

## Structure

- `src/services/` – axios instance + domain services (`index.ts` exports `api`, types) and per-domain modules
- `src/contexts/` – `AdminContext`, `CaixaContext`, `authStorage` (localStorage keys + cross-tab event)
- `src/hooks/` – data-fetching hooks (`useDashboard`, `useFichas`, `useProdutos`, `useVenda(s)`, `useCaixas`, etc.)
- `src/functions/` – formatters/cleanups (`formatters.ts`, `cleanDecimal.ts`, `compare.ts`)
- `src/components/` – shared UI (Card, Popup, Pagination, SearchBar, Select, Tag, Estoque, ...)
- `src/pages/` – routed pages (admin + caixa + public reservation flows)
- `src/router/` – route definitions + auth-guarded layout

## Auth & routing

- Admin session: localStorage key `adminLoggedIn` (`"true"`), managed by `AdminContext`.
- Caixa (cash register) session: localStorage key `caixa_logged_id` (+ legacy `caixa`), managed by `CaixaContext`.
- Cross-tab sync via `AUTH_SESSION_CHANGED_EVENT` dispatched from `authStorage`.
- Routes: public `/reservas/:qrCode`; `/caixa-login`; `/admin-login`; guarded caixa: `/`, `/vendas`, `/fichas`;
  guarded admin: `/admin-dashboard`, `/admin-reservas`, `/admin-caixas`, `/admin-produtos`, `/admin-fichas`, `/admin-movimentacoes`;
  catch-all redirects to `/caixa-login` (except `/admin-*` → `/admin-login`).

## Conventions

- All HTTP goes through the shared axios instance in `src/services/index.ts` (`baseURL` from `VITE_API_BASE_URL`).
- Service modules export plain async functions (e.g. `getFichas`, `postFicha`) consumed by hooks.
- Types mirror backend DTOs — backend uses snake_case field names, but some payloads (e.g. dashboard)
  use camelCase keys (`valorTotal`, `totalVendas`, ...) — keep them aligned in both repos.

## Tests & CI

- Vitest config in `vite.config.ts` (jsdom, globals, setup `src/test-setup.ts`).
- Colocated test files, e.g. `src/pages/CaixaLoginPage/CaixaLoginPage.test.tsx`, `src/pages/ReservaPublicaPage/ReservaPublicaPage.test.tsx`.
- CI (`.github/workflows/ci.yml`): `npm ci && npm run lint && npm run test && npm run build`; deploys to Netlify on push to `main`.

## Deployment

- Vite SPA deployed to Netlify (see `NETLIFY_SETUP.md`, `netlify.toml`); backend counterpart: `/Users/motokiyo/pi-back`.

## Backend counterpart (`pi-back`)

The API base URL and response shapes are owned by the Django backend. Before changing any service
call or type, confirm the matching backend endpoint/serializer still behaves the same — the two repos
ship together (backend deploy → frontend build with `VITE_API_BASE_URL` pointing at the backend).
