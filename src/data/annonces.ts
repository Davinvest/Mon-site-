import type { CleForfait } from './tarifs-annonces'

export interface Categorie {
  slug: string
  titre: string
  /** Filtre court affiché dans le tunnel */
  filtre: string
  description: string
}

export interface TypeAnnonce {
  slug: string
  categorie: string
  titre: string
  /** Phrase d'accroche de la fiche */
  resume: string
  /** Forfait réglementé, ou null si l'annonce est facturée au caractère */
  forfait: CleForfait | null
  modele: string
  forme?: string
  variante?: string
  /** Mis en avant sur l'accueil et dans le tunnel */
  populaire?: boolean
}

export const CATEGORIES: Categorie[] = [
  {
    slug: 'constitution-societe-commerciale',
    titre: 'Constitution de société commerciale',
    filtre: 'Constitution',
    description: 'SAS, SASU, SARL, EURL, SA, SNC et sociétés en commandite : l’avis de constitution, préalable à l’immatriculation.',
  },
  {
    slug: 'constitution-societe-civile',
    titre: 'Constitution de société civile',
    filtre: 'Constitution',
    description: 'SCI, SCM, SCP, sociétés civiles agricoles et de construction-vente.',
  },
  {
    slug: 'constitution-societe-liberale',
    titre: 'Constitution de société libérale',
    filtre: 'Constitution',
    description: 'SELARL, SELAS et autres sociétés d’exercice libéral, tarifées comme leur forme commerciale équivalente.',
  },
  {
    slug: 'modification',
    titre: 'Modification des statuts',
    filtre: 'Modification',
    description: 'Siège, capital, objet, dénomination, durée : chaque modification statutaire se publie dans le mois.',
  },
  {
    slug: 'dirigeants',
    titre: 'Dirigeants et associés',
    filtre: 'Dirigeants',
    description: 'Nomination, démission, révocation de dirigeant ou de commissaire aux comptes, mouvement d’associés.',
  },
  {
    slug: 'transformation',
    titre: 'Transformation de société',
    filtre: 'Transformation',
    description: 'Changement de forme juridique sans création d’une personne morale nouvelle.',
  },
  {
    slug: 'fonds-de-commerce',
    titre: 'Fonds de commerce et baux',
    filtre: 'Gérance & baux',
    description: 'Cession de fonds, location-gérance, cession de droit au bail.',
  },
  {
    slug: 'dissolution',
    titre: 'Dissolution et liquidation',
    filtre: 'Dissolution',
    description: 'Dissolution anticipée, clôture de liquidation, transmission universelle de patrimoine.',
  },
  {
    slug: 'personnes-physiques',
    titre: 'Personnes physiques',
    filtre: 'Particuliers',
    description: 'Changement de régime matrimonial, de nom patronymique, déclaration d’insaisissabilité.',
  },
  {
    slug: 'rectificatif',
    titre: 'Rectificatif',
    filtre: 'Rectificatif',
    description: 'Corriger ou compléter une annonce déjà parue.',
  },
]

const t = (
  categorie: string,
  slug: string,
  titre: string,
  forfait: CleForfait | null,
  modele: string,
  resume: string,
  extra: Partial<TypeAnnonce> = {},
): TypeAnnonce => ({ categorie, slug, titre, forfait, modele, resume, ...extra })

export const TYPES_ANNONCE: TypeAnnonce[] = [
  // Constitution — sociétés commerciales
  t('constitution-societe-commerciale', 'constitution-sas', 'Constitution SAS', 'constitution-sas', 'constitution',
    'Publiez l’avis de constitution de votre société par actions simplifiée avant le dépôt au guichet unique.', { forme: 'SAS', populaire: true }),
  t('constitution-societe-commerciale', 'constitution-sasu', 'Constitution SASU', 'constitution-sasu', 'constitution',
    'L’avis de constitution d’une SAS à associé unique, au forfait réglementé.', { forme: 'SASU', populaire: true }),
  t('constitution-societe-commerciale', 'constitution-sarl', 'Constitution SARL', 'constitution-sarl', 'constitution',
    'L’annonce de création d’une société à responsabilité limitée, rédigée à partir de vos statuts.', { forme: 'SARL', populaire: true }),
  t('constitution-societe-commerciale', 'constitution-eurl', 'Constitution EURL', 'constitution-eurl', 'constitution',
    'L’annonce de création d’une SARL unipersonnelle, au forfait le plus bas des sociétés commerciales.', { forme: 'EURL', populaire: true }),
  t('constitution-societe-commerciale', 'constitution-sa', 'Constitution SA', 'constitution-sa', 'constitution',
    'L’avis de constitution d’une société anonyme, avec conseil d’administration ou directoire.', { forme: 'SA' }),
  t('constitution-societe-commerciale', 'constitution-snc', 'Constitution SNC', 'constitution-snc', 'constitution',
    'L’annonce de création d’une société en nom collectif, avec l’identité des associés en nom.', { forme: 'SNC' }),
  t('constitution-societe-commerciale', 'constitution-scs', 'Constitution SCS', null, 'constitution',
    'Société en commandite simple : annonce facturée au caractère selon le département.', { forme: 'SCS' }),
  t('constitution-societe-commerciale', 'constitution-sca', 'Constitution SCA', null, 'constitution',
    'Société en commandite par actions : annonce facturée au caractère selon le département.', { forme: 'SCA' }),
  t('constitution-societe-commerciale', 'constitution-slp', 'Constitution SLP', null, 'constitution',
    'Société de libre partenariat : annonce facturée au caractère.', { forme: 'SLP' }),

  // Constitution — sociétés civiles
  t('constitution-societe-civile', 'constitution-sci', 'Constitution SCI', 'constitution-sci', 'constitution',
    'L’annonce de création de votre société civile immobilière, au forfait réglementé.', { forme: 'SCI', populaire: true }),
  t('constitution-societe-civile', 'constitution-sccv', 'Constitution SCCV', 'constitution-sci', 'constitution',
    'Société civile de construction-vente : même forfait que la SCI (objet immobilier).', { forme: 'SCCV' }),
  t('constitution-societe-civile', 'constitution-societe-civile', 'Constitution société civile', 'constitution-societe-civile', 'constitution',
    'Société civile de droit commun : holding patrimoniale, société de portefeuille, etc.', { forme: 'Société civile' }),
  t('constitution-societe-civile', 'constitution-scm', 'Constitution SCM', 'constitution-societe-civile', 'constitution',
    'Société civile de moyens entre professionnels libéraux.', { forme: 'SCM' }),
  t('constitution-societe-civile', 'constitution-scp', 'Constitution SCP', 'constitution-societe-civile', 'constitution',
    'Société civile professionnelle.', { forme: 'SCP' }),
  t('constitution-societe-civile', 'constitution-scpi', 'Constitution SCPI', 'constitution-societe-civile', 'constitution',
    'Société civile de placement immobilier.', { forme: 'SCPI' }),
  t('constitution-societe-civile', 'constitution-scea', 'Constitution SCEA', 'constitution-societe-civile', 'constitution',
    'Société civile d’exploitation agricole.', { forme: 'SCEA' }),
  t('constitution-societe-civile', 'constitution-earl', 'Constitution EARL', 'constitution-societe-civile', 'constitution',
    'Exploitation agricole à responsabilité limitée.', { forme: 'EARL' }),
  t('constitution-societe-civile', 'constitution-gaec', 'Constitution GAEC', 'constitution-societe-civile', 'constitution',
    'Groupement agricole d’exploitation en commun.', { forme: 'GAEC' }),

  // Constitution — sociétés libérales
  t('constitution-societe-liberale', 'constitution-selarl', 'Constitution SELARL', 'constitution-sarl', 'constitution',
    'Société d’exercice libéral à responsabilité limitée : même forfait que la SARL.', { forme: 'SELARL', populaire: true }),
  t('constitution-societe-liberale', 'constitution-selurl', 'Constitution SELURL', 'constitution-eurl', 'constitution',
    'SELARL unipersonnelle : même forfait que l’EURL.', { forme: 'SELURL' }),
  t('constitution-societe-liberale', 'constitution-selas', 'Constitution SELAS', 'constitution-sas', 'constitution',
    'Société d’exercice libéral par actions simplifiée : même forfait que la SAS.', { forme: 'SELAS' }),
  t('constitution-societe-liberale', 'constitution-selasu', 'Constitution SELASU', 'constitution-sasu', 'constitution',
    'SELAS unipersonnelle : même forfait que la SASU.', { forme: 'SELASU' }),
  t('constitution-societe-liberale', 'constitution-selafa', 'Constitution SELAFA', 'constitution-sa', 'constitution',
    'Société d’exercice libéral à forme anonyme : même forfait que la SA.', { forme: 'SELAFA' }),
  t('constitution-societe-liberale', 'constitution-selca', 'Constitution SELCA', null, 'constitution',
    'Société d’exercice libéral en commandite par actions : tarif au caractère.', { forme: 'SELCA' }),

  // Modifications
  t('modification', 'transfert-siege-meme-departement', 'Transfert de siège (même département)', 'transfert-siege', 'transfert-siege',
    'Déménagement du siège dans le même département : une seule annonce.', { populaire: true }),
  t('modification', 'transfert-siege-ancien-departement', 'Transfert de siège hors département — ancien siège', 'transfert-siege', 'transfert-siege',
    'Première des deux annonces : publiée dans le département que la société quitte.', { variante: 'ancien-siege' }),
  t('modification', 'transfert-siege-nouveau-departement', 'Transfert de siège hors département — nouveau siège', 'transfert-siege', 'transfert-siege',
    'Seconde annonce : publiée dans le département d’arrivée, avec les mentions complètes.', { variante: 'nouveau-siege' }),
  t('modification', 'modification-capital-social', 'Modification du capital social', 'capital-social', 'capital',
    'Augmentation ou réduction de capital : une annonce au forfait.', { populaire: true }),
  t('modification', 'reduction-capital-non-motivee-pertes', 'Réduction de capital non motivée par des pertes', 'capital-social', 'capital',
    'Réduction de capital hors pertes (rachat de titres, remboursement d’apports).'),
  t('modification', 'changement-objet-social', 'Changement d’objet social', 'objet-social', 'objet',
    'Extension, réduction ou changement complet d’activité.'),
  t('modification', 'changement-denomination', 'Changement de dénomination sociale', 'denomination', 'denomination',
    'Nouveau nom ou nouveau sigle pour votre société.'),
  t('modification', 'prorogation-duree', 'Prorogation de durée', 'prorogation-duree', 'duree',
    'Prolonger la durée de la société avant son terme statutaire.'),
  t('modification', 'poursuite-activite-pertes', 'Poursuite d’activité malgré les pertes', 'poursuite-activite-pertes', 'pertes',
    'Capitaux propres inférieurs à la moitié du capital : décision de ne pas dissoudre.'),

  // Dirigeants et associés
  t('dirigeants', 'changement-dirigeant', 'Changement de dirigeant', 'dirigeants', 'mouvement-dirigeant',
    'Changement de gérant, de président ou de directeur général.', { populaire: true }),
  t('dirigeants', 'nomination-dirigeant', 'Nomination de dirigeant', 'dirigeants', 'mouvement-dirigeant',
    'Nomination d’un nouveau dirigeant ou représentant sans départ.'),
  t('dirigeants', 'demission-revocation', 'Démission, révocation ou non-renouvellement', 'dirigeants', 'mouvement-dirigeant',
    'Cessation de fonctions d’un dirigeant.'),
  t('dirigeants', 'demission-pour-ordre', 'Démission pour ordre', 'dirigeants', 'mouvement-dirigeant',
    'Publication d’une démission intervenue antérieurement et non publiée.', { variante: 'demission-pour-ordre' }),
  t('dirigeants', 'changement-administrateur', 'Changement d’administrateur', 'administrateur', 'mouvement-dirigeant',
    'Nomination ou départ d’un administrateur de SA.'),
  t('dirigeants', 'changement-commissaire-aux-comptes', 'Changement de commissaire aux comptes', 'commissaire-aux-comptes', 'mouvement-dirigeant',
    'Nomination, renouvellement ou départ du commissaire aux comptes.'),
  t('dirigeants', 'cession-parts-mouvement-associes', 'Cession de parts / mouvement d’associés', 'cession-parts', 'cession-parts',
    'Cession de parts dans une SNC, SCS ou SCP, entrée ou sortie d’associés.'),

  // Transformations
  t('transformation', 'transformation-sarl-en-sas', 'Transformation SARL en SAS', 'transformation', 'transformation',
    'Passage de SARL à SAS sans création d’un être moral nouveau.', { forme: 'SARL', populaire: true }),
  t('transformation', 'transformation-sas-en-sarl', 'Transformation SAS en SARL', 'transformation', 'transformation',
    'Passage de SAS à SARL.', { forme: 'SAS' }),
  t('transformation', 'transformation-selarl-en-selas', 'Transformation SELARL en SELAS', 'transformation', 'transformation',
    'Transformation entre formes d’exercice libéral.', { forme: 'SELARL' }),
  t('transformation', 'transformation-societe-commerciale', 'Transformation en société commerciale', 'transformation', 'transformation',
    'Toute transformation vers une forme commerciale.'),
  t('transformation', 'transformation-societe-civile', 'Transformation en société civile ou agricole', 'transformation', 'transformation',
    'Transformation vers une société civile, une EARL ou un GAEC.'),
  t('transformation', 'transformation-societe-liberale', 'Transformation en société libérale', 'transformation', 'transformation',
    'Transformation vers une société d’exercice libéral.'),

  // Fonds de commerce et baux
  t('fonds-de-commerce', 'cession-fonds-de-commerce', 'Cession de fonds de commerce', null, 'cession-fonds',
    'Vente d’un fonds : l’annonce ouvre le délai d’opposition des créanciers.'),
  t('fonds-de-commerce', 'mise-en-location-gerance', 'Mise en location-gérance', null, 'location-gerance',
    'Début d’un contrat de location-gérance.'),
  t('fonds-de-commerce', 'fin-location-gerance', 'Fin de location-gérance', null, 'location-gerance',
    'Fin d’un contrat de location-gérance.', { variante: 'fin' }),
  t('fonds-de-commerce', 'cession-droit-au-bail', 'Cession de droit au bail', null, 'droit-au-bail',
    'Cession du bail commercial seul, sans le fonds.'),

  // Dissolution
  t('dissolution', 'dissolution-anticipee', 'Dissolution anticipée', 'dissolution', 'dissolution',
    'Mise en liquidation amiable et nomination du liquidateur.', { populaire: true }),
  t('dissolution', 'cloture-liquidation', 'Clôture de liquidation', 'cloture-liquidation', 'cloture',
    'Dernière annonce de la vie de la société, avant sa radiation.', { populaire: true }),
  t('dissolution', 'dissolution-tup', 'Dissolution par transmission universelle de patrimoine (TUP)', null, 'tup',
    'Dissolution sans liquidation d’une société à associé unique personne morale.'),

  // Personnes physiques
  t('personnes-physiques', 'changement-regime-matrimonial', 'Changement de régime matrimonial', null, 'regime-matrimonial',
    'Annonce obligatoire après l’acte notarié de changement de régime.'),
  t('personnes-physiques', 'changement-nom-patronymique', 'Changement de nom patronymique', 'nom-patronymique', 'nom-patronymique',
    'Publication préalable à une requête en changement de nom.'),
  t('personnes-physiques', 'declaration-insaisissabilite', 'Déclaration d’insaisissabilité', null, 'insaisissabilite',
    'Protection d’un bien foncier non affecté à l’activité professionnelle.'),

  // Rectificatif
  t('rectificatif', 'rectificatif-additif', 'Rectificatif ou additif', null, 'rectificatif',
    'Corriger une erreur ou compléter une annonce déjà publiée.'),
]

export function trouverType(slug: string): TypeAnnonce | undefined {
  return TYPES_ANNONCE.find((a) => a.slug === slug)
}

export function trouverCategorie(slug: string): Categorie | undefined {
  return CATEGORIES.find((c) => c.slug === slug)
}

export function typesDeCategorie(slug: string): TypeAnnonce[] {
  return TYPES_ANNONCE.filter((a) => a.categorie === slug)
}
