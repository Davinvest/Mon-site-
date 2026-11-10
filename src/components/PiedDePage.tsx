import Link from 'next/link'
import { REFERENCES, SITE } from '@/data/site'
import { ANNEE_TARIFS } from '@/data/tarifs-annonces'
import { Logo } from './Logo'

export function PiedDePage() {
  return (
    <footer className="pied">
      <div className="conteneur">
        <p className="pied-signature">{SITE.signature}</p>
        <div className="pied-grille">
          <div>
            <Logo />
            <p style={{ marginTop: 14, maxWidth: 300 }}>
              Annonces légales au tarif fixé par l’État et formalités au guichet unique de l’INPI, pour les dirigeants et les cabinets.
            </p>
            <p>
              <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
            </p>
          </div>
          <div>
            <h3>Annonces légales</h3>
            <ul>
              <li><Link href="/tunnel">Publier une annonce</Link></li>
              <li><Link href="/annonces-legales/constitution-societe-commerciale">Constitution</Link></li>
              <li><Link href="/annonces-legales/modification">Modification</Link></li>
              <li><Link href="/annonces-legales/dissolution">Dissolution</Link></li>
              <li><Link href="/annonces-legales/tarifs">Tarifs {ANNEE_TARIFS}</Link></li>
            </ul>
          </div>
          <div>
            <h3>Guichet unique</h3>
            <ul>
              <li><Link href="/formalites">Le service</Link></li>
              <li><Link href="/formalites#creation">Création de société</Link></li>
              <li><Link href="/formalites#modification">Modification</Link></li>
              <li><Link href="/formalites#cessation">Cessation</Link></li>
              <li><Link href="/formalites/tarifs">Prix en jetons</Link></li>
            </ul>
          </div>
          <div>
            <h3>Comptoir Légal</h3>
            <ul>
              <li><Link href="/qui-sommes-nous">Qui sommes-nous</Link></li>
              <li><Link href="/professionnels">Cabinets</Link></li>
              <li><Link href="/guides">Guides</Link></li>
              <li><Link href="/contact">Contact</Link></li>
              <li><Link href="/connexion">Se connecter</Link></li>
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
          <span>
            Tarifs des annonces : {REFERENCES.arrete.toLowerCase()} · Paiement sécurisé par Stripe
          </span>
        </div>
      </div>
    </footer>
  )
}
