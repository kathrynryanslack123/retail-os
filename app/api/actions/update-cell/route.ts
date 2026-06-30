import { NextRequest, NextResponse } from "next/server";
import { sheetDefinitions } from "@/lib/sheet-config";
import { coerceInputValue, updateSheetCell } from "@/lib/sheets";
import { SheetUpdatePayload } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as SheetUpdatePayload;
    const definition = sheetDefinitions[payload.sheet];
    const column = definition?.columns.find((item) => item.key === payload.columnKey);

    if (!definition || !column) {
      return NextResponse.json({ error: "Invalid sheet or column." }, { status: 400 });
    }

    const value = coerceInputValue(String(payload.value ?? ""), column.type);

    await updateSheetCell({
      ...payload,
      value
    });

    return NextResponse.json({
      ok: true,
      sheet: payload.sheet,
      rowNumber: payload.rowNumber,
      columnKey: payload.columnKey,
      value
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update command center data.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
