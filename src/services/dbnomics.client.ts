/**
 * DBnomics API Client
 * Public API — no authentication required.
 * Docs: https://api.db.nomics.world/v22/apidocs
 *
 * Series ID format: {provider}/{dataset}/{series}
 * Example: "FR1/CNAF/RSA.M" or "Eurostat/une_rt_m/M.SA.TOTAL.PC_ACT.T.FR"
 */

import type { DBnomicsResponse, DBnomicsSeries, DataPoint } from "@/types";
import { transformDBnomicsSeries } from "@/lib/transformers";

const BASE_URL = "https://api.db.nomics.world/v22";

async function fetchSeries(seriesId: string): Promise<DBnomicsSeries> {
  const [provider, dataset, series] = seriesId.split("/");
  const url = `${BASE_URL}/series/${provider}/${dataset}/${series}?observations=1`;

  const res = await fetch(url, {
    next: { revalidate: Number(process.env.REVALIDATE_SECONDS ?? 3600) },
  });

  if (!res.ok) {
    throw new Error(
      `DBnomics fetch failed [${res.status}]: ${provider}/${dataset}/${series}`
    );
  }

  const json: DBnomicsResponse = await res.json();
  const doc = json.series?.docs?.[0];
  if (!doc) throw new Error(`No series data returned for ${seriesId}`);
  return doc;
}

export const DBnomicsClient = {
  /**
   * Fetch a single series and return normalized DataPoint[].
   */
  async getSeriesData(seriesId: string, label?: string): Promise<DataPoint[]> {
    const series = await fetchSeries(seriesId);
    return transformDBnomicsSeries(series, label);
  },

  /**
   * Convenience: French unemployment rate (Eurostat, monthly, seasonally adjusted).
   * Series: Eurostat/une_rt_m/M.SA.TOTAL.PC_ACT.T.FR
   */
  async getUnemploymentRate(): Promise<DataPoint[]> {
    return DBnomicsClient.getSeriesData(
      "Eurostat/une_rt_m/M.SA.TOTAL.PC_ACT.T.FR",
      "Taux de chômage (%)"
    );
  },

  /**
   * Convenience: French GDP growth rate (quarterly, Eurostat).
   * Series: Eurostat/namq_10_gdp/Q.CLV_PCH_PRE.SCA.B1GQ.FR
   */
  async getGDPGrowth(): Promise<DataPoint[]> {
    return DBnomicsClient.getSeriesData(
      "Eurostat/namq_10_gdp/Q.CLV_PCH_PRE.SCA.B1GQ.FR",
      "Croissance du PIB (%)"
    );
  },

  /**
   * Convenience: French inflation (HICP, monthly, Eurostat).
   * Series: Eurostat/prc_hicp_manr/M.RCH_A.CP00.FR
   */
  async getInflation(): Promise<DataPoint[]> {
    return DBnomicsClient.getSeriesData(
      "Eurostat/prc_hicp_manr/M.RCH_A.CP00.FR",
      "Inflation IPCH (%)"
    );
  },
};
