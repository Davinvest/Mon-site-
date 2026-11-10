/** Titre de l'avis tel qu'il paraît dans le journal, par modèle de rédaction. */
const TITRES_AVIS: Record<string, string> = {
  constitution: 'Avis de constitution',
  'transfert-siege': 'Transfert de siège social',
  'mouvement-dirigeant': 'Changement de dirigeant',
  capital: 'Modification du capital',
  objet: 'Modification de l’objet social',
  denomination: 'Changement de dénomination',
  duree: 'Prorogation de durée',
  pertes: 'Poursuite d’activité',
  transformation: 'Transformation de société',
  'cession-parts': 'Cession de parts sociales',
  dissolution: 'Avis de dissolution',
  cloture: 'Clôture de liquidation',
  tup: 'Dissolution sans liquidation',
  'cession-fonds': 'Cession de fonds de commerce',
  'location-gerance': 'Location-gérance',
  'droit-au-bail': 'Cession de droit au bail',
  'regime-matrimonial': 'Changement de régime matrimonial',
  'nom-patronymique': 'Changement de nom',
  insaisissabilite: 'Déclaration d’insaisissabilité',
  rectificatif: 'Rectificatif',
}

export function titreAvis(modele: string): string {
  return TITRES_AVIS[modele] ?? 'Annonce légale'
}

/**
 * L'annonce telle qu'elle paraît : une coupure de journal d'annonces légales.
 * Sert d'aperçu dans le parcours de commande et d'illustration sur les fiches.
 */
export function CoupureJournal({
  titre,
  texte,
  lieu = 'Journal habilité',
  penchee = false,
}: {
  titre: string
  texte: string
  /** Mention à droite de la manchette, par exemple « Rhône (69) » */
  lieu?: string
  penchee?: boolean
}) {
  return (
    <div className={`coupure${penchee ? ' coupure-penchee' : ''}`}>
      <div className="coupure-tete">
        <span>Annonces légales</span>
        <span>{lieu}</span>
      </div>
      <p className="coupure-titre">{titre}</p>
      <div className="coupure-filet" aria-hidden="true" />
      {texte ? (
        <>
          <p className="coupure-texte" lang="fr">
            {texte}
          </p>
          <p className="coupure-pied">Pour avis.</p>
        </>
      ) : (
        <p className="coupure-texte coupure-vide">Votre annonce s’écrit ici, au fil de votre saisie.</p>
      )}
    </div>
  )
}
