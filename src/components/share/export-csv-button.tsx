"use client";

import { useRef, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildCsv, type CsvColumn } from "@/lib/csv";

export type { CsvColumn };

export interface ExportCsvButtonProps {
  filename: string;
  columns: CsvColumn[];
  rows: Record<string, unknown>[];
  label?: string;
}

export function ExportCsvButton({ filename, columns, rows, label = "Export CSV" }: ExportCsvButtonProps) {
  const [state, setState] = useState<"idle" | "done" | "error">("idle");
  const anchorRef = useRef<HTMLAnchorElement | null>(null);

  const handleExport = () => {
    try {
      const csv = buildCsv(columns, rows);
      const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const anchor = anchorRef.current ?? document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
      setState("done");
      window.setTimeout(() => setState("idle"), 2200);
    } catch {
      setState("error");
    }
  };

  return (
    <>
      <Button type="button" variant="secondary" size="sm" onClick={handleExport} disabled={rows.length === 0} className="min-h-8">
        <Download size={13} />{label}{(state === "done" ? " — saved locally" : "") || (state === "error" ? " — export failed" : "")}
      </Button>
      <a ref={anchorRef} className="hidden" aria-hidden="true" tabIndex={-1} />
    </>
  );
}