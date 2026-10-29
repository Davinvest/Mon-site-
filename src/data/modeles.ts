/**
 * Modèles de rédaction des annonces légales.
 * Chaque modèle décrit les champs du formulaire (étape 4 du tunnel) et
 * produit le texte de l'annonce à partir de la saisie.
 */

export type TypeChamp = 'texte' | 'zone' | 'date' | 'nombre' | 'cp' | 'choix' | 'case' | 'siren'

export interface Champ {
  nom: string
  libelle: string
  type: TypeChamp
  options?: string[]
  requis?: boolean
  aide?: string
  placeholder?: string
}

export interface Groupe {
  titre: string
  champs: Champ[]
}

export interface GroupeRepetable {
  nom: string
  titre: string
  libelleAjout: string
  min: number
  max: number
  champs: Champ[]
}

export interface Saisie {
  champs: Record<string, string>
  listes: Record<string, Record<string, string>[]>
}

export interface Modele {
  id: string
  groupes: Groupe[]
  repetables?: GroupeRepetable[]
  /** Champ code postal qui détermine le département de publication */
  champCodePostal: string
  /** Mentions que l'annonce doit contenir (affichées sur la fiche et en aide) */
  mentions: string[]
  rediger: (s: Saisie, contexte: ContexteRedaction) => string
}

export interface ContexteRedaction {
  /** Forme juridique par défaut du type d'annonce (ex. SAS) */
  forme?: string
  /** Variante propre au type d'annonce (ex. « ancien-siege ») */
  variante?: string
}

export const FORMES_JURIDIQUES = [
  'SAS', 'SASU', 'SARL', 'EURL', 'SA', 'SNC', 'SCS', 'SCA', 'SLP', 'SCI', 'SCCV', 'Société civile', 'SCM',
  'SCP', 'SCPI', 'SCEA', 'EARL', 'GAEC', 'SELARL', 'SELURL', 'SELAS', 'SELASU', 'SELAFA', 'SELCA',
]

const QUALITES_DIRIGEANT = [
  'Président', 'Directeur général', 'Directeur général délégué', 'Gérant', 'Administrateur',
  'Président du conseil de surveillance', 'Membre du directoire', 'Associé commandité',
  'Commissaire aux comptes titulaire', 'Commissaire aux comptes suppléant', 'Liquidateur',
]

const ORGANES = [
  "l'assemblée générale extraordinaire",
  "l'assemblée générale ordinaire",
  "l'associé unique",
  'le président',
  'la gérance',
  "le conseil d'administration",
  'les associés (décision unanime)',
]

/* ---------- utilitaires de rédaction ---------- */

const val = (s: Saisie, nom: string) => (s.champs[nom] ?? '').trim()

const coche = (s: Saisie, nom: string) => s.champs[nom] === 'oui'

function dateFr(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso
  const [a, m, j] = iso.split('-').map(Number)
  const mois = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
  ][m - 1]
  return `${j === 1 ? '1er' : j} ${mois} ${a}`
}

function montant(brut: string): string {
  const n = Number(brut.replace(/\s/g, '').replace(',', '.'))
  if (!brut || Number.isNaN(n)) return brut
  return n.toLocaleString('fr-FR', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })
}

/** Assemble des phrases en ignorant celles dont une donnée manque. */
function phrases(...parties: (string | false | null | undefined)[]): string {
  return parties
    .filter((p): p is string => Boolean(p && p.trim()))
    .map((p) => p.trim().replace(/\s+/g, ' '))
    .join(' ')
}

/** « X » si toutes les valeurs sont présentes, sinon une chaîne vide. */
function si(valeurs: string[], texte: string): string {
  return valeurs.every(Boolean) ? texte : ''
}

function adresse(s: Saisie, prefixe: string): string {
  const a = val(s, `${prefixe}_adresse`)
  const cp = val(s, `${prefixe}_cp`)
  const v = val(s, `${prefixe}_ville`)
  return [a, [cp, v].filter(Boolean).join(' ')].filter(Boolean).join(', ')
}

function personne(p: Record<string, string>): string {
  if (p.personne_morale === 'oui') {
    return phrases(
      p.denomination_pm,
      p.forme_pm && `, ${p.forme_pm}`,
      p.siege_pm && `, dont le siège est ${p.siege_pm}`,
      p.rcs_pm && `, ${p.rcs_pm}`,
      p.representant_pm && `, représentée par ${p.representant_pm}`,
    ).replace(/ ,/g, ',')
  }
  const nom = [p.civilite, p.prenom, p.nom?.toUpperCase()].filter(Boolean).join(' ')
  return p.adresse ? `${nom}, demeurant ${p.adresse}` : nom
}

function acte(s: Saisie): string {
  const nature = val(s, 'acte_nature')
  const date = val(s, 'acte_date')
  if (!date) return ''
  if (nature === 'Acte authentique') {
    const notaire = val(s, 'acte_notaire')
    return `Aux termes d'un acte authentique reçu le ${dateFr(date)}${notaire ? ` par Maître ${notaire}` : ''}`
  }
  const lieu = val(s, 'acte_lieu')
  return `Aux termes d'un acte sous seing privé${lieu ? ` établi à ${lieu}` : ''} en date du ${dateFr(date)}`
}

function decision(s: Saisie): string {
  const organe = val(s, 'decision_organe')
  const date = val(s, 'decision_date')
  if (!date) return ''
  return `Aux termes d'une décision de ${organe || "l'assemblée générale"} en date du ${dateFr(date)}`
}

/** En-tête d'identification d'une société existante. */
function enTeteSociete(s: Saisie): string {
  const capital = val(s, 'capital')
  return phrases(
    val(s, 'denomination').toUpperCase(),
    val(s, 'forme') && `\n${val(s, 'forme')}`,
    capital && ` au capital de ${montant(capital)} €`,
    adresse(s, 'siege') && `\nSiège social : ${adresse(s, 'siege')}`,
    si([val(s, 'siren'), val(s, 'greffe')], `\n${formatSiren(val(s, 'siren'))} RCS ${val(s, 'greffe')}`),
  ).replace(/ \n/g, '\n')
}

function formatSiren(siren: string): string {
  const d = siren.replace(/\D/g, '')
  return d.length === 9 ? `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}` : siren
}

function mentionRcs(s: Saisie): string {
  const greffe = val(s, 'greffe')
  return greffe ? `Mention sera faite au RCS de ${greffe}.` : ''
}

/* ---------- groupes de champs réutilisables ---------- */

const champsSociete: Champ[] = [
  { nom: 'denomination', libelle: 'Dénomination sociale', type: 'texte', requis: true },
  { nom: 'forme', libelle: 'Forme juridique', type: 'choix', options: FORMES_JURIDIQUES, requis: true },
  { nom: 'capital', libelle: 'Capital social (€)', type: 'nombre' },
  { nom: 'siege_adresse', libelle: 'Adresse du siège social', type: 'texte', requis: true },
  { nom: 'siege_cp', libelle: 'Code postal du siège', type: 'cp', requis: true },
  { nom: 'siege_ville', libelle: 'Ville du siège', type: 'texte', requis: true },
  { nom: 'siren', libelle: 'Numéro SIREN', type: 'siren', requis: true, placeholder: '123 456 789' },
  { nom: 'greffe', libelle: 'Greffe (ville du RCS)', type: 'texte', requis: true },
]

const champsDecision: Champ[] = [
  { nom: 'decision_organe', libelle: 'Organe ayant décidé', type: 'choix', options: ORGANES, requis: true },
  { nom: 'decision_date', libelle: 'Date de la décision', type: 'date', requis: true },
  { nom: 'date_effet', libelle: "Date d'effet (si différente)", type: 'date' },
]

const champsActe: Champ[] = [
  {
    nom: 'acte_nature',
    libelle: "Nature de l'acte",
    type: 'choix',
    options: ['Acte sous seing privé', 'Acte authentique'],
    requis: true,
  },
  { nom: 'acte_date', libelle: "Date de signature de l'acte", type: 'date', requis: true },
  { nom: 'acte_lieu', libelle: 'Lieu de signature', type: 'texte' },
  { nom: 'acte_notaire', libelle: 'Notaire (acte authentique)', type: 'texte', placeholder: 'Nom, ville de l’étude' },
]

const champsPersonne = (qualites: string[] | null): Champ[] => [
  ...(qualites ? [{ nom: 'qualite', libelle: 'Qualité', type: 'choix' as const, options: qualites, requis: true }] : []),
  { nom: 'personne_morale', libelle: 'Personne morale', type: 'case' },
  { nom: 'civilite', libelle: 'Civilité', type: 'choix', options: ['Monsieur', 'Madame'] },
  { nom: 'prenom', libelle: 'Prénom', type: 'texte' },
  { nom: 'nom', libelle: 'Nom', type: 'texte' },
  { nom: 'adresse', libelle: 'Adresse complète', type: 'texte' },
  { nom: 'denomination_pm', libelle: 'Dénomination (personne morale)', type: 'texte' },
  { nom: 'forme_pm', libelle: 'Forme (personne morale)', type: 'texte' },
  { nom: 'siege_pm', libelle: 'Siège (personne morale)', type: 'texte' },
  { nom: 'rcs_pm', libelle: 'SIREN et RCS (personne morale)', type: 'texte' },
  { nom: 'representant_pm', libelle: 'Représentant permanent', type: 'texte' },
]

/* ---------- modèles ---------- */

const constitution: Modele = {
  id: 'constitution',
  champCodePostal: 'siege_cp',
  mentions: [
    'Dénomination sociale (et sigle le cas échéant)',
    'Forme juridique',
    'Montant du capital social (et capital minimum si variable)',
    'Adresse du siège social',
    'Objet social, résumé fidèlement',
    'Durée de la société',
    'Identité des dirigeants (et des commissaires aux comptes s’il y en a)',
    'Greffe du RCS où la société sera immatriculée',
    'Conditions d’admission aux assemblées et d’agrément (sociétés par actions)',
  ],
  groupes: [
    { titre: 'Acte', champs: champsActe },
    {
      titre: 'Identité de la société',
      champs: [
        { nom: 'denomination', libelle: 'Dénomination sociale', type: 'texte', requis: true },
        { nom: 'sigle', libelle: 'Sigle (facultatif)', type: 'texte' },
        { nom: 'forme', libelle: 'Forme juridique', type: 'choix', options: FORMES_JURIDIQUES, requis: true },
        { nom: 'objet', libelle: 'Objet social', type: 'zone', requis: true, aide: 'Reprenez l’objet des statuts, sans le résumer au point d’en changer le sens.' },
        { nom: 'capital', libelle: 'Capital social (€)', type: 'nombre', requis: true },
        { nom: 'capital_variable', libelle: 'Capital variable', type: 'case' },
        { nom: 'capital_minimum', libelle: 'Capital minimum (si variable)', type: 'nombre' },
        { nom: 'duree', libelle: 'Durée (années)', type: 'nombre', requis: true, placeholder: '99' },
      ],
    },
    {
      titre: 'Siège social',
      champs: [
        { nom: 'siege_adresse', libelle: 'Adresse du siège social', type: 'texte', requis: true },
        { nom: 'siege_cp', libelle: 'Code postal', type: 'cp', requis: true },
        { nom: 'siege_ville', libelle: 'Ville', type: 'texte', requis: true },
        { nom: 'greffe', libelle: 'Greffe d’immatriculation (ville)', type: 'texte', requis: true },
      ],
    },
    {
      titre: 'Clauses (sociétés par actions)',
      champs: [
        { nom: 'clause_admission', libelle: 'Admission aux assemblées et droit de vote', type: 'zone', placeholder: 'Ex. : Tout associé peut participer aux décisions collectives ; chaque action donne droit à une voix.' },
        { nom: 'clause_agrement', libelle: 'Clause d’agrément', type: 'zone', placeholder: 'Ex. : Les cessions d’actions à des tiers sont soumises à l’agrément de la collectivité des associés.' },
      ],
    },
  ],
  repetables: [
    {
      nom: 'dirigeants',
      titre: 'Dirigeants et commissaires aux comptes',
      libelleAjout: 'Ajouter un dirigeant',
      min: 1,
      max: 8,
      champs: champsPersonne(QUALITES_DIRIGEANT),
    },
  ],
  rediger(s, ctx) {
    const forme = val(s, 'forme') || ctx.forme || ''
    const capitalVariable = coche(s, 'capital_variable')
    const dirigeants = (s.listes.dirigeants ?? [])
      .filter((d) => d.nom || d.denomination_pm)
      .map((d) => `${d.qualite || 'Dirigeant'} : ${personne(d)}.`)
      .join('\n')
    return phrases(
      acte(s) && `${acte(s)}, il a été constitué une société présentant les caractéristiques suivantes :`,
      `\nForme : ${forme}.`,
      val(s, 'denomination') && `\nDénomination : ${val(s, 'denomination').toUpperCase()}.`,
      val(s, 'sigle') && `\nSigle : ${val(s, 'sigle')}.`,
      adresse(s, 'siege') && `\nSiège social : ${adresse(s, 'siege')}.`,
      val(s, 'objet') && `\nObjet : ${val(s, 'objet')}.`,
      val(s, 'duree') && `\nDurée : ${val(s, 'duree')} ans à compter de son immatriculation au RCS.`,
      val(s, 'capital') &&
        (capitalVariable
          ? `\nCapital variable : ${montant(val(s, 'capital'))} €${val(s, 'capital_minimum') ? `, capital minimum : ${montant(val(s, 'capital_minimum'))} €` : ''}.`
          : `\nCapital : ${montant(val(s, 'capital'))} €.`),
      val(s, 'clause_admission') && `\nAdmission aux assemblées et droit de vote : ${val(s, 'clause_admission')}`,
      val(s, 'clause_agrement') && `\nAgrément : ${val(s, 'clause_agrement')}`,
      dirigeants && `\n${dirigeants}`,
      val(s, 'greffe') && `\nImmatriculation au RCS de ${val(s, 'greffe')}.`,
    ).replace(/ \n/g, '\n')
  },
}

const transfertSiege: Modele = {
  id: 'transfert-siege',
  champCodePostal: 'siege_cp',
  mentions: [
    'Identification de la société (dénomination, forme, capital, SIREN, RCS)',
    'Organe et date de la décision',
    'Ancienne et nouvelle adresse du siège',
    'Date d’effet du transfert',
    'En cas de changement de greffe : radiation et nouvelle immatriculation',
  ],
  groupes: [
    { titre: 'Société (ancien siège)', champs: champsSociete },
    { titre: 'Décision', champs: champsDecision },
    {
      titre: 'Nouveau siège',
      champs: [
        { nom: 'nouveau_adresse', libelle: 'Adresse du nouveau siège', type: 'texte', requis: true },
        { nom: 'nouveau_cp', libelle: 'Code postal', type: 'cp', requis: true },
        { nom: 'nouveau_ville', libelle: 'Ville', type: 'texte', requis: true },
        { nom: 'nouveau_greffe', libelle: 'Nouveau greffe (si changement)', type: 'texte' },
        { nom: 'objet', libelle: 'Objet social (annonce du nouveau siège)', type: 'zone' },
        { nom: 'duree', libelle: 'Durée (annonce du nouveau siège)', type: 'texte' },
        { nom: 'dirigeants_texte', libelle: 'Dirigeants (annonce du nouveau siège)', type: 'zone' },
      ],
    },
  ],
  rediger(s, ctx) {
    const effet = val(s, 'date_effet') || val(s, 'decision_date')
    const nouveauGreffe = val(s, 'nouveau_greffe')
    const nouveauSiege = ctx.variante === 'nouveau-siege'
    return phrases(
      enTeteSociete(s),
      `\n${decision(s)}, il a été décidé de transférer le siège social du ${adresse(s, 'siege')} au ${adresse(s, 'nouveau')}${effet ? `, à compter du ${dateFr(effet)}` : ''}.`,
      nouveauSiege && val(s, 'objet') && `\nObjet : ${val(s, 'objet')}.`,
      nouveauSiege && val(s, 'duree') && `\nDurée : ${val(s, 'duree')}.`,
      nouveauSiege && val(s, 'dirigeants_texte') && `\nDirigeants : ${val(s, 'dirigeants_texte')}.`,
      nouveauGreffe
        ? nouveauSiege
          ? `\nLa société sera immatriculée au RCS de ${nouveauGreffe} et radiée du RCS de ${val(s, 'greffe')}.`
          : `\nLa société fera l'objet d'une nouvelle immatriculation au RCS de ${nouveauGreffe} et sera radiée du RCS de ${val(s, 'greffe')}.`
        : `\n${mentionRcs(s)}`,
    ).replace(/ \n/g, '\n')
  },
}

/** Variantes de mouvement de dirigeants, partagées par plusieurs types d'annonce. */
const mouvementDirigeant: Modele = {
  id: 'mouvement-dirigeant',
  champCodePostal: 'siege_cp',
  mentions: [
    'Identification de la société',
    'Organe et date de la décision',
    'Fonction concernée',
    'Identité du partant et/ou du nouvel entrant (nom, prénom, adresse)',
  ],
  groupes: [
    { titre: 'Société', champs: champsSociete },
    { titre: 'Décision', champs: champsDecision },
    {
      titre: 'Fonction',
      champs: [
        { nom: 'fonction', libelle: 'Fonction concernée', type: 'choix', options: QUALITES_DIRIGEANT, requis: true },
        {
          nom: 'evenement',
          libelle: 'Nature du changement',
          type: 'choix',
          options: ['Nomination', 'Démission', 'Révocation', 'Non-renouvellement', 'Remplacement'],
          requis: true,
        },
        { nom: 'partant', libelle: 'Dirigeant sortant (nom, prénom)', type: 'texte' },
      ],
    },
  ],
  repetables: [
    {
      nom: 'entrants',
      titre: 'Nouveau(x) titulaire(s) de la fonction',
      libelleAjout: 'Ajouter une personne',
      min: 0,
      max: 4,
      champs: champsPersonne(null),
    },
  ],
  rediger(s, ctx) {
    const fonction = val(s, 'fonction') || 'dirigeant'
    const evenement = ctx.variante === 'demission-pour-ordre' ? 'Démission' : val(s, 'evenement')
    const entrants = (s.listes.entrants ?? []).filter((p) => p.nom || p.denomination_pm).map(personne)
    const effet = val(s, 'date_effet')
    const partant = val(s, 'partant')
    let corps: string
    if (evenement === 'Nomination') {
      corps = `${entrants.join(' ; ')} a été nommé(e) en qualité de ${fonction}`
    } else if (evenement === 'Remplacement') {
      corps = `${entrants.join(' ; ')} a été nommé(e) en qualité de ${fonction}, en remplacement de ${partant}`
    } else {
      const motif = { Démission: 'démissionnaire', Révocation: 'révoqué(e)', 'Non-renouvellement': 'dont le mandat n’a pas été renouvelé' }[
        evenement
      ]
      corps = `il a été pris acte de la cessation des fonctions de ${fonction} de ${partant}, ${motif ?? ''}`
      if (entrants.length) corps += `. ${entrants.join(' ; ')} a été nommé(e) en remplacement`
    }
    return phrases(
      enTeteSociete(s),
      `\n${decision(s)}, ${corps}${effet ? `, à compter du ${dateFr(effet)}` : ''}.`,
      `\n${mentionRcs(s)}`,
    ).replace(/ \n/g, '\n')
  },
}

function modeleModificationSimple(
  id: string,
  mentions: string[],
  champsSpecifiques: Champ[],
  corps: (s: Saisie) => string,
): Modele {
  return {
    id,
    champCodePostal: 'siege_cp',
    mentions: ['Identification de la société', 'Organe et date de la décision', ...mentions],
    groupes: [
      { titre: 'Société', champs: champsSociete },
      { titre: 'Décision', champs: champsDecision },
      { titre: 'Modification', champs: champsSpecifiques },
    ],
    rediger(s) {
      const effet = val(s, 'date_effet')
      return phrases(
        enTeteSociete(s),
        `\n${decision(s)}, ${corps(s)}${effet ? `, à compter du ${dateFr(effet)}` : ''}.`,
        'Les statuts ont été modifiés en conséquence.',
        `\n${mentionRcs(s)}`,
      ).replace(/ \n/g, '\n')
    },
  }
}

const capital = modeleModificationSimple(
  'capital',
  ['Nature de l’opération', 'Ancien et nouveau montant du capital'],
  [
    {
      nom: 'operation',
      libelle: 'Opération',
      type: 'choix',
      options: ['augmenté', 'réduit'],
      requis: true,
    },
    { nom: 'modalite', libelle: 'Modalité', type: 'texte', placeholder: 'Ex. : par apport en numéraire, par incorporation de réserves' },
    { nom: 'ancien_capital', libelle: 'Ancien capital (€)', type: 'nombre', requis: true },
    { nom: 'nouveau_capital', libelle: 'Nouveau capital (€)', type: 'nombre', requis: true },
  ],
  (s) =>
    `le capital social a été ${val(s, 'operation') || 'modifié'}${val(s, 'modalite') ? ` ${val(s, 'modalite')}` : ''} pour être porté de ${montant(val(s, 'ancien_capital'))} € à ${montant(val(s, 'nouveau_capital'))} €`,
)

const objet = modeleModificationSimple(
  'objet',
  ['Nouvel objet social'],
  [{ nom: 'nouvel_objet', libelle: 'Nouvel objet social', type: 'zone', requis: true }],
  (s) => `l'objet social a été modifié comme suit : ${val(s, 'nouvel_objet')}`,
)

const denomination = modeleModificationSimple(
  'denomination',
  ['Ancienne et nouvelle dénomination (et sigle)'],
  [
    { nom: 'nouvelle_denomination', libelle: 'Nouvelle dénomination', type: 'texte', requis: true },
    { nom: 'nouveau_sigle', libelle: 'Nouveau sigle (facultatif)', type: 'texte' },
  ],
  (s) =>
    `la dénomination sociale a été modifiée et devient « ${val(s, 'nouvelle_denomination').toUpperCase()} »${val(s, 'nouveau_sigle') ? `, sigle « ${val(s, 'nouveau_sigle')} »` : ''}, en remplacement de « ${val(s, 'denomination').toUpperCase()} »`,
)

const duree = modeleModificationSimple(
  'duree',
  ['Ancienne et nouvelle durée ou date d’expiration'],
  [
    { nom: 'ancienne_duree', libelle: 'Ancienne durée / échéance', type: 'texte' },
    { nom: 'nouvelle_duree', libelle: 'Nouvelle durée / échéance', type: 'texte', requis: true, placeholder: 'Ex. : 99 ans, soit jusqu’au 31 décembre 2124' },
  ],
  (s) =>
    `la durée de la société a été prorogée${val(s, 'ancienne_duree') ? ` (antérieurement : ${val(s, 'ancienne_duree')})` : ''} et fixée à ${val(s, 'nouvelle_duree')}`,
)

const pertes = modeleModificationSimple(
  'pertes',
  ['Décision de ne pas dissoudre la société malgré des capitaux propres inférieurs à la moitié du capital'],
  [],
  () =>
    "statuant en application de l'article L. 223-42 ou L. 225-248 du Code de commerce, il a été décidé de ne pas dissoudre la société bien que les capitaux propres soient devenus inférieurs à la moitié du capital social",
)

const transformation: Modele = {
  ...modeleModificationSimple(
    'transformation',
    ['Ancienne et nouvelle forme', 'Nouveaux organes de direction', 'Modifications corrélatives'],
    [
      { nom: 'nouvelle_forme', libelle: 'Nouvelle forme juridique', type: 'choix', options: FORMES_JURIDIQUES, requis: true },
      { nom: 'anciens_dirigeants', libelle: 'Anciens dirigeants (fonction, nom)', type: 'zone' },
      { nom: 'nouveaux_dirigeants', libelle: 'Nouveaux dirigeants (fonction, nom, adresse)', type: 'zone', requis: true },
      { nom: 'clauses', libelle: 'Admission aux assemblées / agrément (si société par actions)', type: 'zone' },
    ],
    (s) =>
      phrases(
        `la société a été transformée en ${val(s, 'nouvelle_forme')}, sans création d'un être moral nouveau.`,
        'La dénomination, l’objet, le siège, la durée et le capital restent inchangés.',
        val(s, 'anciens_dirigeants') && `Ancienne direction : ${val(s, 'anciens_dirigeants')}.`,
        val(s, 'nouveaux_dirigeants') && `Nouvelle direction : ${val(s, 'nouveaux_dirigeants')}.`,
        val(s, 'clauses') && `${val(s, 'clauses')}.`,
      ).replace(/\.$/, ''),
  ),
}

const cessionParts = modeleModificationSimple(
  'cession-parts',
  ['Identité du cédant et du cessionnaire', 'Nombre de parts cédées', 'Modification des statuts'],
  [
    { nom: 'cedant', libelle: 'Cédant (nom, adresse)', type: 'texte', requis: true },
    { nom: 'cessionnaire', libelle: 'Cessionnaire (nom, adresse)', type: 'texte', requis: true },
    { nom: 'nombre_parts', libelle: 'Nombre de parts cédées', type: 'nombre', requis: true },
    { nom: 'autres_modifs', libelle: 'Autres modifications (associés en nom, gérance…)', type: 'zone' },
  ],
  (s) =>
    phrases(
      `il a été pris acte de la cession de ${val(s, 'nombre_parts')} parts sociales par ${val(s, 'cedant')} au profit de ${val(s, 'cessionnaire')}.`,
      val(s, 'autres_modifs'),
    ).replace(/\.$/, ''),
)

const dissolution: Modele = {
  id: 'dissolution',
  champCodePostal: 'siege_cp',
  mentions: [
    'Identification de la société',
    'Date et organe de la décision de dissolution',
    'Identité et adresse du liquidateur',
    'Siège de la liquidation, adresse de correspondance',
    'Greffe de dépôt des actes',
  ],
  groupes: [
    { titre: 'Société', champs: champsSociete },
    { titre: 'Décision', champs: champsDecision },
    {
      titre: 'Liquidation',
      champs: [
        { nom: 'liquidateur', libelle: 'Liquidateur (nom, prénom, adresse)', type: 'texte', requis: true },
        { nom: 'siege_liquidation', libelle: 'Siège de la liquidation', type: 'texte', requis: true },
        { nom: 'correspondance', libelle: 'Adresse de correspondance (si différente)', type: 'texte' },
      ],
    },
  ],
  rediger(s) {
    const effet = val(s, 'date_effet') || val(s, 'decision_date')
    return phrases(
      enTeteSociete(s),
      `\n${decision(s)}, il a été décidé la dissolution anticipée de la société à compter du ${dateFr(effet)} et sa mise en liquidation amiable.`,
      `\nLiquidateur : ${val(s, 'liquidateur')}, avec les pouvoirs les plus étendus pour réaliser l'actif et apurer le passif.`,
      `\nLe siège de la liquidation est fixé au ${val(s, 'siege_liquidation')}.`,
      val(s, 'correspondance') && `C'est à cette adresse que la correspondance doit être envoyée : ${val(s, 'correspondance')}.`,
      val(s, 'greffe') && `\nLes actes et pièces relatifs à la liquidation seront déposés au greffe du tribunal de ${val(s, 'greffe')}.`,
    ).replace(/ \n/g, '\n')
  },
}

const cloture: Modele = {
  id: 'cloture',
  champCodePostal: 'siege_cp',
  mentions: [
    'Identification de la société (en liquidation)',
    'Date de l’assemblée de clôture',
    'Approbation des comptes, quitus et décharge du liquidateur',
    'Greffe de dépôt des comptes de liquidation',
  ],
  groupes: [
    { titre: 'Société', champs: champsSociete },
    {
      titre: 'Clôture',
      champs: [
        { nom: 'decision_organe', libelle: 'Organe ayant décidé', type: 'choix', options: ORGANES, requis: true },
        { nom: 'decision_date', libelle: 'Date de la décision', type: 'date', requis: true },
        { nom: 'liquidateur', libelle: 'Liquidateur (nom, prénom)', type: 'texte', requis: true },
      ],
    },
  ],
  rediger(s) {
    return phrases(
      `${val(s, 'denomination').toUpperCase()}\n${val(s, 'forme')} en liquidation${val(s, 'capital') ? ` au capital de ${montant(val(s, 'capital'))} €` : ''}`,
      `\nSiège social : ${adresse(s, 'siege')}`,
      `\n${formatSiren(val(s, 'siren'))} RCS ${val(s, 'greffe')}`,
      `\n${decision(s)}, les comptes de liquidation ont été approuvés, quitus a été donné au liquidateur, ${val(s, 'liquidateur')}, qui a été déchargé de son mandat, et la clôture des opérations de liquidation a été prononcée.`,
      `\nLes comptes de liquidation seront déposés au greffe du tribunal de ${val(s, 'greffe')}.`,
      'Mention sera faite au RCS.',
    ).replace(/ \n/g, '\n')
  },
}

const tup: Modele = {
  id: 'tup',
  champCodePostal: 'siege_cp',
  mentions: [
    'Identification de la société dissoute',
    'Identité de l’associé unique personne morale',
    'Date de la décision',
    'Délai d’opposition des créanciers (30 jours) et tribunal compétent',
  ],
  groupes: [
    { titre: 'Société dissoute', champs: champsSociete },
    { titre: 'Décision', champs: champsDecision },
    {
      titre: 'Associé unique',
      champs: [
        { nom: 'associe_unique', libelle: 'Associé unique (dénomination, forme, siège, RCS)', type: 'zone', requis: true },
        { nom: 'tribunal', libelle: 'Tribunal compétent pour les oppositions', type: 'texte', requis: true },
      ],
    },
  ],
  rediger(s) {
    return phrases(
      enTeteSociete(s),
      `\n${decision(s)}, ${val(s, 'associe_unique')}, associée unique, a décidé la dissolution sans liquidation de la société, entraînant la transmission universelle de son patrimoine, conformément à l'article 1844-5 alinéa 3 du Code civil.`,
      `\nLes créanciers peuvent former opposition dans un délai de trente jours à compter de la présente publication devant le tribunal de ${val(s, 'tribunal')}.`,
      `\n${mentionRcs(s)}`,
    ).replace(/ \n/g, '\n')
  },
}

const champsFonds: Champ[] = [
  { nom: 'fonds_nature', libelle: 'Nature du fonds', type: 'texte', requis: true, placeholder: 'Ex. : fonds de commerce de restauration' },
  { nom: 'fonds_enseigne', libelle: 'Enseigne / nom commercial', type: 'texte' },
  { nom: 'fonds_adresse', libelle: 'Adresse du fonds', type: 'texte', requis: true },
  { nom: 'fonds_cp', libelle: 'Code postal du fonds', type: 'cp', requis: true },
  { nom: 'fonds_ville', libelle: 'Ville du fonds', type: 'texte', requis: true },
]

const cessionFonds: Modele = {
  id: 'cession-fonds',
  champCodePostal: 'fonds_cp',
  mentions: [
    'Date et nature de l’acte, enregistrement',
    'Identité du vendeur et de l’acquéreur',
    'Désignation et adresse du fonds',
    'Prix et date d’entrée en jouissance',
    'Domicile élu pour les oppositions (10 jours après la publication au BODACC)',
  ],
  groupes: [
    { titre: 'Acte', champs: [...champsActe, { nom: 'enregistrement', libelle: 'Enregistrement (SIE, date, références)', type: 'texte' }] },
    {
      titre: 'Parties',
      champs: [
        { nom: 'vendeur', libelle: 'Vendeur (identité complète, RCS)', type: 'zone', requis: true },
        { nom: 'acquereur', libelle: 'Acquéreur (identité complète, RCS)', type: 'zone', requis: true },
      ],
    },
    { titre: 'Fonds', champs: champsFonds },
    {
      titre: 'Conditions',
      champs: [
        { nom: 'prix', libelle: 'Prix (€)', type: 'nombre', requis: true },
        { nom: 'jouissance', libelle: "Date d'entrée en jouissance", type: 'date', requis: true },
        { nom: 'oppositions', libelle: 'Domicile élu pour les oppositions', type: 'texte', requis: true },
      ],
    },
  ],
  rediger(s) {
    return phrases(
      `${acte(s)}${val(s, 'enregistrement') ? `, enregistré ${val(s, 'enregistrement')}` : ''},`,
      `${val(s, 'vendeur')} a vendu à ${val(s, 'acquereur')}`,
      `un ${val(s, 'fonds_nature')}${val(s, 'fonds_enseigne') ? ` exploité sous l'enseigne « ${val(s, 'fonds_enseigne')} »` : ''}, sis ${adresse(s, 'fonds')},`,
      `moyennant le prix de ${montant(val(s, 'prix'))} €.`,
      val(s, 'jouissance') && `Entrée en jouissance : ${dateFr(val(s, 'jouissance'))}.`,
      `\nLes oppositions, s'il y a lieu, seront reçues dans les dix jours de la dernière en date des publications légales, au ${val(s, 'oppositions')}, où domicile a été élu à cet effet.`,
    ).replace(/ \n/g, '\n')
  },
}

const locationGerance: Modele = {
  id: 'location-gerance',
  champCodePostal: 'fonds_cp',
  mentions: [
    'Date de l’acte',
    'Identité du loueur et du locataire-gérant',
    'Désignation et adresse du fonds',
    'Durée et date de début (mise en location) ou date de fin',
  ],
  groupes: [
    { titre: 'Acte', champs: champsActe },
    {
      titre: 'Parties',
      champs: [
        { nom: 'loueur', libelle: 'Loueur (identité complète, RCS)', type: 'zone', requis: true },
        { nom: 'gerant', libelle: 'Locataire-gérant (identité complète, RCS)', type: 'zone', requis: true },
      ],
    },
    { titre: 'Fonds', champs: champsFonds },
    {
      titre: 'Durée',
      champs: [
        { nom: 'date_debut', libelle: 'Date de début / de fin', type: 'date', requis: true },
        { nom: 'duree_contrat', libelle: 'Durée du contrat (mise en location)', type: 'texte', placeholder: 'Ex. : un an renouvelable par tacite reconduction' },
      ],
    },
  ],
  rediger(s, ctx) {
    if (ctx.variante === 'fin') {
      return phrases(
        `La location-gérance du ${val(s, 'fonds_nature')} sis ${adresse(s, 'fonds')},`,
        `consentie par ${val(s, 'loueur')} à ${val(s, 'gerant')}${val(s, 'acte_date') ? ` suivant ${acte(s).replace("Aux termes d'", '').replace('un acte', 'acte')}` : ''},`,
        `a pris fin le ${dateFr(val(s, 'date_debut'))}.`,
      )
    }
    return phrases(
      `${acte(s)}, ${val(s, 'loueur')} a donné en location-gérance à ${val(s, 'gerant')}`,
      `un ${val(s, 'fonds_nature')}${val(s, 'fonds_enseigne') ? ` exploité sous l'enseigne « ${val(s, 'fonds_enseigne')} »` : ''}, sis ${adresse(s, 'fonds')},`,
      `à compter du ${dateFr(val(s, 'date_debut'))}${val(s, 'duree_contrat') ? `, pour une durée de ${val(s, 'duree_contrat')}` : ''}.`,
    )
  },
}

const droitAuBail: Modele = {
  id: 'droit-au-bail',
  champCodePostal: 'fonds_cp',
  mentions: ['Date de l’acte', 'Identité du cédant et du cessionnaire', 'Adresse des locaux', 'Prix', 'Domicile élu pour les oppositions'],
  groupes: [
    { titre: 'Acte', champs: champsActe },
    {
      titre: 'Parties',
      champs: [
        { nom: 'vendeur', libelle: 'Cédant (identité complète)', type: 'zone', requis: true },
        { nom: 'acquereur', libelle: 'Cessionnaire (identité complète)', type: 'zone', requis: true },
      ],
    },
    {
      titre: 'Locaux',
      champs: [
        { nom: 'fonds_adresse', libelle: 'Adresse des locaux', type: 'texte', requis: true },
        { nom: 'fonds_cp', libelle: 'Code postal', type: 'cp', requis: true },
        { nom: 'fonds_ville', libelle: 'Ville', type: 'texte', requis: true },
        { nom: 'prix', libelle: 'Prix (€)', type: 'nombre', requis: true },
        { nom: 'oppositions', libelle: 'Domicile élu pour les oppositions', type: 'texte' },
      ],
    },
  ],
  rediger(s) {
    return phrases(
      `${acte(s)}, ${val(s, 'vendeur')} a cédé à ${val(s, 'acquereur')} son droit au bail portant sur des locaux sis ${adresse(s, 'fonds')}, moyennant le prix de ${montant(val(s, 'prix'))} €.`,
      val(s, 'oppositions') && `\nLes oppositions, s'il y a lieu, seront reçues au ${val(s, 'oppositions')}.`,
    ).replace(/ \n/g, '\n')
  },
}

const champsParticulier: Champ[] = [
  { nom: 'domicile_adresse', libelle: 'Adresse du domicile', type: 'texte', requis: true },
  { nom: 'domicile_cp', libelle: 'Code postal', type: 'cp', requis: true },
  { nom: 'domicile_ville', libelle: 'Ville', type: 'texte', requis: true },
]

const regimeMatrimonial: Modele = {
  id: 'regime-matrimonial',
  champCodePostal: 'domicile_cp',
  mentions: [
    'Identité des époux et date du mariage',
    'Notaire et date de l’acte',
    'Ancien et nouveau régime',
    'Délai d’opposition (3 mois) et notaire destinataire',
  ],
  groupes: [
    {
      titre: 'Époux',
      champs: [
        { nom: 'epoux', libelle: 'Identité des époux (noms, prénoms, dates et lieux de naissance)', type: 'zone', requis: true },
        { nom: 'date_mariage', libelle: 'Date du mariage', type: 'date', requis: true },
        { nom: 'lieu_mariage', libelle: 'Lieu du mariage', type: 'texte', requis: true },
        ...champsParticulier,
      ],
    },
    {
      titre: 'Acte',
      champs: [
        { nom: 'acte_notaire', libelle: 'Notaire (nom, ville de l’étude)', type: 'texte', requis: true },
        { nom: 'acte_date', libelle: "Date de l'acte", type: 'date', requis: true },
        { nom: 'ancien_regime', libelle: 'Ancien régime', type: 'texte', requis: true, placeholder: 'Ex. : communauté réduite aux acquêts' },
        { nom: 'nouveau_regime', libelle: 'Nouveau régime', type: 'texte', requis: true, placeholder: 'Ex. : séparation de biens' },
      ],
    },
  ],
  rediger(s) {
    return phrases(
      `Suivant acte reçu par Maître ${val(s, 'acte_notaire')}, le ${dateFr(val(s, 'acte_date'))},`,
      `${val(s, 'epoux')}, demeurant ${adresse(s, 'domicile')}, mariés le ${dateFr(val(s, 'date_mariage'))} à ${val(s, 'lieu_mariage')},`,
      `ont convenu de changer de régime matrimonial et d'adopter le régime de la ${val(s, 'nouveau_regime')}, en remplacement de celui de la ${val(s, 'ancien_regime')}.`,
      `\nLes oppositions pourront être faites dans un délai de trois mois et devront être notifiées par lettre recommandée avec avis de réception ou par acte d'huissier de justice à Maître ${val(s, 'acte_notaire')}.`,
    ).replace(/ \n/g, '\n')
  },
}

const nomPatronymique: Modele = {
  id: 'nom-patronymique',
  champCodePostal: 'domicile_cp',
  mentions: ['Identité complète du demandeur', 'Adresse', 'Nom sollicité', 'Requête adressée au garde des Sceaux'],
  groupes: [
    {
      titre: 'Demandeur',
      champs: [
        { nom: 'civilite', libelle: 'Civilité', type: 'choix', options: ['Monsieur', 'Madame'], requis: true },
        { nom: 'nom_actuel', libelle: 'Nom actuel', type: 'texte', requis: true },
        { nom: 'prenoms', libelle: 'Prénoms', type: 'texte', requis: true },
        { nom: 'naissance', libelle: 'Date et lieu de naissance', type: 'texte', requis: true, placeholder: 'Ex. : né le 3 mai 1985 à Lyon (69)' },
        ...champsParticulier,
        { nom: 'nom_demande', libelle: 'Nom sollicité', type: 'texte', requis: true },
        { nom: 'enfants', libelle: 'Enfants mineurs concernés (facultatif)', type: 'texte' },
      ],
    },
  ],
  rediger(s) {
    return phrases(
      `${val(s, 'civilite')} ${val(s, 'nom_actuel').toUpperCase()} ${val(s, 'prenoms')}, ${val(s, 'naissance')}, demeurant ${adresse(s, 'domicile')},`,
      `dépose une requête auprès du garde des Sceaux, ministre de la Justice, afin de s'appeler à l'avenir ${val(s, 'nom_demande').toUpperCase()}`,
      val(s, 'enfants') ? `, ainsi que pour ses enfants mineurs : ${val(s, 'enfants')}.` : '.',
    ).replace(/ \./g, '.').replace(/ ,/g, ',')
  },
}

const insaisissabilite: Modele = {
  id: 'insaisissabilite',
  champCodePostal: 'domicile_cp',
  mentions: ['Identité du déclarant et activité professionnelle', 'Notaire et date de l’acte', 'Désignation du bien déclaré insaisissable'],
  groupes: [
    {
      titre: 'Déclarant',
      champs: [
        { nom: 'declarant', libelle: 'Identité du déclarant', type: 'texte', requis: true },
        { nom: 'activite', libelle: 'Activité professionnelle, SIREN et RCS/RM', type: 'texte', requis: true },
        ...champsParticulier,
      ],
    },
    {
      titre: 'Acte',
      champs: [
        { nom: 'acte_notaire', libelle: 'Notaire (nom, ville de l’étude)', type: 'texte', requis: true },
        { nom: 'acte_date', libelle: "Date de l'acte", type: 'date', requis: true },
        { nom: 'bien', libelle: 'Désignation du bien', type: 'zone', requis: true },
      ],
    },
  ],
  rediger(s) {
    return phrases(
      `Suivant acte reçu par Maître ${val(s, 'acte_notaire')}, le ${dateFr(val(s, 'acte_date'))},`,
      `${val(s, 'declarant')}, demeurant ${adresse(s, 'domicile')}, exerçant l'activité de ${val(s, 'activite')},`,
      `a déclaré insaisissable, conformément aux articles L. 526-1 et suivants du Code de commerce, le bien suivant : ${val(s, 'bien')}.`,
    )
  },
}

const rectificatif: Modele = {
  id: 'rectificatif',
  champCodePostal: 'siege_cp',
  mentions: ['Référence de l’annonce initiale (support, date)', 'Mention erronée et mention rectifiée'],
  groupes: [
    {
      titre: 'Annonce initiale',
      champs: [
        { nom: 'denomination', libelle: 'Dénomination (ou nom) concernée', type: 'texte', requis: true },
        { nom: 'siege_ville', libelle: 'Ville du siège (ou du domicile)', type: 'texte', requis: true },
        { nom: 'siege_cp', libelle: 'Code postal du siège (département de publication)', type: 'cp', requis: true },
        { nom: 'support_initial', libelle: 'Support de publication initial', type: 'texte', requis: true },
        { nom: 'date_initiale', libelle: 'Date de parution initiale', type: 'date', requis: true },
      ],
    },
    {
      titre: 'Rectification',
      champs: [
        { nom: 'erreur', libelle: 'Mention erronée', type: 'zone', requis: true },
        { nom: 'correction', libelle: 'Mention rectifiée', type: 'zone', requis: true },
      ],
    },
  ],
  rediger(s) {
    return phrases(
      `Rectificatif à l'annonce concernant ${val(s, 'denomination').toUpperCase()} (${val(s, 'siege_cp')} ${val(s, 'siege_ville')}), parue dans ${val(s, 'support_initial')} le ${dateFr(val(s, 'date_initiale'))} :`,
      `il fallait lire : « ${val(s, 'correction')} » au lieu de : « ${val(s, 'erreur')} ».`,
      'Le reste de l’annonce demeure inchangé.',
    )
  },
}

export const MODELES: Record<string, Modele> = Object.fromEntries(
  [
    constitution, transfertSiege, mouvementDirigeant, capital, objet, denomination, duree, pertes,
    transformation, cessionParts, dissolution, cloture, tup, cessionFonds, locationGerance, droitAuBail,
    regimeMatrimonial, nomPatronymique, insaisissabilite, rectificatif,
  ].map((m) => [m.id, m]),
)

/** Tous les champs (y compris répétables) d'un modèle, à plat. */
export function tousLesChamps(modele: Modele): Champ[] {
  return [...modele.groupes.flatMap((g) => g.champs), ...(modele.repetables ?? []).flatMap((r) => r.champs)]
}
