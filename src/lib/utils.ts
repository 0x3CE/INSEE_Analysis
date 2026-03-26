import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a numeric value with French locale (e.g. 1 234,5 %) */
export function formatValue(value: number, unit: string): string {
  const formatted = new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 2,
  }).format(value);
  return unit ? `${formatted} ${unit}` : formatted;
}

/**
 * Parse any DBnomics period string into a Date.
 * Handles: "YYYY-QX", "YYYY-MM", "YYYY"
 */
export function parsePeriod(period: string): Date {
  const q = period.match(/^(\d{4})-Q(\d)$/);
  if (q) {
    const month = (parseInt(q[2]) - 1) * 3 + 1;
    return new Date(`${q[1]}-${String(month).padStart(2, "0")}-01`);
  }
  if (/^\d{4}-\d{2}$/.test(period)) return new Date(`${period}-01`);
  if (/^\d{4}$/.test(period)) return new Date(`${period}-01-01`);
  return new Date(period);
}

/** Normalize a period string to a short display label */
export function periodLabel(period: string): string {
  // "2023-Q1" → "T1 2023"
  const quarterMatch = period.match(/^(\d{4})-Q(\d)$/);
  if (quarterMatch) return `T${quarterMatch[2]} ${quarterMatch[1]}`;
  // "2023-01" → "Jan. 2023"
  const monthMatch = period.match(/^(\d{4})-(\d{2})$/);
  if (monthMatch) {
    const d = new Date(`${monthMatch[1]}-${monthMatch[2]}-01`);
    return d.toLocaleDateString("fr-FR", { month: "short", year: "numeric" });
  }
  return period;
}

export const REVALIDATE = Number(process.env.REVALIDATE_SECONDS ?? 3600);
