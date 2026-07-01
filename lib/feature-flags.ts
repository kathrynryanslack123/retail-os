const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);

export function isRetailEventOsEnabled() {
  return TRUE_VALUES.has(process.env.RETAIL_EVENT_OS_ENABLED?.trim().toLowerCase() ?? "");
}

