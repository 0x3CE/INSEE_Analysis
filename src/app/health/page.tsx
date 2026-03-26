/**
 * Health Dashboard — Server Component
 *
 * Fetches in parallel via DBnomics (Eurostat):
 *  • Espérance de vie H/F        (demo_mlexpec)
 *  • Dépenses santé €/hab        (hlth_sha11_hf)
 *  • Dépenses santé % PIB        (hlth_sha11_hf)
 *  • Mortalité standardisée H/F  (hlth_cd_acdr2)
 *  • Médecins — effectif total   (hlth_rs_phys)
 */

import { Suspense } from "react";
import { DBnomicsClient } from "@/services/dbnomics.client";
import { computeTrend } from "@/lib/transformers";
import { REVALIDATE } from "@/lib/utils";
import { StatCard } from "@/components/shared/StatCard";
import { HealthCharts } from "./HealthCharts";

export const revalidate = REVALIDATE;

export default async function HealthPage() {
  const [
    lifeExpF,
    lifeExpM,
    expenditurePerCap,
    expenditureGDP,
    mortalityF,
    mortalityM,
    doctors,
  ] = await Promise.all([
    DBnomicsClient.getLifeExpectancy("F"),
    DBnomicsClient.getLifeExpectancy("M"),
    DBnomicsClient.getHealthExpenditurePerCapita(),
    DBnomicsClient.getHealthExpenditureGDP(),
    DBnomicsClient.getStandardizedMortality("F"),
    DBnomicsClient.getStandardizedMortality("M"),
    DBnomicsClient.getDoctorCount(),
  ]);

  const latestLifeExpF = lifeExpF.at(-1)?.value ?? null;
  const latestLifeExpM = lifeExpM.at(-1)?.value ?? null;
  const latestExpenditure = expenditurePerCap.at(-1)?.value ?? null;
  const latestExpGDP = expenditureGDP.at(-1)?.value ?? null;
  const latestDoctors = doctors.at(-1)?.value ?? null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Santé</h1>
        <p className="text-sm text-gray-500 mt-1">
          Indicateurs de santé publique — source Eurostat via DBnomics
        </p>
      </div>

      {/* KPI */}
      <section>
        <h2 className="text-sm font-semibold text-dsfr-grey uppercase tracking-wide mb-3">
          Derniers chiffres
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            title="Espérance de vie — Femmes"
            value={latestLifeExpF}
            unit="ans"
            trend={computeTrend(lifeExpF)}
            description={lifeExpF.at(-1)?.date ?? "—"}
          />
          <StatCard
            title="Espérance de vie — Hommes"
            value={latestLifeExpM}
            unit="ans"
            trend={computeTrend(lifeExpM)}
            description={lifeExpM.at(-1)?.date ?? "—"}
          />
          <StatCard
            title="Dépenses publiques santé"
            value={latestExpenditure}
            unit="€/hab"
            trend={computeTrend(expenditurePerCap)}
            description={`${latestExpGDP?.toFixed(1) ?? "—"} % du PIB`}
          />
          <StatCard
            title="Médecins en exercice"
            value={latestDoctors}
            unit=""
            trend={computeTrend(doctors)}
            description={doctors.at(-1)?.date ?? "—"}
          />
        </div>
      </section>

      <Suspense fallback={<ChartsSkeleton />}>
        <HealthCharts
          lifeExpF={lifeExpF}
          lifeExpM={lifeExpM}
          expenditurePerCap={expenditurePerCap}
          expenditureGDP={expenditureGDP}
          mortalityF={mortalityF}
          mortalityM={mortalityM}
          doctors={doctors}
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
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg border border-dsfr-grey-border p-5">
            <div className="skeleton h-4 w-40 mb-4" />
            <div className="skeleton h-56 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
