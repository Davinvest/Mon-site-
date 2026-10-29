import Link from 'next/link'

export function BandeauCta({
  titre = 'Le temps d’un clic, votre annonce est prête.',
  texte = 'Pas d’abonnement, pas de frais de dossier : vous payez le tarif fixé par l’État, la rédaction et la relecture sont incluses.',
}: {
  titre?: string
  texte?: string
}) {
  return (
    <section className="section">
      <div className="conteneur">
        <div className="bandeau-cta">
          <h2>{titre}</h2>
          <p>{texte}</p>
          <div className="actions" style={{ justifyContent: 'center' }}>
            <Link href="/tunnel" className="btn btn-accent">
              Publier mon annonce
            </Link>
            <Link href="/contact" className="btn btn-secondaire">
              Parler à un formaliste
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
