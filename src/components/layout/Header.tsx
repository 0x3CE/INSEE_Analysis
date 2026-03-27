"use client";

import { Search, Menu, GitCompareArrows } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useUI } from "@/components/layout/UIContext";
import { DEPT_NAMES } from "@/lib/departmentData";

interface SearchItem {
  label: string;
  sub?: string;
  href: string;
}

const STATIC_ITEMS: SearchItem[] = [
  { label: "Économie", sub: "Chômage, PIB, Inflation", href: "/economy" },
  { label: "Santé", sub: "Espérance de vie, Médecins, Dépenses", href: "/health" },
  { label: "Social", sub: "Pauvreté, Gini, Exclusion", href: "/social" },
  { label: "Investissement", sub: "FBCF, Entreprises", href: "/investment" },
  { label: "Taux de chômage", sub: "Économie", href: "/economy" },
  { label: "PIB France", sub: "Économie", href: "/economy" },
  { label: "Inflation IPCH", sub: "Économie", href: "/economy" },
  { label: "Espérance de vie", sub: "Santé", href: "/health" },
  { label: "Dépenses de santé", sub: "Santé", href: "/health" },
  { label: "Coefficient de Gini", sub: "Social", href: "/social" },
  { label: "Taux de pauvreté", sub: "Social", href: "/social" },
  { label: "FBCF", sub: "Investissement", href: "/investment" },
];

// Département items (first 20 alphabetically, to keep the list manageable)
const DEPT_ITEMS: SearchItem[] = Object.entries(DEPT_NAMES)
  .sort((a, b) => a[1].localeCompare(b[1], "fr"))
  .map(([code, name]) => ({
    label: name,
    sub: `Département ${code}`,
    href: "/economy",
  }));

const ALL_ITEMS = [...STATIC_ITEMS, ...DEPT_ITEMS];

export function Header() {
  const { toggleMobileMenu, toggleComparePanel } = useUI();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const results = query.trim().length >= 2
    ? ALL_ITEMS.filter((item) =>
        item.label.toLowerCase().includes(query.toLowerCase()) ||
        item.sub?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : [];

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-dsfr-grey-border px-4 sm:px-6 py-3 flex items-center gap-3">
      {/* Mobile menu button */}
      <button
        onClick={toggleMobileMenu}
        className="md:hidden p-1 text-gray-600 hover:text-gray-900 shrink-0"
        aria-label="Menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Search bar */}
      <div ref={wrapperRef} className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        <input
          type="search"
          placeholder="Rechercher un département, une métrique…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          className="w-full pl-9 pr-4 py-2 text-sm border border-dsfr-grey-border rounded-md bg-dsfr-grey-light focus:outline-none focus:ring-2 focus:ring-dsfr-blue focus:border-transparent"
        />

        {/* Dropdown results */}
        {open && results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-dsfr-grey-border rounded-md shadow-lg overflow-hidden z-50">
            {results.map((item, i) => (
              <Link
                key={i}
                href={item.href}
                onClick={() => {
                  setQuery("");
                  setOpen(false);
                }}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-dsfr-grey-light transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">{item.label}</p>
                  {item.sub && (
                    <p className="text-xs text-gray-400">{item.sub}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {open && query.trim().length >= 2 && results.length === 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-dsfr-grey-border rounded-md shadow-lg px-4 py-3 z-50">
            <p className="text-sm text-gray-400">Aucun résultat pour &quot;{query}&quot;</p>
          </div>
        )}
      </div>

      <div className="flex-1" />

      {/* Compare button */}
      <button
        onClick={toggleComparePanel}
        className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-dsfr-blue border border-dsfr-blue/40 rounded-md px-3 py-1.5 hover:bg-blue-50 transition-colors shrink-0"
      >
        <GitCompareArrows className="h-4 w-4" />
        Comparer
      </button>

      {/* Data freshness badge */}
      <span className="hidden lg:inline-flex items-center text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full shrink-0">
        Données publiques françaises
      </span>
    </header>
  );
}
