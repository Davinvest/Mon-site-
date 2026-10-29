import type { Metadata } from 'next'
import { PageLegale } from '@/components/PageLegale'
import { SITE } from '@/data/site'

export const metadata: Metadata = { title: 'Politique de confidentialité', alternates: { canonical: '/confidentialite' } }

export default function Confidentialite() {
  return (
    <PageLegale titre="Politique de confidentialité" majLe="29 octobre 2026">
      <h2>Responsable du traitement</h2>
      <p>
        {SITE.editeur.raisonSociale}, {SITE.editeur.siege}. Contact : <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
      </p>
      <h2>Données collectées et finalités</h2>
      <ul>
        <li>
          <strong>Commande d’annonce</strong> : identité, e-mail, téléphone, société et contenu de l’annonce. Finalité : exécuter la
          commande, la transmettre au support habilité, facturer. Base légale : exécution du contrat.
        </li>
        <li>
          <strong>Formulaires de contact et de rappel</strong> : identité, e-mail, téléphone, message. Finalité : répondre à la demande.
          Base légale : mesures précontractuelles.
        </li>
        <li>
          <strong>Paiement</strong> : traité directement par Stripe ; nous ne recevons pas les données de carte.
        </li>
      </ul>
      <p>
        Le contenu d’une annonce légale est, par nature, destiné à être publié : il sera diffusé par le support habilité et peut être
        repris dans les bases officielles.
      </p>
      <h2>Destinataires</h2>
      <p>
        L’équipe {SITE.nom}, le support habilité chargé de la publication, notre partenaire technique de publication le cas échéant, Stripe
        (paiement), notre hébergeur et notre messagerie (OVHcloud). Aucune donnée n’est vendue.
      </p>
      <h2>Durées de conservation</h2>
      <p>
        Données de commande et factures : dix ans (obligations comptables). Demandes de contact sans suite : trois ans à compter du
        dernier échange.
      </p>
      <h2>Cookies</h2>
      <p>
        Le site n’utilise pas de cookie publicitaire ni de mesure d’audience. Le tunnel de commande enregistre votre brouillon dans le
        stockage local de votre navigateur, uniquement sur votre appareil ; il est effacé après le paiement.
      </p>
      <h2>Vos droits</h2>
      <p>
        Vous disposez d’un droit d’accès, de rectification, d’effacement, de limitation, d’opposition et de portabilité. Écrivez à{' '}
        {SITE.email}. Vous pouvez également saisir la CNIL (www.cnil.fr).
      </p>
    </PageLegale>
  )
}
