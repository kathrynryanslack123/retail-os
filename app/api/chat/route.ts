import { NextRequest, NextResponse } from "next/server";
import { getCommandCenterData } from "@/lib/sheets";

export const runtime = "nodejs";

function normalize(value: unknown) {
  return String(value ?? "").toLowerCase();
}

const ignoredWords = new Set([
  "how",
  "many",
  "are",
  "the",
  "there",
  "stock",
  "in",
  "for",
  "with",
  "and",
  "black",
  "white",
  "yellow"
]);

function tokenize(message: string) {
  return message
    .split(/[^a-z0-9]+/)
    .map((word) => (word.endsWith("s") ? word.slice(0, -1) : word))
    .filter((word) => word.length > 2 && !ignoredWords.has(word));
}

function matchesQuery(row: Record<string, unknown>, message: string) {
  const searchableText = [
    row.productName,
    row.category,
    row.sku,
    row.vendor,
    row.location
  ]
    .map(normalize)
    .join(" ");

  const terms = tokenize(message);

  if (!terms.length) {
    return false;
  }

  return terms.every((word) => searchableText.includes(word));
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { message?: string };
    const message = normalize(body.message);

    if (!message) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    const data = await getCommandCenterData();
    const rows = data.sheets["Merch Tracker"];
    const matchingRows = rows.filter((row) => matchesQuery(row, message));

    if (!matchingRows.length) {
      return NextResponse.json({
        answer: "I could not find a matching merch item in the tracker.",
        matches: []
      });
    }

    const totalInStock = matchingRows.reduce((sum, row) => sum + Number(row.inStock || 0), 0);
    const itemSummary = matchingRows
      .map((row) => `${row.productName}: ${row.inStock} in stock at ${row.location || "no location listed"}`)
      .join("; ");

    return NextResponse.json({
      answer: `${totalInStock} units are in stock. ${itemSummary}.`,
      totalInStock,
      matches: matchingRows.map((row) => ({
        rowNumber: row.rowNumber,
        productName: row.productName,
        sku: row.sku,
        inStock: row.inStock,
        location: row.location
      }))
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to answer chat request.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
