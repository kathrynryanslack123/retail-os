# retail-event-os

Next.js 15 (App Router) + React 19 + TypeScript dashboard — a "Retail Event OS" command center for retail pop-up campaigns. Google Sheets is the only backend datastore: the app reads/writes a spreadsheet through a Google service account.

## Cursor Cloud specific instructions

### Services
There is a single service: the Next.js app (web UI + API routes). No database, Docker, or other auxiliary services are involved. Commands live in `package.json`:
- Dev server: `npm run dev` → http://localhost:3000
- Build (also type-checks): `npm run build`
- Lint: `npm run lint`

### Google Sheets credentials are required for the app to render real data
The home page (`app/page.tsx`) is `force-dynamic` and calls `getCommandCenterData()` (`lib/sheets.ts`) on every request, as do the API routes `GET /api/sheet/data` and `PATCH /api/sheet/update`. There is **no built-in mock/offline mode**: without credentials these throw and return HTTP 500 with `Missing Google Sheets credentials`. The dev server itself still boots and compiles fine — only data fetching fails.

To run the product end-to-end, create `.env.local` (gitignored; template in `.env.example`) or set these as Cursor Secrets so they are injected as env vars:
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` (literal `\n` for newlines, wrapped in quotes)
- `GOOGLE_SHEETS_SPREADSHEET_ID` (optional; a fallback ID is hardcoded in `lib/sheets.ts`)
- `EVENT_QA_DATE` (optional; pins the reference "today" used for overdue-task alert calculations — handy for deterministic QA)

The service account must have read/write access to the target spreadsheet, and the spreadsheet must contain the tabs defined in `lib/sheet-config.ts` (`Dashboard`, `Project Timeline`, `Marketing Plan`, `Influencer Tracker`, `Merch Tracker`, `Run of Show`, `Store Experience Checklist`, `Budget Tracker`, `KPI Tracking`) with matching column layouts.

### Project layout note
Source files live under `app/` (routes, layout, global CSS, API handlers), `lib/` (Sheets client, config, types), and `components/` (client UI). The `@/*` path alias maps to the repo root (`tsconfig.json`), so imports are `@/lib/...`, `@/components/...`, `@/app/...`.
