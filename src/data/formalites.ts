import { trouverType } from './annonces'
import { FORFAITS } from './tarifs-annonces'

/**
 * Formalités au guichet unique de l'INPI.
 * Le service prépare un brouillon pré-rempli sur le compte INPI du client, à partir
 * de ses pièces. Il se règle en jetons ; les frais officiels se paient à l'INPI.
 */

/** Jetons crédités au portefeuille du cabinet pour chaque annonce légale publiée. */
export const JETONS_PAR_ANNONCE = 10

/** Prix du brouillon en jetons, par catégorie. null : affiché avant validation. */
export const JETONS_BROUILLON: Record<string, number | null> = {
  creation: 8,
  modification: 6,
  cessation: null,
  comptes: null,
}

export interface CategorieFormalite {
  slug: string
  titre: string
  description: string
}

export interface Formalite {
  slug: string
  categorie: string
  titre: string
  resume: string
  /** Type d'annonce légale associé (slug), le cas échéant */
  annonce?: string
  pieces: string[]
}

export const CATEGORIES_FORMALITES: CategorieFormalite[] = [
  { slug: 'creation', titre: 'Création de société', description: 'L’immatriculation : annonce de constitution, puis dossier au guichet unique.' },
  { slug: 'modification', titre: 'Modification', description: 'Siège, dirigeant, capital, objet, dénomination, transformation.' },
  { slug: 'cessation', titre: 'Cessation', description: 'Dissolution, liquidation, mise en sommeil, radiation.' },
  { slug: 'comptes', titre: 'Dépôt des comptes', description: 'Le dépôt des comptes annuels au guichet unique.' },
]

const PIECES_CREATION = [
  'Statuts signés',
  'Pièce d’identité du ou des dirigeants',
  'Déclaration de non-condamnation et de filiation des dirigeants',
  'Justificatif d’occupation du siège (bail, contrat de domiciliation, attestation)',
  'Attestation de dépôt des fonds',
  'Attestation de parution de l’annonce légale',
]

const PIECES_MODIFICATION = [
  'Procès-verbal de la décision, signé',
  'Statuts mis à jour, certifiés conformes',
  'Pièce d’identité du représentant légal',
  'Attestation de parution de l’annonce légale',
]

const f = (categorie: string, slug: string, titre: string, resume: string, extra: Partial<Formalite> = {}): Formalite => ({
  categorie,
  slug,
  titre,
  resume,
  pieces: categorie === 'creation' ? PIECES_CREATION : PIECES_MODIFICATION,
  ...extra,
})

export const FORMALITES: Formalite[] = [
  f('creation', 'creation-sas', 'Création de SAS', 'La société des projets à plusieurs, avec une gouvernance libre.', { annonce: 'constitution-sas' }),
  f('creation', 'creation-sasu', 'Création de SASU', 'Entreprendre seul avec le statut d’assimilé salarié.', { annonce: 'constitution-sasu' }),
  f('creation', 'creation-sarl', 'Création de SARL', 'Le cadre encadré et rassurant des PME familiales.', { annonce: 'constitution-sarl' }),
  f('creation', 'creation-eurl', 'Création d’EURL', 'La SARL à associé unique.', { annonce: 'constitution-eurl' }),
  f('creation', 'creation-sci', 'Création de SCI', 'Détenir et gérer un patrimoine immobilier à plusieurs.', { annonce: 'constitution-sci' }),
  f('creation', 'creation-sccv', 'Création de SCCV', 'La société des opérations de promotion immobilière.', { annonce: 'constitution-sccv' }),
  f('creation', 'creation-societe-civile', 'Création de société civile', 'Holding patrimoniale, société de moyens, SCP.', { annonce: 'constitution-societe-civile' }),
  f('creation', 'creation-sa', 'Création de SA', 'Pour les projets qui visent un actionnariat large.', { annonce: 'constitution-sa' }),
  f('creation', 'creation-snc', 'Création de SNC', 'Associés commerçants et responsables indéfiniment.', { annonce: 'constitution-snc' }),
  f('creation', 'creation-selarl', 'Création de SELARL', 'Exercer une profession libérale réglementée en société.', { annonce: 'constitution-selarl' }),
  f('creation', 'creation-selas', 'Création de SELAS', 'La SAS des professions libérales réglementées.', { annonce: 'constitution-selas' }),

  f('modification', 'changement-dirigeant', 'Changement de dirigeant', 'Nomination, démission ou révocation de gérant, président ou directeur général.', { annonce: 'changement-dirigeant' }),
  f('modification', 'transfert-siege-meme-departement', 'Transfert de siège (même département)', 'Déménagement du siège sans changement de greffe.', { annonce: 'transfert-siege-meme-departement' }),
  f('modification', 'transfert-siege-hors-departement', 'Transfert de siège (hors département)', 'Changement de greffe : deux annonces, un dossier unique.', { annonce: 'transfert-siege-ancien-departement' }),
  f('modification', 'modification-capital', 'Modification du capital social', 'Augmentation ou réduction de capital.', { annonce: 'modification-capital-social' }),
  f('modification', 'changement-objet-social', 'Changement d’objet social', 'Nouvelle activité, extension ou recentrage.', { annonce: 'changement-objet-social' }),
  f('modification', 'changement-denomination', 'Changement de dénomination', 'Nouveau nom pour votre société.', { annonce: 'changement-denomination' }),
  f('modification', 'prorogation-duree', 'Prorogation de durée', 'Prolonger la vie de la société avant son terme.', { annonce: 'prorogation-duree' }),
  f('modification', 'mouvement-associes', 'Mouvement d’associés', 'Cession de parts, entrée ou sortie d’associés.', { annonce: 'cession-parts-mouvement-associes' }),
  f('modification', 'transformation', 'Transformation de société', 'Changer de forme juridique (SARL en SAS, etc.).', { annonce: 'transformation-sarl-en-sas' }),
  f('modification', 'changement-commissaire-aux-comptes', 'Changement de commissaire aux comptes', 'Nomination ou départ du commissaire aux comptes.', { annonce: 'changement-commissaire-aux-comptes' }),

  f('cessation', 'dissolution-anticipee', 'Dissolution anticipée', 'Mettre la société en liquidation amiable.', { annonce: 'dissolution-anticipee' }),
  f('cessation', 'cloture-liquidation', 'Clôture de liquidation', 'Clôturer les opérations et radier la société.', { annonce: 'cloture-liquidation' }),
  f('cessation', 'dissolution-cloture', 'Dissolution et clôture simultanées', 'Les deux étapes enchaînées quand la société n’a plus d’actif ni de passif.', { annonce: 'dissolution-anticipee' }),
  f('cessation', 'dissolution-tup', 'Dissolution par TUP', 'Dissolution sans liquidation d’une filiale à associé unique.', { annonce: 'dissolution-tup' }),
  f('cessation', 'mise-en-sommeil', 'Mise en sommeil', 'Suspendre l’activité jusqu’à deux ans sans dissoudre.', { pieces: ['Décision de mise en sommeil', 'Pièce d’identité du représentant légal'] }),

  f('comptes', 'depot-comptes-annuels', 'Dépôt des comptes annuels', 'Dépôt des comptes approuvés et de l’affectation du résultat au guichet unique.', {
    pieces: ['Comptes annuels (bilan, compte de résultat, annexe)', 'Procès-verbal d’approbation et d’affectation du résultat', 'Rapport du commissaire aux comptes, le cas échéant', 'Déclaration de confidentialité, si souhaitée'],
  }),
]

export const ETAPES_FORMALITE = [
  { titre: 'Vous déposez vos pièces', texte: 'Statuts, pièce d’identité, justificatif de siège : en PDF, une seule fois.' },
  { titre: 'Vos pièces sont lues', texte: 'Une intelligence artificielle en extrait les informations et remplit le dossier à votre place.' },
  { titre: 'Le brouillon apparaît à l’INPI', texte: 'Il est créé directement sur votre compte du guichet unique, prêt à relire.' },
  { titre: 'Vous relisez et signez', texte: 'Rien n’est déposé sans vous. Vous signez et réglez les frais officiels sur le site de l’INPI.' },
]

/** Prix du brouillon de la formalité, en jetons. */
export function prixBrouillon(f: Pick<Formalite, 'categorie'>): string {
  const jetons = JETONS_BROUILLON[f.categorie]
  return jetons ? `${jetons} jetons` : 'Affiché avant validation'
}

/** Forfait officiel HT de l'annonce liée à la formalité, ou null (au caractère / sans annonce). */
export function forfaitAnnonce(f: Formalite): number | null {
  const t = f.annonce ? trouverType(f.annonce) : undefined
  return t?.forfait ? FORFAITS[t.forfait].france : null
}

export function trouverFormalite(categorie: string, slug: string): Formalite | undefined {
  return FORMALITES.find((x) => x.categorie === categorie && x.slug === slug)
}
