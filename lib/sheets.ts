import { google } from "googleapis";
import { sheetDefinitions } from "@/lib/sheet-config";
import {
  CommandAlert,
  CommandCenterData,
  DashboardSummary,
  GridRow,
  SheetDefinition,
  SheetName,
  SheetUpdatePayload
} from "@/lib/types";

const spreadsheetId =
  process.env.GOOGLE_SHEETS_SPREADSHEET_ID ||
  "1YtkHM5x2QEY9QHp32SLqOJibYbslH8GfJ6u0uYdVLUs";

function getAlertReferenceDate() {
  const configuredDate = process.env.EVENT_QA_DATE?.trim();

  if (!configuredDate) {
    return new Date();
  }

  const parsedDate = new Date(configuredDate);

  if (Number.isNaN(parsedDate.getTime())) {
    return new Date();
  }

  return parsedDate;
}

function getCredentials() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!clientEmail || !privateKey) {
    throw new Error(
      "Missing Google Sheets credentials. Set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY."
    );
  }

  return { client_email: clientEmail, private_key: privateKey };
}

async function getSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: getCredentials(),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"]
  });

  return google.sheets({ version: "v4", auth });
}

function normalizeCell(cell?: string) {
  return cell?.toString().trim() ?? "";
}

function toNumber(value: string | number | undefined) {
  if (typeof value === "number") {
    return value;
  }

  if (!value) {
    return 0;
  }

  const normalized = value.replace(/[$,%(),]/g, "").trim();

  if (!normalized) {
    return 0;
  }

  const parsed = Number(normalized);

  if (Number.isNaN(parsed)) {
    return 0;
  }

  if (value.includes("%")) {
    return parsed / 100;
  }

  if (value.includes("(") && value.includes(")")) {
    return parsed * -1;
  }

  return parsed;
}

function columnLetterToIndex(column: string) {
  return column
    .toUpperCase()
    .split("")
    .reduce((index, character) => index * 26 + character.charCodeAt(0) - 64, 0) - 1;
}

function formatRow(definition: SheetDefinition, row: string[], rowNumber: number): GridRow {
  const item: GridRow = {
    id: `${definition.name}-${rowNumber}`,
    rowNumber
  };

  definition.columns.forEach((column) => {
    item[column.key] = normalizeCell(row[columnLetterToIndex(column.column)]);
  });

  return item;
}

function mapRows(definition: SheetDefinition, values?: string[][]) {
  const rows = values ?? [];
  return rows.slice(1).reduce<GridRow[]>((accumulator, row, index) => {
    if (!row.some((value) => normalizeCell(value).length > 0)) {
      return accumulator;
    }

    accumulator.push(formatRow(definition, row, index + 4));
    return accumulator;
  }, []);
}

function buildDashboardSummary(values?: string[][]): DashboardSummary {
  const rows = values ?? [];
  const get = (row: number, column: number) => normalizeCell(rows[row]?.[column]);

  return {
    eventName: get(3, 1),
    retailer: get(3, 4),
    city: get(4, 1),
    eventDate: get(4, 4),
    storeLocation: get(5, 1),
    projectLead: get(5, 4),
    taskTotal: toNumber(get(8, 1)),
    tasksComplete: toNumber(get(9, 1)),
    roi: toNumber(get(16, 1)),
    projectedRevenue: toNumber(get(12, 1)),
    actualSales: toNumber(get(13, 1)),
    budgetPlanned: toNumber(get(14, 1)),
    budgetActual: toNumber(get(15, 1)),
    averageSellThrough: toNumber(get(12, 7))
  };
}

function buildAlerts(data: Omit<CommandCenterData, "alerts">): CommandAlert[] {
  const today = getAlertReferenceDate();
  const overdueTasks = [
    ...data.sheets["Project Timeline"].filter((row) => new Date(String(row.dueDate)) < today && row.status !== "Complete"),
    ...data.sheets["Store Experience Checklist"].filter((row) => new Date(String(row.dueDate)) < today && row.status !== "Complete")
  ];

  const highPriorityNotStarted = [
    ...data.sheets["Project Timeline"].filter((row) => row.priority === "High" && row.status === "Not Started"),
    ...data.sheets["Store Experience Checklist"].filter((row) => row.priority === "High" && row.status === "Not Started")
  ];

  const lowSellThrough = data.sheets["Merch Tracker"].filter((row) => toNumber(row.sellThrough) < 0.8);
  const unpaidVendors = data.sheets["Budget Tracker"].filter((row) => !["Yes"].includes(String(row.paidStatus)));
  const missingContentLinks = data.sheets["Influencer Tracker"].filter(
    (row) => row.rsvpStatus === "Attending" && !normalizeCell(String(row.contentLink))
  );
  const kpiGaps = data.sheets["KPI Tracking"].filter((row) => !normalizeCell(String(row.actual)) || row.status === "Needs Attention");

  return [
    {
      id: "overdue-tasks",
      title: "Overdue Tasks",
      description: overdueTasks.length ? `${overdueTasks.length} work items are past due and still open.` : "No overdue tasks right now.",
      tone: overdueTasks.length ? "danger" : "success",
      count: overdueTasks.length
    },
    {
      id: "high-priority",
      title: "High-Priority Not Started",
      description: highPriorityNotStarted.length
        ? `${highPriorityNotStarted.length} high-priority items still have not started.`
        : "High-priority work is moving.",
      tone: highPriorityNotStarted.length ? "warning" : "success",
      count: highPriorityNotStarted.length
    },
    {
      id: "sell-through",
      title: "Low Sell-Through",
      description: lowSellThrough.length
        ? `${lowSellThrough.length} merch SKUs are under 80% sell-through.`
        : "Merch sell-through is healthy.",
      tone: lowSellThrough.length ? "warning" : "success",
      count: lowSellThrough.length
    },
    {
      id: "unpaid-vendors",
      title: "Unpaid Vendors",
      description: unpaidVendors.length ? `${unpaidVendors.length} vendor lines are still unpaid or pending.` : "All vendor lines are paid.",
      tone: unpaidVendors.length ? "danger" : "success",
      count: unpaidVendors.length
    },
    {
      id: "influencer-links",
      title: "Missing Content Links",
      description: missingContentLinks.length
        ? `${missingContentLinks.length} attending influencers still need content links added.`
        : "Attending influencer links are in place.",
      tone: missingContentLinks.length ? "info" : "success",
      count: missingContentLinks.length
    },
    {
      id: "kpi-gaps",
      title: "KPI Gaps",
      description: kpiGaps.length ? `${kpiGaps.length} KPI rows are missing actuals or need attention.` : "KPI tracking is current.",
      tone: kpiGaps.length ? "warning" : "success",
      count: kpiGaps.length
    }
  ];
}

export async function getCommandCenterData(): Promise<CommandCenterData> {
  const sheets = await getSheetsClient();
  const ranges = ["Dashboard!A1:H20", ...Object.values(sheetDefinitions).map((definition) => definition.range)];

  const response = await sheets.spreadsheets.values.batchGet({
    spreadsheetId,
    ranges,
    valueRenderOption: "FORMATTED_VALUE"
  });

  const [dashboardRange, ...gridRanges] = response.data.valueRanges ?? [];
  const dashboard = buildDashboardSummary(dashboardRange?.values as string[][] | undefined);

  const mappedSheets = Object.values(sheetDefinitions).reduce((accumulator, definition, index) => {
    accumulator[definition.name] = mapRows(definition, gridRanges[index]?.values as string[][] | undefined);
    return accumulator;
  }, {} as Record<SheetName, GridRow[]>);

  const dataWithoutAlerts = {
    dashboard,
    sheets: mappedSheets
  };

  return {
    ...dataWithoutAlerts,
    alerts: buildAlerts(dataWithoutAlerts)
  };
}

function getSheetDefinition(sheet: SheetName) {
  const definition = sheetDefinitions[sheet];

  if (!definition) {
    throw new Error(`Unsupported sheet: ${sheet}`);
  }

  return definition;
}

export async function updateSheetCell(payload: SheetUpdatePayload) {
  const definition = getSheetDefinition(payload.sheet);
  const column = definition.columns.find((item) => item.key === payload.columnKey);

  if (!column?.editable) {
    throw new Error(`Column ${payload.columnKey} is not editable in ${payload.sheet}.`);
  }

  const sheets = await getSheetsClient();
  const range = `${payload.sheet}!${column.column}${payload.rowNumber}`;

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[payload.value]]
    }
  });
}

export function coerceInputValue(value: string, type: SheetDefinition["columns"][number]["type"]) {
  if (type === "number" || type === "currency" || type === "percent") {
    const numeric = Number(value);
    return Number.isNaN(numeric) ? value : numeric;
  }

  return value;
}
