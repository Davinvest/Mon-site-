import type { Metadata } from 'next'
import { FilAriane } from '@/components/FilAriane'
import { FormulaireContact } from '@/components/FormulaireContact'
import { SITE } from '@/data/site'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Une question sur une annonce légale ou une formalité ? Écrivez-nous, un formaliste vous répond sous 24 h ouvrées.',
  alternates: { canonical: '/contact' },
}

export default function Contact() {
  return (
    <section className="section" style={{ paddingTop: 40 }}>
      <div className="conteneur grille grille-2" style={{ gap: 40, alignItems: 'start' }}>
        <div>
          <FilAriane elements={[{ nom: 'Contact' }]} />
          <h1>Contactez-nous</h1>
          <p className="chapo">Une question sur une annonce, une formalité ou un partenariat ? Un formaliste vous répond sous 24 h ouvrées.</p>
          <p>
            Par e-mail : <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
          </p>
        </div>
        <div className="carte carte-ombre">
          <FormulaireContact origine="/contact" />
        </div>
      </div>
    </section>
  )
}
