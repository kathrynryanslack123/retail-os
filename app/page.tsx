import { CommandCenter } from "@/components/command-center";
import { isRetailEventOsEnabled } from "@/lib/feature-flags";
import { getCommandCenterData } from "@/lib/sheets";

export const dynamic = "force-dynamic";

function FeatureDisabled() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-6 py-12">
      <section className="panel-strong rounded-[36px] border border-white/70 p-8 shadow-panel">
        <p className="mb-3 text-xs uppercase tracking-[0.4em] text-moss">Retail Event OS</p>
        <h1 className="font-display text-4xl leading-tight text-ink md:text-5xl">Command center is paused</h1>
        <p className="mt-4 text-base leading-7 text-ink/72">
          The live Google Sheets command center is currently behind a rollout flag. Enable the feature flag when this update is
          ready for the target environment.
        </p>
      </section>
    </main>
  );
}

export default async function Page() {
  if (!isRetailEventOsEnabled()) {
    return <FeatureDisabled />;
  }

  const initialData = await getCommandCenterData();
  return <CommandCenter initialData={initialData} />;
}
