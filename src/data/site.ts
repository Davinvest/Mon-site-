/**
 * Informations de l'éditeur. Les champs « À COMPLÉTER » doivent être renseignés
 * avant la mise en ligne (mentions légales, CGV, pied de page).
 */
export const SITE = {
  nom: 'Comptoir Légal',
  domaine: 'comptoirlegal.fr',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://comptoirlegal.fr',
  slogan: 'Annonces légales et formalités, au tarif réglementé.',
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
