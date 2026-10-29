/**
 * Formalités prises en charge (dépôt au guichet unique de l'INPI).
 * Les honoraires sont INDICATIFS : à valider par Comptoir Légal avant la mise en ligne.
 * Ils s'entendent hors frais officiels (greffe/INPI) et hors annonce légale.
 */

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
  /** Honoraires HT de Comptoir Légal */
  honoraires: number
  /** Type d'annonce légale associé (slug), le cas échéant */
  annonce?: string
  pieces: string[]
  delai: string
}

export const CATEGORIES_FORMALITES: CategorieFormalite[] = [
  { slug: 'creation', titre: 'Création de société', description: 'Immatriculation complète : annonce, dossier guichet unique, suivi jusqu’au Kbis.' },
  { slug: 'modification', titre: 'Modification', description: 'Siège, dirigeant, capital, objet, dénomination, transformation.' },
  { slug: 'cessation', titre: 'Cessation', description: 'Dissolution, liquidation, mise en sommeil, radiation.' },
  { slug: 'comptes', titre: 'Dépôt des comptes', description: 'Dépôt des comptes annuels au guichet unique.' },
]

const PIECES_CREATION = [
  'Statuts signés',
  'Pièce d’identité du ou des dirigeants',
  'Déclaration de non-condamnation et de filiation des dirigeants',
  'Justificatif d’occupation du siège (bail, contrat de domiciliation, attestation)',
  'Attestation de dépôt des fonds',
  'Liste des bénéficiaires effectifs (préparée par nos soins)',
]

const PIECES_MODIFICATION = [
  'Procès-verbal de la décision, signé',
  'Statuts mis à jour, certifiés conformes',
  'Pièce d’identité du représentant légal',
]

const f = (
  categorie: string,
  slug: string,
  titre: string,
  honoraires: number,
  resume: string,
  extra: Partial<Formalite> = {},
): Formalite => ({
  categorie,
  slug,
  titre,
  honoraires,
  resume,
  pieces: categorie === 'creation' ? PIECES_CREATION : PIECES_MODIFICATION,
  delai: categorie === 'creation' ? 'Dossier déposé sous 48 h ouvrées après réception des pièces' : 'Dossier déposé sous 24 à 48 h ouvrées',
  ...extra,
})

export const FORMALITES: Formalite[] = [
  f('creation', 'creation-sas', 'Création de SAS', 189, 'La société des projets à plusieurs, avec une gouvernance libre.', { annonce: 'constitution-sas' }),
  f('creation', 'creation-sasu', 'Création de SASU', 179, 'Entreprendre seul avec le statut d’assimilé salarié.', { annonce: 'constitution-sasu' }),
  f('creation', 'creation-sarl', 'Création de SARL', 179, 'Le cadre encadré et rassurant des PME familiales.', { annonce: 'constitution-sarl' }),
  f('creation', 'creation-eurl', 'Création d’EURL', 169, 'La SARL à associé unique.', { annonce: 'constitution-eurl' }),
  f('creation', 'creation-sci', 'Création de SCI', 199, 'Détenir et gérer un patrimoine immobilier à plusieurs.', { annonce: 'constitution-sci' }),
  f('creation', 'creation-sccv', 'Création de SCCV', 219, 'La société des opérations de promotion immobilière.', { annonce: 'constitution-sccv' }),
  f('creation', 'creation-societe-civile', 'Création de société civile', 219, 'Holding patrimoniale, société de moyens, SCP.', { annonce: 'constitution-societe-civile' }),
  f('creation', 'creation-sa', 'Création de SA', 289, 'Pour les projets qui visent un actionnariat large.', { annonce: 'constitution-sa' }),
  f('creation', 'creation-snc', 'Création de SNC', 219, 'Associés commerçants et responsables indéfiniment.', { annonce: 'constitution-snc' }),
  f('creation', 'creation-selarl', 'Création de SELARL', 199, 'Exercer une profession libérale réglementée en société.', { annonce: 'constitution-selarl' }),
  f('creation', 'creation-selas', 'Création de SELAS', 209, 'La SAS des professions libérales réglementées.', { annonce: 'constitution-selas' }),

  f('modification', 'changement-dirigeant', 'Changement de dirigeant', 149, 'Nomination, démission ou révocation de gérant, président ou directeur général.', { annonce: 'changement-dirigeant' }),
  f('modification', 'transfert-siege-meme-departement', 'Transfert de siège (même département)', 149, 'Déménagement du siège sans changement de greffe.', { annonce: 'transfert-siege-meme-departement' }),
  f('modification', 'transfert-siege-hors-departement', 'Transfert de siège (hors département)', 229, 'Changement de greffe : deux annonces, un dossier unique.', { annonce: 'transfert-siege-ancien-departement' }),
  f('modification', 'modification-capital', 'Modification du capital social', 179, 'Augmentation ou réduction de capital.', { annonce: 'modification-capital-social' }),
  f('modification', 'changement-objet-social', 'Changement d’objet social', 159, 'Nouvelle activité, extension ou recentrage.', { annonce: 'changement-objet-social' }),
  f('modification', 'changement-denomination', 'Changement de dénomination', 159, 'Nouveau nom pour votre société.', { annonce: 'changement-denomination' }),
  f('modification', 'prorogation-duree', 'Prorogation de durée', 139, 'Prolonger la vie de la société avant son terme.', { annonce: 'prorogation-duree' }),
  f('modification', 'mouvement-associes', 'Mouvement d’associés', 179, 'Cession de parts, entrée ou sortie d’associés.', { annonce: 'cession-parts-mouvement-associes' }),
  f('modification', 'transformation', 'Transformation de société', 259, 'Changer de forme juridique (SARL en SAS, etc.).', { annonce: 'transformation-sarl-en-sas' }),
  f('modification', 'changement-commissaire-aux-comptes', 'Changement de commissaire aux comptes', 139, 'Nomination ou départ du commissaire aux comptes.', { annonce: 'changement-commissaire-aux-comptes' }),

  f('cessation', 'dissolution-anticipee', 'Dissolution anticipée', 189, 'Mettre la société en liquidation amiable.', { annonce: 'dissolution-anticipee' }),
  f('cessation', 'cloture-liquidation', 'Clôture de liquidation', 169, 'Clôturer les opérations et radier la société.', { annonce: 'cloture-liquidation' }),
  f('cessation', 'dissolution-cloture', 'Dissolution et clôture simultanées', 299, 'Les deux étapes enchaînées quand la société n’a plus d’actif ni de passif.', { annonce: 'dissolution-anticipee' }),
  f('cessation', 'dissolution-tup', 'Dissolution par TUP', 229, 'Dissolution sans liquidation d’une filiale à associé unique.', { annonce: 'dissolution-tup' }),
  f('cessation', 'mise-en-sommeil', 'Mise en sommeil', 129, 'Suspendre l’activité jusqu’à deux ans sans dissoudre.', { pieces: ['Pouvoir signé du représentant légal', 'Pièce d’identité'] }),

  f('comptes', 'depot-comptes-annuels', 'Dépôt des comptes annuels', 69, 'Dépôt des comptes approuvés et de l’affectation du résultat au guichet unique.', {
    pieces: ['Comptes annuels (bilan, compte de résultat, annexe)', 'Procès-verbal d’approbation et d’affectation du résultat', 'Rapport du commissaire aux comptes, le cas échéant', 'Déclaration de confidentialité, si souhaitée'],
    delai: 'Dépôt sous 24 h ouvrées',
  }),
]

export const ETAPES_FORMALITE = [
  { titre: 'Vous transmettez vos pièces', texte: 'Un formulaire court, vos documents en pièces jointes. Pas de compte INPI à créer.' },
  { titre: 'Un formaliste vérifie', texte: 'Cohérence entre statuts, annonce et formulaire : c’est là que se jouent la plupart des rejets.' },
  { titre: 'Nous publions l’annonce', texte: 'Au tarif réglementé, dans un journal habilité du département du siège.' },
  { titre: 'Nous déposons au guichet unique', texte: 'Le dossier part sur formalites.entreprises.gouv.fr, nous suivons chaque retour du greffe.' },
  { titre: 'Vous recevez le justificatif', texte: 'Kbis, extrait mis à jour ou accusé de dépôt, dès sa délivrance.' },
]

export function trouverFormalite(categorie: string, slug: string): Formalite | undefined {
  return FORMALITES.find((x) => x.categorie === categorie && x.slug === slug)
}
