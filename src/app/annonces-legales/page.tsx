import type { Metadata } from 'next'
import Link from 'next/link'
import { BandeauCta } from '@/components/BandeauCta'
import { Faq } from '@/components/Faq'
import { FilAriane } from '@/components/FilAriane'
import { CATEGORIES, typesDeCategorie } from '@/data/annonces'
import { ANNEE_TARIFS } from '@/data/tarifs-annonces'
import { prixAffiche } from '@/lib/prix'

export const metadata: Metadata = {
  title: 'Annonce légale en ligne : où, quand et combien',
  description:
    'Publier une annonce légale en ligne : support habilité du département, délais, attestation de parution, causes de rejet et tarifs réglementés.',
  alternates: { canonical: '/annonces-legales' },
}

const sommaire = [
  ['principe', 'À quoi sert une annonce légale'],
  ['support', 'Où la publier'],
  ['delais', 'Les délais à respecter'],
  ['attestation', 'L’attestation et le guichet unique'],
  ['rejets', 'Pourquoi une annonce est refusée'],
  ['types', 'Tous les types d’annonces'],
]

export default function AnnoncesLegales() {
  return (
    <>
      <section className="heros" style={{ paddingBottom: 24 }}>
        <div className="conteneur">
          <FilAriane elements={[{ nom: 'Annonces légales' }]} />
          <span className="surtitre">Annonces légales · Tarifs {ANNEE_TARIFS}</span>
          <h1>Publier une annonce légale en ligne</h1>
          <p className="chapo">
            Création, modification, fermeture : la plupart des événements de la vie d’une société doivent être rendus publics dans un
            journal habilité. Voici comment cela fonctionne, et comment le faire en quelques minutes.
          </p>
          <div className="actions">
            <Link href="/tunnel" className="btn btn-primaire">
              Choisir mon acte
            </Link>
            <Link href="/annonces-legales/tarifs" className="btn btn-secondaire">
              Grille tarifaire {ANNEE_TARIFS}
            </Link>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 24 }}>
        <div className="conteneur mise-en-page-fiche">
          <article className="prose">
            <h2 id="principe">À quoi sert une annonce légale</h2>
            <p>
              L’annonce légale informe les tiers (clients, fournisseurs, créanciers) d’un changement qui les concerne : une société naît,
              change de dirigeant, déménage, modifie son capital ou disparaît. Le principe remonte à la loi n° 55-4 du 4 janvier 1955,
              toujours en vigueur.
            </p>
            <p>
              Elle conditionne la suite : le journal délivre une <strong>attestation de parution</strong>, pièce obligatoire du dossier
              déposé sur le guichet unique de l’INPI. Pas d’attestation, pas de formalité.
            </p>
            <div className="encadre">
              Les sociétés (SAS, SARL, SCI, SA, SNC…) sont concernées. La micro-entreprise ne l’est pas : sans statuts, il n’y a pas de
              publicité statutaire.
            </div>

            <h2 id="support">Où la publier</h2>
            <p>
              Dans un <strong>support habilité à recevoir des annonces légales (SHAL)</strong> du département du siège social : soit un
              journal imprimé (JAL), soit un service de presse en ligne habilité (SPEL), admis depuis 2020. L’habilitation est accordée
              chaque année par le préfet, département par département.
            </p>
            <p>
              Une annonce parue dans un support non habilité pour le bon département n’a aucune valeur : il faut republier et repayer.
              Chez Comptoir Légal, le support est déterminé automatiquement à partir du code postal saisi.
            </p>

            <h2 id="delais">Les délais à respecter</h2>
            <ul>
              <li>
                <strong>Création</strong> : après la signature des statuts et avant le dépôt du dossier d’immatriculation.
              </li>
              <li>
                <strong>Modification</strong> : dans le mois qui suit la décision (articles R. 210-9 et suivants du Code de commerce).
              </li>
              <li>
                <strong>Fermeture</strong> : deux annonces distinctes, l’une pour la dissolution, l’autre pour la clôture de la
                liquidation.
              </li>
            </ul>
            <p>
              L’erreur la plus fréquente est de déposer le dossier avant d’avoir l’attestation : il reste alors incomplet et n’est pas
              instruit. Publiez d’abord, déposez ensuite.
            </p>

            <h2 id="attestation">L’attestation et le guichet unique</h2>
            <p>
              L’attestation prouve que l’annonce a paru, à quelle date, dans quel support et avec quel contenu. Ce n’est pas une facture.
              Elle se joint aux pièces justificatives du dossier sur formalites.entreprises.gouv.fr.
            </p>
            <p>
              Si le greffe rejette le dossier pour une autre raison (pièce d’identité, justificatif de siège…), l’annonce reste valable.
              S’il le rejette à cause de l’annonce elle-même, il faut publier un rectificatif.
            </p>

            <h2 id="rejets">Pourquoi une annonce est refusée</h2>
            <ul>
              <li>Une mention obligatoire manque : la durée de la société et le greffe d’immatriculation sont les plus souvent oubliés.</li>
              <li>L’annonce ne correspond pas aux statuts : capital différent, objet trop résumé, adresse incomplète.</li>
              <li>Le support n’est pas habilité dans le département du siège.</li>
              <li>Le type d’avis ne correspond pas à l’acte (une transformation publiée comme une simple modification, par exemple).</li>
            </ul>
            <p>C’est pour éviter ces rejets qu’un formaliste relit chaque annonce avant sa transmission.</p>
          </article>

          <aside className="colle">
            <div className="carte">
              <p className="surtitre">Sommaire</p>
              <ol style={{ paddingLeft: 18, margin: 0 }}>
                {sommaire.map(([id, titre]) => (
                  <li key={id} style={{ marginBottom: 6 }}>
                    <a href={`#${id}`}>{titre}</a>
                  </li>
                ))}
              </ol>
              <Link href="/tunnel" className="btn btn-primaire btn-bloc" style={{ marginTop: 16 }}>
                Publier mon annonce
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <section className="section section-alt" id="types">
        <div className="conteneur">
          <h2>Tous les types d’annonces</h2>
          {CATEGORIES.map((c) => (
            <div key={c.slug} style={{ marginTop: 32 }}>
              <h3>
                <Link href={`/annonces-legales/${c.slug}`} style={{ color: 'inherit' }}>
                  {c.titre}
                </Link>
              </h3>
              <p className="muted petit">{c.description}</p>
              <div className="grille grille-4">
                {typesDeCategorie(c.slug).map((t) => (
                  <Link key={t.slug} href={`/annonces-legales/${c.slug}/${t.slug}`} className="carte carte-lien" style={{ padding: 16 }}>
                    <strong>{t.titre}</strong>
                    <span className="prix">{prixAffiche(t)}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="conteneur" style={{ maxWidth: 860 }}>
          <h2>Questions fréquentes</h2>
          <Faq
            questions={[
              {
                q: 'Peut-on consulter une annonce déjà parue ?',
                r: 'Oui : les annonces publiées en ligne restent consultables sur le site du support habilité, et les informations principales sont reprises au BODACC pour les sociétés commerciales.',
              },
              {
                q: 'Une annonce peut-elle regrouper plusieurs modifications ?',
                r: 'Oui, mais elle bascule alors au tarif au caractère. Selon la longueur, cela peut être plus ou moins cher que deux forfaits séparés : l’aperçu du tunnel vous donne le prix exact.',
              },
              {
                q: 'Qui peut commander l’annonce ?',
                r: 'Le dirigeant, un associé ou un professionnel mandaté (expert-comptable, avocat, formaliste). Le nom de la société et les mentions doivent être conformes aux actes.',
              },
            ]}
          />
        </div>
      </section>

      <BandeauCta />
    </>
  )
}
