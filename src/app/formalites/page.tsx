import type { Metadata } from 'next'
import Link from 'next/link'
import { BandeauCta } from '@/components/BandeauCta'
import { Faq } from '@/components/Faq'
import { FilAriane } from '@/components/FilAriane'
import { CATEGORIES_FORMALITES, ETAPES_FORMALITE, FORMALITES } from '@/data/formalites'
import { euros } from '@/lib/prix'

export const metadata: Metadata = {
  title: 'Formalités d’entreprise : création, modification, cessation',
  description:
    'Confiez vos formalités à un formaliste : annonce légale, dossier sur le guichet unique de l’INPI et suivi jusqu’au Kbis. Honoraires forfaitaires.',
  alternates: { canonical: '/formalites' },
}

export default function Formalites() {
  return (
    <>
      <section className="heros" style={{ paddingBottom: 24 }}>
        <div className="conteneur">
          <FilAriane elements={[{ nom: 'Formalités' }]} />
          <span className="surtitre">Guichet unique INPI</span>
          <h1>Vos formalités, déposées par un formaliste</h1>
          <p className="chapo">
            Depuis 2023, toutes les formalités d’entreprise passent par le guichet unique de l’INPI. Nous préparons le dossier, publions
            l’annonce légale, déposons et suivons chaque échange avec le greffe jusqu’au justificatif final.
          </p>
          <div className="actions">
            <a href="#catalogue" className="btn btn-primaire">
              Choisir ma formalité
            </a>
            <Link href="/formalites/tarifs" className="btn btn-secondaire">
              Nos honoraires
            </Link>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="conteneur">
          <h2>Comment ça se passe</h2>
          <ol className="etapes" style={{ marginTop: 24 }}>
            {ETAPES_FORMALITE.map((e) => (
              <li key={e.titre}>
                <strong>{e.titre}</strong>
                <span className="muted">{e.texte}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section" id="catalogue">
        <div className="conteneur">
          {CATEGORIES_FORMALITES.map((c) => (
            <div key={c.slug} id={c.slug} style={{ marginBottom: 44, scrollMarginTop: 90 }}>
              <h2>{c.titre}</h2>
              <p className="muted">{c.description}</p>
              <div className="grille grille-3">
                {FORMALITES.filter((f) => f.categorie === c.slug).map((f) => (
                  <Link key={f.slug} href={`/formalites/${f.categorie}/${f.slug}`} className="carte carte-lien">
                    <strong>{f.titre}</strong>
                    <span className="petit muted">{f.resume}</span>
                    <span className="prix">{euros(f.honoraires)} HT d’honoraires</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section section-alt">
        <div className="conteneur" style={{ maxWidth: 860 }}>
          <h2>Questions fréquentes</h2>
          <Faq
            questions={[
              {
                q: 'Que comprennent vos honoraires ?',
                r: 'La vérification des pièces, la préparation et le dépôt du dossier sur le guichet unique, le suivi des demandes de régularisation du greffe et la transmission du justificatif final. Les frais officiels (greffe, INPI) et l’annonce légale sont facturés en plus, à leur tarif réglementé, sans marge.',
              },
              {
                q: 'Dois-je créer un compte sur le guichet unique ?',
                r: 'Non. Nous déposons le dossier en tant que mandataire ; vous signez électroniquement le pouvoir et, si nécessaire, le formulaire.',
              },
              {
                q: 'Travaillez-vous pour les professionnels ?',
                r: 'Oui : experts-comptables, avocats et cabinets nous sous-traitent leurs formalités. Voir notre offre professionnels.',
              },
            ]}
          />
        </div>
      </section>

      <BandeauCta titre="Une question sur votre formalité ?" texte="Un formaliste vous rappelle sous 24 h ouvrées pour cadrer le dossier et vous envoyer un devis." />
    </>
  )
}
