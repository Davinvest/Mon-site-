import type { Metadata } from 'next'
import { FilAriane } from '@/components/FilAriane'
import { FormulaireContact } from '@/components/FormulaireContact'

export const metadata: Metadata = {
  title: 'Offre professionnels : cabinets, éditeurs de logiciels',
  description:
    'Experts-comptables, avocats, formalistes et éditeurs : publiez les annonces de vos clients, suivez vos formalités et intégrez notre API.',
  alternates: { canonical: '/professionnels' },
}

const exemple = `POST /api/v1/annonces
X-Api-Key: sk_test_…

{
  "type": "constitution-sas",
  "codePostal": "69002",
  "texte": "Aux termes d'un acte sous seing privé…",
  "callbackUrl": "https://votre-logiciel.fr/retour"
}

→ 201 { "reference": "CL-20261029-8K2Q1A",
        "prix": { "ht": 199, "ttc": 238.8 },
        "statut": "en_relecture" }`

export default function Professionnels() {
  return (
    <>
      <section className="heros" style={{ paddingBottom: 24 }}>
        <div className="conteneur">
          <FilAriane elements={[{ nom: 'Professionnels' }]} />
          <span className="surtitre">Cabinets · Éditeurs de logiciels</span>
          <h1>Les annonces et formalités de vos clients, sans ressaisie.</h1>
          <p className="chapo">
            Vous traitez des formalités pour vos clients ? Comptoir Légal publie les annonces au tarif réglementé, prend en charge les
            dépôts au guichet unique et vous tient informé de chaque étape.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 16 }}>
        <div className="conteneur grille grille-3">
          <div className="carte">
            <span className="badge">Disponible</span>
            <h2 style={{ fontSize: '1.3rem', marginTop: 10 }}>Sous-traitance</h2>
            <p className="muted">
              Confiez-nous l’annonce et le dépôt : un formaliste vérifie les pièces, dépose sur le guichet unique et traite les demandes
              de régularisation du greffe.
            </p>
          </div>
          <div className="carte">
            <span className="badge badge-accent">En préparation</span>
            <h2 style={{ fontSize: '1.3rem', marginTop: 10 }}>Espace de suivi</h2>
            <p className="muted">
              Tous vos dossiers au même endroit : statut, pièces, attestations de parution, factures. Attribution à un collaborateur,
              rappels et historique.
            </p>
          </div>
          <div className="carte">
            <span className="badge badge-accent">En préparation</span>
            <h2 style={{ fontSize: '1.3rem', marginTop: 10 }}>API</h2>
            <p className="muted">
              Publiez une annonce depuis votre logiciel : types d’annonce, calcul du tarif, commande, statut par webhook et attestation
              en PDF.
            </p>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="conteneur grille grille-2" style={{ gap: 40, alignItems: 'start' }}>
          <div>
            <span className="surtitre">Aperçu de l’API</span>
            <h2>Une requête pour publier.</h2>
            <p className="muted">
              REST et JSON, clé dans l’en-tête, environnement de test. Le tarif réglementé et le choix du journal habilité restent de notre
              côté. Format indicatif, susceptible d’évoluer d’ici l’ouverture.
            </p>
            <div className="code" role="figure" aria-label="Exemple de requête API">
              {exemple}
            </div>
          </div>
          <div className="carte carte-ombre">
            <h2 style={{ fontSize: '1.3rem' }}>Demander une démo ou un accès anticipé</h2>
            <FormulaireContact sujet="Démo CRM / API" origine="/professionnels" libelleBouton="Envoyer ma demande" />
          </div>
        </div>
      </section>
    </>
  )
}
