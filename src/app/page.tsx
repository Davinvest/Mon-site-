import Link from 'next/link'
import { BandeauCta } from '@/components/BandeauCta'
import { Faq } from '@/components/Faq'
import { TYPES_ANNONCE } from '@/data/annonces'
import { DEPARTEMENTS } from '@/data/departements'
import { ANNEE_TARIFS } from '@/data/tarifs-annonces'
import { prixAffiche } from '@/lib/prix'

const actes = [
  { titre: 'Créer une société', slug: 'constitution-sas', detail: 'SAS, SASU, SARL, EURL, SCI…', prix: 'dès 124 € HT' },
  { titre: 'Transférer le siège', slug: 'transfert-siege-meme-departement', detail: 'Même département ou non', prix: '109 € HT' },
  { titre: 'Changer de dirigeant', slug: 'changement-dirigeant', detail: 'Gérant, président, DG', prix: '109 € HT' },
  { titre: 'Modifier le capital', slug: 'modification-capital-social', detail: 'Augmentation ou réduction', prix: '136 € HT' },
  { titre: 'Changer de dénomination', slug: 'changement-denomination', detail: 'Nouveau nom, nouveau sigle', prix: '199 € HT' },
  { titre: 'Dissoudre, liquider', slug: 'dissolution-anticipee', detail: 'Dissolution puis clôture', prix: 'dès 111 € HT' },
]

const questions = [
  {
    q: 'Le prix est-il vraiment le même partout ?',
    r: `Oui. Le prix d’une annonce légale est fixé chaque année par arrêté ministériel et s’impose à tous les journaux habilités. Pour ${ANNEE_TARIFS}, une constitution de SAS coûte 199 € HT partout en France (hors La Réunion et Mayotte). Comptoir Légal n’ajoute ni frais de dossier ni option payante.`,
  },
  {
    q: 'Dans quel journal mon annonce sera-t-elle publiée ?',
    r: 'Dans un support habilité du département de votre siège social (ou du lieu du fonds, ou de votre domicile pour les annonces de particuliers). Il est choisi automatiquement à partir du code postal saisi.',
  },
  {
    q: 'Quand vais-je recevoir l’attestation de parution ?',
    r: 'Après relecture par un formaliste et transmission au journal, l’attestation vous est envoyée par e-mail. C’est elle que vous joindrez à votre dossier sur le guichet unique de l’INPI.',
  },
  {
    q: 'Et si je me suis trompé dans l’annonce ?',
    r: 'Tant que l’annonce n’est pas transmise, nous la corrigeons avec vous sans frais. Une fois parue, une erreur se corrige par un avis rectificatif, facturé au caractère : c’est pour l’éviter que chaque annonce est relue avant envoi.',
  },
  {
    q: 'Faut-il créer un compte ?',
    r: 'Non. Vous choisissez votre annonce, la complétez, payez en ligne et recevez tout par e-mail.',
  },
]

export default function Accueil() {
  const populaires = TYPES_ANNONCE.filter((t) => t.populaire).slice(0, 8)
  return (
    <>
      <section className="heros">
        <div className="conteneur heros-grille">
          <div>
            <span className="surtitre">Annonces légales · Formalités d’entreprise</span>
            <h1>
              Votre annonce légale, <em>publiée au tarif réglementé</em>, sans rien payer de plus.
            </h1>
            <p className="chapo">
              Choisissez votre acte, remplissez le formulaire, l’annonce se rédige sous vos yeux. Un formaliste la relit, nous la
              transmettons au journal habilité de votre département et vous recevez l’attestation de parution.
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
              <li>Tarif fixé par l’État</li>
              <li>Relecture par un formaliste</li>
              <li>Paiement sécurisé</li>
            </ul>
          </div>

          <div className="carte carte-ombre">
            <p className="surtitre">Sélectionnez votre acte</p>
            <div className="grille grille-2">
              {actes.map((a) => (
                <Link key={a.slug} href={`/tunnel?type=${a.slug}`} className="carte carte-lien" style={{ padding: 16 }}>
                  <strong>{a.titre}</strong>
                  <span className="petit muted">{a.detail}</span>
                  <span className="prix">{a.prix}</span>
                </Link>
              ))}
            </div>
            <p className="petit muted" style={{ marginTop: 14, marginBottom: 0 }}>
              Un autre acte ? Cession de fonds, location-gérance, transformation, rectificatif…{' '}
              <Link href="/tunnel">Tous les types d’annonces</Link>
            </p>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="conteneur">
          <span className="surtitre">Comment ça marche</span>
          <h2>Cinq étapes, une seule saisie.</h2>
          <ol className="etapes" style={{ marginTop: 28 }}>
            <li>
              <strong>Choisissez l’acte</strong>
              <span className="muted">Il fixe les mentions obligatoires et le forfait applicable.</span>
            </li>
            <li>
              <strong>Complétez le formulaire</strong>
              <span className="muted">Le texte se rédige en direct, avec les seules mentions exigées.</span>
            </li>
            <li>
              <strong>Vérifiez l’aperçu</strong>
              <span className="muted">Le prix s’affiche selon le département du siège.</span>
            </li>
            <li>
              <strong>Payez en ligne</strong>
              <span className="muted">Carte bancaire, paiement sécurisé par Stripe.</span>
            </li>
            <li>
              <strong>Recevez l’attestation</strong>
              <span className="muted">Après relecture et parution, par e-mail.</span>
            </li>
          </ol>
        </div>
      </section>

      <section className="section">
        <div className="conteneur">
          <div className="grille grille-3">
            <div>
              <span className="surtitre">Le prix</span>
              <h2>Le tarif de l’arrêté, rien d’autre.</h2>
              <p className="muted">
                Le prix d’une annonce légale est fixé par l’État et identique dans tous les journaux. Ce qui change d’un prestataire à
                l’autre, ce sont les frais annexes : chez nous, la rédaction, la relecture et l’attestation sont incluses.
              </p>
            </div>
            <div>
              <span className="surtitre">La conformité</span>
              <h2>Une relecture humaine avant parution.</h2>
              <p className="muted">
                Une mention oubliée ou un capital qui ne correspond pas aux statuts, et le greffe rejette le dossier. Un formaliste
                vérifie chaque annonce avant de l’envoyer au journal.
              </p>
            </div>
            <div>
              <span className="surtitre">La couverture</span>
              <h2>Tous les départements, outre-mer compris.</h2>
              <p className="muted">
                {Object.keys(DEPARTEMENTS).length} départements et collectivités couverts. Le support habilité est sélectionné à partir
                du code postal de votre siège.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="conteneur">
          <span className="surtitre">Les plus demandées</span>
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
          <p style={{ marginTop: 20 }}>
            <Link href="/annonces-legales">Voir les {TYPES_ANNONCE.length} types d’annonces →</Link>
          </p>
        </div>
      </section>

      <section className="section">
        <div className="conteneur grille grille-2" style={{ alignItems: 'center', gap: 40 }}>
          <div>
            <span className="surtitre">Formalités</span>
            <h2>L’annonce, puis le guichet unique : nous pouvons tout faire.</h2>
            <p className="muted">
              Création, transfert de siège, changement de dirigeant, dissolution : nos formalistes préparent le dossier, publient
              l’annonce et le déposent sur le guichet unique de l’INPI. Vous suivez l’avancement par e-mail jusqu’au Kbis.
            </p>
            <div className="actions">
              <Link href="/formalites" className="btn btn-primaire">
                Déléguer une formalité
              </Link>
              <Link href="/formalites/tarifs" className="btn btn-secondaire">
                Tarifs des formalités
              </Link>
            </div>
          </div>
          <div className="carte">
            <span className="surtitre">Professionnels du droit et du chiffre</span>
            <h3>Experts-comptables, avocats, formalistes</h3>
            <p className="muted">
              Un volume régulier d’annonces ? Facturation mensuelle, interlocuteur dédié, et bientôt un espace de suivi et une API pour
              publier depuis votre logiciel.
            </p>
            <Link href="/professionnels">Découvrir l’offre professionnels →</Link>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="conteneur" style={{ maxWidth: 860 }}>
          <span className="surtitre">Questions fréquentes</span>
          <h2>Ce qu’on nous demande le plus souvent</h2>
          <Faq questions={questions} />
        </div>
      </section>

      <BandeauCta />
    </>
  )
}
