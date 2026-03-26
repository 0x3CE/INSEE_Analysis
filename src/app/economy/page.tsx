/**
 * Economy Dashboard — Server Component
 *
 * Fetches three DBnomics series at build/ISR time:
 *  • Unemployment rate  (Eurostat monthly, SA)
 *  • GDP growth         (Eurostat quarterly)
 *  • Inflation          (Eurostat HICP monthly)
 *
 * Data is passed to Client Components for interactivity.
 */

import { Suspense } from "react";
import { DBnomicsClient } from "@/services/dbnomics.client";
import { computeTrend } from "@/lib/transformers";
import { REVALIDATE } from "@/lib/utils";
import { StatCard } from "@/components/shared/StatCard";
import { EconomyCharts } from "./EconomyCharts";

export const revalidate = REVALIDATE;

export default async function EconomyPage() {
  // Parallel fetch all three series
  const [unemployment, gdp, inflation] = await Promise.all([
    DBnomicsClient.getUnemploymentRate(),
    DBnomicsClient.getGDPGrowth(),
    DBnomicsClient.getInflation(),
  ]);

  // Latest values for KPI cards
  const latestUnemployment = unemployment.at(-1)?.value ?? null;
  const latestGDP = gdp.at(-1)?.value ?? null;
  const latestInflation = inflation.at(-1)?.value ?? null;

  const unemploymentTrend = computeTrend(unemployment);
  const gdpTrend = computeTrend(gdp);
  const inflationTrend = computeTrend(inflation);

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Économie</h1>
        <p className="text-sm text-gray-500 mt-1">
          Indicateurs macroéconomiques français — source Eurostat via DBnomics
        </p>
      </div>

      {/* KPI cards */}
      <section>
        <h2 className="text-sm font-semibold text-dsfr-grey uppercase tracking-wide mb-3">
          Derniers chiffres
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Taux de chômage"
            value={latestUnemployment}
            unit="%"
            trend={unemploymentTrend}
            description={`Dernière période : ${unemployment.at(-1)?.date ?? "—"}`}
          />
          <StatCard
            title="Croissance PIB"
            value={latestGDP}
            unit="%"
            trend={gdpTrend}
            description={`Dernière période : ${gdp.at(-1)?.date ?? "—"}`}
          />
          <StatCard
            title="Inflation (IPCH)"
            value={latestInflation}
            unit="%"
            trend={inflationTrend}
            description={`Dernière période : ${inflation.at(-1)?.date ?? "—"}`}
          />
        </div>
      </section>

      {/* Interactive charts (Client Component) */}
      <Suspense fallback={<ChartsSkeleton />}>
        <EconomyCharts
          unemployment={unemployment}
          gdp={gdp}
          inflation={inflation}
        />
      </Suspense>
    </div>
  );
}

function ChartsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-dsfr-grey-border p-5">
        <div className="skeleton h-4 w-48 mb-4" />
        <div className="skeleton h-72 w-full" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-dsfr-grey-border p-5">
          <div className="skeleton h-4 w-40 mb-4" />
          <div className="skeleton h-60 w-full" />
        </div>
        <div className="bg-white rounded-lg border border-dsfr-grey-border p-5">
          <div className="skeleton h-4 w-40 mb-4" />
          <div className="skeleton h-60 w-full" />
        </div>
      </div>
    </div>
  );
}
