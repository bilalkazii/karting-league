export interface CsvColumn {
  key: string;
  label: string;
}

const CSV_INJECTION_START = /^[=+\-@\t\r]/;

export function csvEscapeCell(value: unknown): string {
  const text = value === null || value === undefined ? "" : String(value);
  return CSV_INJECTION_START.test(text) ? `'${text}` : text;
}

export function csvCell(value: unknown): string {
  const text = csvEscapeCell(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function buildCsv(columns: CsvColumn[], rows: Record<string, unknown>[]): string {
  const header = columns.map((c) => csvCell(c.label)).join(",");
  const lines = rows.map((row) => columns.map((c) => csvCell(row[c.key])).join(","));
  return [header, ...lines].join("\n");
}