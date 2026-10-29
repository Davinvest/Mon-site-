import { FORFAITS, TARIF_CARACTERE, TAUX_TVA, annexeDuDepartement, estReunionOuMayotte } from '@/data/tarifs-annonces'
import type { Annexe } from '@/data/tarifs-annonces'
import type { TypeAnnonce } from '@/data/annonces'

export interface DetailPrix {
  mode: 'forfait' | 'caractere'
  ht: number
  tva: number
  ttc: number
  /** Renseignés pour le tarif au caractère */
  caracteres?: number
  tarifCaractere?: number
  annexe?: Annexe
}

const arrondi = (n: number) => Math.round(n * 100) / 100

/** Texte tel qu'il sera publié : espaces multiples réduits, sans espaces en bordure. */
export function normaliserTexte(texte: string): string {
  return texte
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/ ?\n ?/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/** Nombre de caractères facturables, espaces comprises. */
export function compterCaracteres(texte: string): number {
  return [...normaliserTexte(texte)].length
}

function avecTva(ht: number): Pick<DetailPrix, 'ht' | 'tva' | 'ttc'> {
  const h = arrondi(ht)
  const tva = arrondi(h * TAUX_TVA)
  return { ht: h, tva, ttc: arrondi(h + tva) }
}

/**
 * Prix réglementé d'une annonce.
 * Forfait si le type en a un, sinon nombre de caractères × tarif du département.
 */
export function calculerPrix(type: Pick<TypeAnnonce, 'forfait'>, departement: string, texte: string): DetailPrix {
  if (type.forfait) {
    const forfait = FORFAITS[type.forfait]
    const ht = estReunionOuMayotte(departement) ? forfait.reunionMayotte : forfait.france
    return { mode: 'forfait', ...avecTva(ht) }
  }
  const annexe = annexeDuDepartement(departement)
  const tarifCaractere = TARIF_CARACTERE[annexe]
  const caracteres = compterCaracteres(texte)
  return { mode: 'caractere', caracteres, tarifCaractere, annexe, ...avecTva(caracteres * tarifCaractere) }
}

/** Prix « à partir de » affiché sur les fiches et cartes. */
export function prixAffiche(type: Pick<TypeAnnonce, 'forfait'>): string {
  if (!type.forfait) return 'Au caractère'
  return `${euros(FORFAITS[type.forfait].france)} HT`
}

export function euros(n: number): string {
  return n.toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
    maximumFractionDigits: 2,
  })
}
