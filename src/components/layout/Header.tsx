"use client";

import { Search, Menu } from "lucide-react";
import { useState } from "react";

export function Header() {
  const [query, setQuery] = useState("");

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-dsfr-grey-border px-6 py-3 flex items-center gap-4">
      {/* Mobile menu button — wired to a drawer in a real impl */}
      <button className="md:hidden p-1 text-gray-600 hover:text-gray-900">
        <Menu className="h-5 w-5" />
      </button>

      {/* Search bar */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        <input
          type="search"
          placeholder="Rechercher un département, une métrique…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm border border-dsfr-grey-border rounded-md bg-dsfr-grey-light focus:outline-none focus:ring-2 focus:ring-dsfr-blue focus:border-transparent"
        />
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Data freshness badge */}
      <span className="hidden sm:inline-flex items-center text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
        Données publiques françaises
      </span>
    </header>
  );
}
