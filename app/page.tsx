import { CommandCenter } from "@/components/command-center";
import { getCommandCenterData, GoogleSheetsConfigurationError } from "@/lib/sheets";
import type { CommandCenterData } from "@/lib/types";

export const dynamic = "force-dynamic";

type InitialDataResult = { data: CommandCenterData } | { setupError: string };

function SetupRequired({ message }: { message: string }) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-6 py-12">
      <section className="panel-strong rounded-[36px] border border-white/70 p-8 shadow-panel md:p-10">
        <p className="mb-3 text-xs uppercase tracking-[0.4em] text-moss">Setup Required</p>
        <h1 className="font-display text-4xl leading-tight text-ink md:text-5xl">Connect Google Sheets to load Retail Event OS.</h1>
        <p className="mt-5 text-base leading-7 text-ink/72">{message}</p>
        <div className="mt-6 rounded-2xl border border-ink/10 bg-white/75 p-5">
          <p className="text-sm font-semibold text-ink">Required environment variables</p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-ink/72">
            <li>GOOGLE_SHEETS_SPREADSHEET_ID</li>
            <li>GOOGLE_SERVICE_ACCOUNT_EMAIL</li>
            <li>GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY</li>
          </ul>
        </div>
        <p className="mt-5 text-sm leading-6 text-ink/60">
          Copy <code className="rounded bg-ink/5 px-1.5 py-0.5">.env.example</code> to{" "}
          <code className="rounded bg-ink/5 px-1.5 py-0.5">.env.local</code>, fill in the service account values, and restart the
          dev server.
        </p>
      </section>
    </main>
  );
}

async function loadInitialData(): Promise<InitialDataResult> {
  try {
    return { data: await getCommandCenterData() };
  } catch (error) {
    if (error instanceof GoogleSheetsConfigurationError) {
      return { setupError: error.message };
    }

    throw error;
  }
}

export default async function Page() {
  const initialData = await loadInitialData();

  if ("setupError" in initialData) {
    return <SetupRequired message={initialData.setupError} />;
  }

  return <CommandCenter initialData={initialData.data} />;
}
