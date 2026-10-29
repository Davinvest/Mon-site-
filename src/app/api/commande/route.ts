import { NextResponse, type NextRequest } from 'next/server'
import { connecteur } from '@/lib/connecteur'
import { nouvelleReference, validerDemande } from '@/lib/commande'
import type { Commande } from '@/lib/commande'
import { envoyerMail, mailCommandeInterne, mailConfirmationClient } from '@/lib/mail'
import { stripe, stripeActif, versMetadonnees } from '@/lib/paiement'

export async function POST(req: NextRequest) {
  let corps: unknown
  try {
    corps = await req.json()
  } catch {
    return NextResponse.json({ erreur: 'Requête invalide.' }, { status: 400 })
  }

  const demande = validerDemande(corps)
  if ('erreur' in demande) return NextResponse.json(demande, { status: 400 })

  // Le prix est toujours recalculé côté serveur : celui affiché au client n'est jamais repris.
  const c = connecteur()
  const commande: Commande = {
    reference: nouvelleReference(),
    typeSlug: demande.type.slug,
    typeTitre: demande.type.titre,
    codePostal: demande.codePostal,
    departement: demande.departement,
    texte: demande.texte,
    client: demande.client,
    prix: await c.estimer(demande.type, demande.departement, demande.texte),
    journal: await c.journalPour(demande.departement),
    creeLe: new Date().toISOString(),
  }
  const origine = process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin

  if (!stripeActif()) {
    // Mode démonstration : pas de paiement, la commande est traitée directement.
    await c.transmettre(commande)
    await envoyerMail(mailConfirmationClient(commande))
    return NextResponse.json({ url: `${origine}/commande/confirmation?ref=${commande.reference}&demo=1` })
  }

  try {
    const session = await stripe().checkout.sessions.create({
      mode: 'payment',
      locale: 'fr',
      customer_email: commande.client.email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'eur',
            unit_amount: Math.round(commande.prix.ttc * 100),
            product_data: {
              name: `Annonce légale — ${commande.typeTitre}`,
              description: `Département ${commande.departement} · ${commande.prix.mode === 'forfait' ? 'forfait réglementé' : `${commande.prix.caracteres} caractères`} · TTC`,
            },
          },
        },
      ],
      metadata: versMetadonnees(commande),
      payment_intent_data: { description: `Annonce légale ${commande.reference}` },
      success_url: `${origine}/commande/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origine}/tunnel?type=${commande.typeSlug}&annule=1`,
    })
    await envoyerMail(mailCommandeInterne(commande, 'En attente de paiement')).catch((e) =>
      console.error('Mail interne non envoyé', e),
    )
    return NextResponse.json({ url: session.url })
  } catch (e) {
    console.error('Création de la session Stripe impossible', e)
    return NextResponse.json({ erreur: 'Le paiement est momentanément indisponible. Réessayez dans un instant.' }, { status: 502 })
  }
}
