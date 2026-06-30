# Retail Event OS

Next.js command center for a live retail pop-up event with two-way Google Sheets sync.

## Stack

- Next.js App Router
- React + TypeScript
- Tailwind CSS
- Google Sheets API via server-side route handlers

## Connected spreadsheet

This app targets:

`https://docs.google.com/spreadsheets/d/1YtkHM5x2QEY9QHp32SLqOJibYbslH8GfJ6u0uYdVLUs/edit`

Supported tabs:

- Dashboard
- Project Timeline
- Marketing Plan
- Influencer Tracker
- Merch Tracker
- Run of Show
- Store Experience Checklist
- Budget Tracker
- KPI Tracking

## Environment setup

1. Create a Google Cloud project and enable the Google Sheets API.
2. Create a service account with Sheets access.
3. Share the spreadsheet with the service account email as an editor.
4. Copy `.env.example` to `.env.local` and fill in the service account values.

Example:

```env
GOOGLE_SHEETS_SPREADSHEET_ID=1YtkHM5x2QEY9QHp32SLqOJibYbslH8GfJ6u0uYdVLUs
GOOGLE_SERVICE_ACCOUNT_EMAIL=service-account@project-id.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"
EVENT_QA_DATE=2026-05-07T12:00:00-05:00
```

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Sync model

- The UI reads all supported tabs on load.
- The client polls the server every 20 seconds for fresh Google Sheets data.
- Editable cells write back immediately through `PATCH /api/sheet/update`.
- All Google credentials stay server-side.

## Editable fields

- Task status and notes
- Marketing status, creative link, and notes
- Influencer invite status, RSVP status, and content link
- Merch units sold and notes
- Run of show status and notes
- Store checklist status and notes
- Budget actuals, paid status, and notes
- KPI actuals, status, and notes

## ChatGPT action surface

The app now exposes action-friendly endpoints:

- `GET /api/actions/command-center`
- `POST /api/actions/update-cell`
- `GET /api/openapi.json`

To connect this to ChatGPT:

1. Deploy the app to a public HTTPS URL.
2. Set `APP_BASE_URL` in the deployed environment to that exact public origin.
3. In ChatGPT, create a custom GPT and add an Action using the OpenAPI schema from:
   `https://your-domain/api/openapi.json`
4. If you want authentication, place it in front of these routes and then update the Action auth settings to match.

The Action can then:

- pull the latest command-center state
- inspect alerts and rows by tab
- write updates back to the sheet one cell at a time

## Deploy on Vercel

1. Push this folder to a GitHub repository.
2. In Vercel, create a new project from that repo.
3. Keep the framework preset as `Next.js`.
4. Add these environment variables in Vercel Project Settings:

```env
APP_BASE_URL=https://your-vercel-domain.vercel.app
GOOGLE_SHEETS_SPREADSHEET_ID=1YtkHM5x2QEY9QHp32SLqOJibYbslH8GfJ6u0uYdVLUs
GOOGLE_SERVICE_ACCOUNT_EMAIL=service-account@project-id.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"
EVENT_QA_DATE=2026-05-07T12:00:00-05:00
```

5. Redeploy after saving the environment variables.
6. Verify these URLs after deployment:
   `https://your-domain/api/health`
   `https://your-domain/api/actions/command-center`
   `https://your-domain/api/openapi.json`
7. Use the deployed `openapi.json` URL inside your custom GPT Action config.

## Vercel notes

- `APP_BASE_URL` must match the exact deployed origin used by ChatGPT Actions.
- `EVENT_QA_DATE` controls the date used for overdue-task alert calculations. Omit it to use the current server date.
- The service account must have Editor access to the Google Sheet.
- The API routes are pinned to the Node.js runtime because the Google client library should not run on the Edge runtime.
- If you later add Action auth, update both Vercel and the GPT Action configuration together.
