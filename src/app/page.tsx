import Link from 'next/link'
import { Attestation } from '@/components/Attestation'
import { BandeauCta } from '@/components/BandeauCta'
import { Chrono } from '@/components/Chrono'
import { CoupureJournal, titreAvis } from '@/components/CoupureJournal'
import { Refs } from '@/components/EnTetePage'
import { Faq } from '@/components/Faq'
import { TYPES_ANNONCE } from '@/data/annonces'
import { DEPARTEMENTS } from '@/data/departements'
import { saisieExemple } from '@/data/exemples'
import { JETONS_BROUILLON, JETONS_PAR_ANNONCE } from '@/data/formalites'
import { MODELES } from '@/data/modeles'
import { PUBLICATION_INSTANTANEE, REFERENCES, SLOGANS } from '@/data/site'
import { ANNEE_TARIFS, FORFAITS } from '@/data/tarifs-annonces'
import { euros, normaliserTexte, prixAffiche } from '@/lib/prix'

const ht = (cle: keyof typeof FORFAITS) => `${euros(FORFAITS[cle].france)} HT`

const actes = [
  { titre: 'Créer une société', slug: 'constitution-sas', detail: 'SAS, SASU, SARL, EURL, SCI…', prix: `dès ${ht('constitution-eurl')}` },
  { titre: 'Transférer le siège', slug: 'transfert-siege-meme-departement', detail: 'Même département ou non', prix: ht('transfert-siege') },
  { titre: 'Changer de dirigeant', slug: 'changement-dirigeant', detail: 'Gérant, président, directeur général', prix: ht('dirigeants') },
  { titre: 'Modifier le capital', slug: 'modification-capital-social', detail: 'Augmentation ou réduction', prix: ht('capital-social') },
  { titre: 'Changer de dénomination', slug: 'changement-denomination', detail: 'Nouveau nom, nouveau sigle', prix: ht('denomination') },
  { titre: 'Dissoudre, liquider', slug: 'dissolution-anticipee', detail: 'Dissolution, puis clôture', prix: `dès ${ht('cloture-liquidation')}` },
]

const questions = [
  {
    q: 'Combien coûte une annonce légale ?',
    r: `Le prix est fixé chaque année par arrêté ministériel et il est le même dans tous les journaux habilités. En ${ANNEE_TARIFS} : ${ht('constitution-sas')} pour la constitution d’une SAS, ${ht('constitution-sasu')} pour une SASU, ${ht('constitution-sarl')} pour une SARL, ${ht('constitution-eurl')} pour une EURL, ${ht('transfert-siege')} pour un transfert de siège ou un changement de dirigeant. Comptoir Légal n’ajoute aucun frais.`,
  },
  {
    q: 'Qui rédige l’annonce ?',
    r: 'Le formulaire, à partir de vos réponses : il impose les mentions obligatoires du type d’acte choisi. Vous relisez l’aperçu, vous pouvez l’ajuster, puis vous payez.',
  },
  {
    q: 'Dans quel journal mon annonce paraît-elle ?',
    r: 'Dans un journal habilité du département du siège social (ou du lieu du fonds, ou de votre domicile pour une annonce de particulier). Le département est déduit du code postal saisi.',
  },
  {
    q: 'Quand vais-je recevoir l’attestation de parution ?',
    r: 'Elle est disponible dans votre espace et envoyée par e-mail. C’est la pièce que le guichet unique de l’INPI exige pour instruire votre formalité.',
  },
  {
    q: 'Comment fonctionne le guichet unique ?',
    r: 'Vous déposez vos pièces en PDF. Un brouillon pré-rempli est créé sur votre compte INPI : vous le relisez, vous le signez et vous réglez les frais officiels sur le site de l’INPI. Rien n’est déposé sans vous.',
  },
  {
    q: 'Faut-il créer un compte ?',
    r: 'Pas pour publier une annonce : vous la rédigez, vous payez, vous recevez l’attestation par e-mail. Un compte sert à retrouver vos attestations, à gérer votre cabinet et à utiliser le guichet unique.',
  },
]

export default function Accueil() {
  const populaires = TYPES_ANNONCE.filter((t) => t.populaire).slice(0, 8)
  const exemple = normaliserTexte(MODELES.constitution.rediger(saisieExemple('SAS'), { forme: 'SAS' }))

  return (
    <>
      <section className="heros">
        <div className="conteneur heros-grille">
          <div>
            <p className="surtitre">Annonces légales · Guichet unique INPI</p>
            <h1>
              Le temps d’un clic, votre annonce légale est <em>{PUBLICATION_INSTANTANEE ? 'publiée' : 'rédigée'}</em>.
            </h1>
            <p className="chapo">
              Vous remplissez un formulaire. L’annonce s’écrit sous vos yeux, part au journal habilité de votre département, et
              l’attestation de parution vous revient. En quelques secondes, au tarif fixé par l’État.
            </p>
            <div className="actions">
              <Link href="/tunnel" className="btn btn-primaire">
                Publier mon annonce
              </Link>
              <Link href="/annonces-legales/tarifs" className="btn btn-secondaire">
                Voir les tarifs {ANNEE_TARIFS}
              </Link>
            </div>
            <ul className="puces-confiance">
              <li>Sans abonnement</li>
              <li>Tarif fixé par l’État</li>
              <li>Attestation de parution comprise</li>
            </ul>
            <Refs refs={[REFERENCES.loi1955, REFERENCES.arrete]} />
          </div>

          <Chrono />
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0, paddingBottom: 56 }}>
        <div className="conteneur">
          <ul className="reperes">
            <li>
              <strong>{TYPES_ANNONCE.length}</strong>
              <span>types d’annonces légales, chacun avec son formulaire</span>
            </li>
            <li>
              <strong>{Object.keys(DEPARTEMENTS).length}</strong>
              <span>départements et collectivités couverts, outre-mer compris</span>
            </li>
            <li>
              <strong>0 €</strong>
              <span>de frais ajoutés au tarif fixé par l’État</span>
            </li>
            <li>
              <strong>1</strong>
              <span>seule saisie, du formulaire à l’attestation</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="section section-alt">
        <div className="conteneur">
          <p className="surtitre">Sélectionnez votre acte</p>
          <h2>
            Quelle annonce devez-vous <em>publier</em> ?
          </h2>
          <div className="grille grille-3" style={{ marginTop: 28 }}>
            {actes.map((a) => (
              <Link key={a.slug} href={`/tunnel?type=${a.slug}`} className="carte carte-lien">
                <strong>{a.titre}</strong>
                <span className="petit muted">{a.detail}</span>
                <span className="prix">{a.prix}</span>
              </Link>
            ))}
          </div>
          <p className="petit muted" style={{ marginTop: 16, marginBottom: 0 }}>
            Un autre acte ? Cession de fonds, location-gérance, transformation, rectificatif…{' '}
            <Link href="/tunnel">Voir les {TYPES_ANNONCE.length} types d’annonces</Link>
          </p>
        </div>
      </section>

      <section className="section">
        <div className="conteneur">
          <p className="surtitre">Une seule saisie</p>
          <h2>
            Vous saisissez une fois. <em>Tout le reste suit.</em>
          </h2>
          <p className="chapo">Les informations de votre société ne se tapent qu’une fois. Chaque destinataire reçoit ensuite sa pièce.</p>
          <div className="destinataires">
            <div className="carte">
              <span className="numero">01 · LE JOURNAL</span>
              <h3>Votre annonce paraît</h3>
              <p className="muted" style={{ margin: 0 }}>
                Elle part au journal habilité du département du siège, au tarif réglementé. Vous choisissez la date de parution.
              </p>
            </div>
            <div className="carte">
              <span className="numero">02 · L’ATTESTATION</span>
              <h3>La preuve vous revient</h3>
              <p className="muted" style={{ margin: 0 }}>
                L’attestation de parution est rangée dans votre espace et envoyée par e-mail. Le guichet unique l’exige.
              </p>
            </div>
            <div className="carte">
              <span className="numero">03 · L’INPI</span>
              <h3>Le dossier se prépare</h3>
              <p className="muted" style={{ margin: 0 }}>
                Déposez vos pièces : le brouillon est pré-rempli sur votre compte du guichet unique. Vous relisez, vous signez.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="conteneur duo">
          <div>
            <p className="surtitre">La preuve par le document</p>
            <h2>
              Votre annonce, <em>comme dans le journal</em>.
            </h2>
            <p className="muted">
              Pendant que vous remplissez le formulaire, l’avis prend la forme exacte qu’il aura à la parution : les mentions exigées
              par les textes, rien de plus. Sur une annonce facturée au caractère, chaque mot inutile se paie.
            </p>
            <ul className="liste-coches">
              <li>Les mentions obligatoires de chaque type d’acte</li>
              <li>Le prix officiel recalculé à chaque modification</li>
              <li>L’attestation de parution, à joindre à votre dossier</li>
            </ul>
            <div className="actions">
              <Link href="/tunnel?type=constitution-sas" className="btn btn-primaire">
                Essayer avec une SAS
              </Link>
            </div>
          </div>
          <div className="pile-documents">
            <CoupureJournal titre={titreAvis('constitution')} texte={exemple} lieu="Rhône (69)" penchee />
            <Attestation />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="conteneur">
          <p className="surtitre">Ce qui change</p>
          <h2>
            La formalité, <em>sans formalités</em>.
          </h2>
          <div className="comparatif" style={{ marginTop: 28 }}>
            <div className="carte carte-avant">
              <h3>Le parcours habituel</h3>
              <ul className="liste-coches liste-croix">
                <li>Chercher un journal habilité dans le bon département</li>
                <li>Rédiger l’annonce à la main, mention par mention</li>
                <li>Découvrir le prix au moment de payer</li>
                <li>Attendre l’attestation pour avancer le dossier</li>
                <li>Ressaisir les mêmes informations au guichet unique</li>
              </ul>
            </div>
            <div className="carte carte-avec">
              <h3>Avec Comptoir Légal</h3>
              <ul className="liste-coches">
                <li>Le journal habilité est trouvé d’après le siège</li>
                <li>L’annonce s’écrit pendant que vous remplissez le formulaire</li>
                <li>Le prix officiel s’affiche avant le paiement</li>
                <li>L’attestation arrive dans votre espace et par e-mail</li>
                <li>Vos pièces pré-remplissent le brouillon INPI</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="conteneur duo">
          <div>
            <p className="surtitre">Cabinets d’expertise comptable, d’avocats, formalistes</p>
            <h2>{SLOGANS.cabinets}</h2>
            <ul className="liste-coches">
              <li>Plusieurs cabinets dans un seul espace, chacun avec ses commandes</li>
              <li>Vos collègues invités pour commander avec vous</li>
              <li>Un lien de paiement à envoyer à votre client</li>
              <li>
                Chaque annonce publiée crédite {JETONS_PAR_ANNONCE} jetons, qui règlent vos brouillons au guichet unique
              </li>
            </ul>
            <div className="actions">
              <Link href="/professionnels" className="btn btn-secondaire">
                L’offre pour les cabinets
              </Link>
            </div>
          </div>
          <div className="carte carte-ombre recap">
            <p className="surtitre">Exemple · Portefeuille d’un cabinet</p>
            <dl>
              <dt>Annonce de constitution publiée</dt>
              <dd>+ {JETONS_PAR_ANNONCE} jetons</dd>
              <dt>Brouillon INPI de création</dt>
              <dd>− {JETONS_BROUILLON.creation} jetons</dd>
              <dt className="total">Solde</dt>
              <dd className="total">{JETONS_PAR_ANNONCE - (JETONS_BROUILLON.creation ?? 0)} jetons</dd>
            </dl>
            <p className="petit muted" style={{ margin: '14px 0 0' }}>
              Les jetons ne s’achètent pas : ils se gagnent en publiant.
            </p>
          </div>
        </div>
      </section>

      <section className="section bloc-nuit">
        <div className="conteneur">
          <p className="surtitre">Sécurité et confidentialité</p>
          <h2>Vos données, traitées avec le même sérieux que vos actes.</h2>
          <div className="grille grille-4" style={{ marginTop: 28 }}>
            <div className="carte">
              <h3>Paiement chez Stripe</h3>
              <p style={{ margin: 0 }}>La carte est saisie sur les pages de Stripe, jamais sur ce site.</p>
            </div>
            <div className="carte">
              <h3>Identifiants INPI chiffrés</h3>
              <p style={{ margin: 0 }}>Enregistrés chiffrés, jamais réaffichés, supprimables à tout moment.</p>
            </div>
            <div className="carte">
              <h3>Pièces effacées</h3>
              <p style={{ margin: 0 }}>Vos documents sont supprimés automatiquement 30 jours après leur envoi.</p>
            </div>
            <div className="carte">
              <h3>Ni revente ni publicité</h3>
              <p style={{ margin: 0 }}>
                Vos données servent à vos démarches, à rien d’autre. <Link href="/confidentialite">En savoir plus</Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="conteneur">
          <p className="surtitre">Les plus demandées</p>
          <h2>Annonces légales courantes</h2>
          <div className="grille grille-4" style={{ marginTop: 24 }}>
            {populaires.map((t) => (
              <Link key={t.slug} href={`/annonces-legales/${t.categorie}/${t.slug}`} className="carte carte-lien">
                <strong>{t.titre}</strong>
                <span className="petit muted">{t.resume}</span>
                <span className="prix">{prixAffiche(t)}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="conteneur section-etroite">
          <p className="surtitre">Questions fréquentes</p>
          <h2>Ce qu’on nous demande le plus souvent</h2>
          <Faq questions={questions} />
        </div>
      </section>

      <BandeauCta />
    </>
  )
}
