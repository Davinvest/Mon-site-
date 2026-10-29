import { describe, expect, it } from 'vitest'
import { calculerPrix, compterCaracteres } from '@/lib/prix'
import { departementDuCodePostal } from '@/data/departements'
import { CATEGORIES, TYPES_ANNONCE, trouverType } from '@/data/annonces'
import { MODELES } from '@/data/modeles'

const type = (slug: string) => {
  const t = trouverType(slug)
  if (!t) throw new Error(`type inconnu : ${slug}`)
  return t
}

describe('forfaits 2026', () => {
  it.each([
    ['constitution-sas', '75', 199, 238.8],
    ['constitution-sasu', '69', 142, 170.4],
    ['constitution-sarl', '13', 148, 177.6],
    ['constitution-eurl', '33', 124, 148.8],
    ['constitution-sci', '01', 191, 229.2],
    ['constitution-sa', '59', 399, 478.8],
    ['constitution-selas', '75', 199, 238.8],
    ['dissolution-anticipee', '75', 153, 183.6],
    ['cloture-liquidation', '75', 111, 133.2],
    ['transfert-siege-meme-departement', '75', 109, 130.8],
    ['modification-capital-social', '75', 136, 163.2],
    ['changement-denomination', '75', 199, 238.8],
    ['poursuite-activite-pertes', '75', 83, 99.6],
    ['changement-nom-patronymique', '974', 58, 69.6],
  ])('%s dans le %s : %d € HT', (slug, dep, ht, ttc) => {
    const p = calculerPrix(type(slug), dep, 'texte quelconque')
    expect(p.mode).toBe('forfait')
    expect(p.ht).toBe(ht)
    expect(p.ttc).toBe(ttc)
  })

  it('applique les forfaits majorés de La Réunion et Mayotte', () => {
    expect(calculerPrix(type('constitution-sas'), '974', '').ht).toBe(233)
    expect(calculerPrix(type('constitution-sas'), '976', '').ht).toBe(233)
    expect(calculerPrix(type('dissolution-anticipee'), '974', '').ht).toBe(181)
    expect(calculerPrix(type('constitution-sas'), '971', '').ht).toBe(199)
  })
})

describe('tarif au caractère', () => {
  const texte400 = 'a'.repeat(400)

  it('400 caractères dans l’Ain = 75,60 € HT / 90,72 € TTC', () => {
    const p = calculerPrix(type('cession-fonds-de-commerce'), '01', texte400)
    expect(p).toMatchObject({ mode: 'caractere', caracteres: 400, annexe: 'I', ht: 75.6, ttc: 90.72 })
  })

  it('400 caractères à Paris = 95,60 € HT', () => {
    expect(calculerPrix(type('cession-fonds-de-commerce'), '75', texte400).ht).toBe(95.6)
  })

  it('utilise les annexes II à VII', () => {
    expect(calculerPrix(type('rectificatif-additif'), '69', texte400).annexe).toBe('II')
    expect(calculerPrix(type('rectificatif-additif'), '76', texte400).annexe).toBe('III')
    expect(calculerPrix(type('rectificatif-additif'), '91', texte400).annexe).toBe('IV')
    expect(calculerPrix(type('rectificatif-additif'), '93', texte400).annexe).toBe('V')
    expect(calculerPrix(type('rectificatif-additif'), '972', texte400).annexe).toBe('VI')
    expect(calculerPrix(type('rectificatif-additif'), '974', texte400)).toMatchObject({ annexe: 'VII', ht: 84 })
  })

  it('compte les espaces mais pas les espaces superflus', () => {
    expect(compterCaracteres('a  b')).toBe(3)
    expect(compterCaracteres('  a b \n\n\n\nc ')).toBe(6)
  })
})

describe('départements', () => {
  it.each([
    ['75009', '75'],
    ['01000', '01'],
    ['20000', '2A'],
    ['20200', '2B'],
    ['97400', '974'],
    ['97600', '976'],
    ['1234', null],
    ['abcde', null],
  ])('%s → %s', (cp, dep) => {
    expect(departementDuCodePostal(cp)).toBe(dep)
  })
})

describe('catalogue', () => {
  it('chaque type a une catégorie et un modèle existants, et un slug unique', () => {
    const slugs = new Set<string>()
    for (const t of TYPES_ANNONCE) {
      expect(CATEGORIES.some((c) => c.slug === t.categorie), t.slug).toBe(true)
      expect(MODELES[t.modele], t.slug).toBeDefined()
      expect(slugs.has(t.slug), t.slug).toBe(false)
      slugs.add(t.slug)
    }
  })

  it('chaque modèle rédige un texte non vide avec une saisie minimale', () => {
    for (const m of Object.values(MODELES)) {
      const champs: Record<string, string> = {}
      for (const g of m.groupes) for (const c of g.champs) champs[c.nom] = c.type === 'date' ? '2026-03-01' : 'X'
      const texte = m.rediger({ champs, listes: { dirigeants: [{ nom: 'Martin', prenom: 'Léa', qualite: 'Président' }] } }, {})
      expect(texte.length, m.id).toBeGreaterThan(40)
      expect(texte, m.id).not.toContain('undefined')
    }
  })
})

describe('métadonnées Stripe', () => {
  it('conservent une commande longue sans dépasser les limites Stripe', async () => {
    const { versMetadonnees, depuisMetadonnees } = await import('@/lib/paiement')
    const { TEXTE_MAX } = await import('@/lib/commande')
    const texte = 'é'.repeat(TEXTE_MAX)
    const client = { prenom: 'P'.repeat(80), nom: 'N'.repeat(80), email: `${'e'.repeat(150)}@x.fr`, telephone: '0'.repeat(30), societe: 'S'.repeat(160) }
    const meta = versMetadonnees({
      reference: 'CL-20261029-ABCDEF', typeSlug: 'constitution-sas', typeTitre: 'Constitution SAS', codePostal: '75002',
      departement: '75', texte, client, prix: calculerPrix(type('constitution-sas'), '75', texte), journal: 'J', creeLe: '2026-10-29T00:00:00Z',
    })
    expect(Object.keys(meta).length).toBeLessThanOrEqual(50)
    for (const v of Object.values(meta)) expect(v.length).toBeLessThanOrEqual(500)
    const retour = depuisMetadonnees(meta)
    expect(retour.texte).toBe(texte)
    expect(retour.client).toEqual(client)
  })
})
