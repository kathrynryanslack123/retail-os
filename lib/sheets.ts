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

const privateKeyBegin = "-----BEGIN PRIVATE KEY-----";
const privateKeyEnd = "-----END PRIVATE KEY-----";

export class GoogleSheetsConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GoogleSheetsConfigurationError";
  }
}

function isPlaceholder(value: string) {
  return /^\[.+\]$/.test(value) || value.includes("YOUR_KEY_HERE") || value.includes("project-id");
}

function getSpreadsheetId() {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID?.trim();

  if (!spreadsheetId || isPlaceholder(spreadsheetId)) {
    throw new GoogleSheetsConfigurationError("Missing Google Sheets spreadsheet ID. Set GOOGLE_SHEETS_SPREADSHEET_ID.");
  }

  return spreadsheetId;
}

function isServiceAccountEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.iam\.gserviceaccount\.com$/.test(value);
}

function isPrivateKey(value: string) {
  return value.startsWith(privateKeyBegin) && value.endsWith(privateKeyEnd) && !isPlaceholder(value);
}

function isCredentialDecoderError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  return "code" in error && error.code === "ERR_OSSL_UNSUPPORTED";
}

function normalizeSheetsError(error: unknown): never {
  if (isCredentialDecoderError(error)) {
    throw new GoogleSheetsConfigurationError(
      "Invalid Google service account private key. Set GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY to the full PEM key with newline escapes."
    );
  }

  throw error;
}

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
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n").trim();

  if (!clientEmail || !privateKey) {
    throw new GoogleSheetsConfigurationError(
      "Missing Google Sheets credentials. Set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY."
    );
  }

  if (isPlaceholder(clientEmail) || !isServiceAccountEmail(clientEmail)) {
    throw new GoogleSheetsConfigurationError(
      "Invalid Google service account email. Set GOOGLE_SERVICE_ACCOUNT_EMAIL to the service account's iam.gserviceaccount.com address."
    );
  }

  if (!isPrivateKey(privateKey)) {
    throw new GoogleSheetsConfigurationError(
      "Invalid Google service account private key. Set GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY to the full PEM key with newline escapes."
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
  const spreadsheetId = getSpreadsheetId();
  const sheets = await getSheetsClient();
  const ranges = ["Dashboard!A1:H20", ...Object.values(sheetDefinitions).map((definition) => definition.range)];

  const response = await sheets.spreadsheets.values
    .batchGet({
      spreadsheetId,
      ranges,
      valueRenderOption: "FORMATTED_VALUE"
    })
    .catch(normalizeSheetsError);

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

  const spreadsheetId = getSpreadsheetId();
  const sheets = await getSheetsClient();
  const range = `${payload.sheet}!${column.column}${payload.rowNumber}`;

  await sheets.spreadsheets.values
    .update({
      spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[payload.value]]
      }
    })
    .catch(normalizeSheetsError);
}

export function coerceInputValue(value: string, type: SheetDefinition["columns"][number]["type"]) {
  if (type === "number" || type === "currency" || type === "percent") {
    const numeric = Number(value);
    return Number.isNaN(numeric) ? value : numeric;
  }

  return value;
}

export function parseSheetUpdatePayload(body: unknown): SheetUpdatePayload {
  if (!body || typeof body !== "object") {
    throw new Error("Request body must be an object.");
  }

  const payload = body as Record<string, unknown>;

  if (typeof payload.sheet !== "string" || !(payload.sheet in sheetDefinitions)) {
    throw new Error("Unsupported sheet.");
  }

  const sheet = payload.sheet as SheetName;

  if (typeof payload.rowNumber !== "number" || !Number.isInteger(payload.rowNumber) || payload.rowNumber < 1) {
    throw new Error("rowNumber must be a positive integer.");
  }

  if (typeof payload.columnKey !== "string") {
    throw new Error("columnKey must be a string.");
  }

  if (typeof payload.value !== "string" && typeof payload.value !== "number") {
    throw new Error("value must be a string or number.");
  }

  const column = sheetDefinitions[sheet].columns.find((item) => item.key === payload.columnKey);

  if (!column?.editable) {
    throw new Error("Column is not editable.");
  }

  return {
    sheet,
    rowNumber: payload.rowNumber,
    columnKey: payload.columnKey,
    value: typeof payload.value === "string" ? coerceInputValue(payload.value, column.type) : payload.value
  };
}
