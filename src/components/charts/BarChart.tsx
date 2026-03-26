"use client";

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export interface BarDataPoint {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarDataPoint[];
  unit?: string;
  color?: string;
  height?: number;
  layout?: "vertical" | "horizontal";
}

function DSFRTooltip({
  active,
  payload,
  unit,
}: {
  active?: boolean;
  payload?: { value: number; payload: BarDataPoint }[];
  unit?: string;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-white border border-dsfr-grey-border rounded-md px-3 py-2 shadow text-xs">
      <p className="font-semibold text-gray-800">
        {new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(d.value)}{" "}
        {unit}
      </p>
      <p className="text-gray-500">{d.payload.label}</p>
    </div>
  );
}

export function BarChart({
  data,
  unit = "",
  color = "#003189",
  height = 300,
  layout = "horizontal",
}: BarChartProps) {
  const isVertical = layout === "vertical";

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart
        data={data}
        layout={layout}
        margin={{ top: 5, right: 16, left: isVertical ? 100 : 0, bottom: 5 }}
        barSize={isVertical ? 14 : undefined}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#e5e7eb"
          horizontal={!isVertical}
          vertical={isVertical}
        />
        {isVertical ? (
          <>
            <XAxis
              type="number"
              tickFormatter={(v) =>
                new Intl.NumberFormat("fr-FR", {
                  notation: "compact",
                  maximumFractionDigits: 1,
                }).format(v)
              }
              tick={{ fontSize: 11, fill: "#6b7280" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="label"
              tick={{ fontSize: 11, fill: "#374151" }}
              axisLine={false}
              tickLine={false}
              width={96}
            />
          </>
        ) : (
          <>
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "#6b7280" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) =>
                new Intl.NumberFormat("fr-FR", {
                  notation: "compact",
                  maximumFractionDigits: 1,
                }).format(v)
              }
              tick={{ fontSize: 11, fill: "#6b7280" }}
              axisLine={false}
              tickLine={false}
              width={48}
            />
          </>
        )}
        <Tooltip content={<DSFRTooltip unit={unit} />} cursor={{ fill: "#f3f4f6" }} />
        <Bar dataKey="value" radius={[3, 3, 0, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color ?? color} />
          ))}
        </Bar>
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
