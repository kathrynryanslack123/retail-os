import { NextRequest, NextResponse } from "next/server";
import { sheetDefinitions } from "@/lib/sheet-config";
import { coerceInputValue, updateSheetCell } from "@/lib/sheets";
import { SheetName, SheetUpdatePayload } from "@/lib/types";

function isSheetName(value: unknown): value is SheetName {
  return typeof value === "string" && value in sheetDefinitions;
}

export async function PATCH(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<SheetUpdatePayload>;

    if (!isSheetName(body.sheet)) {
      return NextResponse.json({ error: "Unsupported sheet." }, { status: 400 });
    }

    if (typeof body.rowNumber !== "number" || !Number.isInteger(body.rowNumber) || body.rowNumber < 1) {
      return NextResponse.json({ error: "Invalid row number." }, { status: 400 });
    }

    if (typeof body.columnKey !== "string") {
      return NextResponse.json({ error: "Invalid column key." }, { status: 400 });
    }

    if (typeof body.value !== "string" && typeof body.value !== "number") {
      return NextResponse.json({ error: "Invalid value." }, { status: 400 });
    }

    const column = sheetDefinitions[body.sheet].columns.find((item) => item.key === body.columnKey);

    if (!column?.editable) {
      return NextResponse.json({ error: "Column is not editable." }, { status: 400 });
    }

    const value = typeof body.value === "number" ? body.value : coerceInputValue(body.value, column.type);

    await updateSheetCell({
      sheet: body.sheet,
      rowNumber: body.rowNumber,
      columnKey: body.columnKey,
      value
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to update sheet cell.", error);
    return NextResponse.json({ error: "Unable to update sheet cell." }, { status: 500 });
  }
}
