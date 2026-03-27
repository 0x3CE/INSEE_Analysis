"use client";

import { useRef, useState } from "react";
import { Users, TrendingDown, MapPin, BarChart2 } from "lucide-react";
import { MultiLineChart } from "@/components/charts/MultiLineChart";
import { TimeSeriesChart } from "@/components/charts/TimeSeriesChart";
import { FranceMap } from "@/components/map/FranceMap";
import { ExportButton } from "@/components/shared/ExportButton";
import type { DataPoint } from "@/types";
import { parsePeriod } from "@/lib/utils";

// Taux de pauvreté par département — INSEE, revenus et pauvreté 2021
// Seuil à 60% du niveau de vie médian national
const POVERTY_RATE_BY_DEPT: { code: string; value: number }[] = [
  { code: "75", value: 13.6 }, { code: "77", value: 11.9 },
  { code: "78", value: 9.1 },  { code: "91", value: 11.5 },
  { code: "92", value: 9.8 },  { code: "93", value: 28.8 },
  { code: "94", value: 14.2 }, { code: "95", value: 14.1 },
  { code: "69", value: 14.1 }, { code: "13", value: 18.5 },
  { code: "59", value: 20.8 }, { code: "62", value: 22.5 },
  { code: "31", value: 17.1 }, { code: "33", value: 16.2 },
  { code: "34", value: 21.2 }, { code: "30", value: 23.1 },
  { code: "67", value: 14.4 }, { code: "06", value: 16.8 },
  { code: "76", value: 16.5 }, { code: "44", value: 13.2 },
  { code: "35", value: 12.8 }, { code: "29", value: 14.6 },
  { code: "56", value: 16.2 }, { code: "22", value: 14.1 },
  { code: "57", value: 18.1 }, { code: "38", value: 13.1 },
  { code: "74", value: 10.3 }, { code: "83", value: 15.2 },
  { code: "84", value: 18.4 }, { code: "73", value: 12.4 },
  { code: "63", value: 17.5 }, { code: "87", value: 17.8 },
  { code: "45", value: 14.8 }, { code: "37", value: 14.2 },
  { code: "49", value: 14.1 }, { code: "85", value: 12.3 },
  { code: "14", value: 15.6 }, { code: "76", value: 16.5 },
  { code: "60", value: 16.9 }, { code: "02", value: 23.4 },
  { code: "08", value: 21.5 }, { code: "51", value: 16.3 },
  { code: "10", value: 17.4 }, { code: "52", value: 19.1 },
  { code: "54", value: 18.9 }, { code: "55", value: 22.1 },
  { code: "88", value: 18.3 }, { code: "68", value: 16.2 },
  { code: "70", value: 19.4 }, { code: "25", value: 14.2 },
  { code: "39", value: 16.8 }, { code: "21", value: 15.3 },
  { code: "71", value: 17.6 }, { code: "58", value: 19.8 },
  { code: "89", value: 17.5 }, { code: "03", value: 20.7 },
  { code: "15", value: 20.2 }, { code: "43", value: 17.9 },
  { code: "42", value: 17.1 }, { code: "01", value: 11.8 },
  { code: "07", value: 18.6 }, { code: "26", value: 18.1 },
  { code: "04", value: 20.3 }, { code: "05", value: 17.9 },
  { code: "13", value: 18.5 }, { code: "83", value: 15.2 },
  { code: "11", value: 23.5 }, { code: "66", value: 25.1 },
  { code: "09", value: 22.7 }, { code: "12", value: 19.6 },
  { code: "81", value: 20.3 }, { code: "82", value: 19.2 },
  { code: "32", value: 19.4 }, { code: "65", value: 18.2 },
  { code: "64", value: 15.3 }, { code: "40", value: 14.7 },
  { code: "47", value: 21.4 }, { code: "24", value: 20.8 },
  { code: "19", value: 18.5 }, { code: "46", value: 20.1 },
  { code: "48", value: 20.4 }, { code: "16", value: 19.3 },
  { code: "17", value: 15.9 }, { code: "79", value: 16.1 },
  { code: "86", value: 17.4 }, { code: "23", value: 22.6 },
  { code: "36", value: 21.5 }, { code: "18", value: 18.2 },
  { code: "41", value: 16.4 }, { code: "28", value: 13.6 },
  { code: "72", value: 15.4 }, { code: "53", value: 14.8 },
  { code: "50", value: 14.9 }, { code: "61", value: 18.2 },
  { code: "27", value: 16.8 }, { code: "76", value: 16.5 },
  { code: "2A", value: 21.6 }, { code: "2B", value: 20.1 },
  { code: "971", value: 33.4 }, { code: "972", value: 29.7 },
  { code: "973", value: 52.1 }, { code: "974", value: 37.8 },
];

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
          data={POVERTY_RATE_BY_DEPT}
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
