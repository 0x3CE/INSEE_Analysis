"use client";

/**
 * IndicatorTooltip — bulle d'explication pédagogique.
 *
 * Affiche un bouton "?" accessible qui ouvre une popover au clic ou au focus.
 * Usage :
 *   <IndicatorTooltip id="chomage-bit" content={TOOLTIPS.chomage} />
 */

import { useState, useRef, useEffect } from "react";
import { Info } from "lucide-react";

interface IndicatorTooltipProps {
  /** Identifiant unique pour aria-describedby */
  id: string;
  content: string | React.ReactNode;
}

export function IndicatorTooltip({ id, content }: IndicatorTooltipProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const popoverId = `tooltip-${id}`;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handle(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="En savoir plus sur cet indicateur"
        aria-expanded={open}
        aria-controls={popoverId}
        className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-gray-200 text-gray-500 hover:bg-dsfr-blue hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-dsfr-blue"
      >
        <Info className="h-2.5 w-2.5" aria-hidden="true" />
      </button>

      {open && (
        <div
          id={popoverId}
          role="tooltip"
          className="absolute left-0 top-6 z-50 w-72 bg-white border border-dsfr-grey-border rounded-lg shadow-lg p-3 text-xs text-gray-700 leading-relaxed"
        >
          <div className="absolute -top-1.5 left-2 w-3 h-3 bg-white border-l border-t border-dsfr-grey-border rotate-45" aria-hidden="true" />
          {content}
        </div>
      )}
    </div>
  );
}

// ─── Contenu pédagogique des indicateurs ──────────────────────────────────────
export const INDICATOR_TOOLTIPS = {
  chomageBIT: (
    <div className="space-y-1.5">
      <p className="font-semibold text-gray-800">Chômage au sens du BIT</p>
      <p>
        Le BIT (Bureau International du Travail) comptabilise les personnes{" "}
        <strong>sans emploi, disponibles et ayant activement recherché</strong> un
        emploi dans les 4 semaines précédentes.
      </p>
      <p className="text-gray-500">
        ≠ Inscrits à France Travail (ex-Pôle Emploi) : inclut des personnes en
        activité réduite et exclut certains non-inscrits en recherche d&apos;emploi.
        Le taux BIT est plus faible et plus comparable internationalement.
      </p>
    </div>
  ),

  ipcEnsemble: (
    <div className="space-y-1.5">
      <p className="font-semibold text-gray-800">IPC — Indice des Prix à la Consommation</p>
      <p>
        Mesure l&apos;évolution du niveau général des prix pour les ménages
        français. Exprimé ici en <strong>glissement annuel</strong> (variation
        sur 12 mois).
      </p>
      <p className="text-gray-500">
        ≠ IPCH (Eurostat) : l&apos;IPC national exclut certains postes (ex :
        assurances vies) inclus dans l&apos;IPCH harmonisé européen.
      </p>
    </div>
  ),

  ipcEnergie: (
    <div className="space-y-1.5">
      <p className="font-semibold text-gray-800">IPC Énergie</p>
      <p>
        Composante énergétique de l&apos;IPC : carburants, gaz, électricité,
        fioul. Très volatile car directement liée aux cours du pétrole et du gaz.
      </p>
      <p className="text-gray-500">
        En 2022, la composante énergie a contribué à plus de la moitié de
        l&apos;inflation totale.
      </p>
    </div>
  ),

  creationsEntreprises: (
    <div className="space-y-1.5">
      <p className="font-semibold text-gray-800">Créations totales d&apos;entreprises</p>
      <p>
        Inclut toutes les nouvelles immatriculations : entreprises classiques{" "}
        <strong>et micro-entrepreneurs</strong>. Depuis 2015, ces derniers
        représentent plus de 60 % des créations.
      </p>
      <p className="text-gray-500">
        Un pic de créations ne reflète pas nécessairement une hausse de
        l&apos;activité économique réelle — beaucoup de micro-entreprises
        restent dormantes ou très petites.
      </p>
    </div>
  ),

  pibVariation: (
    <div className="space-y-1.5">
      <p className="font-semibold text-gray-800">PIB en volume — variation trimestrielle</p>
      <p>
        Mesure la croissance économique d&apos;un trimestre à l&apos;autre,{" "}
        <strong>corrigée de l&apos;inflation</strong> (volume chaîné).
      </p>
      <p className="text-gray-500">
        La variation trimestrielle peut être trompeuse isolément : deux
        trimestres consécutifs négatifs définissent une <em>récession technique</em>.
      </p>
    </div>
  ),

  inflationVsChomage: (
    <div className="space-y-1.5">
      <p className="font-semibold text-gray-800">Courbe de Phillips</p>
      <p>
        La relation inverse entre inflation et chômage, décrite par A.W.
        Phillips en 1958, suggère qu&apos;une faible inflation coïncide avec un
        chômage élevé (et vice-versa).
      </p>
      <p className="text-gray-500">
        Cette relation s&apos;est montrée instable depuis les années 1970
        (stagflation) et 2020 (faible chômage mais forte inflation d&apos;offre).
      </p>
    </div>
  ),
};
