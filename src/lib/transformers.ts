import type { DataPoint, DBnomicsSeries } from "@/types";

/**
 * Transforms a DBnomics series into the unified DataPoint[] format.
 * Null values from the API are filtered out.
 */
export function transformDBnomicsSeries(
  series: DBnomicsSeries,
  label?: string
): DataPoint[] {
  return series.period
    .map((period, i) => ({
      date: period,
      value: series.value[i] as number,
      label: label ?? series.series_name,
    }))
    .filter((dp): dp is DataPoint => dp.value !== null && !isNaN(dp.value));
}

/**
 * Merges multiple DataPoint arrays into one array keyed by date.
 * Useful for multi-series Recharts data: [{ date, SeriesA, SeriesB }]
 */
export function mergeSeriesForRecharts(
  seriesMap: Record<string, DataPoint[]>
): Record<string, string | number>[] {
  const byDate: Record<string, Record<string, string | number>> = {};

  for (const [key, points] of Object.entries(seriesMap)) {
    for (const point of points) {
      if (!byDate[point.date]) byDate[point.date] = { date: point.date };
      byDate[point.date][key] = point.value;
    }
  }

  return Object.values(byDate).sort((a, b) =>
    String(a.date).localeCompare(String(b.date))
  );
}

/**
 * Converts a flat DataPoint[] to a CSV string.
 */
export function dataPointsToCSV(data: DataPoint[], title: string): string {
  const header = "date,value,label";
  const rows = data.map((d) => `${d.date},${d.value},"${d.label}"`);
  return [
    `# ${title}`,
    `# Exporté depuis Observatoire National — ${new Date().toLocaleDateString("fr-FR")}`,
    header,
    ...rows,
  ].join("\n");
}

/**
 * Computes the percentage change between the last two data points.
 * Returns null if fewer than 2 points exist.
 */
export function computeTrend(data: DataPoint[]): number | null {
  if (data.length < 2) return null;
  const prev = data[data.length - 2].value;
  const curr = data[data.length - 1].value;
  if (prev === 0) return null;
  return ((curr - prev) / Math.abs(prev)) * 100;
}
