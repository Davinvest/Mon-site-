import type { Metadata } from 'next'
import Link from 'next/link'
import { BandeauCta } from '@/components/BandeauCta'
import { EnTetePage } from '@/components/EnTetePage'
import { SITE } from '@/data/site'

export const metadata: Metadata = {
  title: 'Qui sommes-nous',
  description: 'Comptoir Légal rend la publication d’annonces légales et les formalités d’entreprise rapides, transparentes et au juste prix.',
  alternates: { canonical: '/qui-sommes-nous' },
}

const engagements = [
  ['Le tarif de l’État, sans supplément', 'Le prix d’une annonce est fixé par arrêté. Nous n’y ajoutons ni frais de dossier, ni option, ni marge cachée.'],
  ['Juste du premier coup', 'Chaque formulaire impose les mentions obligatoires de son type d’acte, et vous relisez l’avis tel qu’il paraîtra. Une annonce exacte, c’est un dossier qui passe.'],
  ['Le temps rendu', 'Une seule saisie, aucun copier-coller. Chaque étape supprimée est du temps rendu au dirigeant ou au cabinet.'],
  ['La transparence', 'Les prix sont affichés avant la commande, les étapes sont expliquées, et vous savez à tout moment où en est votre dossier.'],
]

export default function QuiSommesNous() {
  return (
    <>
      <EnTetePage
        ariane={[{ nom: 'Qui sommes-nous' }]}
        surtitre={SITE.nom}
        titre={
          <>
            La rigueur du formaliste. <em>La vitesse du numérique.</em>
          </>
        }
        chapo="Une annonce légale ou une formalité ne devrait ni coûter une après-midi, ni réserver de mauvaise surprise. Nous avons construit Comptoir Légal pour que chaque démarche tienne en quelques minutes, au prix juste."
      />

      <section className="section">
        <div className="conteneur">
          <p className="surtitre">Nos engagements</p>
          <h2>
            Quatre règles, <em>sans exception</em>
          </h2>
          <div className="grille grille-2" style={{ marginTop: 28 }}>
            {engagements.map(([titre, texte]) => (
              <div key={titre} className="carte">
                <h3>{titre}</h3>
                <p className="muted" style={{ margin: 0 }}>
                  {texte}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="conteneur duo">
          <div>
            <p className="surtitre">Notre place</p>
            <h2>Un service privé, au service d’obligations publiques.</h2>
          </div>
          <div>
            <p>
              Les annonces légales sont publiées par des journaux habilités par les préfets, au tarif fixé par arrêté ministériel. Les
              formalités sont déposées au guichet unique de l’INPI et instruites par les greffes.
            </p>
            <p className="muted">
              {SITE.nom} est une société privée : elle ne remplace aucune de ces institutions, elle vous fait gagner du temps pour
              vous en acquitter. <Link href="/contact">Une question ? Écrivez-nous.</Link>
            </p>
          </div>
        </div>
      </section>

      <BandeauCta />
    </>
  )
}
