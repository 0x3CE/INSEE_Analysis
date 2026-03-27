# Todo — Observatoire National

## Fait

- [x] Layout + Sidebar DSFR
- [x] Module Économie (chômage, PIB, inflation — DBnomics)
- [x] Module Investissement (FBCF, variation annuelle, entreprises par dept — API Entreprises live)
- [x] Module Santé (espérance de vie H/F, dépenses, mortalité, médecins — DBnomics Eurostat)
- [x] Composants : `TimeSeriesChart`, `MultiLineChart`, `BarChart`, `FranceMap`, `StatCard`, `ExportButton`
- [x] `parsePeriod()` — fix filtrage 5Y/10Y sur données trimestrielles/annuelles
- [x] Module Social — taux de pauvreté H/F, Gini, risque exclusion, carte par département
  - Eurostat: `ilc_li02` (pauvreté), `ilc_di12` (Gini), `ilc_peps01` (exclusion)
- [x] Données départementales complètes centralisées dans `src/lib/departmentData.ts`
  - Chômage : INSEE BIT T4 2025 — 99 départements (96 métro + 3 DOM)
  - Pauvreté : INSEE FiLoSoFi 2021 — 101 départements (96 métro + 5 DOM)
  - Densité médicale : DREES 2023 — couverture étendue
- [x] Carte chômage réelle — remplacé le mock dans `EconomyCharts` par les vraies données INSEE
- [x] Mode Comparaison — `ComparePanel` drawer droit, 2 départements, 3 indicateurs, barres comparatives
- [x] Barre de recherche globale — modules + indicateurs + départements, dropdown résultats
- [x] Menu mobile — drawer Sidebar animé, backdrop, bouton fermeture
