import Stripe from 'stripe'
import type { Commande } from '@/lib/commande'

/**
 * Paiement par Stripe Checkout. La commande complète voyage dans les métadonnées
 * de la session (texte découpé en morceaux de 500 caractères) : aucune base de
 * données n'est nécessaire en phase 1.
 */

const TAILLE_MORCEAU = 490

export function stripeActif(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY)
}

export function stripe(): Stripe {
  const cle = process.env.STRIPE_SECRET_KEY
  if (!cle) throw new Error('STRIPE_SECRET_KEY manquante')
  return new Stripe(cle)
}

export function versMetadonnees(c: Commande): Record<string, string> {
  const meta: Record<string, string> = {
    reference: c.reference,
    typeSlug: c.typeSlug,
    codePostal: c.codePostal,
    creeLe: c.creeLe,
    clientPrenom: c.client.prenom,
    clientNom: c.client.nom,
    clientEmail: c.client.email,
    clientTelephone: c.client.telephone,
    clientSociete: c.client.societe,
  }
  const morceaux = Math.ceil(c.texte.length / TAILLE_MORCEAU)
  meta.texteMorceaux = String(morceaux)
  for (let i = 0; i < morceaux; i++) meta[`texte${i}`] = c.texte.slice(i * TAILLE_MORCEAU, (i + 1) * TAILLE_MORCEAU)
  return meta
}

export interface CommandeStripe {
  reference: string
  typeSlug: string
  codePostal: string
  creeLe: string
  client: Commande['client']
  texte: string
}

export function depuisMetadonnees(meta: Record<string, string>): CommandeStripe {
  const morceaux = Number(meta.texteMorceaux || 0)
  let texte = ''
  for (let i = 0; i < morceaux; i++) texte += meta[`texte${i}`] ?? ''
  return {
    reference: meta.reference,
    typeSlug: meta.typeSlug,
    codePostal: meta.codePostal,
    creeLe: meta.creeLe,
    client: {
      prenom: meta.clientPrenom ?? '',
      nom: meta.clientNom ?? '',
      email: meta.clientEmail ?? '',
      telephone: meta.clientTelephone ?? '',
      societe: meta.clientSociete ?? '',
    },
    texte,
  }
}

/** Les métadonnées Stripe sont limitées à 50 clés : 40 morceaux, soit ~19 600 caractères de texte. */
export const TEXTE_MAX_STRIPE = TAILLE_MORCEAU * 40
