import { DEPARTEMENTS } from '@/data/departements'
import { calculerPrix } from '@/lib/prix'
import type { DetailPrix } from '@/lib/prix'
import type { Connecteur } from './types'

/**
 * Connecteur vers l'API du Guichet des Formalités (Jordan).
 * Les routes suivent la documentation publique « /api/annonce-legale-v1 » :
 * authenticate, types, generate, order/{id}/config, order/pay, order/{id}/certificate.
 * À vérifier avec la documentation complète et la clé de test avant activation.
 */

const base = () => (process.env.LGDF_API_URL ?? '').replace(/\/$/, '')

async function appel<T>(chemin: string, init: RequestInit = {}): Promise<T> {
  const cle = process.env.LGDF_API_KEY
  if (!base() || !cle) throw new Error('Connecteur LGDF non configuré (LGDF_API_URL / LGDF_API_KEY).')
  const reponse = await fetch(`${base()}/api/annonce-legale-v1${chemin}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', 'X-Api-Key': cle, ...init.headers },
    cache: 'no-store',
  })
  if (!reponse.ok) throw new Error(`API LGDF ${chemin} : HTTP ${reponse.status}`)
  return reponse.json() as Promise<T>
}

interface ReponseCommande {
  success: boolean
  commande?: { publicId?: string; statut?: string; pricePaye?: number; journalNom?: string }
}

export const connecteurLgdf: Connecteur = {
  nom: 'lgdf',

  async journalPour(departement) {
    return `Journal habilité sélectionné par notre partenaire (${DEPARTEMENTS[departement] ?? departement})`
  },

  async estimer(type, departement, texte): Promise<DetailPrix> {
    // Le tarif est réglementé : notre calcul local fait foi pour l'affichage.
    return calculerPrix(type, departement, texte)
  },

  async transmettre(commande) {
    const creee = await appel<ReponseCommande>('/generate', {
      method: 'POST',
      body: JSON.stringify({ type: commande.typeSlug, departement: commande.departement, texte: commande.texte, reference: commande.reference }),
    })
    const id = creee.commande?.publicId
    if (!id) throw new Error('API LGDF : identifiant de commande absent.')
    await appel(`/order/${encodeURIComponent(id)}/config`, {
      method: 'PATCH',
      body: JSON.stringify({ departement: commande.departement }),
    })
    const payee = await appel<ReponseCommande>('/order/pay', {
      method: 'POST',
      body: JSON.stringify({ commandePublicId: id, paymentMethod: 'wallet' }),
    })
    return { statut: 'transmise', detail: `Commande partenaire ${id} — ${payee.commande?.statut ?? 'transmise'}` }
  },
}
