/**
 * Social Dashboard — Server Component
 *
 * Fetches in parallel via DBnomics (Eurostat):
 *  • Taux de pauvreté H/F         (ilc_li02)
 *  • Coefficient de Gini           (ilc_di12)
 *  • Risque pauvreté ou exclusion  (ilc_peps01)
 */

import { Suspense } from "react";
import { DBnomicsClient } from "@/services/dbnomics.client";
import { computeTrend } from "@/lib/transformers";
import { REVALIDATE } from "@/lib/utils";
import { StatCard } from "@/components/shared/StatCard";
import { SocialCharts } from "./SocialCharts";

export const revalidate = REVALIDATE;

export default async function SocialPage() {
  const [povertyF, povertyM, gini, povertyOrExclusion] = await Promise.all([
    DBnomicsClient.getPovertyRate("F"),
    DBnomicsClient.getPovertyRate("M"),
    DBnomicsClient.getGiniCoefficient(),
    DBnomicsClient.getPovertyOrExclusion(),
  ]);

  const latestPovertyF = povertyF.at(-1)?.value ?? null;
  const latestPovertyM = povertyM.at(-1)?.value ?? null;
  const latestGini = gini.at(-1)?.value ?? null;
  const latestExclusion = povertyOrExclusion.at(-1)?.value ?? null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Social</h1>
        <p className="text-sm text-gray-500 mt-1">
          Indicateurs de pauvreté et d&apos;inégalités — source Eurostat via DBnomics
        </p>
      </div>

      {/* KPI */}
      <section>
        <h2 className="text-sm font-semibold text-dsfr-grey uppercase tracking-wide mb-3">
          Derniers chiffres
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            title="Taux de pauvreté — Femmes"
            value={latestPovertyF}
            unit="%"
            trend={computeTrend(povertyF)}
            description={povertyF.at(-1)?.date ?? "—"}
          />
          <StatCard
            title="Taux de pauvreté — Hommes"
            value={latestPovertyM}
            unit="%"
            trend={computeTrend(povertyM)}
            description={povertyM.at(-1)?.date ?? "—"}
          />
          <StatCard
            title="Coefficient de Gini"
            value={latestGini}
            unit=""
            trend={computeTrend(gini)}
            description={gini.at(-1)?.date ?? "—"}
          />
          <StatCard
            title="Risque pauvreté / exclusion"
            value={latestExclusion}
            unit="%"
            trend={computeTrend(povertyOrExclusion)}
            description={povertyOrExclusion.at(-1)?.date ?? "—"}
          />
        </div>
      </section>

      <Suspense fallback={<ChartsSkeleton />}>
        <SocialCharts
          povertyF={povertyF}
          povertyM={povertyM}
          gini={gini}
          povertyOrExclusion={povertyOrExclusion}
        />
      </Suspense>
    </div>
  );
}

function ChartsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-dsfr-grey-border p-5">
        <div className="skeleton h-4 w-56 mb-4" />
        <div className="skeleton h-72 w-full" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-lg border border-dsfr-grey-border p-5">
            <div className="skeleton h-4 w-40 mb-4" />
            <div className="skeleton h-56 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
