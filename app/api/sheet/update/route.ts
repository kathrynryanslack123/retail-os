import { NextRequest, NextResponse } from "next/server";
import { GoogleSheetsConfigurationError, parseSheetUpdatePayload, updateSheetCell } from "@/lib/sheets";

export const runtime = "nodejs";

export async function PATCH(request: NextRequest) {
  try {
    const payload = parseSheetUpdatePayload(await request.json());
    await updateSheetCell(payload);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update sheet cell.";
    const status = error instanceof GoogleSheetsConfigurationError ? 500 : 400;
    console.error("Unable to update sheet cell", error);
    return NextResponse.json({ error: message }, { status });
  }
}
