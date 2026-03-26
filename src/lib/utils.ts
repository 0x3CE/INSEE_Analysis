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
