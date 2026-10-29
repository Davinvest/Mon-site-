import { NextResponse, type NextRequest } from 'next/server'
import type Stripe from 'stripe'
import { trouverType } from '@/data/annonces'
import { departementDuCodePostal } from '@/data/departements'
import { connecteur } from '@/lib/connecteur'
import type { Commande } from '@/lib/commande'
import { envoyerMail, mailCommandeInterne, mailConfirmationClient } from '@/lib/mail'
import { depuisMetadonnees, stripe } from '@/lib/paiement'

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  const signature = req.headers.get('stripe-signature')
  if (!secret || !signature) return NextResponse.json({ erreur: 'Webhook non configuré.' }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe().webhooks.constructEvent(await req.text(), signature, secret)
  } catch {
    return NextResponse.json({ erreur: 'Signature invalide.' }, { status: 400 })
  }

  if (event.type !== 'checkout.session.completed' && event.type !== 'checkout.session.async_payment_succeeded') {
    return NextResponse.json({ recu: true })
  }
  const session = event.data.object as Stripe.Checkout.Session
  if (session.payment_status !== 'paid') return NextResponse.json({ recu: true })

  const donnees = depuisMetadonnees((session.metadata ?? {}) as Record<string, string>)
  const type = trouverType(donnees.typeSlug)
  const departement = departementDuCodePostal(donnees.codePostal)
  if (!type || !departement) {
    console.error('Webhook : métadonnées incomplètes', session.id)
    return NextResponse.json({ recu: true })
  }

  const c = connecteur()
  const commande: Commande = {
    reference: donnees.reference,
    typeSlug: type.slug,
    typeTitre: type.titre,
    codePostal: donnees.codePostal,
    departement,
    texte: donnees.texte,
    client: donnees.client,
    prix: await c.estimer(type, departement, donnees.texte),
    journal: await c.journalPour(departement),
    creeLe: donnees.creeLe,
  }

  try {
    await c.transmettre(commande)
  } catch (e) {
    console.error('Transmission au support impossible', e)
    await envoyerMail(mailCommandeInterne(commande, `PAYÉE — transmission automatique en échec (${String(e)}) : à traiter manuellement`))
  }
  await envoyerMail(mailConfirmationClient(commande)).catch((e) => console.error('Confirmation client non envoyée', e))
  return NextResponse.json({ recu: true })
}
