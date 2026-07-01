import { NextRequest, NextResponse } from "next/server";
import { GoogleSheetsConfigurationError, parseSheetUpdatePayload, updateSheetCell } from "@/lib/sheets";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const payload = parseSheetUpdatePayload(await request.json());
    await updateSheetCell(payload);

    return NextResponse.json({
      ok: true,
      sheet: payload.sheet,
      rowNumber: payload.rowNumber,
      columnKey: payload.columnKey,
      value: payload.value
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update command center data.";
    const status = error instanceof GoogleSheetsConfigurationError ? 500 : 400;
    console.error("Unable to update command center cell", error);
    return NextResponse.json({ error: message }, { status });
  }
}
