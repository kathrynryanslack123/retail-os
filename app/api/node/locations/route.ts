import { NextResponse } from "next/server";
import { getCommandCenterData } from "@/lib/sheets";

export const runtime = "nodejs";

export async function GET() {
  try {
    const data = await getCommandCenterData();
    const items = data.sheets["Merch Tracker"].map((row) => ({
      rowNumber: row.rowNumber,
      productName: row.productName,
      sku: row.sku,
      location: row.location
    }));

    return NextResponse.json({
      ok: true,
      count: items.length,
      items
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load merch locations.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
