"use client";

import { useRef, useState } from "react";
import { Building2, TrendingUp, MapPin, ExternalLink } from "lucide-react";
import { TimeSeriesChart } from "@/components/charts/TimeSeriesChart";
import { BarChart } from "@/components/charts/BarChart";
import { FranceMap } from "@/components/map/FranceMap";
import { ExportButton } from "@/components/shared/ExportButton";
import type { DataPoint } from "@/types";
import type { Entreprise } from "@/services/entreprises.client";
import { parsePeriod } from "@/lib/utils";

// Répartition sectorielle — données INSEE Sirene (structures par grand secteur NAF)
// Source : INSEE, Répertoire des entreprises, 2023
const SECTOR_DATA = [
  { label: "Commerce & réparation", value: 890000, color: "#003189" },
  { label: "Construction", value: 620000, color: "#1d4ed8" },
  { label: "Activités spécialisées", value: 580000, color: "#2563eb" },
  { label: "Hébergement & restauration", value: 310000, color: "#3b82f6" },
  { label: "Transports", value: 260000, color: "#60a5fa" },
  { label: "Santé & action sociale", value: 240000, color: "#93c5fd" },
  { label: "Information & communication", value: 190000, color: "#bfdbfe" },
];

type Period = "5Y" | "10Y" | "ALL";

function filterByPeriod(data: DataPoint[], period: Period): DataPoint[] {
  if (period === "ALL") return data;
  const years = period === "5Y" ? 5 : 10;
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - years);
  return data.filter((d) => parsePeriod(d.date) >= cutoff);
}

const PERIOD_LABELS: Record<Period, string> = { "5Y": "5 ans", "10Y": "10 ans", ALL: "Tout" };

interface InvestmentChartsProps {
  fbcf: DataPoint[];
  investRate: DataPoint[];
  deptData: { label: string; value: number; code: string }[];
  recentCompanies: Entreprise[];
}

export function InvestmentCharts({
  fbcf,
  investRate,
  deptData,
  recentCompanies,
}: InvestmentChartsProps) {
  const [period, setPeriod] = useState<Period>("10Y");
  const fbcfRef = useRef<HTMLDivElement>(null);

  const filteredFBCF = filterByPeriod(fbcf, period);
  const filteredRate = filterByPeriod(investRate, period);

  // Données carte : nombre d'entreprises par département (normalisé pour choroplèthe)
  const mapData = deptData.map((d) => ({ code: d.code, value: d.value }));

  // Format compact pour les axes du bar chart depts
  const deptBarData = deptData.map((d) => ({ label: d.label, value: d.value }));

  return (
    <div className="space-y-6">
      {/* Sélecteur de période */}
      <div className="flex items-center gap-1 bg-white border border-dsfr-grey-border rounded-md p-0.5 w-fit">
        {(["5Y", "10Y", "ALL"] as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
              period === p
                ? "bg-dsfr-blue text-white"
                : "text-gray-600 hover:bg-dsfr-grey-light"
            }`}
          >
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>

      {/* FBCF — graphique principal */}
      <div className="bg-white rounded-lg border border-dsfr-grey-border p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-dsfr-blue" />
              Formation Brute de Capital Fixe (FBCF)
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Trimestrielle, prix courants (M€ nationaux) — Eurostat / DBnomics
            </p>
          </div>
          <ExportButton
            data={filteredFBCF}
            title="FBCF France"
            chartRef={fbcfRef}
          />
        </div>
        <div ref={fbcfRef}>
          <TimeSeriesChart
            data={filteredFBCF}
            unit="M€"
            color="#003189"
            tickInterval={period === "5Y" ? 4 : 8}
          />
        </div>
      </div>

      {/* Variation FBCF + Secteurs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-dsfr-grey-border p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900">
                Variation annuelle de la FBCF
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                % vs année précédente — Eurostat / DBnomics
              </p>
            </div>
            <ExportButton data={filteredRate} title="Variation FBCF France" />
          </div>
          <TimeSeriesChart
            data={filteredRate}
            unit="% PIB"
            color="#00a95f"
            tickInterval={2}
            referenceValue={0}
            referenceLabel="Zéro"
          />
        </div>

        <div className="bg-white rounded-lg border border-dsfr-grey-border p-5">
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900">
              Répartition sectorielle
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Nombre d'entreprises par secteur — INSEE Sirene 2023
            </p>
          </div>
          <BarChart
            data={SECTOR_DATA}
            unit="entreprises"
            layout="vertical"
            height={260}
          />
        </div>
      </div>

      {/* Entreprises par département + carte */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-dsfr-grey-border p-5">
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-dsfr-blue" />
              Établissements par département
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              12 plus grands départements — API Recherche Entreprises (données live)
            </p>
          </div>
          <BarChart
            data={deptBarData}
            unit="établissements"
            color="#003189"
            layout="vertical"
            height={320}
          />
        </div>

        <div className="bg-white rounded-lg border border-dsfr-grey-border p-5">
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-dsfr-blue" />
              Densité d'entreprises
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Nombre d'établissements par département (12 dept. disponibles)
            </p>
          </div>
          <FranceMap
            data={mapData}
            unit="établissements"
            colorScale={["#e8edff", "#003189"]}
          />
        </div>
      </div>

      {/* Dernières entreprises enregistrées */}
      <div className="bg-white rounded-lg border border-dsfr-grey-border p-5">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Building2 className="h-4 w-4 text-dsfr-blue" />
          Dernières entreprises enregistrées
          <span className="ml-auto text-xs font-normal text-gray-400">
            API Recherche Entreprises
          </span>
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dsfr-grey-border text-xs text-dsfr-grey uppercase tracking-wide">
                <th className="text-left py-2 pr-4 font-medium">Entreprise</th>
                <th className="text-left py-2 pr-4 font-medium">SIREN</th>
                <th className="text-left py-2 pr-4 font-medium">Commune</th>
                <th className="text-left py-2 pr-4 font-medium">Secteur NAF</th>
                <th className="text-left py-2 font-medium">Création</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentCompanies.map((e) => (
                <tr key={e.siren} className="hover:bg-dsfr-grey-light transition-colors">
                  <td className="py-2.5 pr-4 font-medium text-gray-900 truncate max-w-[180px]">
                    {e.nom_complet}
                  </td>
                  <td className="py-2.5 pr-4 text-gray-500 font-mono text-xs">
                    {e.siren}
                  </td>
                  <td className="py-2.5 pr-4 text-gray-600">
                    {e.siege?.commune ?? "—"}
                    {e.siege?.departement ? ` (${e.siege.departement})` : ""}
                  </td>
                  <td className="py-2.5 pr-4 text-gray-500 text-xs">
                    {e.activite_principale ?? "—"}
                  </td>
                  <td className="py-2.5 text-gray-500 text-xs whitespace-nowrap">
                    {e.date_creation
                      ? new Date(e.date_creation).toLocaleDateString("fr-FR")
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 pt-3 border-t border-dsfr-grey-border">
          <a
            href="https://recherche-entreprises.api.gouv.fr"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-dsfr-blue hover:underline"
          >
            <ExternalLink className="h-3 w-3" />
            API Recherche Entreprises — api.gouv.fr
          </a>
        </div>
      </div>
    </div>
  );
}
