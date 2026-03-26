"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { mergeSeriesForRecharts, } from "@/lib/transformers";
import { periodLabel } from "@/lib/utils";
import type { DataPoint } from "@/types";

export interface NamedSeries {
  key: string;
  label: string;
  data: DataPoint[];
  color: string;
}

interface MultiLineChartProps {
  series: NamedSeries[];
  unit?: string;
  tickInterval?: number;
  height?: number;
}

function DSFRTooltip({
  active,
  payload,
  label,
  unit,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
  unit?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-dsfr-grey-border rounded-md px-3 py-2 shadow text-xs space-y-1">
      <p className="font-semibold text-gray-600 mb-1">{periodLabel(label ?? "")}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full shrink-0" style={{ background: p.color }} />
          <span className="text-gray-700">
            {p.name} :{" "}
            <strong>
              {new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 }).format(p.value)}{" "}
              {unit}
            </strong>
          </span>
        </div>
      ))}
    </div>
  );
}

export function MultiLineChart({
  series,
  unit = "",
  tickInterval = 4,
  height = 300,
}: MultiLineChartProps) {
  const seriesMap = Object.fromEntries(series.map((s) => [s.key, s.data]));
  const merged = mergeSeriesForRecharts(seriesMap);

  const ticks = merged
    .filter((_, i) => i % tickInterval === 0)
    .map((d) => d.date as string);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={merged} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="date"
          ticks={ticks}
          tickFormatter={(v) => periodLabel(String(v))}
          tick={{ fontSize: 11, fill: "#6b7280" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(v) =>
            new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(v)
          }
          tick={{ fontSize: 11, fill: "#6b7280" }}
          axisLine={false}
          tickLine={false}
          width={44}
        />
        <Tooltip content={<DSFRTooltip unit={unit} />} />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
          formatter={(value) => {
            const s = series.find((x) => x.key === value);
            return s?.label ?? value;
          }}
        />
        {series.map((s) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            stroke={s.color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: s.color }}
            name={s.key}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
