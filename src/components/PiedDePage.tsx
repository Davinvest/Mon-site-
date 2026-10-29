import Link from 'next/link'
import { SITE } from '@/data/site'
import { Logo } from './Logo'

export function PiedDePage() {
  return (
    <footer className="pied">
      <div className="conteneur">
        <div className="pied-grille">
          <div>
            <Logo />
            <p style={{ marginTop: 14, maxWidth: 300 }}>{SITE.slogan}</p>
            <p>
              <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
            </p>
          </div>
          <div>
            <h3>Annonces légales</h3>
            <ul>
              <li><Link href="/annonces-legales/constitution-societe-commerciale">Constitution</Link></li>
              <li><Link href="/annonces-legales/modification">Modification</Link></li>
              <li><Link href="/annonces-legales/dirigeants">Dirigeants</Link></li>
              <li><Link href="/annonces-legales/dissolution">Dissolution</Link></li>
              <li><Link href="/annonces-legales/tarifs">Tarifs 2026</Link></li>
            </ul>
          </div>
          <div>
            <h3>Formalités</h3>
            <ul>
              <li><Link href="/formalites#creation">Création</Link></li>
              <li><Link href="/formalites#modification">Modification</Link></li>
              <li><Link href="/formalites#cessation">Cessation</Link></li>
              <li><Link href="/formalites/comptes/depot-comptes-annuels">Dépôt des comptes</Link></li>
              <li><Link href="/formalites/tarifs">Honoraires</Link></li>
            </ul>
          </div>
          <div>
            <h3>Comptoir Légal</h3>
            <ul>
              <li><Link href="/qui-sommes-nous">Qui sommes-nous</Link></li>
              <li><Link href="/professionnels">Professionnels</Link></li>
              <li><Link href="/guides">Guides</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3>Informations</h3>
            <ul>
              <li><Link href="/mentions-legales">Mentions légales</Link></li>
              <li><Link href="/cgv">Conditions générales de vente</Link></li>
              <li><Link href="/confidentialite">Confidentialité</Link></li>
            </ul>
          </div>
        </div>
        <div className="pied-bas">
          <span>© {new Date().getFullYear()} {SITE.nom}. Tous droits réservés.</span>
          <span>Tarifs des annonces fixés par arrêté ministériel · Paiement sécurisé par Stripe</span>
        </div>
      </div>
    </footer>
  )
}
