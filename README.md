# Observatoire National

A high-end, open-data visualization platform aggregating French national statistics across Economy, Health, Social, and Investment domains.

## Architecture

```
observatoire-national/
├── src/
│   ├── app/                        # Next.js App Router pages
│   │   ├── layout.tsx              # Root layout with sidebar
│   │   ├── page.tsx                # Homepage redirect
│   │   ├── economy/page.tsx        # Economy & unemployment dashboard
│   │   ├── health/page.tsx         # Health indicators dashboard
│   │   ├── social/page.tsx         # Poverty & RSA dashboard
│   │   └── investment/page.tsx     # France Relance & investment dashboard
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx         # Navigation sidebar
│   │   │   └── Header.tsx          # Top bar with search & export
│   │   ├── charts/
│   │   │   ├── LineChart.tsx       # Recharts line chart wrapper
│   │   │   ├── BarChart.tsx        # Recharts bar chart wrapper
│   │   │   └── ChartSkeleton.tsx   # Skeleton loader for charts
│   │   ├── map/
│   │   │   └── FranceMap.tsx       # Department choropleth map
│   │   └── shared/
│   │       ├── StatCard.tsx        # KPI summary card
│   │       ├── ComparePanel.tsx    # Side-by-side department comparison
│   │       └── ExportButton.tsx    # PNG / CSV export
│   │
│   ├── services/                   # API client layer (one file per source)
│   │   ├── dbnomics.client.ts      # DBnomics time-series API
│   │   ├── insee.client.ts         # INSEE SNDI / Sirene API
│   │   ├── datagouv.client.ts      # data.gouv.fr datasets API
│   │   └── entreprises.client.ts   # API Recherche Entreprises
│   │
│   ├── lib/
│   │   ├── transformers.ts         # Unified { date, value, label } converter
│   │   ├── queryClient.ts          # TanStack Query client singleton
│   │   └── utils.ts                # cn(), formatters, constants
│   │
│   └── types/
│       └── index.ts                # Shared TypeScript types
│
├── .env.local.example
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

## Data Sources

| Source | Usage | Auth |
|---|---|---|
| [DBnomics](https://db.nomics.world/) | GDP, unemployment time series | None (public) |
| [INSEE SNDI](https://api.insee.fr/) | Demographics, economic indicators | API key |
| [data.gouv.fr](https://www.data.gouv.fr/api/1/) | Health, environment datasets | API key (optional) |
| [API Entreprises](https://recherche-entreprises.api.gouv.fr/) | Business, investment data | None (public) |

## Getting Started

```bash
# Install dependencies
npm install

# Copy env template
cp .env.local.example .env.local
# Fill in your API keys

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Key Design Decisions

- **ISR (Incremental Static Regeneration)**: All data-fetching pages use `revalidate` to cache API responses server-side, preventing rate-limit issues.
- **Unified transformer**: All API responses are normalized to `DataPoint[]` before reaching charts, decoupling data sources from UI.
- **DSFR-inspired design**: Governmental blue palette, high contrast, accessible typography — no dark/neon aesthetics.
- **Skeleton-first loading**: Every chart renders a skeleton while data loads; no layout shift.
