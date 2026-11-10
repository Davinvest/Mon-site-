import Link from 'next/link'
import { SLOGANS } from '@/data/site'

export function BandeauCta({
  titre = SLOGANS.fin,
  texte = 'Pas d’abonnement, pas de frais de dossier. Vous payez le tarif fixé par l’État, et l’attestation de parution est comprise.',
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
            <Link href="/tunnel" className="btn btn-clair">
              Publier mon annonce
            </Link>
            <Link href="/contact" className="btn btn-contour-clair">
              Nous contacter
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
