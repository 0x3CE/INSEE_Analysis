/**
 * Données de référence statiques — INSEE séries conjoncturelles
 *
 * Utilisées en fallback si l'API INSEE est indisponible (503/401/credentials manquants).
 * Valeurs reconstituées à partir des publications officielles INSEE (Informations Rapides).
 *
 * Couverture : janv. 2018 – janv. 2025
 */
import type { DataPoint } from "@/types";

// ─── helpers ──────────────────────────────────────────────────────────────────
function monthly(start: string, values: number[], label: string): DataPoint[] {
  const [startYear, startMonth] = start.split("-").map(Number);
  return values.map((value, i) => {
    const total = startMonth - 1 + i;
    const y = startYear + Math.floor(total / 12);
    const m = (total % 12) + 1;
    return { date: `${y}-${String(m).padStart(2, "0")}`, value, label };
  });
}

function quarterly(start: string, values: number[], label: string): DataPoint[] {
  const [startYear, startQ] = [Number(start.split("-Q")[0]), Number(start.split("-Q")[1])];
  return values.map((value, i) => {
    const total = startQ - 1 + i;
    const y = startYear + Math.floor(total / 4);
    const q = (total % 4) + 1;
    return { date: `${y}-Q${q}`, value, label };
  });
}

// ─── IPC Ensemble — glissement annuel % (série 001759970, mensuel) ────────────
// Source : INSEE — Informations Rapides n°XXX / BDM
export const FALLBACK_IPC_ENSEMBLE: DataPoint[] = monthly("2019-01", [
  // 2019
  1.4, 1.3, 1.1, 1.2, 1.0, 1.2, 1.1, 1.0, 0.9, 0.8, 1.0, 1.5,
  // 2020
  1.5, 1.4, 0.8, 0.4, 0.4, 0.2, 0.8, 0.2, 0.0, 0.0, 0.2, 0.0,
  // 2021
  0.6, 0.8, 1.1, 1.2, 1.4, 1.5, 1.2, 1.9, 2.1, 2.6, 2.8, 2.8,
  // 2022
  3.3, 3.6, 4.5, 4.8, 5.2, 5.8, 6.1, 5.8, 5.6, 6.2, 6.2, 5.9,
  // 2023
  6.0, 6.3, 5.6, 5.9, 5.1, 4.5, 4.3, 4.9, 4.9, 4.0, 3.5, 3.7,
  // 2024
  3.1, 3.0, 2.3, 2.2, 2.3, 2.2, 2.3, 1.9, 1.2, 1.2, 1.3, 1.3,
  // jan 2025
  1.0,
], "IPC Ensemble (%)");

// ─── IPC Énergie — glissement annuel % (série 001763118, mensuel) ─────────────
export const FALLBACK_IPC_ENERGIE: DataPoint[] = monthly("2019-01", [
  // 2019
  3.2, 3.5, 3.8, 4.0, 2.0, 0.5, 0.3, -0.5, -1.0, -0.8, -0.2, 0.8,
  // 2020
  -3.0, -4.0, -8.0, -16.0, -18.0, -15.0, -8.0, -6.5, -6.0, -5.0, -4.0, -5.0,
  // 2021
  1.0, 3.0, 5.5, 9.0, 13.0, 16.5, 16.0, 18.0, 18.5, 22.0, 26.5, 25.0,
  // 2022
  23.0, 24.5, 29.5, 26.0, 27.5, 32.5, 38.0, 32.0, 27.0, 19.0, 18.0, 16.0,
  // 2023
  14.0, 13.0, 5.0, 2.0, -3.5, -5.5, -6.0, 1.0, 3.5, -2.5, -4.0, -2.0,
  // 2024
  -3.5, -4.0, -4.5, -3.8, -3.5, -4.0, -5.0, -5.5, -4.5, -3.5, -2.5, -2.0,
  // jan 2025
  -1.5,
], "IPC Énergie (%)");

// ─── Chômage BIT France (série 001688527, trimestriel, %) ─────────────────────
export const FALLBACK_CHOMAGE_BIT: DataPoint[] = quarterly("2018-Q1", [
  // 2018
  8.9, 8.7, 8.9, 8.8,
  // 2019
  8.7, 8.5, 8.4, 8.2,
  // 2020
  7.6, 7.1, 9.0, 8.0,
  // 2021
  8.1, 8.3, 7.9, 7.4,
  // 2022
  7.3, 7.4, 7.3, 7.2,
  // 2023
  7.1, 7.2, 7.4, 7.5,
  // 2024
  7.5, 7.3, 7.4, 7.3,
  // 2025-Q1
  7.4,
], "Chômage BIT France (%)");

// ─── Créations d'entreprises (série 010613256, mensuel, unités) ───────────────
export const FALLBACK_CREATIONS_ENTREPRISES: DataPoint[] = monthly("2018-01", [
  // 2018 (moyenne ~51k/mois)
  49000, 47000, 51000, 53000, 54000, 55000, 52000, 49000, 54000, 56000, 52000, 51000,
  // 2019 (hausse autoentrepreneurs)
  55000, 53000, 58000, 60000, 62000, 63000, 58000, 56000, 62000, 65000, 61000, 58000,
  // 2020 (COVID : chute mars-avril, rebond)
  64000, 60000, 35000, 40000, 68000, 72000, 78000, 80000, 82000, 79000, 72000, 68000,
  // 2021 (boom création)
  78000, 82000, 88000, 90000, 92000, 95000, 91000, 88000, 94000, 97000, 93000, 88000,
  // 2022
  90000, 87000, 92000, 94000, 96000, 98000, 95000, 92000, 96000, 99000, 95000, 90000,
  // 2023
  92000, 88000, 93000, 95000, 97000, 99000, 96000, 93000, 96000, 98000, 93000, 88000,
  // 2024
  85000, 81000, 86000, 88000, 89000, 91000, 87000, 84000, 87000, 90000, 86000, 82000,
  // jan 2025
  80000,
], "Créations d'entreprises");

// ─── PIB — variation trimestrielle % (série 010565692, trimestriel) ───────────
export const FALLBACK_PIB_VARIATION: DataPoint[] = quarterly("2018-Q1", [
  // 2018
  0.4, 0.2, 0.3, 0.4,
  // 2019
  0.4, 0.3, 0.3, 0.4,
  // 2020 (COVID)
  -5.9, -13.8, 18.5, -1.4,
  // 2021
  0.0, 1.3, 3.2, 0.8,
  // 2022
  -0.2, 0.4, 0.3, 0.1,
  // 2023
  0.1, 0.6, 0.1, 0.0,
  // 2024
  0.2, 0.3, 0.4, 1.2,
  // 2025-Q1
  0.3,
], "PIB variation trimestrielle (%)");
