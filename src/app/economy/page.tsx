/**
 * Economy Dashboard — Server Component
 *
 * Sources de données :
 *  ┌─ DBnomics / Eurostat (toujours disponible, pas d'auth) ────────────────┐
 *  │  • Chômage mensuel SA       Eurostat/une_rt_m                          │
 *  │  • Croissance PIB trimestr. Eurostat/namq_10_gdp                       │
 *  │  • Inflation IPCH mensuelle Eurostat/prc_hicp_manr                     │
 *  └────────────────────────────────────────────────────────────────────────┘
 *  ┌─ INSEE BDM (OAuth2 — avec fallback statique si indisponible) ──────────┐
 *  │  • IPC Ensemble YoY %    série 001759970                               │
 *  │  • IPC Énergie YoY %     série 001763118                               │
 *  │  • Chômage BIT trimestr. série 001688527                               │
 *  │  • Créations entreprises série 010613256                               │
 *  │  • PIB variation trimestr série 010565692                              │
 *  └────────────────────────────────────────────────────────────────────────┘
 *
 * Caching : Next.js Data Cache via fetch({ next: { revalidate: N } }).
 * Les données INSEE sont rechargées toutes les REVALIDATE_SECONDS (défaut 1h).
 */

import { Suspense } from "react";
import { DBnomicsClient } from "@/services/dbnomics.client";
import { INSEEClient, INSEEApiError } from "@/services/insee.client";
import {
  FALLBACK_IPC_ENSEMBLE,
  FALLBACK_IPC_ENERGIE,
  FALLBACK_CHOMAGE_BIT,
  FALLBACK_CREATIONS_ENTREPRISES,
  FALLBACK_PIB_VARIATION,
} from "@/lib/inseeStaticFallback";
import { computeTrend } from "@/lib/transformers";
import { REVALIDATE } from "@/lib/utils";
import { StatCard } from "@/components/shared/StatCard";
import { EconomyCharts } from "./EconomyCharts";
import type { DataPoint } from "@/types";

export const revalidate = REVALIDATE;

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function safeINSEE<T>(
  fn: () => Promise<T>,
  fallback: T
): Promise<{ data: T; isLive: boolean }> {
  try {
    const data = await fn();
    return { data, isLive: true };
  } catch (err) {
    if (err instanceof INSEEApiError) {
      console.warn(`[INSEE] ${err.message} — using static fallback`);
    } else {
      console.error("[INSEE] Unexpected error:", err);
    }
    return { data: fallback, isLive: false };
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function EconomyPage() {
  // All fetches run in parallel — INSEE failures are caught individually
  const [
    unemployment,
    gdpDBnomics,
    inflationDBnomics,
    ipcEnsembleResult,
    ipcEnergieResult,
    chomageInseeResult,
    creationsResult,
    pibInseeResult,
  ] = await Promise.all([
    DBnomicsClient.getUnemploymentRate(),
    DBnomicsClient.getGDPGrowth(),
    DBnomicsClient.getInflation(),
    safeINSEE<DataPoint[]>(() => INSEEClient.getInflationIPC(),        FALLBACK_IPC_ENSEMBLE),
    safeINSEE<DataPoint[]>(() => INSEEClient.getInflationEnergy(),     FALLBACK_IPC_ENERGIE),
    safeINSEE<DataPoint[]>(() => INSEEClient.getUnemploymentBIT(),     FALLBACK_CHOMAGE_BIT),
    safeINSEE<DataPoint[]>(() => INSEEClient.getBusinessCreations(),   FALLBACK_CREATIONS_ENTREPRISES),
    safeINSEE<DataPoint[]>(() => INSEEClient.getGDPGrowth(),           FALLBACK_PIB_VARIATION),
  ]);

  // At least one INSEE series is live → show "live" badge
  const inseeIsLive =
    ipcEnsembleResult.isLive ||
    ipcEnergieResult.isLive  ||
    chomageInseeResult.isLive;

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Économie</h1>
          <p className="text-sm text-gray-500 mt-1">
            Indicateurs macroéconomiques — INSEE BDM · Eurostat via DBnomics
          </p>
        </div>
        {!inseeIsLive && (
          <div
            role="alert"
            className="flex items-center gap-2 text-xs bg-amber-50 border border-amber-200 text-amber-700 px-3 py-2 rounded-lg"
          >
            <span className="font-semibold">⚠ INSEE indisponible</span>
            <span>— données de référence affichées</span>
          </div>
        )}
      </div>

      {/* KPI cards — 6 indicateurs */}
      <section aria-labelledby="kpi-heading">
        <h2
          id="kpi-heading"
          className="text-sm font-semibold text-dsfr-grey uppercase tracking-wide mb-3"
        >
          Derniers chiffres
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard
            title="Chômage BIT"
            value={chomageInseeResult.data.at(-1)?.value ?? null}
            unit="%"
            trend={computeTrend(chomageInseeResult.data)}
            description={chomageInseeResult.data.at(-1)?.date ?? "—"}
          />
          <StatCard
            title="Croissance PIB"
            value={pibInseeResult.data.at(-1)?.value ?? null}
            unit="%"
            trend={computeTrend(pibInseeResult.data)}
            description={pibInseeResult.data.at(-1)?.date ?? "—"}
          />
          <StatCard
            title="IPC Ensemble"
            value={ipcEnsembleResult.data.at(-1)?.value ?? null}
            unit="%"
            trend={computeTrend(ipcEnsembleResult.data)}
            description={ipcEnsembleResult.data.at(-1)?.date ?? "—"}
          />
          <StatCard
            title="IPC Énergie"
            value={ipcEnergieResult.data.at(-1)?.value ?? null}
            unit="%"
            trend={computeTrend(ipcEnergieResult.data)}
            description={ipcEnergieResult.data.at(-1)?.date ?? "—"}
          />
          <StatCard
            title="Inflation IPCH"
            value={inflationDBnomics.at(-1)?.value ?? null}
            unit="%"
            trend={computeTrend(inflationDBnomics)}
            description={inflationDBnomics.at(-1)?.date ?? "—"}
          />
          <StatCard
            title="Créations entreprises"
            value={creationsResult.data.at(-1)?.value ?? null}
            unit=""
            trend={computeTrend(creationsResult.data)}
            description={creationsResult.data.at(-1)?.date ?? "—"}
          />
        </div>
      </section>

      {/* Interactive charts */}
      <Suspense fallback={<ChartsSkeleton />}>
        <EconomyCharts
          // DBnomics
          unemploymentEurostat={unemployment}
          gdpDBnomics={gdpDBnomics}
          inflationIPCH={inflationDBnomics}
          // INSEE (live or fallback)
          ipcEnsemble={ipcEnsembleResult.data}
          ipcEnergie={ipcEnergieResult.data}
          chomageINSEE={chomageInseeResult.data}
          creationsEntreprises={creationsResult.data}
          pibINSEE={pibInseeResult.data}
          inseeIsLive={inseeIsLive}
        />
      </Suspense>
    </div>
  );
}

function ChartsSkeleton() {
  return (
    <div className="space-y-6">
      {[320, 260, 320, 260].map((h, i) => (
        <div key={i} className="bg-white rounded-lg border border-dsfr-grey-border p-5">
          <div className="skeleton h-4 w-48 mb-4" />
          <div className={`skeleton w-full`} style={{ height: h }} />
        </div>
      ))}
    </div>
  );
}
