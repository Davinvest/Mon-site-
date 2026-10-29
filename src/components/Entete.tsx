import Link from 'next/link'
import { CATEGORIES, TYPES_ANNONCE } from '@/data/annonces'
import { CATEGORIES_FORMALITES, FORMALITES } from '@/data/formalites'
import { Logo } from './Logo'

const populaires = TYPES_ANNONCE.filter((t) => t.populaire)

export function Entete() {
  return (
    <header className="entete">
      <div className="conteneur entete-inner">
        <Logo />

        <nav className="nav" aria-label="Navigation principale">
          <div className="nav-item">
            <Link href="/annonces-legales" className="nav-lien">
              Annonces légales <span aria-hidden="true">▾</span>
            </Link>
            <div className="mega">
              <div className="mega-intro">
                <h3>Publier une annonce légale</h3>
                <p className="petit muted">Journal habilité dans le département du siège, tarif réglementé 2026, relecture par un formaliste.</p>
                <Link href="/tunnel" className="btn btn-primaire btn-bloc">
                  Publier mon annonce
                </Link>
                <p className="petit" style={{ marginTop: 12 }}>
                  <Link href="/annonces-legales/tarifs">Tarifs 2026 des annonces légales</Link>
                </p>
              </div>
              <div>
                <p className="surtitre">Par type d’acte</p>
                <div className="mega-cols">
                  {CATEGORIES.map((c) => (
                    <Link key={c.slug} href={`/annonces-legales/${c.slug}`}>
                      {c.titre}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="nav-item">
            <Link href="/formalites" className="nav-lien">
              Formalités <span aria-hidden="true">▾</span>
            </Link>
            <div className="mega">
              <div className="mega-intro">
                <h3>Déléguer une formalité</h3>
                <p className="petit muted">Création, modification, cessation : un formaliste prépare et dépose votre dossier au guichet unique.</p>
                <Link href="/formalites" className="btn btn-primaire btn-bloc">
                  Voir les formalités
                </Link>
                <p className="petit" style={{ marginTop: 12 }}>
                  <Link href="/formalites/tarifs">Tarifs des formalités</Link>
                </p>
              </div>
              <div className="mega-cols">
                {CATEGORIES_FORMALITES.map((c) => (
                  <div key={c.slug}>
                    <p className="surtitre" style={{ marginBottom: 2 }}>
                      {c.titre}
                    </p>
                    {FORMALITES.filter((f) => f.categorie === c.slug)
                      .slice(0, 4)
                      .map((f) => (
                        <Link key={f.slug} href={`/formalites/${f.categorie}/${f.slug}`}>
                          {f.titre}
                        </Link>
                      ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Link href="/professionnels" className="nav-lien">
            Professionnels
          </Link>
          <Link href="/guides" className="nav-lien">
            Guides
          </Link>
          <Link href="/contact" className="nav-lien">
            Contact
          </Link>
        </nav>

        <div className="entete-actions">
          <Link href="/tunnel" className="btn btn-primaire">
            Publier une annonce
          </Link>
        </div>

        <details className="menu-mobile">
          <summary aria-label="Ouvrir le menu">
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </summary>
          <div className="menu-mobile-panneau">
            <Link href="/annonces-legales">Annonces légales</Link>
            {populaires.slice(0, 4).map((t) => (
              <Link key={t.slug} href={`/annonces-legales/${t.categorie}/${t.slug}`} style={{ paddingLeft: 18, fontWeight: 400 }}>
                {t.titre}
              </Link>
            ))}
            <Link href="/annonces-legales/tarifs">Tarifs des annonces</Link>
            <Link href="/formalites">Formalités</Link>
            <Link href="/formalites/tarifs">Honoraires formalités</Link>
            <Link href="/professionnels">Professionnels (CRM, API)</Link>
            <Link href="/guides">Guides</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/tunnel" className="btn btn-primaire btn-bloc">
              Publier une annonce
            </Link>
          </div>
        </details>
      </div>
    </header>
  )
}
