/**
 * data.gouv.fr API Client
 * Most endpoints are public. An API key adds higher rate limits.
 * Docs: https://www.data.gouv.fr/api/1/
 */

import type { DataGouvDataset, DataGouvResource, DataPoint } from "@/types";

const BASE_URL = "https://www.data.gouv.fr/api/1";

function getHeaders(): HeadersInit {
  const key = process.env.DATAGOUV_API_KEY;
  return key ? { "X-API-KEY": key } : {};
}

export const DataGouvClient = {
  /**
   * Search for datasets by keyword.
   */
  async searchDatasets(query: string, pageSize = 10): Promise<DataGouvDataset[]> {
    const url = `${BASE_URL}/datasets/?q=${encodeURIComponent(query)}&page_size=${pageSize}`;
    const res = await fetch(url, {
      headers: getHeaders(),
      next: { revalidate: Number(process.env.REVALIDATE_SECONDS ?? 3600) },
    });
    if (!res.ok) throw new Error(`data.gouv.fr search failed [${res.status}]`);
    const json = await res.json();
    return json.data as DataGouvDataset[];
  },

  /**
   * Get a specific dataset by its slug or ID.
   */
  async getDataset(idOrSlug: string): Promise<DataGouvDataset> {
    const url = `${BASE_URL}/datasets/${idOrSlug}/`;
    const res = await fetch(url, {
      headers: getHeaders(),
      next: { revalidate: Number(process.env.REVALIDATE_SECONDS ?? 3600) },
    });
    if (!res.ok) throw new Error(`data.gouv.fr dataset [${idOrSlug}] failed [${res.status}]`);
    return res.json() as Promise<DataGouvDataset>;
  },

  /**
   * Fetch a CSV resource and parse it into DataPoint[].
   * The CSV must have columns matching dateColumn and valueColumn names.
   */
  async getCSVResource(
    resource: DataGouvResource,
    dateColumn: string,
    valueColumn: string,
    label: string
  ): Promise<DataPoint[]> {
    // Dynamic import to keep papaparse out of the server bundle when unused
    const Papa = (await import("papaparse")).default;

    const res = await fetch(resource.url, {
      next: { revalidate: Number(process.env.REVALIDATE_SECONDS ?? 3600) },
    });
    if (!res.ok) throw new Error(`Failed to fetch CSV resource ${resource.url}`);
    const text = await res.text();

    const result = Papa.parse<Record<string, string>>(text, {
      header: true,
      skipEmptyLines: true,
    });

    return result.data
      .map((row) => ({
        date: row[dateColumn] ?? "",
        value: parseFloat(row[valueColumn] ?? ""),
        label,
      }))
      .filter((dp) => dp.date !== "" && !isNaN(dp.value));
  },
};
