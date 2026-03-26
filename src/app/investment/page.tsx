/**
 * Investment Dashboard — Server Component
 *
 * Fetches in parallel:
 *  • FBCF trimestrielle       (DBnomics / Eurostat)
 *  • Taux d'investissement    (DBnomics / Eurostat)
 *  • Nombre d'entreprises     (API Recherche Entreprises — 12 grands départements)
 *  • Dernières créations      (API Recherche Entreprises)
 */

import { Suspense } from "react";
import { DBnomicsClient } from "@/services/dbnomics.client";
import { EntreprisesClient } from "@/services/entreprises.client";
import { computeTrend } from "@/lib/transformers";
import { REVALIDATE } from "@/lib/utils";
import { StatCard } from "@/components/shared/StatCard";
import { InvestmentCharts } from "./InvestmentCharts";

export const revalidate = REVALIDATE;

// 12 grands départements français par population
const TOP_DEPTS = ["75", "69", "13", "92", "93", "94", "59", "33", "31", "44", "67", "06"];

const DEPT_NAMES: Record<string, string> = {
  "75": "Paris", "69": "Rhône", "13": "Bouches-du-Rhône",
  "92": "Hauts-de-Seine", "93": "Seine-St-Denis", "94": "Val-de-Marne",
  "59": "Nord", "33": "Gironde", "31": "Haute-Garonne",
  "44": "Loire-Atlantique", "67": "Bas-Rhin", "06": "Alpes-Maritimes",
};

export default async function InvestmentPage() {
  const [fbcf, investRate, deptCounts, recentCompanies] = await Promise.all([
    DBnomicsClient.getCapitalFormation(),
    DBnomicsClient.getInvestmentRate(),
    EntreprisesClient.countByDepartement(TOP_DEPTS),
    EntreprisesClient.getRecent(undefined, 8).catch(() => []),
  ]);

  const latestFBCF = fbcf.at(-1)?.value ?? null;
  const latestRate = investRate.at(-1)?.value ?? null;
  const fbcfTrend = computeTrend(fbcf);
  const rateTrend = computeTrend(investRate);

  const totalCompanies = Object.values(deptCounts).reduce((a, b) => a + b, 0);

  // Prépare les données dept pour les graphiques
  const deptData = TOP_DEPTS.map((code) => ({
    label: DEPT_NAMES[code] ?? code,
    value: deptCounts[code] ?? 0,
    code,
  })).sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Investissement</h1>
        <p className="text-sm text-gray-500 mt-1">
          Formation de capital, tissu d'entreprises et dynamisme économique territorial
        </p>
      </div>

      {/* KPI */}
      <section>
        <h2 className="text-sm font-semibold text-dsfr-grey uppercase tracking-wide mb-3">
          Indicateurs clés
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="FBCF (dernier trimestre)"
            value={latestFBCF}
            unit="M€"
            trend={fbcfTrend}
            description={`Période : ${fbcf.at(-1)?.date ?? "—"} — Eurostat`}
          />
          <StatCard
            title="Variation FBCF (annuelle)"
            value={latestRate}
            unit="%"
            trend={rateTrend}
            description={`Année : ${investRate.at(-1)?.date ?? "—"} — Eurostat`}
          />
          <StatCard
            title="Entreprises (12 depts)"
            value={totalCompanies}
            unit="établissements"
            description="Source : API Recherche Entreprises"
          />
        </div>
      </section>

      {/* Graphiques interactifs */}
      <Suspense fallback={<ChartsSkeleton />}>
        <InvestmentCharts
          fbcf={fbcf}
          investRate={investRate}
          deptData={deptData}
          recentCompanies={recentCompanies}
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
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-lg border border-dsfr-grey-border p-5">
            <div className="skeleton h-4 w-40 mb-4" />
            <div className="skeleton h-64 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
