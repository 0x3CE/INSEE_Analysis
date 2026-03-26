// ─── Unified chart data point (all API responses normalize to this) ──────────
export interface DataPoint {
  date: string;   // ISO date string "YYYY-MM-DD" or period "YYYY-QX" / "YYYY"
  value: number;
  label: string;  // Human-readable series name
}

// ─── Department / region ─────────────────────────────────────────────────────
export interface Department {
  code: string;   // e.g. "75", "69", "2A"
  name: string;
  region: string;
  value?: number; // Mapped indicator value for choropleth
}

// ─── API responses ────────────────────────────────────────────────────────────
export interface DBnomicsSeries {
  provider_code: string;
  dataset_code: string;
  series_code: string;
  series_name: string;
  period: string[];
  value: (number | null)[];
}

export interface DBnomicsResponse {
  series: {
    docs: DBnomicsSeries[];
  };
}

export interface DataGouvDataset {
  id: string;
  title: string;
  description: string;
  resources: DataGouvResource[];
}

export interface DataGouvResource {
  id: string;
  title: string;
  url: string;
  format: string;
  last_modified: string;
}

// ─── Module-level indicator definitions ──────────────────────────────────────
export type CategoryModule = "economy" | "health" | "social" | "investment";

export interface Indicator {
  id: string;
  label: string;
  unit: string;
  source: "dbnomics" | "insee" | "datagouv" | "entreprises";
  seriesId?: string; // DBnomics series identifier
}

// ─── Comparison mode ──────────────────────────────────────────────────────────
export interface ComparisonState {
  deptA: Department | null;
  deptB: Department | null;
}

// ─── Export ───────────────────────────────────────────────────────────────────
export type ExportFormat = "png" | "csv";
