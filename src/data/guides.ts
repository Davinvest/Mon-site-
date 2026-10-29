export interface Section {
  titre: string
  paragraphes?: string[]
  liste?: string[]
}

export interface Guide {
  slug: string
  titre: string
  description: string
  publieLe: string
  lienAction: { libelle: string; href: string }
  sections: Section[]
}

export const GUIDES: Guide[] = [
  {
    slug: 'creer-une-sas',
    titre: 'Créer une SAS : les étapes et le vrai coût',
    description: 'Statuts, dépôt du capital, annonce légale, guichet unique : les cinq étapes de la création d’une SAS et ce que chacune coûte.',
    publieLe: '2026-10-29',
    lienAction: { libelle: 'Publier l’annonce de constitution de ma SAS', href: '/tunnel?type=constitution-sas' },
    sections: [
      {
        titre: 'Pourquoi la SAS',
        paragraphes: [
          'La société par actions simplifiée laisse aux associés une grande liberté pour organiser les pouvoirs : président obligatoire, directeurs généraux facultatifs, règles de majorité et d’agrément librement fixées. La responsabilité des associés est limitée à leurs apports, et le président relève du régime des assimilés salariés.',
          'Seul, on crée une SASU : les démarches sont les mêmes, l’annonce légale est moins chère (142 € HT contre 199 € HT en 2026).',
        ],
      },
      {
        titre: 'Les cinq étapes',
        liste: [
          'Rédiger et signer les statuts : dénomination, siège, objet, durée, capital, et surtout les clauses de gouvernance et de cession.',
          'Déposer le capital : au moins la moitié des apports en numéraire, sur un compte bloqué au nom de la société en formation. Le capital peut être de 1 €.',
          'Publier l’annonce légale de constitution dans un journal habilité du département du siège : 199 € HT, forfait réglementé.',
          'Déposer le dossier d’immatriculation sur le guichet unique de l’INPI, avec l’attestation de parution, la déclaration des bénéficiaires effectifs et les justificatifs.',
          'Recevoir le Kbis, puis débloquer le capital auprès de la banque.',
        ],
      },
      {
        titre: 'Ce que ça coûte',
        paragraphes: [
          'Le poste incompressible est l’annonce légale : 199 € HT (238,80 € TTC) en métropole, 233 € HT à La Réunion et à Mayotte. S’y ajoutent les frais d’immatriculation et de dépôt de la déclaration des bénéficiaires effectifs, au tarif réglementé des greffes.',
          'Le reste dépend de vous : rédaction des statuts par un professionnel ou non, accompagnement pour le dépôt. Une SAS à plusieurs associés justifie souvent un conseil sur les statuts.',
        ],
      },
      {
        titre: 'Les erreurs qui retardent l’immatriculation',
        liste: [
          'Déposer le dossier avant d’avoir l’attestation de parution.',
          'Une annonce qui ne reprend pas exactement le capital, l’objet ou l’adresse des statuts.',
          'Oublier la durée de la société ou le greffe d’immatriculation dans l’annonce.',
          'Un justificatif de siège au nom d’une autre personne sans attestation d’hébergement.',
        ],
      },
    ],
  },
  {
    slug: 'guichet-unique-inpi',
    titre: 'Le guichet unique de l’INPI, mode d’emploi',
    description: 'Depuis 2023, toutes les formalités d’entreprise passent par formalites.entreprises.gouv.fr. Ce qui a changé et comment s’y retrouver.',
    publieLe: '2026-10-29',
    lienAction: { libelle: 'Confier ma formalité à un formaliste', href: '/formalites' },
    sections: [
      {
        titre: 'Ce qui a changé',
        paragraphes: [
          'Depuis le 1er janvier 2023, le guichet unique opéré par l’INPI est le point d’entrée obligatoire de toutes les formalités d’entreprise : création, modification, cessation et dépôt des comptes. Il a remplacé les centres de formalités des entreprises (CFE) et les dépôts papier au greffe.',
          'Le greffe reste compétent pour contrôler et inscrire les sociétés au RCS : le guichet unique lui transmet le dossier.',
        ],
      },
      {
        titre: 'Le parcours',
        liste: [
          'Créer un compte sur formalites.entreprises.gouv.fr.',
          'Choisir la formalité et remplir le formulaire en ligne.',
          'Joindre les pièces : statuts, attestation de parution de l’annonce, justificatifs d’identité et de siège.',
          'Signer électroniquement et payer les frais.',
          'Suivre l’instruction et répondre aux éventuelles demandes de régularisation.',
        ],
      },
      {
        titre: 'Les blocages fréquents',
        paragraphes: [
          'Les difficultés viennent surtout des pièces : une attestation de parution manquante, un justificatif de siège incomplet ou des statuts non signés suffisent à mettre le dossier en attente. Les demandes de régularisation arrivent par e-mail et doivent être traitées vite pour ne pas perdre la date de dépôt.',
          'Un formaliste peut déposer pour vous en tant que mandataire : vous n’avez pas à créer de compte ni à remplir le formulaire.',
        ],
      },
    ],
  },
  {
    slug: 'attestation-de-parution',
    titre: 'Attestation de parution : à quoi elle sert et comment l’obtenir',
    description: 'La pièce que le greffe exige pour toute formalité soumise à annonce légale. Ce qu’elle contient, quand la demander, que faire en cas d’erreur.',
    publieLe: '2026-10-29',
    lienAction: { libelle: 'Publier une annonce et recevoir l’attestation', href: '/tunnel' },
    sections: [
      {
        titre: 'Ce qu’elle prouve',
        paragraphes: [
          'L’attestation de parution est délivrée par le journal habilité après la publication. Elle certifie que l’annonce a paru, à quelle date, dans quel support et avec quel texte. Ce n’est pas une facture, et une facture ne la remplace pas.',
        ],
      },
      {
        titre: 'Où elle intervient',
        paragraphes: [
          'Elle fait partie des pièces justificatives du dossier déposé sur le guichet unique, pour une création, une modification ou une cessation. Tant qu’elle manque, le dossier est incomplet et n’est pas instruit.',
        ],
      },
      {
        titre: 'En cas d’erreur dans l’annonce',
        liste: [
          'Si le greffe rejette le dossier pour une autre raison, l’annonce reste valable : il suffit de corriger la pièce en cause.',
          'Si l’erreur porte sur l’annonce elle-même (mention manquante, capital erroné), il faut publier un avis rectificatif, facturé au caractère.',
          'Une relecture avant parution évite ce coût et ce délai : c’est pourquoi chaque annonce passe par un formaliste chez Comptoir Légal.',
        ],
      },
    ],
  },
  {
    slug: 'transfert-de-siege-social',
    titre: 'Transférer le siège social : procédure et annonces',
    description: 'Même département ou changement de greffe : décision, annonce légale, dossier au guichet unique, et le cas des deux annonces.',
    publieLe: '2026-10-29',
    lienAction: { libelle: 'Publier l’annonce de transfert de siège', href: '/tunnel?type=transfert-siege-meme-departement' },
    sections: [
      {
        titre: 'La décision',
        paragraphes: [
          'Selon les statuts, le transfert est décidé par les associés, par l’associé unique ou par le dirigeant. Dans une SAS, les statuts confient souvent ce pouvoir au président, sous réserve de ratification. La décision est constatée dans un procès-verbal et les statuts sont mis à jour.',
        ],
      },
      {
        titre: 'Une ou deux annonces',
        liste: [
          'Dans le même département : une seule annonce, au forfait de 109 € HT en 2026.',
          'Vers un autre département : deux annonces, l’une dans le département de départ, l’autre dans celui d’arrivée, chacune au forfait. L’annonce d’arrivée reprend les mentions complètes de la société (objet, durée, dirigeants).',
        ],
      },
      {
        titre: 'Le dossier',
        paragraphes: [
          'Le dossier de modification est déposé sur le guichet unique dans le mois qui suit la décision, avec le procès-verbal, les statuts à jour, le justificatif du nouveau siège et l’attestation de parution.',
        ],
      },
    ],
  },
  {
    slug: 'fermer-une-societe',
    titre: 'Fermer une société : dissolution puis liquidation',
    description: 'Les deux temps de la fermeture amiable d’une société, les deux annonces légales et ce qu’elles coûtent.',
    publieLe: '2026-10-29',
    lienAction: { libelle: 'Publier l’annonce de dissolution', href: '/tunnel?type=dissolution-anticipee' },
    sections: [
      {
        titre: 'Premier temps : la dissolution',
        paragraphes: [
          'Les associés décident la dissolution anticipée et nomment un liquidateur, souvent l’ancien dirigeant. La société continue d’exister pour les besoins de la liquidation : sa dénomination est suivie de la mention « en liquidation ».',
          'Annonce de dissolution : 153 € HT en 2026, puis dépôt du dossier sur le guichet unique.',
        ],
      },
      {
        titre: 'Second temps : la clôture',
        paragraphes: [
          'Le liquidateur vend les actifs, paie les dettes et établit les comptes de liquidation. Les associés les approuvent, donnent quitus au liquidateur et prononcent la clôture.',
          'Annonce de clôture : 111 € HT en 2026, puis dépôt des comptes de liquidation et demande de radiation.',
        ],
      },
      {
        titre: 'Le cas de l’associé unique personne morale',
        paragraphes: [
          'Lorsqu’une société appartient à une autre société, elle peut être dissoute sans liquidation : son patrimoine est transmis à l’associé unique (transmission universelle de patrimoine). Une seule annonce, facturée au caractère, ouvre un délai d’opposition de trente jours pour les créanciers.',
        ],
      },
    ],
  },
  {
    slug: 'depot-des-comptes-annuels',
    titre: 'Dépôt des comptes annuels : délais et sanctions',
    description: 'Qui doit déposer, dans quels délais, quelles pièces, et ce que risque une société en retard.',
    publieLe: '2026-10-29',
    lienAction: { libelle: 'Faire déposer mes comptes', href: '/formalites/comptes/depot-comptes-annuels' },
    sections: [
      {
        titre: 'Qui est concerné',
        paragraphes: [
          'Les sociétés commerciales (SARL, EURL, SAS, SASU, SA, et SNC dont tous les associés sont des SARL ou des sociétés par actions) doivent déposer leurs comptes au greffe. Les sociétés civiles, comme les SCI, n’y sont en principe pas tenues.',
        ],
      },
      {
        titre: 'Les délais',
        liste: [
          'Approbation des comptes dans les six mois suivant la clôture de l’exercice.',
          'Dépôt dans le mois qui suit l’approbation, porté à deux mois en cas de dépôt par voie électronique.',
          'Pour une clôture au 31 décembre : approbation avant le 30 juin, dépôt en ligne avant la fin août.',
        ],
      },
      {
        titre: 'Les pièces',
        liste: [
          'Bilan, compte de résultat et annexe.',
          'Procès-verbal d’approbation et proposition d’affectation du résultat.',
          'Rapport du commissaire aux comptes, s’il y en a un.',
          'Le cas échéant, la déclaration de confidentialité des comptes pour les micro et petites entreprises.',
        ],
      },
      {
        titre: 'Le risque',
        paragraphes: [
          'Le défaut de dépôt est puni d’une amende de 1 500 € (contravention de cinquième classe), et tout intéressé peut demander au président du tribunal d’enjoindre au dirigeant de déposer sous astreinte.',
        ],
      },
    ],
  },
]

export function trouverGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug)
}
