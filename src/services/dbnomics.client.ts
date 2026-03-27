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

  /**
   * Convenience: French gross fixed capital formation — FBCF (quarterly, current prices).
   * Series: Eurostat/namq_10_gdp/Q.CP_MNAC.SCA.P51G.FR
   */
  async getCapitalFormation(): Promise<DataPoint[]> {
    return DBnomicsClient.getSeriesData(
      "Eurostat/namq_10_gdp/Q.CP_MNAC.SCA.P51G.FR",
      "FBCF (M€ courants)"
    );
  },

  // ─── Health series ────────────────────────────────────────────────────────

  /**
   * Life expectancy at birth — France (annual).
   * sex: "T" (total) | "F" (females) | "M" (males)
   * Series: Eurostat/demo_mlexpec/A.YR.{sex}.Y_LT1.FR
   */
  async getLifeExpectancy(sex: "T" | "F" | "M" = "T"): Promise<DataPoint[]> {
    const labels = { T: "Espérance de vie (ans)", F: "Femmes (ans)", M: "Hommes (ans)" };
    return DBnomicsClient.getSeriesData(
      `Eurostat/demo_mlexpec/A.YR.${sex}.Y_LT1.FR`,
      labels[sex]
    );
  },

  /**
   * Public health expenditure per inhabitant (EUR/hab, annual).
   * Series: Eurostat/hlth_sha11_hf/A.EUR_HAB.HF1.FR
   */
  async getHealthExpenditurePerCapita(): Promise<DataPoint[]> {
    return DBnomicsClient.getSeriesData(
      "Eurostat/hlth_sha11_hf/A.EUR_HAB.HF1.FR",
      "Dépenses publiques santé (€/hab)"
    );
  },

  /**
   * Public health expenditure as % of GDP (annual).
   * Series: Eurostat/hlth_sha11_hf/A.PC_GDP.HF1.FR
   */
  async getHealthExpenditureGDP(): Promise<DataPoint[]> {
    return DBnomicsClient.getSeriesData(
      "Eurostat/hlth_sha11_hf/A.PC_GDP.HF1.FR",
      "Dépenses publiques santé (% PIB)"
    );
  },

  /**
   * Standardised death rate, all causes — France (annual).
   * sex: "T" | "F" | "M"
   * Series: Eurostat/hlth_cd_acdr2/A.RT.{sex}.TOTAL.A-R_V-Y.FR
   */
  async getStandardizedMortality(sex: "T" | "F" | "M" = "T"): Promise<DataPoint[]> {
    const labels = {
      T: "Mortalité standardisée (pour 100k)",
      F: "Mortalité — Femmes",
      M: "Mortalité — Hommes",
    };
    return DBnomicsClient.getSeriesData(
      `Eurostat/hlth_cd_acdr2/A.RT.${sex}.TOTAL.A-R_V-Y.FR`,
      labels[sex]
    );
  },

  /**
   * Total number of practising physicians — France (annual).
   * Series: Eurostat/hlth_rs_phys/A.NR.TOTAL.T.FR
   */
  async getDoctorCount(): Promise<DataPoint[]> {
    return DBnomicsClient.getSeriesData(
      "Eurostat/hlth_rs_phys/A.NR.TOTAL.T.FR",
      "Médecins (effectif total)"
    );
  },

  /**
   * Convenience: French GFCF annual growth rate (%, vs previous year).
   * Series: Eurostat/nama_10_gdp/A.CLV_PCH_PRE.P51G.FR
   */
  async getInvestmentRate(): Promise<DataPoint[]> {
    return DBnomicsClient.getSeriesData(
      "Eurostat/nama_10_gdp/A.CLV_PCH_PRE.P51G.FR",
      "Variation FBCF (% vs an préc.)"
    );
  },

  // ─── Social series ─────────────────────────────────────────────────────────

  /**
   * At-risk-of-poverty rate — France (annual, 40% mean income threshold).
   * sex: "T" (total) | "F" (females) | "M" (males)
   * Series: Eurostat/ilc_li02/A.PC.LI_R_M40.{sex}.TOTAL.FR
   */
  async getPovertyRate(sex: "T" | "F" | "M" = "T"): Promise<DataPoint[]> {
    const labels = { T: "Taux de pauvreté (%)", F: "Femmes (%)", M: "Hommes (%)" };
    return DBnomicsClient.getSeriesData(
      `Eurostat/ilc_li02/A.PC.LI_R_M40.${sex}.TOTAL.FR`,
      labels[sex]
    );
  },

  /**
   * Gini coefficient of equivalised disposable income — France (annual).
   * Series: Eurostat/ilc_di12/A.TOTAL.GINI_HND.FR
   */
  async getGiniCoefficient(): Promise<DataPoint[]> {
    return DBnomicsClient.getSeriesData(
      "Eurostat/ilc_di12/A.TOTAL.GINI_HND.FR",
      "Coefficient de Gini"
    );
  },

  /**
   * People at risk of poverty or social exclusion — France (annual, %).
   * Series: Eurostat/ilc_peps01/A.PC.TOTAL.T.FR
   */
  async getPovertyOrExclusion(): Promise<DataPoint[]> {
    return DBnomicsClient.getSeriesData(
      "Eurostat/ilc_peps01/A.PC.TOTAL.T.FR",
      "Risque pauvreté ou exclusion (%)"
    );
  },
};
