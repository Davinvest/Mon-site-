import { trouverType } from '@/data/annonces'
import type { TypeAnnonce } from '@/data/annonces'
import { departementDuCodePostal, DEPARTEMENTS } from '@/data/departements'
import { normaliserTexte } from '@/lib/prix'
import type { DetailPrix } from '@/lib/prix'

export const TEXTE_MIN = 80
export const TEXTE_MAX = 15000 // reste sous TEXTE_MAX_STRIPE (lib/paiement)

export interface Client {
  prenom: string
  nom: string
  email: string
  telephone: string
  societe: string
}

export interface Commande {
  reference: string
  typeSlug: string
  typeTitre: string
  codePostal: string
  departement: string
  texte: string
  client: Client
  prix: DetailPrix
  journal: string
  creeLe: string
}

export interface DemandeValide {
  type: TypeAnnonce
  codePostal: string
  departement: string
  texte: string
  client: Client
}

const EMAIL = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[a-z]{2,}$/i

function chaine(v: unknown, max = 200): string {
  return typeof v === 'string' ? v.trim().slice(0, max) : ''
}

/** Valide le corps envoyé par le tunnel. Renvoie la demande ou un message d'erreur. */
export function validerDemande(corps: unknown): DemandeValide | { erreur: string } {
  if (!corps || typeof corps !== 'object') return { erreur: 'Requête invalide.' }
  const c = corps as Record<string, unknown>
  const type = trouverType(chaine(c.typeSlug, 100))
  if (!type) return { erreur: 'Type d’annonce inconnu.' }

  const codePostal = chaine(c.codePostal, 10)
  const departement = departementDuCodePostal(codePostal)
  if (!departement || !(departement in DEPARTEMENTS)) return { erreur: 'Code postal du département de publication invalide.' }

  const texte = normaliserTexte(chaine(c.texte, TEXTE_MAX + 1000))
  if (texte.length < TEXTE_MIN) return { erreur: 'Le texte de l’annonce est trop court.' }
  if (texte.length > TEXTE_MAX) return { erreur: 'Le texte de l’annonce est trop long.' }
  // Le département fixe le tarif : son code postal doit figurer dans le texte publié.
  if (!texte.includes(codePostal)) return { erreur: 'Le code postal du département de publication doit figurer dans l’annonce.' }

  const cl = (c.client ?? {}) as Record<string, unknown>
  const client: Client = {
    prenom: chaine(cl.prenom, 80),
    nom: chaine(cl.nom, 80),
    email: chaine(cl.email, 160).toLowerCase(),
    telephone: chaine(cl.telephone, 30),
    societe: chaine(cl.societe, 160),
  }
  if (!client.prenom || !client.nom) return { erreur: 'Indiquez vos nom et prénom.' }
  if (!EMAIL.test(client.email)) return { erreur: 'Adresse e-mail invalide.' }
  if (c.accepteCgv !== true) return { erreur: 'Vous devez accepter les conditions générales de vente.' }
  if (c.accepteExecution !== true) return { erreur: 'Vous devez demander l’exécution immédiate de la prestation.' }

  return { type, codePostal, departement, texte, client }
}

export function nouvelleReference(): string {
  const d = new Date()
  const date = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
  const alea = crypto.getRandomValues(new Uint32Array(1))[0].toString(36).toUpperCase().padStart(6, '0').slice(-6)
  return `CL-${date}-${alea}`
}
