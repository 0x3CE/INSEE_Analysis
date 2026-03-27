"use client";

/**
 * DualAxisChart — graphique comparatif à deux axes Y.
 *
 * Permet de superposer deux séries avec des unités différentes
 * (ex : % inflation à gauche, % chômage à droite).
 * Accessibilité : role="img" + aria-label sur le conteneur.
 */

import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { DataPoint } from "@/types";
import { mergeSeriesForRecharts } from "@/lib/transformers";
import { periodLabel } from "@/lib/utils";

export interface DualAxisSeries {
  key:   string;
  label: string;
  unit:  string;
  data:  DataPoint[];
  color: string;
  /** Which Y axis to use — default "left" */
  axis?: "left" | "right";
}

interface DualAxisChartProps {
  left:  DualAxisSeries;
  right: DualAxisSeries;
  tickInterval?: number;
  height?: number;
  ariaLabel?: string;
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────
function DualTooltip({
  active,
  payload,
  label,
  leftUnit,
  rightUnit,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string; dataKey: string }[];
  label?: string;
  leftUnit: string;
  rightUnit: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="bg-white border border-dsfr-grey-border rounded-md px-3 py-2 shadow text-xs space-y-1"
    >
      <p className="font-semibold text-gray-600 mb-1">{periodLabel(label ?? "")}</p>
      {payload.map((p) => {
        const unit = p.dataKey === "left" ? leftUnit : rightUnit;
        return (
          <div key={p.dataKey} className="flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full shrink-0"
              style={{ background: p.color }}
              aria-hidden="true"
            />
            <span className="text-gray-700">
              {p.name} :{" "}
              <strong>
                {new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 }).format(p.value)}{" "}
                {unit}
              </strong>
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export function DualAxisChart({
  left,
  right,
  tickInterval = 4,
  height = 320,
  ariaLabel,
}: DualAxisChartProps) {
  // Merge both series on the same date key
  const merged = mergeSeriesForRecharts({
    left:  left.data,
    right: right.data,
  });

  const ticks = merged
    .filter((_, i) => i % tickInterval === 0)
    .map((d) => d.date as string);

  const fmt = (v: number) =>
    new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(v);

  return (
    <div
      role="img"
      aria-label={
        ariaLabel ??
        `Graphique comparatif : ${left.label} (axe gauche, ${left.unit}) et ${right.label} (axe droit, ${right.unit})`
      }
    >
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={merged} margin={{ top: 5, right: 16, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

          <XAxis
            dataKey="date"
            ticks={ticks}
            tickFormatter={(v) => periodLabel(String(v))}
            tick={{ fontSize: 11, fill: "#6b7280" }}
            axisLine={false}
            tickLine={false}
          />

          {/* Left Y axis */}
          <YAxis
            yAxisId="left"
            orientation="left"
            tickFormatter={fmt}
            tick={{ fontSize: 11, fill: left.color }}
            axisLine={false}
            tickLine={false}
            width={44}
            label={{
              value: left.unit,
              angle: -90,
              position: "insideLeft",
              offset: 12,
              style: { fontSize: 10, fill: left.color },
            }}
          />

          {/* Right Y axis */}
          <YAxis
            yAxisId="right"
            orientation="right"
            tickFormatter={fmt}
            tick={{ fontSize: 11, fill: right.color }}
            axisLine={false}
            tickLine={false}
            width={44}
            label={{
              value: right.unit,
              angle: 90,
              position: "insideRight",
              offset: 12,
              style: { fontSize: 10, fill: right.color },
            }}
          />

          <Tooltip
            content={
              <DualTooltip leftUnit={left.unit} rightUnit={right.unit} />
            }
          />

          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
            formatter={(value) => {
              if (value === "left")  return left.label;
              if (value === "right") return right.label;
              return value;
            }}
          />

          <Line
            yAxisId="left"
            type="monotone"
            dataKey="left"
            name="left"
            stroke={left.color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: left.color }}
            aria-label={left.label}
          />

          <Line
            yAxisId="right"
            type="monotone"
            dataKey="right"
            name="right"
            stroke={right.color}
            strokeWidth={2}
            strokeDasharray="5 3"
            dot={false}
            activeDot={{ r: 4, fill: right.color }}
            aria-label={right.label}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
