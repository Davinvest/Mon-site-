import type { Metadata } from 'next'
import { EnTetePage } from '@/components/EnTetePage'
import { FormulaireContact } from '@/components/FormulaireContact'
import { SITE } from '@/data/site'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Une question sur une annonce légale ou une formalité ? Écrivez-nous, nous vous répondons sous 24 h ouvrées.',
  alternates: { canonical: '/contact' },
}

export default function Contact() {
  return (
    <>
      <EnTetePage
        ariane={[{ nom: 'Contact' }]}
        surtitre="Contact"
        titre={
          <>
            Une question ? <em>Une réponse, pas un répondeur.</em>
          </>
        }
        chapo="Une annonce, une formalité, un partenariat : écrivez-nous. Nous vous répondons sous 24 h ouvrées."
      />
      <section className="section">
        <div className="conteneur duo duo-haut">
          <div>
            <p className="surtitre">Par e-mail</p>
            <h2>
              <a href={`mailto:${SITE.email}`} style={{ color: 'inherit' }}>
                {SITE.email}
              </a>
            </h2>
            <p className="muted">Pour une commande en cours, indiquez sa référence (elle commence par « CL- ») : nous retrouvons votre dossier tout de suite.</p>
            <ul className="liste-coches">
              <li>Une question sur une annonce déjà publiée</li>
              <li>Un doute sur le type d’acte à choisir</li>
              <li>Une démonstration pour votre cabinet</li>
            </ul>
          </div>
          <div className="carte carte-ombre">
            <FormulaireContact origine="/contact" />
          </div>
        </div>
      </section>
    </>
  )
}
