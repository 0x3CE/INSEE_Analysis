"use client";

import { useState, useMemo } from "react";
import { X, GitCompareArrows } from "lucide-react";
import { useUI } from "@/components/layout/UIContext";
import {
  DEPT_NAMES,
  DEPT_UNEMPLOYMENT,
  DEPT_POVERTY,
  DEPT_DOCTORS,
  getDeptValue,
} from "@/lib/departmentData";

const DEPT_OPTIONS = Object.entries(DEPT_NAMES)
  .map(([code, name]) => ({ code, name }))
  .sort((a, b) => a.name.localeCompare(b.name, "fr"));

interface Metric {
  label: string;
  unit: string;
  source: string;
  getValue: (code: string) => number | undefined;
  format?: (v: number) => string;
  better: "lower" | "higher";
}

const METRICS: Metric[] = [
  {
    label: "Taux de chômage",
    unit: "%",
    source: "INSEE BIT T4 2025",
    getValue: (code) => getDeptValue(DEPT_UNEMPLOYMENT, code),
    better: "lower",
  },
  {
    label: "Taux de pauvreté",
    unit: "%",
    source: "FiLoSoFi 2021",
    getValue: (code) => getDeptValue(DEPT_POVERTY, code),
    better: "lower",
  },
  {
    label: "Densité médicale",
    unit: "/ 100k hab.",
    source: "DREES 2023",
    getValue: (code) => getDeptValue(DEPT_DOCTORS, code),
    better: "higher",
  },
];

function DeptSelect({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full text-sm border border-dsfr-grey-border rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-dsfr-blue"
    >
      <option value="">{placeholder}</option>
      {DEPT_OPTIONS.map(({ code, name }) => (
        <option key={code} value={code}>
          {name} ({code})
        </option>
      ))}
    </select>
  );
}

export function ComparePanel() {
  const { isComparePanelOpen, closeComparePanel } = useUI();
  const [deptA, setDeptA] = useState("");
  const [deptB, setDeptB] = useState("");

  const rows = useMemo(() => {
    if (!deptA || !deptB) return [];
    return METRICS.map((m) => {
      const a = m.getValue(deptA);
      const b = m.getValue(deptB);
      return { ...m, a, b };
    });
  }, [deptA, deptB]);

  if (!isComparePanelOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-30 bg-black/30"
        onClick={closeComparePanel}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside className="fixed right-0 top-0 h-full w-full max-w-md z-40 bg-white shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-dsfr-grey-border">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <GitCompareArrows className="h-5 w-5 text-dsfr-blue" />
            Comparer deux départements
          </h2>
          <button
            onClick={closeComparePanel}
            className="p-1 rounded hover:bg-gray-100 text-gray-500"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Selectors */}
        <div className="grid grid-cols-2 gap-3 px-5 py-4 border-b border-dsfr-grey-border">
          <div>
            <p className="text-xs font-semibold text-dsfr-blue mb-1.5">Département A</p>
            <DeptSelect value={deptA} onChange={setDeptA} placeholder="Choisir…" />
          </div>
          <div>
            <p className="text-xs font-semibold text-orange-500 mb-1.5">Département B</p>
            <DeptSelect value={deptB} onChange={setDeptB} placeholder="Choisir…" />
          </div>
        </div>

        {/* Comparison table */}
        <div className="flex-1 overflow-auto px-5 py-4">
          {!deptA || !deptB ? (
            <p className="text-sm text-gray-400 text-center mt-8">
              Sélectionnez deux départements pour comparer leurs indicateurs.
            </p>
          ) : (
            <div className="space-y-3">
              {/* Column headers */}
              <div className="grid grid-cols-3 text-xs font-semibold text-gray-500 uppercase tracking-wide pb-1 border-b">
                <span>Indicateur</span>
                <span className="text-center text-dsfr-blue">{DEPT_NAMES[deptA] ?? deptA}</span>
                <span className="text-center text-orange-500">{DEPT_NAMES[deptB] ?? deptB}</span>
              </div>

              {rows.map((row) => {
                const aVal = row.a;
                const bVal = row.b;
                const aWins =
                  aVal !== undefined && bVal !== undefined
                    ? row.better === "lower"
                      ? aVal < bVal
                      : aVal > bVal
                    : false;
                const bWins =
                  aVal !== undefined && bVal !== undefined
                    ? row.better === "lower"
                      ? bVal < aVal
                      : bVal > aVal
                    : false;

                return (
                  <div
                    key={row.label}
                    className="grid grid-cols-3 items-center py-3 border-b border-gray-100"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800">{row.label}</p>
                      <p className="text-xs text-gray-400">{row.source}</p>
                    </div>
                    <div className="text-center">
                      {aVal !== undefined ? (
                        <span
                          className={`text-lg font-bold ${
                            aWins ? "text-green-600" : bWins ? "text-red-500" : "text-gray-700"
                          }`}
                        >
                          {aVal.toFixed(1)}
                          <span className="text-xs font-normal text-gray-400 ml-0.5">
                            {row.unit}
                          </span>
                        </span>
                      ) : (
                        <span className="text-gray-300 text-sm">n/d</span>
                      )}
                    </div>
                    <div className="text-center">
                      {bVal !== undefined ? (
                        <span
                          className={`text-lg font-bold ${
                            bWins ? "text-green-600" : aWins ? "text-red-500" : "text-gray-700"
                          }`}
                        >
                          {bVal.toFixed(1)}
                          <span className="text-xs font-normal text-gray-400 ml-0.5">
                            {row.unit}
                          </span>
                        </span>
                      ) : (
                        <span className="text-gray-300 text-sm">n/d</span>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Bar charts */}
              {rows.map((row) => {
                const aVal = row.a;
                const bVal = row.b;
                if (aVal === undefined || bVal === undefined) return null;
                const max = Math.max(aVal, bVal) * 1.1;
                return (
                  <div key={`bar-${row.label}`} className="pt-2 pb-1">
                    <p className="text-xs text-gray-500 mb-2">{row.label}</p>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs w-4 text-dsfr-blue font-semibold">A</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-3">
                          <div
                            className="bg-dsfr-blue h-3 rounded-full transition-all"
                            style={{ width: `${(aVal / max) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs w-12 text-right text-gray-600">
                          {aVal.toFixed(1)} {row.unit}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs w-4 text-orange-500 font-semibold">B</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-3">
                          <div
                            className="bg-orange-500 h-3 rounded-full transition-all"
                            style={{ width: `${(bVal / max) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs w-12 text-right text-gray-600">
                          {bVal.toFixed(1)} {row.unit}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-dsfr-grey-border bg-gray-50">
          <p className="text-xs text-gray-400">
            Vert = meilleure valeur · Rouge = moins favorable
          </p>
        </div>
      </aside>
    </>
  );
}
