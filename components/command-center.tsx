"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { AlertTriangle, BadgeDollarSign, ChartNoAxesCombined, PackageSearch, RadioTower, Siren, Users } from "lucide-react";
import { EditableTable } from "@/components/editable-table";
import { sheetDefinitions } from "@/lib/sheet-config";
import { CommandAlert, CommandCenterData, GridRow, SheetName } from "@/lib/types";

type CommandCenterProps = {
  initialData: CommandCenterData;
};

const sectionDescriptions: Record<SheetName, string> = {
  "Project Timeline": "Master timeline for creative, merchandising, marketing, influencer, and store operations.",
  "Marketing Plan": "Calendar for campaign launches, creative readiness, and content links.",
  "Influencer Tracker": "Creator attendance, outreach status, and live content accountability.",
  "Merch Tracker": "SKU performance, live sell-through, and revenue pacing.",
  "Run of Show": "Minute-by-minute event-day schedule and activation readiness.",
  "Store Experience Checklist": "Store-floor execution checklist before doors open.",
  "Budget Tracker": "Actuals, vendor payment status, and variance management.",
  "KPI Tracking": "Target versus actual performance across traffic, sales, and content."
};

const toneClasses: Record<CommandAlert["tone"], string> = {
  danger: "border-ember/30 bg-ember/10 text-ember",
  warning: "border-amber-300/60 bg-amber-50 text-amber-800",
  info: "border-sky-300/70 bg-sky-50 text-sky-800",
  success: "border-emerald-300/60 bg-emerald-50 text-emerald-800"
};

const alertIcons = [Siren, AlertTriangle, PackageSearch, BadgeDollarSign, RadioTower, Users, ChartNoAxesCombined];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

function formatPercent(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    maximumFractionDigits: 1
  }).format(value);
}

function buildCompletionRate(complete: number, total: number) {
  if (!total) {
    return "0%";
  }

  return `${Math.round((complete / total) * 100)}%`;
}

export function CommandCenter({ initialData }: CommandCenterProps) {
  const [data, setData] = useState(initialData);
  const [syncLabel, setSyncLabel] = useState("Live sync active");

  useEffect(() => {
    const interval = window.setInterval(async () => {
      try {
        const response = await fetch("/api/sheet/data", { cache: "no-store" });

        if (!response.ok) {
          throw new Error("Refresh failed.");
        }

        const nextData = (await response.json()) as CommandCenterData;
        setData(nextData);
        setSyncLabel(`Synced ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`);
      } catch {
        setSyncLabel("Refresh issue");
      }
    }, 20000);

    return () => window.clearInterval(interval);
  }, []);

  function patchRow(sheet: SheetName, rowNumber: number, columnKey: string, value: string | number) {
    setData((current) => ({
      ...current,
      sheets: {
        ...current.sheets,
        [sheet]: current.sheets[sheet].map((row) =>
          row.rowNumber === rowNumber
            ? {
                ...row,
                [columnKey]: value
              }
            : row
        )
      }
    }));
  }

  const statCards = useMemo(
    () => [
      { label: "Task Completion", value: buildCompletionRate(data.dashboard.tasksComplete, data.dashboard.taskTotal) },
      { label: "ROI", value: formatPercent(data.dashboard.roi) },
      { label: "Actual Merch Sales", value: formatCurrency(data.dashboard.actualSales) },
      { label: "Average Sell Through", value: formatPercent(data.dashboard.averageSellThrough) }
    ],
    [data.dashboard]
  );

  const sheetEntries = Object.entries(sheetDefinitions) as [SheetName, (typeof sheetDefinitions)[SheetName]][];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col gap-8 px-4 py-6 md:px-8 lg:px-10">
      <section className="panel-strong relative overflow-hidden rounded-[36px] border border-white/70 px-6 py-8 shadow-panel md:px-8">
        <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-[radial-gradient(circle_at_center,rgba(215,241,113,0.4),transparent_65%)] lg:block" />
        <div className="relative grid gap-8 lg:grid-cols-[1.7fr_1fr]">
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.4em] text-moss">Retail Event OS</p>
            <h1 className="max-w-3xl font-display text-4xl leading-tight text-ink md:text-6xl">
              {data.dashboard.eventName || "Retail Pop-Up Command Center"}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-ink/72">
              Live campaign control room for merchandising, marketing, influencers, budget, and store operations with direct two-way
              Google Sheets sync.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {[
                data.dashboard.city || "Chicago",
                data.dashboard.retailer || "Retail Partner TBD",
                data.dashboard.storeLocation || "Store location pending",
                data.dashboard.projectLead || "Owner pending"
              ].map((chip) => (
                <span key={chip} className="rounded-full border border-ink/10 bg-white/70 px-4 py-2 text-sm text-ink/80">
                  {chip}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[28px] bg-ink px-5 py-5 text-sand">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.35em] text-lime">Ops Pulse</p>
                <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.24em]">{syncLabel}</span>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {statCards.map((card) => (
                  <div key={card.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-sand/60">{card.label}</p>
                    <p className="mt-3 font-display text-3xl">{card.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-ink/10 bg-white/75 p-5">
              <p className="text-xs uppercase tracking-[0.35em] text-moss">Navigation</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {sheetEntries.map(([sheet]) => (
                  <a
                    key={sheet}
                    href={`#${sheet.replace(/\s+/g, "-").toLowerCase()}`}
                    className="rounded-full border border-ink/10 px-4 py-2 text-sm text-ink/72 transition hover:border-moss hover:text-moss"
                  >
                    {sheet}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.alerts.map((alert, index) => {
          const Icon = alertIcons[index % alertIcons.length];
          return (
            <article key={alert.id} className={clsx("rounded-[28px] border p-5 shadow-sm", toneClasses[alert.tone])}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em]">Alert</p>
                  <h2 className="mt-3 font-display text-2xl">{alert.title}</h2>
                </div>
                <Icon className="h-6 w-6" />
              </div>
              <p className="mt-4 text-sm leading-6">{alert.description}</p>
              <div className="mt-5 text-3xl font-semibold">{alert.count}</div>
            </article>
          );
        })}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Event Date", value: data.dashboard.eventDate || "TBD" },
          { label: "Tasks Tracked", value: String(data.dashboard.taskTotal) },
          { label: "Budget Planned", value: formatCurrency(data.dashboard.budgetPlanned) },
          { label: "Budget Actual", value: formatCurrency(data.dashboard.budgetActual) }
        ].map((item) => (
          <div key={item.label} className="panel rounded-[28px] border border-white/60 p-5 shadow-panel">
            <p className="text-xs uppercase tracking-[0.3em] text-ink/45">{item.label}</p>
            <p className="mt-4 font-display text-3xl text-ink">{item.value}</p>
          </div>
        ))}
      </section>

      <div className="grid gap-6">
        {sheetEntries.map(([sheet, definition]) => (
          <EditableTable
            key={sheet}
            sheet={sheet}
            title={sheet}
            description={sectionDescriptions[sheet]}
            columns={definition.columns}
            rows={data.sheets[sheet] as GridRow[]}
            onRowPatched={patchRow}
          />
        ))}
      </div>
    </main>
  );
}
