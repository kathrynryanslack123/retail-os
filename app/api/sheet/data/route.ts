import { NextResponse } from "next/server";
import { getCommandCenterData } from "@/lib/sheets";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const data = await getCommandCenterData();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to load command center data.", error);
    return NextResponse.json({ error: "Unable to load command center data." }, { status: 500 });
    const message = error instanceof Error ? error.message : "Unable to load Google Sheet data.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
