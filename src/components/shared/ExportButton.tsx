"use client";

import { Download } from "lucide-react";
import { useState } from "react";
import type { DataPoint, ExportFormat } from "@/types";
import { dataPointsToCSV } from "@/lib/transformers";
import { cn } from "@/lib/utils";

interface ExportButtonProps {
  data: DataPoint[];
  title: string;
  chartRef?: React.RefObject<HTMLDivElement>;
  className?: string;
}

export function ExportButton({ data, title, chartRef, className }: ExportButtonProps) {
  const [open, setOpen] = useState(false);

  async function handleExport(format: ExportFormat) {
    setOpen(false);

    if (format === "csv") {
      const csv = dataPointsToCSV(data, title);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${title.replace(/\s+/g, "_")}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    }

    if (format === "png" && chartRef?.current) {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(chartRef.current, { backgroundColor: "#fff" });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `${title.replace(/\s+/g, "_")}.png`;
      link.click();
    }
  }

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-xs font-medium text-dsfr-blue border border-dsfr-blue rounded px-3 py-1.5 hover:bg-dsfr-blue-light transition-colors"
      >
        <Download className="h-3.5 w-3.5" />
        Exporter
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-dsfr-grey-border rounded-md shadow-lg overflow-hidden w-36">
            <button
              className="w-full text-left px-4 py-2 text-sm hover:bg-dsfr-grey-light transition-colors"
              onClick={() => handleExport("csv")}
            >
              CSV (.csv)
            </button>
            <button
              className="w-full text-left px-4 py-2 text-sm hover:bg-dsfr-grey-light transition-colors disabled:opacity-40"
              onClick={() => handleExport("png")}
              disabled={!chartRef}
            >
              Image (.png)
            </button>
          </div>
        </>
      )}
    </div>
  );
}
