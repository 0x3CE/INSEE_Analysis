/**
 * INSEE SNDI API Client
 * Requires an API key from https://api.insee.fr/catalogue/
 * Store as INSEE_API_KEY in .env.local
 *
 * Docs: https://api.insee.fr/catalogue/site/themes/wso2/subthemes/insee/pages/item-info.jag
 */

import type { DataPoint } from "@/types";

const BASE_URL = "https://api.insee.fr/series/BDM/V1";

function getHeaders(): HeadersInit {
  const key = process.env.INSEE_API_KEY;
  if (!key) {
    console.warn("[INSEE] INSEE_API_KEY is not set — requests may fail.");
  }
  return {
    Authorization: `Bearer ${key ?? ""}`,
    Accept: "application/json",
  };
}

interface INSEEObservation {
  DATE: string;
  OBS_VALUE: string;
  OBS_STATUS?: string;
}

interface INSEESeriesResponse {
  seriesKey: string;
  title: string;
  observations: INSEEObservation[];
}

export const INSEEClient = {
  /**
   * Fetch an INSEE BDM series by its series key.
   * @param seriesKey e.g. "001694056" (population France)
   * @param label Human-readable label for charts
   */
  async getSeries(seriesKey: string, label: string): Promise<DataPoint[]> {
    const url = `${BASE_URL}/data/SERIES_BDM/${seriesKey}?lastNObservations=60`;

    const res = await fetch(url, {
      headers: getHeaders(),
      next: { revalidate: Number(process.env.REVALIDATE_SECONDS ?? 3600) },
    });

    if (!res.ok) {
      throw new Error(`INSEE API error [${res.status}] for series ${seriesKey}`);
    }

    const json: { seriesList: INSEESeriesResponse[] } = await res.json();
    const series = json.seriesList?.[0];
    if (!series) throw new Error(`No data for INSEE series ${seriesKey}`);

    return series.observations
      .filter((obs) => obs.OBS_VALUE !== "" && obs.OBS_STATUS !== "M")
      .map((obs) => ({
        date: obs.DATE,
        value: parseFloat(obs.OBS_VALUE),
        label,
      }));
  },

  /**
   * Convenience: French population estimate (annual).
   * INSEE series 001694056
   */
  async getPopulation(): Promise<DataPoint[]> {
    return INSEEClient.getSeries("001694056", "Population (milliers)");
  },

  /**
   * Convenience: Employment rate (15-64 years, quarterly).
   * INSEE series 001688526
   */
  async getEmploymentRate(): Promise<DataPoint[]> {
    return INSEEClient.getSeries("001688526", "Taux d'emploi 15-64 ans (%)");
  },
};
