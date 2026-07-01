"use client";

import { useEffect, useState, useTransition } from "react";
import { useState, useTransition } from "react";
import clsx from "clsx";
import { SheetColumn, SheetName, GridRow } from "@/lib/types";

type EditableTableProps = {
  sheet: SheetName;
  title: string;
  description: string;
  columns: SheetColumn[];
  rows: GridRow[];
  onRowPatched: (sheet: SheetName, rowNumber: number, columnKey: string, value: string | number) => void;
};

type SaveState = "idle" | "saving" | "saved" | "error";

function EditableCell({
  sheet,
  row,
  column,
  onCommit
}: {
  sheet: SheetName;
  row: GridRow;
  column: SheetColumn;
  onCommit: (sheet: SheetName, rowNumber: number, columnKey: string, value: string | number) => Promise<void>;
}) {
  const initialValue = String(row[column.key] ?? "");
  const [value, setValue] = useState(initialValue);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  async function commit(nextValue: string) {
    if (!column.editable || nextValue === initialValue) {
      return;
    }

    setSaveState("saving");

    try {
      await onCommit(sheet, row.rowNumber, column.key, nextValue);
      setSaveState("saved");
      window.setTimeout(() => setSaveState("idle"), 1200);
    } catch {
      setSaveState("error");
    }
  }

  if (!column.editable) {
    return <div className="min-w-32 whitespace-pre-wrap text-sm text-ink/80">{initialValue || "—"}</div>;
  }

  const sharedClassName =
    "w-full rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm text-ink shadow-sm outline-none transition focus:border-moss focus:ring-2 focus:ring-lime";

  return (
    <div className="min-w-40">
      {column.type === "select" ? (
        <select
          className={sharedClassName}
          value={value}
          onChange={(event) => {
            const nextValue = event.target.value;
            setValue(nextValue);
            startTransition(() => {
              void commit(nextValue);
            });
          }}
        >
          {column.options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : column.type === "textarea" ? (
        <textarea
          className={sharedClassName}
          rows={2}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onBlur={() => {
            startTransition(() => {
              void commit(value);
            });
          }}
        />
      ) : (
        <input
          className={sharedClassName}
          inputMode={column.type === "number" || column.type === "currency" || column.type === "percent" ? "decimal" : undefined}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onBlur={() => {
            startTransition(() => {
              void commit(value);
            });
          }}
        />
      )}

      <div
        className={clsx("mt-1 text-[11px] uppercase tracking-[0.2em]", {
          "text-ink/35": saveState === "idle",
          "text-moss": saveState === "saved",
          "text-ember": saveState === "error",
          "text-sky-700": saveState === "saving" || isPending
        })}
      >
        {saveState === "saving" || isPending
          ? "Syncing"
          : saveState === "saved"
            ? "Saved"
            : saveState === "error"
              ? "Retry needed"
              : "Live"}
      </div>
    </div>
  );
}

export function EditableTable(props: EditableTableProps) {
  const { sheet, title, description, columns, rows, onRowPatched } = props;

  async function commit(sheetName: SheetName, rowNumber: number, columnKey: string, value: string | number) {
    const response = await fetch("/api/sheet/update", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        sheet: sheetName,
        rowNumber,
        columnKey,
        value
      })
    });

    if (!response.ok) {
      throw new Error("Unable to update cell.");
    }

    onRowPatched(sheetName, rowNumber, columnKey, value);
  }

  return (
    <section id={sheet.replace(/\s+/g, "-").toLowerCase()} className="panel rounded-[28px] border border-white/60 p-5 shadow-panel">
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-moss">{sheet}</p>
          <h2 className="font-display text-3xl text-ink">{title}</h2>
          <p className="max-w-3xl text-sm text-ink/70">{description}</p>
        </div>
        <div className="rounded-full border border-ink/10 bg-white/70 px-4 py-2 text-xs uppercase tracking-[0.25em] text-ink/55">
          {rows.length} live rows
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-y-3">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-3 text-left text-[11px] font-semibold uppercase tracking-[0.22em] text-ink/50">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="align-top">
                {columns.map((column) => (
                  <td key={`${row.id}-${column.key}`} className="rounded-2xl bg-white/80 px-3 py-3">
                    <EditableCell sheet={sheet} row={row} column={column} onCommit={commit} />
                    <EditableCell
                      key={`${row.id}-${column.key}-${String(row[column.key] ?? "")}`}
                      sheet={sheet}
                      row={row}
                      column={column}
                      onCommit={commit}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
