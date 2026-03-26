"use client";

/**
 * Client Component — holds all interactive chart state for the Economy page.
 * Receives pre-fetched data from the Server Component as props.
 */

import { useRef, useState } from "react";
import { TimeSeriesChart } from "@/components/charts/TimeSeriesChart";
import { FranceMap } from "@/components/map/FranceMap";
import { ExportButton } from "@/components/shared/ExportButton";
import type { DataPoint } from "@/types";
import { parsePeriod } from "@/lib/utils";

// Synthetic department-level unemployment data (real data would come from INSEE API)
// Replace with actual API call to INSEEClient.getSeries() per department.
const DEPT_UNEMPLOYMENT_MOCK: { code: string; value: number }[] = [
  { code: "75", value: 7.2 }, { code: "69", value: 7.8 }, { code: "13", value: 12.1 },
  { code: "31", value: 9.4 }, { code: "33", value: 9.8 }, { code: "44", value: 7.1 },
  { code: "59", value: 12.8 }, { code: "67", value: 7.4 }, { code: "06", value: 10.2 },
  { code: "34", value: 11.5 }, { code: "76", value: 9.1 }, { code: "35", value: 6.9 },
  { code: "57", value: 10.3 }, { code: "972", value: 17.2 }, { code: "974", value: 18.1 },
  { code: "971", value: 19.3 }, { code: "973", value: 15.4 },
];

type Period = "5Y" | "10Y" | "ALL";

function filterByPeriod(data: DataPoint[], period: Period): DataPoint[] {
  if (period === "ALL") return data;
  const years = period === "5Y" ? 5 : 10;
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - years);
  return data.filter((d) => parsePeriod(d.date) >= cutoff);
}

interface EconomyChartsProps {
  unemployment: DataPoint[];
  gdp: DataPoint[];
  inflation: DataPoint[];
}

export function EconomyCharts({ unemployment, gdp, inflation }: EconomyChartsProps) {
  const [period, setPeriod] = useState<Period>("10Y");
  const unemploymentChartRef = useRef<HTMLDivElement>(null);

  const filteredUnemployment = filterByPeriod(unemployment, period);
  const filteredGDP = filterByPeriod(gdp, period);
  const filteredInflation = filterByPeriod(inflation, period);

  const PERIODS: Period[] = ["5Y", "10Y", "ALL"];
  const PERIOD_LABELS: Record<Period, string> = {
    "5Y": "5 ans",
    "10Y": "10 ans",
    ALL: "Tout",
  };

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="flex items-center gap-1 bg-white border border-dsfr-grey-border rounded-md p-0.5 w-fit">
        {PERIODS.map((p) => (
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

      {/* Unemployment line chart */}
      <div className="bg-white rounded-lg border border-dsfr-grey-border p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-900">
              Taux de chômage — France
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Données mensuelles, désaisonnalisées — Eurostat / DBnomics
            </p>
          </div>
          <ExportButton
            data={filteredUnemployment}
            title="Taux de chômage France"
            chartRef={unemploymentChartRef}
          />
        </div>
        <div ref={unemploymentChartRef}>
          <TimeSeriesChart
            data={filteredUnemployment}
            unit="%"
            color="#003189"
            tickInterval={period === "5Y" ? 6 : 12}
            referenceValue={6.5}
            referenceLabel="Moy. UE"
          />
        </div>
      </div>

      {/* GDP + Inflation side-by-side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-dsfr-grey-border p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900">Croissance du PIB</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Trimestrielle — Eurostat / DBnomics
              </p>
            </div>
            <ExportButton data={filteredGDP} title="Croissance PIB France" />
          </div>
          <TimeSeriesChart
            data={filteredGDP}
            unit="%"
            color="#00a95f"
            tickInterval={4}
          />
        </div>

        <div className="bg-white rounded-lg border border-dsfr-grey-border p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900">Inflation (IPCH)</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Mensuelle, glissement annuel — Eurostat / DBnomics
              </p>
            </div>
            <ExportButton data={filteredInflation} title="Inflation France IPCH" />
          </div>
          <TimeSeriesChart
            data={filteredInflation}
            unit="%"
            color="#e1000f"
            tickInterval={period === "5Y" ? 6 : 12}
            referenceValue={2}
            referenceLabel="Cible BCE"
          />
        </div>
      </div>

      {/* France department map */}
      <div className="bg-white rounded-lg border border-dsfr-grey-border p-5">
        <div className="mb-4">
          <h3 className="font-semibold text-gray-900">
            Taux de chômage par département
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Données illustratives — connecter à l&apos;API INSEE pour les vraies valeurs
          </p>
        </div>
        <FranceMap
          data={DEPT_UNEMPLOYMENT_MOCK}
          unit="%"
          colorScale={["#e8edff", "#003189"]}
        />
      </div>
    </div>
  );
}
