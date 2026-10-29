/**
 * Vrai seulement quand la publication est automatisée de bout en bout (API partenaire) :
 * les textes passent alors de « rédigée » à « publiée ». Ne jamais forcer à true sans cela.
 */
export const PUBLICATION_INSTANTANEE = process.env.CONNECTEUR === 'lgdf'

/**
 * Informations de l'éditeur. Les champs « À COMPLÉTER » doivent être renseignés
 * avant la mise en ligne (mentions légales, CGV, pied de page).
 */
export const SITE = {
  nom: 'Comptoir Légal',
  domaine: 'comptoirlegal.fr',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://comptoirlegal.fr',
  slogan: `Le temps d’un clic, votre annonce légale est ${PUBLICATION_INSTANTANEE ? 'publiée' : 'rédigée'}.`,
  description:
    'Publiez votre annonce légale en ligne au tarif réglementé 2026 et confiez vos formalités d’entreprise à des formalistes : création, modification, dissolution.',
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
