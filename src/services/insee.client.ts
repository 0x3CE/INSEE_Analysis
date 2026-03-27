/**
 * INSEE BDM API Client — SDMX-JSON v1.0
 *
 * Auth   : OAuth2 client_credentials (INSEE_CONSUMER_KEY + INSEE_CONSUMER_SECRET)
 * Docs   : https://api.insee.fr/catalogue/
 * Format : SDMX-JSON 1.0 — https://sdmx.org/?page_id=4500
 *
 * If credentials are missing or the API returns 4xx/5xx, the client throws
 * INSEEApiError so callers can catch and fall back to static data.
 */

import type { DataPoint } from "@/types";

// ─── Constants ────────────────────────────────────────────────────────────────
const TOKEN_URL = "https://api.insee.fr/token";
const BASE_URL  = "https://api.insee.fr/series/BDM/V1";

// ─── OAuth2 Token cache (module-level, survives across ISR cycles) ────────────
let _tokenCache: { value: string; expiresAt: number } | null = null;

export class INSEEApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = "INSEEApiError";
  }
}

async function fetchToken(): Promise<string> {
  const key    = process.env.INSEE_CONSUMER_KEY;
  const secret = process.env.INSEE_CONSUMER_SECRET;

  if (!key || !secret) {
    throw new INSEEApiError(
      0,
      "INSEE credentials missing — set INSEE_CONSUMER_KEY and INSEE_CONSUMER_SECRET in .env.local"
    );
  }

  // Return cached token if still valid (leaving a 60s margin)
  if (_tokenCache && Date.now() < _tokenCache.expiresAt - 60_000) {
    return _tokenCache.value;
  }

  const credentials = Buffer.from(`${key}:${secret}`).toString("base64");

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new INSEEApiError(
      res.status,
      `INSEE token request failed [${res.status}]: ${await res.text()}`
    );
  }

  const json = (await res.json()) as {
    access_token: string;
    expires_in: number;
  };

  _tokenCache = {
    value: json.access_token,
    expiresAt: Date.now() + json.expires_in * 1_000,
  };

  return _tokenCache.value;
}

// ─── SDMX-JSON types ──────────────────────────────────────────────────────────
interface SDMXPeriodValue { id: string; name?: string }
interface SDMXDimension   { id: string; values: SDMXPeriodValue[] }
interface SDMXDataSet {
  series: Record<string, {
    observations: Record<string, (number | null)[]>;
  }>;
}
interface SDMXResponse {
  dataSets: SDMXDataSet[];
  structure: {
    dimensions: {
      series?: SDMXDimension[];
      observation: SDMXDimension[];
    };
  };
}

// ─── SDMX-JSON parser ─────────────────────────────────────────────────────────
function parseSDMX(json: SDMXResponse, label: string): DataPoint[] {
  const timeDim = json.structure.dimensions.observation.find(
    (d) => d.id === "TIME_PERIOD"
  );
  if (!timeDim) throw new Error("SDMX: TIME_PERIOD dimension not found");

  const dataSet = json.dataSets[0];
  if (!dataSet) throw new Error("SDMX: no dataSets");

  // For a single-series BDM request the first key is always the relevant series
  const rawSeries = Object.values(dataSet.series)[0];
  if (!rawSeries) throw new Error("SDMX: no series data");

  return Object.entries(rawSeries.observations)
    .map(([idx, obsArr]) => {
      const period = timeDim.values[Number(idx)];
      const val    = obsArr[0];
      if (!period || val === null || val === undefined) return null;
      const num = Number(val);
      if (isNaN(num)) return null;
      return { date: period.id, value: num, label } as DataPoint;
    })
    .filter((d): d is DataPoint => d !== null)
    .sort((a, b) => a.date.localeCompare(b.date));
}

// ─── Core fetch ───────────────────────────────────────────────────────────────
async function fetchSeries(seriesKey: string, label: string): Promise<DataPoint[]> {
  const token = await fetchToken();
  const url   = `${BASE_URL}/data/SERIES_BDM/${seriesKey}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    next: { revalidate: Number(process.env.REVALIDATE_SECONDS ?? 3600) },
  });

  if (!res.ok) {
    throw new INSEEApiError(
      res.status,
      `INSEE series ${seriesKey} failed [${res.status}]`
    );
  }

  return parseSDMX(await res.json(), label);
}

// ─── Year-on-year variation from a raw index series ───────────────────────────
// Monthly (shift=12) or quarterly (shift=4).
function computeYoY(data: DataPoint[], shift: number, label: string): DataPoint[] {
  return data
    .slice(shift)
    .map((d, i) => {
      const base = data[i].value;
      if (base === 0) return null;
      return { ...d, value: ((d.value / base) - 1) * 100, label };
    })
    .filter((d): d is DataPoint => d !== null);
}

// ─── Public client ────────────────────────────────────────────────────────────
export const INSEEClient = {
  /**
   * IPC — Indice d'ensemble (001759970) → glissement annuel %.
   * Mensuel ; le YoY est calculé sur 12 mois.
   */
  async getInflationIPC(): Promise<DataPoint[]> {
    const raw = await fetchSeries("001759970", "IPC Ensemble (indice)");
    return computeYoY(raw, 12, "IPC Ensemble (%)");
  },

  /**
   * IPC — Énergie (001763118) → glissement annuel %.
   * Mensuel.
   */
  async getInflationEnergy(): Promise<DataPoint[]> {
    const raw = await fetchSeries("001763118", "IPC Énergie (indice)");
    return computeYoY(raw, 12, "IPC Énergie (%)");
  },

  /**
   * Taux de chômage BIT — France entière (001688527), en %.
   * Trimestriel.
   */
  async getUnemploymentBIT(): Promise<DataPoint[]> {
    return fetchSeries("001688527", "Chômage BIT France (%)");
  },

  /**
   * Créations totales d'entreprises (010613256).
   * Mensuel, en unités.
   */
  async getBusinessCreations(): Promise<DataPoint[]> {
    return fetchSeries("010613256", "Créations d'entreprises");
  },

  /**
   * PIB en volume — variation trimestrielle % (010565692).
   */
  async getGDPGrowth(): Promise<DataPoint[]> {
    return fetchSeries("010565692", "PIB variation trimestrielle (%)");
  },
};
