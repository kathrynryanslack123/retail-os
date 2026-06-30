import { NextResponse } from "next/server";
import { getCommandCenterData } from "@/lib/sheets";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getCommandCenterData();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Unable to load sheet data", error);
    return NextResponse.json({ error: "Unable to load sheet data." }, { status: 500 });
  }
}

