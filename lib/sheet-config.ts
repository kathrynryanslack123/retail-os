import { SheetDefinition, SheetName } from "@/lib/types";

const statusOptions = ["Not Started", "In Progress", "Blocked", "Complete"];
const priorityOptions = ["High", "Medium", "Low"];
const inviteStatusOptions = ["To Invite", "Invited", "Confirmed", "Declined"];
const rsvpStatusOptions = ["Pending", "Attending", "Maybe", "Declined"];
const paymentOptions = ["Pending", "No", "Yes"];
const kpiStatusOptions = ["On Track", "Needs Attention"];

export const sheetDefinitions: Record<SheetName, SheetDefinition> = {
  "Project Timeline": {
    name: "Project Timeline",
    range: "Project Timeline!A3:J200",
    columns: [
      { key: "week", label: "Week", column: "A", type: "text" },
      { key: "task", label: "Task", column: "B", type: "text" },
      { key: "category", label: "Category", column: "C", type: "text" },
      { key: "owner", label: "Owner", column: "D", type: "text" },
      { key: "startDate", label: "Start Date", column: "E", type: "text" },
      { key: "dueDate", label: "Due Date", column: "F", type: "text" },
      { key: "status", label: "Status", column: "G", type: "select", editable: true, options: statusOptions },
      { key: "priority", label: "Priority", column: "H", type: "select", options: priorityOptions },
      { key: "dependencies", label: "Dependencies", column: "I", type: "text" },
      { key: "notes", label: "Notes", column: "J", type: "textarea", editable: true }
    ]
  },
  "Marketing Plan": {
    name: "Marketing Plan",
    range: "Marketing Plan!A3:K200",
    columns: [
      { key: "channel", label: "Channel", column: "A", type: "text" },
      { key: "campaignName", label: "Campaign", column: "B", type: "text" },
      { key: "contentType", label: "Content Type", column: "C", type: "text" },
      { key: "assetNeeded", label: "Asset Needed", column: "D", type: "text" },
      { key: "owner", label: "Owner", column: "E", type: "text" },
      { key: "draftDue", label: "Draft Due", column: "F", type: "text" },
      { key: "launchDate", label: "Launch Date", column: "G", type: "text" },
      { key: "status", label: "Status", column: "H", type: "select", editable: true, options: statusOptions },
      { key: "creativeLink", label: "Creative Link", column: "I", type: "text", editable: true },
      { key: "cta", label: "CTA", column: "J", type: "text" },
      { key: "notes", label: "Notes", column: "K", type: "textarea", editable: true }
    ]
  },
  "Influencer Tracker": {
    name: "Influencer Tracker",
    range: "Influencer Tracker!A3:K200",
    columns: [
      { key: "name", label: "Name", column: "A", type: "text" },
      { key: "handle", label: "Handle", column: "B", type: "text" },
      { key: "platform", label: "Platform", column: "C", type: "text" },
      { key: "followers", label: "Followers", column: "D", type: "number" },
      { key: "tier", label: "Tier", column: "E", type: "text" },
      { key: "inviteStatus", label: "Invite Status", column: "F", type: "select", editable: true, options: inviteStatusOptions },
      { key: "rsvpStatus", label: "RSVP Status", column: "G", type: "select", editable: true, options: rsvpStatusOptions },
      { key: "deliverables", label: "Deliverables", column: "H", type: "text" },
      { key: "compensation", label: "Compensation", column: "I", type: "text" },
      { key: "contentLink", label: "Content Link", column: "J", type: "text", editable: true },
      { key: "estimatedReach", label: "Est. Reach", column: "K", type: "number" }
    ]
  },
  "Merch Tracker": {
    name: "Merch Tracker",
    range: "Merch Tracker!A3:O200",
    columns: [
      { key: "productName", label: "Product Name", column: "A", type: "text" },
      { key: "category", label: "Category", column: "B", type: "text" },
      { key: "sku", label: "SKU", column: "C", type: "text" },
      { key: "vendor", label: "Vendor", column: "D", type: "text" },
      { key: "unitCost", label: "Unit Cost", column: "E", type: "currency" },
      { key: "retailPrice", label: "Retail Price", column: "F", type: "currency" },
      { key: "margin", label: "Margin %", column: "G", type: "percent" },
      { key: "qtyOrdered", label: "Qty Ordered", column: "H", type: "number" },
      { key: "unitsSold", label: "Units Sold", column: "J", type: "number", editable: true },
      { key: "sellThrough", label: "Sell-Through %", column: "K", type: "percent" },
      { key: "actualSales", label: "Actual Sales", column: "L", type: "currency" },
      { key: "projectedGrossSales", label: "Projected Gross Sales", column: "M", type: "currency" },
      { key: "inStock", label: "Instock", column: "N", type: "number", editable: true },
      { key: "location", label: "Location", column: "O", type: "text", editable: true }
    ]
  },
  "Run of Show": {
    name: "Run of Show",
    range: "Run of Show!A3:G200",
    columns: [
      { key: "time", label: "Time", column: "A", type: "text" },
      { key: "activity", label: "Activity", column: "B", type: "text" },
      { key: "zone", label: "Zone", column: "C", type: "text" },
      { key: "owner", label: "Owner", column: "D", type: "text" },
      { key: "duration", label: "Duration", column: "E", type: "number" },
      { key: "status", label: "Status", column: "F", type: "select", editable: true, options: statusOptions },
      { key: "notes", label: "Notes", column: "G", type: "textarea", editable: true }
    ]
  },
  "Store Experience Checklist": {
    name: "Store Experience Checklist",
    range: "Store Experience Checklist!A3:G200",
    columns: [
      { key: "area", label: "Area", column: "A", type: "text" },
      { key: "task", label: "Task", column: "B", type: "text" },
      { key: "owner", label: "Owner", column: "C", type: "text" },
      { key: "dueDate", label: "Due Date", column: "D", type: "text" },
      { key: "status", label: "Status", column: "E", type: "select", editable: true, options: statusOptions },
      { key: "priority", label: "Priority", column: "F", type: "select", options: priorityOptions },
      { key: "notes", label: "Notes", column: "G", type: "textarea", editable: true }
    ]
  },
  "Budget Tracker": {
    name: "Budget Tracker",
    range: "Budget Tracker!A3:H200",
    columns: [
      { key: "category", label: "Category", column: "A", type: "text" },
      { key: "item", label: "Item", column: "B", type: "text" },
      { key: "vendor", label: "Vendor", column: "C", type: "text" },
      { key: "budgetedCost", label: "Budgeted", column: "D", type: "currency" },
      { key: "actualCost", label: "Actual", column: "E", type: "currency", editable: true },
      { key: "variance", label: "Variance", column: "F", type: "currency" },
      { key: "paidStatus", label: "Paid Status", column: "G", type: "select", editable: true, options: paymentOptions },
      { key: "notes", label: "Notes", column: "H", type: "textarea", editable: true }
    ]
  },
  "KPI Tracking": {
    name: "KPI Tracking",
    range: "KPI Tracking!A3:F200",
    columns: [
      { key: "metric", label: "Metric", column: "A", type: "text" },
      { key: "target", label: "Target", column: "B", type: "text" },
      { key: "actual", label: "Actual", column: "C", type: "number", editable: true },
      { key: "variance", label: "Variance", column: "D", type: "text" },
      { key: "status", label: "Status", column: "E", type: "select", editable: true, options: kpiStatusOptions },
      { key: "notes", label: "Notes", column: "F", type: "textarea", editable: true }
    ]
  }
};
