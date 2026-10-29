import type { Metadata } from 'next'
import { PageLegale } from '@/components/PageLegale'
import { SITE } from '@/data/site'

export const metadata: Metadata = { title: 'Mentions légales', alternates: { canonical: '/mentions-legales' } }

export default function MentionsLegales() {
  const e = SITE.editeur
  return (
    <PageLegale titre="Mentions légales" majLe="29 octobre 2026">
      <h2>Éditeur du site</h2>
      <p>
        Le site {SITE.domaine} est édité par {e.raisonSociale}, {e.forme}, dont le siège social est situé {e.siege}, immatriculée sous le
        numéro {e.rcs}. Numéro de TVA intracommunautaire : {e.tva}.
        <br />
        Contact : <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
        <br />
        Directeur de la publication : {e.directeurPublication}.
      </p>
      <h2>Hébergement</h2>
      <p>
        Le site est hébergé par {SITE.hebergeur.nom}, {SITE.hebergeur.adresse} ({SITE.hebergeur.site}).
      </p>
      <h2>Activité</h2>
      <p>
        {SITE.nom} est un service d’intermédiation : les annonces légales sont publiées par des supports habilités à recevoir des
        annonces judiciaires et légales dans le département concerné, au tarif fixé par arrêté ministériel. {SITE.nom} n’est pas un
        cabinet d’avocats et ne délivre pas de consultation juridique.
      </p>
      <h2>Propriété intellectuelle</h2>
      <p>
        Les textes, la charte graphique et le logo du site sont la propriété de l’éditeur. Toute reproduction sans autorisation est
        interdite. Les exemples d’annonces sont fictifs.
      </p>
      <h2>Données personnelles</h2>
      <p>
        Voir notre <a href="/confidentialite">politique de confidentialité</a>.
      </p>
    </PageLegale>
  )
}
