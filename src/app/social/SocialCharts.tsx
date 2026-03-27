"use client";

import { useRef, useState } from "react";
import { Users, TrendingDown, MapPin, BarChart2 } from "lucide-react";
import { MultiLineChart } from "@/components/charts/MultiLineChart";
import { TimeSeriesChart } from "@/components/charts/TimeSeriesChart";
import { FranceMap } from "@/components/map/FranceMap";
import { ExportButton } from "@/components/shared/ExportButton";
import type { DataPoint } from "@/types";
import { parsePeriod } from "@/lib/utils";
import { DEPT_POVERTY } from "@/lib/departmentData";

type Period = "5Y" | "10Y" | "ALL";
const PERIOD_LABELS: Record<Period, string> = { "5Y": "5 ans", "10Y": "10 ans", ALL: "Tout" };

function filterByPeriod(data: DataPoint[], period: Period): DataPoint[] {
  if (period === "ALL") return data;
  const years = period === "5Y" ? 5 : 10;
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - years);
  return data.filter((d) => parsePeriod(d.date) >= cutoff);
}

interface SocialChartsProps {
  povertyF: DataPoint[];
  povertyM: DataPoint[];
  gini: DataPoint[];
  povertyOrExclusion: DataPoint[];
}

export function SocialCharts({
  povertyF,
  povertyM,
  gini,
  povertyOrExclusion,
}: SocialChartsProps) {
  const [period, setPeriod] = useState<Period>("10Y");
  const povertyRef = useRef<HTMLDivElement>(null);

  const fPovertyF = filterByPeriod(povertyF, period);
  const fPovertyM = filterByPeriod(povertyM, period);
  const fGini = filterByPeriod(gini, period);
  const fPovertyExcl = filterByPeriod(povertyOrExclusion, period);

  const povertyMerged = [
    ...fPovertyF.map((d) => ({ ...d, label: "Femmes" })),
    ...fPovertyM.map((d) => ({ ...d, label: "Hommes" })),
  ];

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

      {/* Taux de pauvreté H/F */}
      <div className="bg-white rounded-lg border border-dsfr-grey-border p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Users className="h-4 w-4 text-dsfr-red" />
              Taux de pauvreté par genre
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Annuel, % — seuil 40% du revenu moyen — Eurostat / DBnomics
            </p>
          </div>
          <ExportButton
            data={povertyMerged}
            title="Taux de pauvreté France H-F"
            chartRef={povertyRef}
          />
        </div>
        <div ref={povertyRef}>
          <MultiLineChart
            series={[
              { key: "povertyF", label: "Femmes", data: fPovertyF, color: "#e1000f" },
              { key: "povertyM", label: "Hommes", data: fPovertyM, color: "#003189" },
            ]}
            unit="%"
            tickInterval={2}
            height={300}
          />
        </div>
      </div>

      {/* Gini + Pauvreté/exclusion */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Coefficient de Gini */}
        <div className="bg-white rounded-lg border border-dsfr-grey-border p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <BarChart2 className="h-4 w-4 text-dsfr-blue" />
                Coefficient de Gini
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Inégalités de revenus, annuel — Eurostat / DBnomics
              </p>
            </div>
            <ExportButton data={fGini} title="Coefficient de Gini France" />
          </div>
          <TimeSeriesChart
            data={fGini}
            unit=""
            color="#7c3aed"
            tickInterval={3}
            referenceValue={30}
            referenceLabel="Moy. UE"
          />
        </div>

        {/* Risque pauvreté ou exclusion sociale */}
        <div className="bg-white rounded-lg border border-dsfr-grey-border p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-orange-500" />
                Risque pauvreté ou exclusion sociale
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                % population, annuel — stratégie EU 2020 — Eurostat / DBnomics
              </p>
            </div>
            <ExportButton data={fPovertyExcl} title="Risque pauvreté exclusion France" />
          </div>
          <TimeSeriesChart
            data={fPovertyExcl}
            unit="%"
            color="#f97316"
            tickInterval={3}
          />
        </div>
      </div>

      {/* Carte taux de pauvreté par département */}
      <div className="bg-white rounded-lg border border-dsfr-grey-border p-5">
        <div className="mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-dsfr-blue" />
            Taux de pauvreté par département
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            % population sous le seuil de pauvreté (60% médian national) — INSEE, revenus 2021
          </p>
        </div>
        <FranceMap
          data={DEPT_POVERTY}
          unit="%"
          colorScale={["#fff3e0", "#e1000f"]}
        />
      </div>

      {/* Note méthodologique */}
      <div className="bg-dsfr-blue-light border border-blue-200 rounded-lg p-4 text-xs text-dsfr-blue space-y-1">
        <p className="font-semibold">Sources & méthodes</p>
        <ul className="list-disc list-inside space-y-0.5 text-blue-700">
          <li>Taux de pauvreté H/F : Eurostat — <code>ilc_li02</code> — seuil 40% du revenu moyen</li>
          <li>Coefficient de Gini : Eurostat — <code>ilc_di12</code> — revenu disponible équivalent</li>
          <li>Risque pauvreté/exclusion : Eurostat — <code>ilc_peps01</code> — stratégie EU 2020</li>
          <li>Carte départementale : INSEE, Fichier localisé social et fiscal (FiLoSoFi) 2021 — seuil 60% médian</li>
        </ul>
      </div>
    </div>
  );
}
