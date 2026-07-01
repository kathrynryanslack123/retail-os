## Retail Event OS feature flag

Set `RETAIL_EVENT_OS_ENABLED=true` to enable the live Google Sheets-backed command center and sheet API routes.

When the flag is unset or set to any other value, the app renders a paused rollout screen and the `/api/sheet/*` routes return
404 responses without contacting Google Sheets.

> Why do I have a folder named ".vercel" in my project?
The ".vercel" folder is created when you link a directory to a Vercel project.

> What does the "project.json" file contain?
The "project.json" file contains:
- The ID of the Vercel project that you linked ("projectId")
- The ID of the user or team your Vercel project is owned by ("orgId")

> Should I commit the ".vercel" folder?
No, you should not share the ".vercel" folder with anyone.
Upon creation, it will be automatically added to your ".gitignore" file.
