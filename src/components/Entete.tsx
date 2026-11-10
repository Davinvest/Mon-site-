import Link from 'next/link'
import { CATEGORIES } from '@/data/annonces'
import { CATEGORIES_FORMALITES, FORMALITES } from '@/data/formalites'
import { ANNEE_TARIFS } from '@/data/tarifs-annonces'
import { Logo } from './Logo'

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
                <p className="petit muted">Journal habilité du département, tarif fixé par l’État, attestation de parution.</p>
                <Link href="/tunnel" className="btn btn-primaire btn-bloc">
                  Publier mon annonce
                </Link>
                <p className="petit" style={{ margin: '12px 0 0' }}>
                  <Link href="/annonces-legales/tarifs">Tarifs {ANNEE_TARIFS} des annonces légales</Link>
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
              Guichet unique <span aria-hidden="true">▾</span>
            </Link>
            <div className="mega">
              <div className="mega-intro">
                <h3>Votre dossier INPI, déjà pré-rempli</h3>
                <p className="petit muted">Déposez vos pièces : le brouillon se crée sur votre compte du guichet unique.</p>
                <Link href="/formalites" className="btn btn-primaire btn-bloc">
                  Découvrir le service
                </Link>
                <p className="petit" style={{ margin: '12px 0 0' }}>
                  <Link href="/formalites/tarifs">Prix du brouillon, en jetons</Link>
                </p>
              </div>
              <div className="mega-cols">
                {CATEGORIES_FORMALITES.slice(0, 2).map((c) => (
                  <div key={c.slug}>
                    <p className="surtitre">{c.titre}</p>
                    {FORMALITES.filter((f) => f.categorie === c.slug)
                      .slice(0, 5)
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

          <Link href="/annonces-legales/tarifs" className="nav-lien">
            Tarifs
          </Link>
          <Link href="/guides" className="nav-lien">
            Guides
          </Link>
          <Link href="/contact" className="nav-lien">
            Contact
          </Link>
        </nav>

        <div className="entete-actions">
          <Link href="/connexion" className="btn btn-secondaire">
            Se connecter
          </Link>
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
            <Link href="/formalites">Guichet unique</Link>
            <Link href="/annonces-legales/tarifs">Tarifs</Link>
            <Link href="/professionnels">Cabinets</Link>
            <Link href="/guides">Guides</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/connexion">Se connecter</Link>
            <Link href="/tunnel" className="btn btn-primaire btn-bloc">
              Publier une annonce
            </Link>
          </div>
        </details>
      </div>
    </header>
  )
}
