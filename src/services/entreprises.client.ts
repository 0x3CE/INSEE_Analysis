/**
 * API Recherche Entreprises Client
 * Public API — no key required.
 * Docs: https://recherche-entreprises.api.gouv.fr/docs/
 */

const BASE_URL = "https://recherche-entreprises.api.gouv.fr";

export interface Entreprise {
  siren: string;
  nom_complet: string;
  siege: {
    siret: string;
    code_postal: string;
    departement: string;
    region: string;
    commune: string;
    latitude: number | null;
    longitude: number | null;
  };
  activite_principale: string;
  tranche_effectif_salarie: string | null;
  date_creation: string;
}

interface SearchResult {
  results: Entreprise[];
  total_results: number;
  page: number;
  per_page: number;
}

export const EntreprisesClient = {
  /**
   * Search companies by name and optional department filter.
   */
  async search(
    query: string,
    departement?: string,
    page = 1,
    perPage = 25
  ): Promise<SearchResult> {
    const params = new URLSearchParams({
      q: query,
      page: String(page),
      per_page: String(perPage),
    });
    if (departement) params.set("departement", departement);

    const url = `${BASE_URL}/search?${params}`;
    const res = await fetch(url, {
      next: { revalidate: Number(process.env.REVALIDATE_SECONDS ?? 3600) },
    });
    if (!res.ok) throw new Error(`Entreprises API failed [${res.status}]`);
    return res.json() as Promise<SearchResult>;
  },

  /**
   * Count total registered companies per department.
   * Returns a map of departement code → count.
   */
  async countByDepartement(
    departments: string[]
  ): Promise<Record<string, number>> {
    const counts: Record<string, number> = {};

    await Promise.all(
      departments.map(async (dept) => {
        try {
          const url = `${BASE_URL}/search?departement=${dept}&per_page=1`;
          const res = await fetch(url, {
            next: { revalidate: Number(process.env.REVALIDATE_SECONDS ?? 3600) },
          });
          if (!res.ok) return;
          const json: SearchResult = await res.json();
          counts[dept] = json.total_results;
        } catch {
          counts[dept] = 0;
        }
      })
    );

    return counts;
  },
};
