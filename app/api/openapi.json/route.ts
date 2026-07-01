import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const sheetNames = [
  "Project Timeline",
  "Marketing Plan",
  "Influencer Tracker",
  "Merch Tracker",
  "Run of Show",
  "Store Experience Checklist",
  "Budget Tracker",
  "KPI Tracking"
] as const;

const columnKeys = [
  "status",
  "notes",
  "creativeLink",
  "inviteStatus",
  "rsvpStatus",
  "contentLink",
  "unitsSold",
  "inStock",
  "location",
  "actualCost",
  "paidStatus",
  "actual"
] as const;

export async function GET(request: NextRequest) {
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const forwardedHost = request.headers.get("x-forwarded-host");
  const inferredBaseUrl =
    forwardedProto && forwardedHost ? `${forwardedProto}://${forwardedHost}` : request.nextUrl.origin;

  const baseUrl = process.env.APP_BASE_URL || inferredBaseUrl;

  return NextResponse.json({
    openapi: "3.1.0",
    info: {
      title: "Retail Event OS API",
      version: "1.0.0",
      description: "Read and update the Retail Event OS Google Sheet command center."
    },
    servers: [
      {
        url: baseUrl
      }
    ],
    paths: {
      "/api/actions/command-center": {
        get: {
          operationId: "getCommandCenter",
          summary: "Get the live Retail Event OS command center data",
          responses: {
            "200": {
              description: "Live dashboard data and sheet rows",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/CommandCenterData"
                  }
                }
              }
            }
          }
        }
      },
      "/api/actions/update-cell": {
        post: {
          operationId: "updateCommandCenterCell",
          summary: "Update one editable cell and write it back to Google Sheets",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/UpdateCellRequest"
                }
              }
            }
          },
          responses: {
            "200": {
              description: "Update accepted",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      ok: { type: "boolean" },
                      sheet: { type: "string" },
                      rowNumber: { type: "integer" },
                      columnKey: { type: "string" },
                      value: {
                        oneOf: [{ type: "string" }, { type: "number" }]
                      }
                    },
                    required: ["ok", "sheet", "rowNumber", "columnKey", "value"]
                  }
                }
              }
            }
          }
        }
      }
    },
    components: {
      schemas: {
        DashboardSummary: {
          type: "object",
          properties: {
            eventName: { type: "string" },
            retailer: { type: "string" },
            city: { type: "string" },
            eventDate: { type: "string" },
            storeLocation: { type: "string" },
            projectLead: { type: "string" },
            taskTotal: { type: "number" },
            tasksComplete: { type: "number" },
            roi: { type: "number" },
            projectedRevenue: { type: "number" },
            actualSales: { type: "number" },
            budgetPlanned: { type: "number" },
            budgetActual: { type: "number" },
            averageSellThrough: { type: "number" }
          },
          required: [
            "eventName",
            "retailer",
            "city",
            "eventDate",
            "storeLocation",
            "projectLead",
            "taskTotal",
            "tasksComplete",
            "roi",
            "projectedRevenue",
            "actualSales",
            "budgetPlanned",
            "budgetActual",
            "averageSellThrough"
          ]
        },
        CommandAlert: {
          type: "object",
          properties: {
            id: { type: "string" },
            title: { type: "string" },
            description: { type: "string" },
            tone: { type: "string", enum: ["danger", "warning", "info", "success"] },
            count: { type: "number" }
          },
          required: ["id", "title", "description", "tone", "count"]
        },
        GridRow: {
          type: "object",
          additionalProperties: {
            oneOf: [{ type: "string" }, { type: "number" }]
          },
          properties: {
            id: { type: "string" },
            rowNumber: { type: "integer" }
          },
          required: ["id", "rowNumber"]
        },
        CommandCenterData: {
          type: "object",
          properties: {
            dashboard: { $ref: "#/components/schemas/DashboardSummary" },
            alerts: {
              type: "array",
              items: { $ref: "#/components/schemas/CommandAlert" }
            },
            sheets: {
              type: "object",
              properties: Object.fromEntries(
                sheetNames.map((sheetName) => [
                  sheetName,
                  {
                    type: "array",
                    items: { $ref: "#/components/schemas/GridRow" }
                  }
                ])
              ),
              required: [...sheetNames]
            }
          },
          required: ["dashboard", "alerts", "sheets"]
        },
        UpdateCellRequest: {
          type: "object",
          properties: {
            sheet: {
              type: "string",
              enum: [...sheetNames]
            },
            rowNumber: {
              type: "integer",
              description: "The actual Google Sheets row number, for example 4 or 12."
            },
            columnKey: {
              type: "string",
              description:
                "Editable field key. For Merch Tracker, use unitsSold for column J, inStock for column N, and location for column O.",
              enum: [...columnKeys]
            },
            value: {
              oneOf: [{ type: "string" }, { type: "number" }]
            }
          },
          required: ["sheet", "rowNumber", "columnKey", "value"]
        }
      }
    }
  });
}
