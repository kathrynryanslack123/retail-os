import { NextResponse } from "next/server";
import { isRetailEventOsEnabled } from "@/lib/feature-flags";
import { getCommandCenterData } from "@/lib/sheets";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isRetailEventOsEnabled()) {
    return NextResponse.json({ error: "Feature disabled." }, { status: 404 });
  }

  try {
    const data = await getCommandCenterData();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Unable to load sheet data", error);
    return NextResponse.json({ error: "Unable to load sheet data." }, { status: 500 });
  }
}

