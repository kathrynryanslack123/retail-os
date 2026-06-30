export type SheetName =
  | "Project Timeline"
  | "Marketing Plan"
  | "Influencer Tracker"
  | "Merch Tracker"
  | "Run of Show"
  | "Store Experience Checklist"
  | "Budget Tracker"
  | "KPI Tracking";

export type DashboardSummary = {
  eventName: string;
  retailer: string;
  city: string;
  eventDate: string;
  storeLocation: string;
  projectLead: string;
  taskTotal: number;
  tasksComplete: number;
  roi: number;
  projectedRevenue: number;
  actualSales: number;
  budgetPlanned: number;
  budgetActual: number;
  averageSellThrough: number;
};

export type AlertTone = "danger" | "warning" | "info" | "success";

export type CommandAlert = {
  id: string;
  title: string;
  description: string;
  tone: AlertTone;
  count: number;
};

export type SheetColumnType = "text" | "number" | "currency" | "percent" | "select" | "textarea";

export type SheetColumn = {
  key: string;
  label: string;
  column: string;
  type: SheetColumnType;
  editable?: boolean;
  options?: string[];
};

export type GridRow = {
  id: string;
  rowNumber: number;
  [key: string]: string | number;
};

export type SheetDefinition = {
  name: SheetName;
  range: string;
  columns: SheetColumn[];
};

export type CommandCenterData = {
  dashboard: DashboardSummary;
  alerts: CommandAlert[];
  sheets: Record<SheetName, GridRow[]>;
};

export type SheetUpdatePayload = {
  sheet: SheetName;
  rowNumber: number;
  columnKey: string;
  value: string | number;
};
