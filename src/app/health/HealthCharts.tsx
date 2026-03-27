"use client";

import { useRef, useState } from "react";
import { Heart, Activity, Stethoscope, MapPin } from "lucide-react";
import { MultiLineChart } from "@/components/charts/MultiLineChart";
import { TimeSeriesChart } from "@/components/charts/TimeSeriesChart";
import { FranceMap } from "@/components/map/FranceMap";
import { ExportButton } from "@/components/shared/ExportButton";
import type { DataPoint } from "@/types";
import { parsePeriod } from "@/lib/utils";
import { DEPT_DOCTORS } from "@/lib/departmentData";

type Period = "5Y" | "10Y" | "ALL";
const PERIOD_LABELS: Record<Period, string> = { "5Y": "5 ans", "10Y": "10 ans", ALL: "Tout" };

function filterByPeriod(data: DataPoint[], period: Period): DataPoint[] {
  if (period === "ALL") return data;
  const years = period === "5Y" ? 5 : 10;
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - years);
  return data.filter((d) => parsePeriod(d.date) >= cutoff);
}

interface HealthChartsProps {
  lifeExpF: DataPoint[];
  lifeExpM: DataPoint[];
  expenditurePerCap: DataPoint[];
  expenditureGDP: DataPoint[];
  mortalityF: DataPoint[];
  mortalityM: DataPoint[];
  doctors: DataPoint[];
}

export function HealthCharts({
  lifeExpF,
  lifeExpM,
  expenditurePerCap,
  expenditureGDP,
  mortalityF,
  mortalityM,
  doctors,
}: HealthChartsProps) {
  const [period, setPeriod] = useState<Period>("10Y");
  const lifeExpRef = useRef<HTMLDivElement>(null);
  const mortalityRef = useRef<HTMLDivElement>(null);

  const fLifeExp = filterByPeriod(lifeExpF, period);
  const mLifeExp = filterByPeriod(lifeExpM, period);
  const fExpenditure = filterByPeriod(expenditurePerCap, period);
  const fExpGDP = filterByPeriod(expenditureGDP, period);
  const fMortalityF = filterByPeriod(mortalityF, period);
  const fMortalityM = filterByPeriod(mortalityM, period);
  const fDoctors = filterByPeriod(doctors, period);

  // Export data : merge H+F pour CSV espérance de vie
  const lifeExpMerged = [
    ...fLifeExp.map((d) => ({ ...d, label: "Femmes" })),
    ...mLifeExp.map((d) => ({ ...d, label: "Hommes" })),
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

      {/* Espérance de vie H/F — graphique principal */}
      <div className="bg-white rounded-lg border border-dsfr-grey-border p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Heart className="h-4 w-4 text-dsfr-red" />
              Espérance de vie à la naissance
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Annuelle, en années — Eurostat / DBnomics
            </p>
          </div>
          <ExportButton
            data={lifeExpMerged}
            title="Espérance de vie France H-F"
            chartRef={lifeExpRef}
          />
        </div>
        <div ref={lifeExpRef}>
          <MultiLineChart
            series={[
              { key: "lifeF", label: "Femmes", data: fLifeExp, color: "#e1000f" },
              { key: "lifeM", label: "Hommes", data: mLifeExp, color: "#003189" },
            ]}
            unit="ans"
            tickInterval={4}
            height={300}
          />
        </div>
      </div>

      {/* Dépenses + Mortalité */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dépenses santé EUR/hab */}
        <div className="bg-white rounded-lg border border-dsfr-grey-border p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Activity className="h-4 w-4 text-dsfr-blue" />
                Dépenses publiques de santé
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                €/hab, annuel — Eurostat / DBnomics
              </p>
            </div>
            <ExportButton data={fExpenditure} title="Dépenses santé France" />
          </div>
          <TimeSeriesChart
            data={fExpenditure}
            unit="€/hab"
            color="#003189"
            tickInterval={3}
          />
        </div>

        {/* Dépenses % PIB */}
        <div className="bg-white rounded-lg border border-dsfr-grey-border p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900">
                Dépenses santé (% PIB)
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Part du PIB, annuel — Eurostat / DBnomics
              </p>
            </div>
            <ExportButton data={fExpGDP} title="Dépenses santé % PIB France" />
          </div>
          <TimeSeriesChart
            data={fExpGDP}
            unit="% PIB"
            color="#00a95f"
            tickInterval={3}
            referenceValue={7}
            referenceLabel="Moy. UE"
          />
        </div>

        {/* Mortalité standardisée H/F */}
        <div className="bg-white rounded-lg border border-dsfr-grey-border p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Activity className="h-4 w-4 text-gray-500" />
                Mortalité standardisée
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Toutes causes, pour 100 000 hab — Eurostat / DBnomics
              </p>
            </div>
            <ExportButton
              data={[
                ...fMortalityF.map((d) => ({ ...d, label: "Femmes" })),
                ...fMortalityM.map((d) => ({ ...d, label: "Hommes" })),
              ]}
              title="Mortalité standardisée France H-F"
              chartRef={mortalityRef}
            />
          </div>
          <div ref={mortalityRef}>
            <MultiLineChart
              series={[
                { key: "mortF", label: "Femmes", data: fMortalityF, color: "#e1000f" },
                { key: "mortM", label: "Hommes", data: fMortalityM, color: "#003189" },
              ]}
              unit="/ 100k"
              tickInterval={2}
              height={240}
            />
          </div>
        </div>

        {/* Médecins en exercice */}
        <div className="bg-white rounded-lg border border-dsfr-grey-border p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-dsfr-blue" />
                Médecins en exercice
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Effectif total, annuel — Eurostat / DBnomics
              </p>
            </div>
            <ExportButton data={fDoctors} title="Médecins France" />
          </div>
          <TimeSeriesChart
            data={fDoctors}
            unit=""
            color="#7c3aed"
            tickInterval={4}
          />
        </div>
      </div>

      {/* Carte densité médicale */}
      <div className="bg-white rounded-lg border border-dsfr-grey-border p-5">
        <div className="mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-dsfr-blue" />
            Densité médicale par département
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Médecins pour 100 000 habitants — DREES, Atlas démographie médicale 2023
          </p>
        </div>
        <FranceMap
          data={DEPT_DOCTORS}
          unit="/ 100k hab"
          colorScale={["#e8edff", "#003189"]}
        />
      </div>

      {/* Note méthodologique */}
      <div className="bg-dsfr-blue-light border border-blue-200 rounded-lg p-4 text-xs text-dsfr-blue space-y-1">
        <p className="font-semibold">Sources & méthodes</p>
        <ul className="list-disc list-inside space-y-0.5 text-blue-700">
          <li>Espérance de vie : Eurostat — <code>demo_mlexpec</code> — à la naissance</li>
          <li>Dépenses de santé : Eurostat — <code>hlth_sha11_hf</code> — dépenses publiques (HF1)</li>
          <li>Mortalité standardisée : Eurostat — <code>hlth_cd_acdr2</code> — toutes causes (A-R_V-Y)</li>
          <li>Médecins : Eurostat — <code>hlth_rs_phys</code> — praticiens en exercice</li>
          <li>Densité médicale départementale : DREES, Atlas démographie médicale 2023</li>
        </ul>
      </div>
    </div>
  );
}
