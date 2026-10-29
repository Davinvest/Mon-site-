import type { Metadata } from 'next'
import { PageLegale } from '@/components/PageLegale'
import { SITE } from '@/data/site'
import { REFERENCE_ARRETE } from '@/data/tarifs-annonces'

export const metadata: Metadata = { title: 'Conditions générales de vente', alternates: { canonical: '/cgv' } }

export default function Cgv() {
  return (
    <PageLegale titre="Conditions générales de vente" majLe="29 octobre 2026">
      <h2>1. Objet</h2>
      <p>
        Les présentes conditions régissent les commandes passées sur {SITE.domaine} auprès de {SITE.editeur.raisonSociale} (« {SITE.nom} »)
        : publication d’annonces légales dans un support habilité et, sur devis, prise en charge de formalités d’entreprise.
      </p>
      <h2>2. Commande d’une annonce légale</h2>
      <p>
        Le client choisit le type d’annonce, renseigne les informations demandées et valide le texte affiché. Il est seul responsable de
        l’exactitude des informations fournies et de leur conformité aux actes de la société. {SITE.nom} relit l’annonce et peut
        proposer des corrections avant transmission ; aucune modification n’est apportée sans l’accord du client.
      </p>
      <p>
        L’annonce est publiée dans un support habilité du département déterminé par le code postal saisi (siège social, lieu du fonds
        ou domicile selon l’annonce). L’attestation de parution est adressée par e-mail.
      </p>
      <h2>3. Prix</h2>
      <p>
        Le prix des annonces légales est celui fixé par l’arrêté ministériel en vigueur ({REFERENCE_ARRETE}) : forfait selon la nature
        de l’annonce, ou nombre de caractères multiplié par le tarif du département. Les prix sont indiqués hors taxes et toutes taxes
        comprises (TVA 20 %) avant le paiement. Aucun frais supplémentaire n’est facturé.
      </p>
      <p>
        Les honoraires des formalités sont indiqués sur le site et confirmés par devis. Les frais officiels (greffe, INPI) et l’annonce
        légale s’y ajoutent à leur tarif réglementé.
      </p>
      <h2>4. Paiement</h2>
      <p>
        Le paiement s’effectue en ligne par carte bancaire via la société Stripe. {SITE.nom} n’a jamais accès aux données bancaires. La
        commande est ferme dès la confirmation du paiement ; une facture est adressée par e-mail.
      </p>
      <h2>5. Droit de rétractation</h2>
      <p>
        Le client consommateur dispose d’un délai de quatorze jours pour se rétracter. Toutefois, conformément à l’article L. 221-28 du
        Code de la consommation, ce droit ne peut plus être exercé lorsque la prestation a été pleinement exécutée avant la fin du délai,
        avec l’accord préalable exprès du client et sa renonciation expresse à son droit de rétractation. En commandant, le client
        demande l’exécution immédiate : le droit de rétractation est perdu dès la transmission de l’annonce au support. Avant
        transmission, toute demande d’annulation adressée à {SITE.email} donne lieu à remboursement intégral.
      </p>
      <h2>6. Délais</h2>
      <p>
        Les annonces sont relues et transmises dans les meilleurs délais, en principe le jour ouvré de la commande ou le suivant. La
        date de parution dépend du support. {SITE.nom} ne saurait être tenu responsable d’un retard imputable au support, au greffe ou
        au guichet unique.
      </p>
      <h2>7. Responsabilité</h2>
      <p>
        {SITE.nom} est tenu d’une obligation de moyens. Sa responsabilité ne peut être engagée en cas d’informations inexactes ou
        incomplètes fournies par le client. Si une erreur imputable à {SITE.nom} rend nécessaire un avis rectificatif, celui-ci est pris
        en charge par {SITE.nom}.
      </p>
      <h2>8. Réclamations et médiation</h2>
      <p>
        Toute réclamation est à adresser à {SITE.email}. Le client consommateur peut recourir gratuitement à un médiateur de la
        consommation : [À COMPLÉTER : nom et coordonnées du médiateur].
      </p>
      <h2>9. Droit applicable</h2>
      <p>Les présentes conditions sont soumises au droit français.</p>
    </PageLegale>
  )
}
