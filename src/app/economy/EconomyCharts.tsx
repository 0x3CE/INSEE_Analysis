"use client";

/**
 * EconomyCharts — Client Component
 *
 * Reçoit les données pré-chargées du Server Component (page.tsx) et gère :
 *  - Filtre temporel interactif : 2 ans / 5 ans / 10 ans / Max
 *  - Section INSEE : IPC (ensemble + énergie), créations d'entreprises, PIB
 *  - Analyse comparative : DualAxisChart inflation vs chômage (Courbe de Phillips)
 *  - Section Eurostat/DBnomics : chômage mensuel SA, PIB trimestriel
 *  - Carte choroplèthe du chômage par département
 *  - Export CSV + PNG sur chaque carte
 *  - Tooltips pédagogiques sur chaque indicateur
 */

import { useRef, useState } from "react";
import { TrendingUp, Factory, AlertTriangle, BarChart2 } from "lucide-react";
import { TimeSeriesChart } from "@/components/charts/TimeSeriesChart";
import { MultiLineChart } from "@/components/charts/MultiLineChart";
import { DualAxisChart } from "@/components/charts/DualAxisChart";
import { FranceMap } from "@/components/map/FranceMap";
import { ExportButton } from "@/components/shared/ExportButton";
import { IndicatorTooltip, INDICATOR_TOOLTIPS } from "@/components/shared/IndicatorTooltip";
import type { DataPoint } from "@/types";
import { parsePeriod } from "@/lib/utils";
import { DEPT_UNEMPLOYMENT } from "@/lib/departmentData";

// ─── Types ────────────────────────────────────────────────────────────────────
type Period = "2Y" | "5Y" | "10Y" | "MAX";

const PERIODS: Period[] = ["2Y", "5Y", "10Y", "MAX"];
const PERIOD_LABELS: Record<Period, string> = {
  "2Y": "2 ans", "5Y": "5 ans", "10Y": "10 ans", MAX: "Max",
};

function filterByPeriod(data: DataPoint[], period: Period): DataPoint[] {
  if (period === "MAX") return data;
  const years = period === "2Y" ? 2 : period === "5Y" ? 5 : 10;
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - years);
  return data.filter((d) => parsePeriod(d.date) >= cutoff);
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface EconomyChartsProps {
  // DBnomics / Eurostat
  unemploymentEurostat: DataPoint[];
  gdpDBnomics:          DataPoint[];
  inflationIPCH:        DataPoint[];
  // INSEE BDM (live ou fallback)
  ipcEnsemble:          DataPoint[];
  ipcEnergie:           DataPoint[];
  chomageINSEE:         DataPoint[];
  creationsEntreprises: DataPoint[];
  pibINSEE:             DataPoint[];
  inseeIsLive:          boolean;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** En-tête de carte avec titre, sous-titre, tooltip et bouton export */
function CardHeader({
  title,
  subtitle,
  tooltipId,
  tooltipContent,
  exportData,
  exportTitle,
  exportRef,
}: {
  title: string;
  subtitle: string;
  tooltipId?: string;
  tooltipContent?: React.ReactNode;
  exportData: DataPoint[];
  exportTitle: string;
  exportRef?: React.RefObject<HTMLDivElement>;
}) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <h3 className="font-semibold text-gray-900 flex items-center gap-1.5">
          {title}
          {tooltipId && tooltipContent && (
            <IndicatorTooltip id={tooltipId} content={tooltipContent} />
          )}
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
      </div>
      <ExportButton data={exportData} title={exportTitle} chartRef={exportRef} />
    </div>
  );
}

/** Sélecteur de période */
function PeriodSelector({
  period,
  onChange,
}: {
  period: Period;
  onChange: (p: Period) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Filtre de période"
      className="flex items-center gap-1 bg-white border border-dsfr-grey-border rounded-md p-0.5 w-fit"
    >
      {PERIODS.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          aria-pressed={period === p}
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
  );
}

/** Badge source de données */
function SourceBadge({
  isLive,
  liveLabel = "INSEE Live",
  fallbackLabel = "Données de référence",
}: {
  isLive: boolean;
  liveLabel?: string;
  fallbackLabel?: string;
}) {
  return isLive ? (
    <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
      <span className="h-1.5 w-1.5 rounded-full bg-green-500" aria-hidden="true" />
      {liveLabel}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
      <AlertTriangle className="h-3 w-3" aria-hidden="true" />
      {fallbackLabel}
    </span>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function EconomyCharts({
  unemploymentEurostat,
  gdpDBnomics,
  inflationIPCH,
  ipcEnsemble,
  ipcEnergie,
  chomageINSEE,
  creationsEntreprises,
  pibINSEE,
  inseeIsLive,
}: EconomyChartsProps) {
  const [period, setPeriod] = useState<Period>("10Y");

  // Refs pour export PNG
  const ipcRef       = useRef<HTMLDivElement>(null);
  const dualRef      = useRef<HTMLDivElement>(null);
  const chomageRef   = useRef<HTMLDivElement>(null);
  const creationsRef = useRef<HTMLDivElement>(null);
  const pibRef       = useRef<HTMLDivElement>(null);

  // Filtres temporels — appliqués à toutes les séries
  const f = (d: DataPoint[]) => filterByPeriod(d, period);

  const fIpcEnsemble   = f(ipcEnsemble);
  const fIpcEnergie    = f(ipcEnergie);
  const fChomageINSEE  = f(chomageINSEE);
  const fCreations     = f(creationsEntreprises);
  const fPib           = f(pibINSEE);
  const fUnemployment  = f(unemploymentEurostat);
  const fGdp           = f(gdpDBnomics);
  const fInflation     = f(inflationIPCH);

  const tickMonth = period === "2Y" ? 3 : period === "5Y" ? 6 : 12;
  const tickQtr   = period === "2Y" ? 2 : period === "5Y" ? 4 : 8;

  return (
    <div className="space-y-8">

      {/* ── Filtre de période ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 flex-wrap">
        <PeriodSelector period={period} onChange={setPeriod} />
        <SourceBadge isLive={inseeIsLive} />
      </div>

      {/* ══ Section 1 — Indicateurs de prix (INSEE BDM) ═══════════════════════ */}
      <section aria-labelledby="section-prix">
        <h2
          id="section-prix"
          className="text-sm font-semibold text-dsfr-grey uppercase tracking-wide mb-4 flex items-center gap-2"
        >
          <TrendingUp className="h-4 w-4" aria-hidden="true" />
          Prix — IPC INSEE
        </h2>

        {/* IPC Ensemble + Énergie */}
        <div className="bg-white rounded-lg border border-dsfr-grey-border p-5">
          <CardHeader
            title="IPC — Inflation Ensemble & Énergie"
            subtitle="Glissement annuel en % — INSEE BDM (séries 001759970 / 001763118)"
            tooltipId="ipc-ensemble"
            tooltipContent={INDICATOR_TOOLTIPS.ipcEnsemble}
            exportData={[...fIpcEnsemble, ...fIpcEnergie]}
            exportTitle="IPC Ensemble Energie France"
            exportRef={ipcRef}
          />
          <div ref={ipcRef} aria-label="Graphique IPC Ensemble et Énergie">
            <MultiLineChart
              series={[
                { key: "ensemble", label: "Ensemble",  data: fIpcEnsemble, color: "#003189" },
                { key: "energie",  label: "Énergie",   data: fIpcEnergie,  color: "#e1000f" },
              ]}
              unit="%"
              tickInterval={tickMonth}
              height={300}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Cible BCE : 2 % · Pic énergie : nov. 2022 (+38 %)
          </p>
        </div>
      </section>

      {/* ══ Section 2 — Activité économique (INSEE BDM) ════════════════════════ */}
      <section aria-labelledby="section-activite">
        <h2
          id="section-activite"
          className="text-sm font-semibold text-dsfr-grey uppercase tracking-wide mb-4 flex items-center gap-2"
        >
          <Factory className="h-4 w-4" aria-hidden="true" />
          Activité — INSEE BDM
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Créations d'entreprises */}
          <div className="bg-white rounded-lg border border-dsfr-grey-border p-5">
            <CardHeader
              title="Créations d'entreprises"
              subtitle="Total mensuel — INSEE BDM (010613256)"
              tooltipId="creations"
              tooltipContent={INDICATOR_TOOLTIPS.creationsEntreprises}
              exportData={fCreations}
              exportTitle="Creations entreprises France"
              exportRef={creationsRef}
            />
            <div ref={creationsRef} aria-label="Graphique créations d'entreprises">
              <TimeSeriesChart
                data={fCreations}
                unit=""
                color="#7c3aed"
                tickInterval={tickMonth}
              />
            </div>
          </div>

          {/* PIB — variation trimestrielle */}
          <div className="bg-white rounded-lg border border-dsfr-grey-border p-5">
            <CardHeader
              title="PIB — variation trimestrielle"
              subtitle="Volume chaîné, en % — INSEE BDM (010565692)"
              tooltipId="pib"
              tooltipContent={INDICATOR_TOOLTIPS.pibVariation}
              exportData={fPib}
              exportTitle="PIB variation trimestrielle France"
              exportRef={pibRef}
            />
            <div ref={pibRef} aria-label="Graphique PIB variation trimestrielle">
              <TimeSeriesChart
                data={fPib}
                unit="%"
                color="#00a95f"
                tickInterval={tickQtr}
                referenceValue={0}
                referenceLabel="Seuil 0%"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ══ Section 3 — Analyse comparative (Courbe de Phillips) ══════════════ */}
      <section aria-labelledby="section-comparatif">
        <h2
          id="section-comparatif"
          className="text-sm font-semibold text-dsfr-grey uppercase tracking-wide mb-4 flex items-center gap-2"
        >
          <BarChart2 className="h-4 w-4" aria-hidden="true" />
          Analyse comparative
        </h2>

        <div className="bg-white rounded-lg border border-dsfr-grey-border p-5">
          <CardHeader
            title="Inflation vs Chômage BIT"
            subtitle="Axes Y indépendants — IPC Ensemble (g.) · Taux BIT (dr.) — INSEE BDM"
            tooltipId="phillips"
            tooltipContent={INDICATOR_TOOLTIPS.inflationVsChomage}
            exportData={[...fIpcEnsemble, ...fChomageINSEE]}
            exportTitle="Inflation vs Chomage France"
            exportRef={dualRef}
          />
          <div ref={dualRef}>
            <DualAxisChart
              left={{
                key:   "left",
                label: "IPC Ensemble",
                unit:  "%",
                data:  fIpcEnsemble,
                color: "#e1000f",
              }}
              right={{
                key:   "right",
                label: "Chômage BIT",
                unit:  "%",
                data:  fChomageINSEE,
                color: "#003189",
              }}
              tickInterval={tickMonth}
              height={320}
              ariaLabel="Graphique comparatif IPC Ensemble (axe gauche) et Chômage BIT (axe droit)"
            />
          </div>
        </div>
      </section>

      {/* ══ Section 4 — Indicateurs Eurostat / DBnomics ════════════════════════ */}
      <section aria-labelledby="section-eurostat">
        <h2
          id="section-eurostat"
          className="text-sm font-semibold text-dsfr-grey uppercase tracking-wide mb-4"
        >
          Données Eurostat — DBnomics
        </h2>

        {/* Chômage mensuel SA */}
        <div className="bg-white rounded-lg border border-dsfr-grey-border p-5 mb-6">
          <CardHeader
            title="Taux de chômage mensuel (SA)"
            subtitle="Désaisonnalisé, en % — Eurostat/une_rt_m via DBnomics"
            tooltipId="chomage-eurostat"
            tooltipContent={INDICATOR_TOOLTIPS.chomageBIT}
            exportData={fUnemployment}
            exportTitle="Chomage mensuel France Eurostat"
            exportRef={chomageRef}
          />
          <div ref={chomageRef} aria-label="Graphique taux de chômage mensuel France">
            <TimeSeriesChart
              data={fUnemployment}
              unit="%"
              color="#003189"
              tickInterval={tickMonth}
              referenceValue={6.5}
              referenceLabel="Moy. UE"
            />
          </div>
        </div>

        {/* PIB + Inflation IPCH côte à côte */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-dsfr-grey-border p-5">
            <CardHeader
              title="Croissance du PIB (Eurostat)"
              subtitle="Trimestrielle — Eurostat/namq_10_gdp via DBnomics"
              tooltipId="gdp-eurostat"
              tooltipContent={INDICATOR_TOOLTIPS.pibVariation}
              exportData={fGdp}
              exportTitle="Croissance PIB Eurostat France"
            />
            <TimeSeriesChart
              data={fGdp}
              unit="%"
              color="#00a95f"
              tickInterval={tickQtr}
            />
          </div>

          <div className="bg-white rounded-lg border border-dsfr-grey-border p-5">
            <CardHeader
              title="Inflation IPCH (Eurostat)"
              subtitle="Glissement annuel, mensuel — Eurostat/prc_hicp_manr via DBnomics"
              tooltipId="ipch-eurostat"
              tooltipContent={INDICATOR_TOOLTIPS.ipcEnsemble}
              exportData={fInflation}
              exportTitle="Inflation IPCH Eurostat France"
            />
            <TimeSeriesChart
              data={fInflation}
              unit="%"
              color="#f97316"
              tickInterval={tickMonth}
              referenceValue={2}
              referenceLabel="Cible BCE"
            />
          </div>
        </div>
      </section>

      {/* ══ Section 5 — Carte chômage par département ════════════════════════ */}
      <section aria-labelledby="section-carte">
        <div className="bg-white rounded-lg border border-dsfr-grey-border p-5">
          <div className="mb-4">
            <h2
              id="section-carte"
              className="font-semibold text-gray-900"
            >
              Taux de chômage par département
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              % actifs au sens du BIT — INSEE, T4 2025 (provisoire) — 99 départements
            </p>
          </div>
          <FranceMap
            data={DEPT_UNEMPLOYMENT}
            unit="%"
            colorScale={["#e8edff", "#003189"]}
          />
        </div>
      </section>

      {/* ══ Note méthodologique ══════════════════════════════════════════════ */}
      <div className="bg-dsfr-blue-light border border-blue-200 rounded-lg p-4 text-xs text-dsfr-blue space-y-1">
        <p className="font-semibold">Sources & méthodes</p>
        <ul className="list-disc list-inside space-y-0.5 text-blue-700">
          <li>IPC : INSEE BDM — séries 001759970 (ensemble) et 001763118 (énergie) — glissement annuel calculé sur 12 mois</li>
          <li>Chômage BIT : INSEE BDM — série 001688527 — France entière, trimestriel</li>
          <li>Créations d&apos;entreprises : INSEE BDM — série 010613256 — total mensuel (classiques + micro-entrepreneurs)</li>
          <li>PIB INSEE : INSEE BDM — série 010565692 — volume chaîné, variation trimestrielle</li>
          <li>Chômage Eurostat : Eurostat/une_rt_m — mensuel, désaisonnalisé</li>
          <li>PIB Eurostat : Eurostat/namq_10_gdp — trimestriel</li>
          <li>Inflation IPCH : Eurostat/prc_hicp_manr — mensuel, glissement annuel</li>
          <li>Carte chômage : INSEE, taux localisés BIT — T4 2025 (provisoire)</li>
        </ul>
      </div>
    </div>
  );
}
