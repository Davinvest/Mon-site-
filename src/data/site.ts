/**
 * Mode maquette : actif tant que le site ne tourne pas sur son domaine définitif
 * (NEXT_PUBLIC_SITE_URL non renseignée). Il affiche le bandeau « maquette », exclut
 * le site des moteurs de recherche et présente le service dans son état cible.
 */
export const MAQUETTE = !process.env.NEXT_PUBLIC_SITE_URL

/**
 * Vrai quand la publication est automatisée de bout en bout (API partenaire), ou en
 * maquette, qui montre l'état cible : les textes disent alors « publiée » et non « rédigée ».
 */
export const PUBLICATION_INSTANTANEE = MAQUETTE || process.env.CONNECTEUR === 'lgdf'

/**
 * Informations de l'éditeur. Les champs « À COMPLÉTER » doivent être renseignés
 * avant la mise en ligne (mentions légales, CGV, pied de page).
 */
export const SITE = {
  nom: 'Comptoir Légal',
  domaine: 'comptoirlegal.fr',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://comptoirlegal.fr',
  slogan: `Le temps d’un clic, votre annonce légale est ${PUBLICATION_INSTANTANEE ? 'publiée' : 'rédigée'}.`,
  signature: 'La formalité, sans formalités.',
  description:
    'Publiez votre annonce légale en ligne au tarif fixé par l’État et préparez vos formalités au guichet unique de l’INPI : création, modification, dissolution.',
  email: 'contact@comptoirlegal.fr',
  telephone: '',
  editeur: {
    raisonSociale: '[À COMPLÉTER : raison sociale]',
    forme: '[À COMPLÉTER : forme et capital]',
    siege: '[À COMPLÉTER : adresse du siège]',
    rcs: '[À COMPLÉTER : SIREN et RCS]',
    tva: '[À COMPLÉTER : n° de TVA intracommunautaire]',
    directeurPublication: '[À COMPLÉTER : directeur de la publication]',
  },
  hebergeur: {
    nom: 'Vercel Inc.',
    adresse: '440 N Barranca Ave #4133, Covina, CA 91723, États-Unis',
    site: 'https://vercel.com',
  },
}

/** Le slogan de chaque page : une seule source, reprise aussi par la page Charte. */
export const SLOGANS = {
  accueil: SITE.slogan,
  annonces: 'La loi exige une annonce. Nous en faisons l’affaire de quelques secondes.',
  fiche: 'votre avis, prêt à paraître.',
  tarifs: 'Le tarif de l’État. Pas un euro de plus.',
  publier: 'Vous saisissez une fois. Tout le reste suit.',
  guichet: 'Le guichet unique, sans la file d’attente.',
  cabinets: 'Vos dossiers avancent. Vous, vous conseillez.',
  guides: 'Le droit des sociétés, sans jargon.',
  apropos: 'La rigueur du formaliste. La vitesse du numérique.',
  contact: 'Une question ? Une réponse, pas un répondeur.',
  confirmation: 'C’est parti. Votre annonce est en route.',
  fin: 'Votre prochaine formalité ne prendra pas votre journée.',
} as const

/** Textes de référence cités sur le site. */
export const REFERENCES = {
  loi1955: 'Loi n° 55-4 du 4 janvier 1955',
  arrete: 'Arrêté du 19 novembre 2025',
  codeCommerce: 'Art. R. 210-9 du Code de commerce',
  retractation: 'Art. L. 221-28 du Code de la consommation',
} as const
