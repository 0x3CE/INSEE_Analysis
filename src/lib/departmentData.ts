/**
 * Centralized department-level static data.
 * All data is keyed by department code (string).
 *
 * Sources :
 *  - Chômage     : INSEE, taux de chômage localisés BIT — T4 2025 (prov.)
 *  - Pauvreté    : INSEE, FiLoSoFi 2021 — seuil 60 % du niveau de vie médian
 *  - Médecins    : DREES, Atlas de la démographie médicale 2023 — pour 100 000 hab.
 */

export interface DeptValue {
  code: string;
  value: number;
}

// ─── Noms des départements ────────────────────────────────────────────────────
export const DEPT_NAMES: Record<string, string> = {
  "01": "Ain", "02": "Aisne", "03": "Allier", "04": "Alpes-de-Haute-Provence",
  "05": "Hautes-Alpes", "06": "Alpes-Maritimes", "07": "Ardèche", "08": "Ardennes",
  "09": "Ariège", "10": "Aube", "11": "Aude", "12": "Aveyron",
  "13": "Bouches-du-Rhône", "14": "Calvados", "15": "Cantal", "16": "Charente",
  "17": "Charente-Maritime", "18": "Cher", "19": "Corrèze",
  "2A": "Corse-du-Sud", "2B": "Haute-Corse",
  "21": "Côte-d'Or", "22": "Côtes-d'Armor", "23": "Creuse",
  "24": "Dordogne", "25": "Doubs", "26": "Drôme", "27": "Eure",
  "28": "Eure-et-Loir", "29": "Finistère", "30": "Gard", "31": "Haute-Garonne",
  "32": "Gers", "33": "Gironde", "34": "Hérault", "35": "Ille-et-Vilaine",
  "36": "Indre", "37": "Indre-et-Loire", "38": "Isère", "39": "Jura",
  "40": "Landes", "41": "Loir-et-Cher", "42": "Loire", "43": "Haute-Loire",
  "44": "Loire-Atlantique", "45": "Loiret", "46": "Lot", "47": "Lot-et-Garonne",
  "48": "Lozère", "49": "Maine-et-Loire", "50": "Manche", "51": "Marne",
  "52": "Haute-Marne", "53": "Mayenne", "54": "Meurthe-et-Moselle", "55": "Meuse",
  "56": "Morbihan", "57": "Moselle", "58": "Nièvre", "59": "Nord",
  "60": "Oise", "61": "Orne", "62": "Pas-de-Calais", "63": "Puy-de-Dôme",
  "64": "Pyrénées-Atlantiques", "65": "Hautes-Pyrénées", "66": "Pyrénées-Orientales",
  "67": "Bas-Rhin", "68": "Haut-Rhin", "69": "Rhône", "70": "Haute-Saône",
  "71": "Saône-et-Loire", "72": "Sarthe", "73": "Savoie", "74": "Haute-Savoie",
  "75": "Paris", "76": "Seine-Maritime", "77": "Seine-et-Marne", "78": "Yvelines",
  "79": "Deux-Sèvres", "80": "Somme", "81": "Tarn", "82": "Tarn-et-Garonne",
  "83": "Var", "84": "Vaucluse", "85": "Vendée", "86": "Vienne",
  "87": "Haute-Vienne", "88": "Vosges", "89": "Yonne", "90": "Territoire de Belfort",
  "91": "Essonne", "92": "Hauts-de-Seine", "93": "Seine-Saint-Denis",
  "94": "Val-de-Marne", "95": "Val-d'Oise",
  "971": "Guadeloupe", "972": "Martinique", "973": "Guyane",
  "974": "La Réunion", "976": "Mayotte",
};

// ─── Taux de chômage — INSEE, BIT, T4 2025 (provisoire) ─────────────────────
export const DEPT_UNEMPLOYMENT: DeptValue[] = [
  { code: "01", value: 5.8 },  { code: "02", value: 10.6 }, { code: "03", value: 8.2 },
  { code: "04", value: 8.2 },  { code: "05", value: 6.5 },  { code: "06", value: 7.2 },
  { code: "07", value: 8.0 },  { code: "08", value: 10.1 }, { code: "09", value: 9.4 },
  { code: "10", value: 9.6 },  { code: "11", value: 10.8 }, { code: "12", value: 5.8 },
  { code: "13", value: 9.0 },  { code: "14", value: 7.1 },  { code: "15", value: 4.6 },
  { code: "16", value: 7.9 },  { code: "17", value: 7.4 },  { code: "18", value: 7.6 },
  { code: "19", value: 6.0 },  { code: "2A", value: 6.5 },  { code: "2B", value: 7.1 },
  { code: "21", value: 6.3 },  { code: "22", value: 6.4 },  { code: "23", value: 6.9 },
  { code: "24", value: 7.5 },  { code: "25", value: 7.7 },  { code: "26", value: 8.1 },
  { code: "27", value: 7.4 },  { code: "28", value: 7.2 },  { code: "29", value: 6.7 },
  { code: "30", value: 10.3 }, { code: "31", value: 8.7 },  { code: "32", value: 6.1 },
  { code: "33", value: 7.6 },  { code: "34", value: 10.8 }, { code: "35", value: 6.4 },
  { code: "36", value: 7.2 },  { code: "37", value: 7.1 },  { code: "38", value: 6.5 },
  { code: "39", value: 5.8 },  { code: "40", value: 7.0 },  { code: "41", value: 6.6 },
  { code: "42", value: 8.1 },  { code: "43", value: 5.8 },  { code: "44", value: 6.2 },
  { code: "45", value: 8.0 },  { code: "46", value: 7.4 },  { code: "47", value: 7.9 },
  { code: "48", value: 4.8 },  { code: "49", value: 7.1 },  { code: "50", value: 5.5 },
  { code: "51", value: 7.6 },  { code: "52", value: 6.9 },  { code: "53", value: 5.7 },
  { code: "54", value: 7.1 },  { code: "55", value: 7.3 },  { code: "56", value: 6.0 },
  { code: "57", value: 7.3 },  { code: "58", value: 7.3 },  { code: "59", value: 10.3 },
  { code: "60", value: 8.0 },  { code: "61", value: 7.5 },  { code: "62", value: 9.0 },
  { code: "63", value: 6.9 },  { code: "64", value: 6.1 },  { code: "65", value: 8.0 },
  { code: "66", value: 12.7 }, { code: "67", value: 6.7 },  { code: "68", value: 7.3 },
  { code: "69", value: 7.3 },  { code: "70", value: 7.2 },  { code: "71", value: 7.0 },
  { code: "72", value: 7.8 },  { code: "73", value: 5.7 },  { code: "74", value: 5.7 },
  { code: "75", value: 6.1 },  { code: "76", value: 8.7 },  { code: "77", value: 7.4 },
  { code: "78", value: 7.2 },  { code: "79", value: 5.9 },  { code: "80", value: 8.7 },
  { code: "81", value: 8.5 },  { code: "82", value: 9.2 },  { code: "83", value: 7.7 },
  { code: "84", value: 10.4 }, { code: "85", value: 5.9 },  { code: "86", value: 6.9 },
  { code: "87", value: 7.3 },  { code: "88", value: 8.1 },  { code: "89", value: 7.9 },
  { code: "90", value: 9.5 },  { code: "91", value: 7.3 },  { code: "92", value: 6.8 },
  { code: "93", value: 10.8 }, { code: "94", value: 8.1 },  { code: "95", value: 8.8 },
  { code: "971", value: 17.2 }, { code: "972", value: 12.5 },
  { code: "973", value: 17.5 }, { code: "974", value: 16.4 },
];

// ─── Taux de pauvreté — INSEE FiLoSoFi 2021, seuil 60 % médian ──────────────
export const DEPT_POVERTY: DeptValue[] = [
  { code: "01", value: 10.8 }, { code: "02", value: 18.8 }, { code: "03", value: 16.2 },
  { code: "04", value: 17.1 }, { code: "05", value: 14.7 }, { code: "06", value: 16.4 },
  { code: "07", value: 14.9 }, { code: "08", value: 19.4 }, { code: "09", value: 19.0 },
  { code: "10", value: 16.9 }, { code: "11", value: 20.8 }, { code: "12", value: 14.5 },
  { code: "13", value: 18.5 }, { code: "14", value: 12.5 }, { code: "15", value: 14.2 },
  { code: "16", value: 15.1 }, { code: "17", value: 12.5 }, { code: "18", value: 14.7 },
  { code: "19", value: 13.7 }, { code: "2A", value: 15.8 }, { code: "2B", value: 20.2 },
  { code: "21", value: 11.8 }, { code: "22", value: 11.8 }, { code: "23", value: 19.2 },
  { code: "24", value: 16.6 }, { code: "25", value: 13.1 }, { code: "26", value: 14.8 },
  { code: "27", value: 12.7 }, { code: "28", value: 12.1 }, { code: "29", value: 10.8 },
  { code: "30", value: 20.0 }, { code: "31", value: 14.3 }, { code: "32", value: 15.3 },
  { code: "33", value: 12.8 }, { code: "34", value: 19.4 }, { code: "35", value: 10.8 },
  { code: "36", value: 15.4 }, { code: "37", value: 12.8 }, { code: "38", value: 11.8 },
  { code: "39", value: 11.8 }, { code: "40", value: 11.7 }, { code: "41", value: 13.2 },
  { code: "42", value: 15.8 }, { code: "43", value: 12.3 }, { code: "44", value: 10.5 },
  { code: "45", value: 13.9 }, { code: "46", value: 15.3 }, { code: "47", value: 17.7 },
  { code: "48", value: 15.5 }, { code: "49", value: 11.5 }, { code: "50", value: 11.7 },
  { code: "51", value: 15.0 }, { code: "52", value: 15.3 }, { code: "53", value: 11.5 },
  { code: "54", value: 15.3 }, { code: "55", value: 14.8 }, { code: "56", value: 11.1 },
  { code: "57", value: 15.9 }, { code: "58", value: 16.1 }, { code: "59", value: 19.5 },
  { code: "60", value: 13.4 }, { code: "61", value: 15.6 }, { code: "62", value: 18.4 },
  { code: "63", value: 13.9 }, { code: "64", value: 12.6 }, { code: "65", value: 16.0 },
  { code: "66", value: 21.2 }, { code: "67", value: 13.5 }, { code: "68", value: 13.7 },
  { code: "69", value: 14.8 }, { code: "70", value: 13.6 }, { code: "71", value: 13.3 },
  { code: "72", value: 13.5 }, { code: "73", value: 11.2 }, { code: "74", value: 9.5 },
  { code: "75", value: 15.6 }, { code: "76", value: 15.4 }, { code: "77", value: 12.4 },
  { code: "78", value: 10.5 }, { code: "79", value: 12.4 }, { code: "80", value: 16.4 },
  { code: "81", value: 15.7 }, { code: "82", value: 16.7 }, { code: "83", value: 15.6 },
  { code: "84", value: 19.9 }, { code: "85", value: 9.1 },  { code: "86", value: 14.7 },
  { code: "87", value: 16.1 }, { code: "88", value: 15.3 }, { code: "89", value: 14.9 },
  { code: "90", value: 16.3 }, { code: "91", value: 13.9 }, { code: "92", value: 12.4 },
  { code: "93", value: 28.4 }, { code: "94", value: 17.2 }, { code: "95", value: 17.7 },
  { code: "972", value: 26.8 }, { code: "974", value: 36.1 },
  { code: "971", value: 34.5 }, { code: "973", value: 53.0 }, { code: "976", value: 77.3 },
];

// ─── Densité médicale — DREES, Atlas démographie médicale 2023 ──────────────
export const DEPT_DOCTORS: DeptValue[] = [
  { code: "75", value: 580 }, { code: "92", value: 480 }, { code: "69", value: 340 },
  { code: "13", value: 310 }, { code: "34", value: 330 }, { code: "06", value: 390 },
  { code: "31", value: 320 }, { code: "67", value: 300 }, { code: "33", value: 295 },
  { code: "44", value: 270 }, { code: "59", value: 240 }, { code: "76", value: 230 },
  { code: "57", value: 220 }, { code: "35", value: 260 }, { code: "93", value: 195 },
  { code: "94", value: 350 }, { code: "38", value: 285 }, { code: "74", value: 270 },
  { code: "29", value: 245 }, { code: "56", value: 240 }, { code: "22", value: 230 },
  { code: "49", value: 255 }, { code: "85", value: 220 }, { code: "87", value: 260 },
  { code: "63", value: 290 }, { code: "2A", value: 200 }, { code: "2B", value: 190 },
  { code: "971", value: 180 }, { code: "972", value: 175 }, { code: "974", value: 160 },
  { code: "973", value: 145 }, { code: "01", value: 215 }, { code: "02", value: 185 },
  { code: "03", value: 195 }, { code: "04", value: 205 }, { code: "05", value: 210 },
  { code: "07", value: 205 }, { code: "08", value: 175 }, { code: "09", value: 190 },
  { code: "10", value: 185 }, { code: "11", value: 200 }, { code: "12", value: 195 },
  { code: "14", value: 245 }, { code: "15", value: 190 }, { code: "16", value: 205 },
  { code: "17", value: 230 }, { code: "18", value: 195 }, { code: "19", value: 215 },
  { code: "21", value: 255 }, { code: "23", value: 170 }, { code: "24", value: 210 },
  { code: "25", value: 230 }, { code: "26", value: 215 }, { code: "27", value: 185 },
  { code: "28", value: 195 }, { code: "30", value: 265 }, { code: "32", value: 210 },
  { code: "36", value: 180 }, { code: "37", value: 235 }, { code: "39", value: 210 },
  { code: "40", value: 220 }, { code: "41", value: 195 }, { code: "42", value: 225 },
  { code: "43", value: 195 }, { code: "45", value: 210 }, { code: "46", value: 200 },
  { code: "47", value: 210 }, { code: "48", value: 175 }, { code: "50", value: 210 },
  { code: "51", value: 235 }, { code: "52", value: 175 }, { code: "53", value: 195 },
  { code: "54", value: 265 }, { code: "55", value: 170 }, { code: "58", value: 185 },
  { code: "60", value: 195 }, { code: "61", value: 185 }, { code: "62", value: 200 },
  { code: "64", value: 285 }, { code: "65", value: 215 }, { code: "66", value: 280 },
  { code: "68", value: 250 }, { code: "70", value: 180 }, { code: "71", value: 210 },
  { code: "72", value: 220 }, { code: "73", value: 230 }, { code: "77", value: 200 },
  { code: "78", value: 270 }, { code: "79", value: 205 }, { code: "80", value: 195 },
  { code: "81", value: 215 }, { code: "82", value: 200 }, { code: "83", value: 265 },
  { code: "84", value: 255 }, { code: "86", value: 230 }, { code: "88", value: 185 },
  { code: "89", value: 195 }, { code: "90", value: 210 }, { code: "91", value: 240 },
  { code: "95", value: 215 },
];

/** Lookup value for a department code (returns undefined if not found). */
export function getDeptValue(data: DeptValue[], code: string): number | undefined {
  return data.find((d) => d.code === code)?.value;
}
