/**
 * Tarifs réglementés des annonces légales — 2026.
 * Source : arrêté du 19 novembre 2025 modifiant l'arrêté du 19 novembre 2021
 * (JO du 28 décembre 2025, applicable au 1er janvier 2026).
 *
 * Mise à jour annuelle : seul ce fichier est à modifier quand le nouvel arrêté paraît.
 * Tous les montants sont hors taxes, TVA 20 %.
 */

export const ANNEE_TARIFS = 2026
export const REFERENCE_ARRETE = 'Arrêté du 19 novembre 2025 (JO du 28 décembre 2025)'
export const TAUX_TVA = 0.2

/** Clés des forfaits, utilisées par les types d'annonce. */
export type CleForfait =
  | 'constitution-sa'
  | 'constitution-sas'
  | 'constitution-sasu'
  | 'constitution-snc'
  | 'constitution-sarl'
  | 'constitution-eurl'
  | 'constitution-societe-civile'
  | 'constitution-sci'
  | 'dissolution'
  | 'cloture-liquidation'
  | 'transfert-siege'
  | 'dirigeants'
  | 'commissaire-aux-comptes'
  | 'administrateur'
  | 'prorogation-duree'
  | 'objet-social'
  | 'capital-social'
  | 'transformation'
  | 'denomination'
  | 'cession-parts'
  | 'poursuite-activite-pertes'
  | 'nom-patronymique'

export interface Forfait {
  libelle: string
  /** France métropolitaine, DOM et collectivités hors La Réunion et Mayotte */
  france: number
  /** La Réunion (974) et Mayotte (976) */
  reunionMayotte: number
}

export const FORFAITS: Record<CleForfait, Forfait> = {
  'constitution-sa': { libelle: 'Société anonyme (SA)', france: 399, reunionMayotte: 466 },
  'constitution-sas': { libelle: 'Société par actions simplifiée (SAS)', france: 199, reunionMayotte: 233 },
  'constitution-sasu': { libelle: 'SAS unipersonnelle (SASU)', france: 142, reunionMayotte: 167 },
  'constitution-snc': { libelle: 'Société en nom collectif (SNC)', france: 220, reunionMayotte: 259 },
  'constitution-sarl': { libelle: 'Société à responsabilité limitée (SARL)', france: 148, reunionMayotte: 173 },
  'constitution-eurl': { libelle: 'SARL unipersonnelle (EURL)', france: 124, reunionMayotte: 147 },
  'constitution-societe-civile': {
    libelle: 'Société civile (hors sociétés civiles à objet immobilier)',
    france: 222,
    reunionMayotte: 263,
  },
  'constitution-sci': { libelle: 'Société civile à objet immobilier (SCI, SCCV)', france: 191, reunionMayotte: 223 },
  dissolution: { libelle: 'Dissolution (avec nomination du liquidateur)', france: 153, reunionMayotte: 181 },
  'cloture-liquidation': { libelle: 'Clôture de liquidation', france: 111, reunionMayotte: 129 },
  'transfert-siege': { libelle: 'Transfert de siège social', france: 109, reunionMayotte: 126 },
  dirigeants: { libelle: 'Nomination ou cessation de fonction des dirigeants', france: 109, reunionMayotte: 126 },
  'commissaire-aux-comptes': {
    libelle: 'Nomination ou cessation du commissaire aux comptes',
    france: 109,
    reunionMayotte: 126,
  },
  administrateur: { libelle: "Changement d'administrateur", france: 109, reunionMayotte: 126 },
  'prorogation-duree': { libelle: 'Prorogation ou modification de la durée', france: 109, reunionMayotte: 126 },
  'objet-social': { libelle: "Changement de l'objet social", france: 136, reunionMayotte: 158 },
  'capital-social': { libelle: 'Modification du capital social', france: 136, reunionMayotte: 158 },
  transformation: { libelle: 'Transformation de la forme juridique', france: 199, reunionMayotte: 229 },
  denomination: { libelle: 'Changement de dénomination sociale', france: 199, reunionMayotte: 229 },
  'cession-parts': { libelle: "Cession de parts sociales / mouvement d'associés", france: 199, reunionMayotte: 229 },
  'poursuite-activite-pertes': { libelle: "Poursuite d'activité malgré les pertes", france: 83, reunionMayotte: 93 },
  'nom-patronymique': { libelle: 'Changement de nom patronymique', france: 58, reunionMayotte: 58 },
}

/** Tarif au caractère (espaces comprises), par annexe de l'arrêté. */
export type Annexe = 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI' | 'VII'

export const TARIF_CARACTERE: Record<Annexe, number> = {
  I: 0.189,
  II: 0.195,
  III: 0.206,
  IV: 0.227,
  V: 0.239,
  VI: 0.185,
  VII: 0.21,
}

export const DESCRIPTION_ANNEXES: Record<Annexe, string> = {
  I: 'Tous les autres départements de métropole, Corse, Polynésie française, Nouvelle-Calédonie, Saint-Pierre-et-Miquelon',
  II: 'Aisne, Ardèche, Ardennes, Drôme, Isère, Oise, Rhône, Somme, Yonne',
  III: 'Eure, Seine-Maritime',
  IV: "Nord, Pas-de-Calais, Seine-et-Marne, Yvelines, Essonne, Val-d'Oise",
  V: 'Paris, Hauts-de-Seine, Seine-Saint-Denis, Val-de-Marne',
  VI: 'Guadeloupe, Martinique, Guyane, Saint-Barthélemy, Saint-Martin, Wallis-et-Futuna',
  VII: 'La Réunion, Mayotte',
}

const ANNEXE_PAR_DEPARTEMENT: Record<string, Annexe> = {
  '02': 'II', '07': 'II', '08': 'II', '26': 'II', '38': 'II', '60': 'II', '69': 'II', '80': 'II', '89': 'II',
  '27': 'III', '76': 'III',
  '59': 'IV', '62': 'IV', '77': 'IV', '78': 'IV', '91': 'IV', '95': 'IV',
  '75': 'V', '92': 'V', '93': 'V', '94': 'V',
  '971': 'VI', '972': 'VI', '973': 'VI', '977': 'VI', '978': 'VI', '986': 'VI',
  '974': 'VII', '976': 'VII',
}

/** Annexe tarifaire d'un département (code « 75 », « 2A », « 974 »…). */
export function annexeDuDepartement(departement: string): Annexe {
  return ANNEXE_PAR_DEPARTEMENT[departement] ?? 'I'
}

export function estReunionOuMayotte(departement: string): boolean {
  return departement === '974' || departement === '976'
}
