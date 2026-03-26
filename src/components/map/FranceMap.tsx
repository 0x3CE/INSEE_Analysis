"use client";

import { useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { formatValue } from "@/lib/utils";

// GeoJSON for French metropolitan departments (hosted on GitHub)
const GEO_URL =
  "https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/departements-version-simplifiee.geojson";

interface MapDataPoint {
  code: string;
  value: number;
}

interface FranceMapProps {
  data: MapDataPoint[];
  unit?: string;
  colorScale?: [low: string, high: string];
  onDepartmentClick?: (code: string, name: string) => void;
}

function interpolateColor(
  value: number,
  min: number,
  max: number,
  low: string,
  high: string
): string {
  if (max === min) return low;
  const t = (value - min) / (max - min);

  // Simple hex interpolation between two colors
  const parse = (hex: string) => ({
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  });

  const c0 = parse(low);
  const c1 = parse(high);
  const lerp = (a: number, b: number) => Math.round(a + (b - a) * t);
  const toHex = (n: number) => n.toString(16).padStart(2, "0");

  return `#${toHex(lerp(c0.r, c1.r))}${toHex(lerp(c0.g, c1.g))}${toHex(
    lerp(c0.b, c1.b)
  )}`;
}

export function FranceMap({
  data,
  unit = "%",
  colorScale = ["#e8edff", "#003189"],
  onDepartmentClick,
}: FranceMapProps) {
  const [tooltip, setTooltip] = useState<{
    name: string;
    code: string;
    value: number | null;
    x: number;
    y: number;
  } | null>(null);

  const byCode = new Map(data.map((d) => [d.code, d.value]));
  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);

  return (
    <div className="relative select-none">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 2600, center: [2.5, 46.5] }}
        width={700}
        height={600}
        style={{ width: "100%", height: "auto" }}
      >
        <ZoomableGroup zoom={1} minZoom={0.8} maxZoom={4}>
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const code: string = geo.properties.code;
                const name: string = geo.properties.nom;
                const value = byCode.get(code) ?? null;

                const fill =
                  value !== null
                    ? interpolateColor(value, min, max, colorScale[0], colorScale[1])
                    : "#f3f4f6";

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fill}
                    stroke="#ffffff"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: "none" },
                      hover: { fill: "#e1000f", outline: "none", cursor: "pointer" },
                      pressed: { outline: "none" },
                    }}
                    onMouseEnter={(evt) => {
                      setTooltip({
                        name,
                        code,
                        value,
                        x: evt.clientX,
                        y: evt.clientY,
                      });
                    }}
                    onMouseLeave={() => setTooltip(null)}
                    onClick={() => onDepartmentClick?.(code, name)}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {/* Floating tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none bg-white border border-dsfr-grey-border rounded shadow-md px-3 py-2 text-xs"
          style={{ left: tooltip.x + 12, top: tooltip.y - 30 }}
        >
          <p className="font-semibold">{tooltip.name}</p>
          <p className="text-gray-500">
            {tooltip.value !== null
              ? formatValue(tooltip.value, unit)
              : "Donnée indisponible"}
          </p>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
        <span>{min.toFixed(1)} {unit}</span>
        <div
          className="h-2 flex-1 rounded"
          style={{
            background: `linear-gradient(to right, ${colorScale[0]}, ${colorScale[1]})`,
          }}
        />
        <span>{max.toFixed(1)} {unit}</span>
      </div>
    </div>
  );
}
