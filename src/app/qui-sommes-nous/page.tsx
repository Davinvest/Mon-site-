import type { Metadata } from 'next'
import Link from 'next/link'
import { BandeauCta } from '@/components/BandeauCta'
import { FilAriane } from '@/components/FilAriane'

export const metadata: Metadata = {
  title: 'Qui sommes-nous',
  description: 'Comptoir Légal rend la publication d’annonces légales et les formalités d’entreprise simples, transparentes et au juste prix.',
  alternates: { canonical: '/qui-sommes-nous' },
}

const convictions = [
  ['Le tarif réglementé, sans supplément', 'Le prix d’une annonce est fixé par l’État. Nous n’y ajoutons ni frais de dossier, ni option, ni marge cachée.'],
  ['Une relecture humaine', 'Chaque annonce est relue par un formaliste avant sa transmission. Une annonce juste du premier coup, c’est un dossier qui passe.'],
  ['La transparence', 'Les prix sont affichés avant la commande, les étapes sont expliquées, et vous savez à tout moment où en est votre dossier.'],
  ['Un service en français, par des personnes', 'Une question ? Un formaliste vous répond par e-mail ou vous rappelle.'],
]

export default function QuiSommesNous() {
  return (
    <>
      <section className="heros" style={{ paddingBottom: 24 }}>
        <div className="conteneur">
          <FilAriane elements={[{ nom: 'Qui sommes-nous' }]} />
          <span className="surtitre">Comptoir Légal</span>
          <h1>Le comptoir des formalités, ouvert à tous.</h1>
          <p className="chapo">
            Dirigeants, créateurs, cabinets : une annonce légale ou une formalité ne devrait pas coûter une après-midi ni réserver de
            mauvaise surprise. Nous avons construit Comptoir Légal pour que chaque démarche tienne en quelques minutes, au prix juste.
          </p>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 16 }}>
        <div className="conteneur">
          <h2>Nos engagements</h2>
          <div className="grille grille-2" style={{ marginTop: 20 }}>
            {convictions.map(([t, x]) => (
              <div key={t} className="carte">
                <h3>{t}</h3>
                <p className="muted" style={{ margin: 0 }}>
                  {x}
                </p>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 28 }}>
            Une question, un partenariat ? <Link href="/contact">Écrivez-nous</Link>.
          </p>
        </div>
      </section>
      <BandeauCta />
    </>
  )
}
