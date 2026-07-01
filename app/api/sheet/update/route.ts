import { NextRequest, NextResponse } from "next/server";
import { isRetailEventOsEnabled } from "@/lib/feature-flags";
import { sheetDefinitions } from "@/lib/sheet-config";
import { coerceInputValue, updateSheetCell } from "@/lib/sheets";
import { SheetName, SheetUpdatePayload } from "@/lib/types";

function isSheetName(value: unknown): value is SheetName {
  return typeof value === "string" && value in sheetDefinitions;
}

function parsePayload(body: unknown): SheetUpdatePayload {
  if (!body || typeof body !== "object") {
    throw new Error("Request body must be an object.");
  }

  const payload = body as Record<string, unknown>;

  if (!isSheetName(payload.sheet)) {
    throw new Error("Unsupported sheet.");
  }

  if (typeof payload.rowNumber !== "number" || !Number.isInteger(payload.rowNumber) || payload.rowNumber < 1) {
    throw new Error("rowNumber must be a positive integer.");
  }

  if (typeof payload.columnKey !== "string") {
    throw new Error("columnKey must be a string.");
  }

  if (typeof payload.value !== "string" && typeof payload.value !== "number") {
    throw new Error("value must be a string or number.");
  }

  const column = sheetDefinitions[payload.sheet].columns.find((item) => item.key === payload.columnKey);

  if (!column?.editable) {
    throw new Error("Column is not editable.");
  }

  return {
    sheet: payload.sheet,
    rowNumber: payload.rowNumber,
    columnKey: payload.columnKey,
    value: typeof payload.value === "string" ? coerceInputValue(payload.value, column.type) : payload.value
  };
}

export async function PATCH(request: NextRequest) {
  if (!isRetailEventOsEnabled()) {
    return NextResponse.json({ error: "Feature disabled." }, { status: 404 });
  }

  try {
    const payload = parsePayload(await request.json());
    await updateSheetCell(payload);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update sheet cell.";
    const status = message.includes("credentials") ? 500 : 400;
    console.error("Unable to update sheet cell", error);
    return NextResponse.json({ error: message }, { status });
  }
}

