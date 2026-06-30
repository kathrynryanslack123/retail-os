# retail-event-os

Next.js 15 (App Router) + React 19 + TypeScript dashboard ("Retail Event Command Center"). Google Sheets is the only backend datastore — the app reads/writes a spreadsheet through a Google service account.

## Cursor Cloud specific instructions

### Services
There is a single service: the Next.js app (web UI + API routes). No database, Docker, or auxiliary services are involved.

- Dev server: `npm run dev` → http://localhost:3000 (commands live in `package.json`).
- Build: `npm run build` (also runs TypeScript type-checking).

### Google Sheets credentials are required for the app to render
The home page (`app/page.tsx`) is `force-dynamic` and calls `getCommandCenterData()` (`lib/sheets.ts`) on every request, as do the API routes `GET /api/sheet/data` and `PATCH /api/sheet/update`. There is **no mock/offline mode**: without credentials these throw and return HTTP 500 with `Missing Google Sheets credentials`.

To run the product end-to-end, create `.env.local` (gitignored; template in `.env.example`) with:
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` (literal `\n` for newlines, wrapped in quotes)
- `GOOGLE_SHEETS_SPREADSHEET_ID` (optional; a fallback ID is hardcoded in `lib/sheets.ts`)
- `EVENT_QA_DATE` (optional; reference "today" for overdue-task alerts)

The service account must have read/write access to the target spreadsheet, and the spreadsheet must contain the tabs defined in `lib/sheet-config.ts` (`Dashboard`, `Project Timeline`, `Marketing Plan`, `Influencer Tracker`, `Merch Tracker`, `Run of Show`, `Store Experience Checklist`, `Budget Tracker`, `KPI Tracking`). In Cursor Cloud, set these via the Secrets panel so they are injected as env vars.

### Linting is not configured in the repo
`npm run lint` (`next lint`) prompts interactively to create an ESLint config because none exists, so it cannot run non-interactively. Rely on `npm run build` for static/type checking unless an ESLint config is added to the repo.
