import { CommandCenter } from "@/components/command-center";
import { getCommandCenterData } from "@/lib/sheets";

export const dynamic = "force-dynamic";

export default async function Page() {
  const initialData = await getCommandCenterData();
  return <CommandCenter initialData={initialData} />;
}
