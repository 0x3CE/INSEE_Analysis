"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { periodLabel } from "@/lib/utils";
import type { DataPoint } from "@/types";

interface TimeSeriesChartProps {
  data: DataPoint[];
  color?: string;
  unit?: string;
  /** Show only every Nth tick to avoid crowding on small screens */
  tickInterval?: number;
  /** Optional reference value (e.g. EU average) */
  referenceValue?: number;
  referenceLabel?: string;
}

// Custom tooltip styled in DSFR spirit
function DSFRTooltip({
  active,
  payload,
  unit,
}: {
  active?: boolean;
  payload?: { value: number; payload: DataPoint }[];
  unit?: string;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-white border border-dsfr-grey-border rounded-md px-3 py-2 shadow text-xs">
      <p className="font-semibold text-gray-800">
        {new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 }).format(
          d.value
        )}{" "}
        {unit}
      </p>
      <p className="text-gray-500">{periodLabel(d.payload.date)}</p>
    </div>
  );
}

export function TimeSeriesChart({
  data,
  color = "#003189",
  unit = "%",
  tickInterval = 12,
  referenceValue,
  referenceLabel,
}: TimeSeriesChartProps) {
  // Sample ticks to avoid overlapping labels on small screens
  const ticks = data
    .filter((_, i) => i % tickInterval === 0)
    .map((d) => d.date);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="date"
          ticks={ticks}
          tickFormatter={periodLabel}
          tick={{ fontSize: 11, fill: "#6b7280" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(v) =>
            new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(
              v
            )
          }
          tick={{ fontSize: 11, fill: "#6b7280" }}
          axisLine={false}
          tickLine={false}
          width={40}
        />
        <Tooltip content={<DSFRTooltip unit={unit} />} />
        {referenceValue !== undefined && (
          <ReferenceLine
            y={referenceValue}
            stroke="#e1000f"
            strokeDasharray="4 4"
            label={{
              value: referenceLabel ?? `Réf. ${referenceValue}`,
              position: "insideTopRight",
              fontSize: 10,
              fill: "#e1000f",
            }}
          />
        )}
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: color }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
