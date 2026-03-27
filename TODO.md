# Todo — Observatoire National

## En cours / À faire

- [x] **Module Social** — taux de pauvreté H/F, Gini, risque exclusion, carte par département
  - Eurostat: `ilc_li02` (pauvreté), `ilc_di12` (Gini), `ilc_peps01` (exclusion)
  - Carte statique INSEE FiLoSoFi 2021 (seuil 60% médian)

- [ ] **Mode Comparaison** — 2 départements côte à côte
  - Composant prévu : `src/components/shared/ComparePanel.tsx`

- [ ] **Carte chômage réelle** — remplacer `DEPT_UNEMPLOYMENT_MOCK` dans `src/app/economy/EconomyCharts.tsx` par vraies données INSEE par département

- [ ] **Barre de recherche globale** — activer la recherche dans `src/components/layout/Header.tsx` (le champ est déjà rendu, il faut brancher la navigation)

- [ ] **Menu mobile** — drawer Sidebar pour petits écrans (bouton `<Menu>` dans `Header.tsx` déjà présent mais non branché)

## Fait

- [x] Layout + Sidebar DSFR
- [x] Module Économie (chômage, PIB, inflation — DBnomics)
- [x] Module Investissement (FBCF, variation annuelle, entreprises par dept — API Entreprises live)
- [x] Module Santé (espérance de vie H/F, dépenses, mortalité, médecins — DBnomics Eurostat)
- [x] Composants : `TimeSeriesChart`, `MultiLineChart`, `BarChart`, `FranceMap`, `StatCard`, `ExportButton`
- [x] `parsePeriod()` — fix filtrage 5Y/10Y sur données trimestrielles/annuelles
