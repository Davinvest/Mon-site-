import type { TypeAnnonce } from '@/data/annonces'
import type { Commande } from '@/lib/commande'
import type { DetailPrix } from '@/lib/prix'

export interface ResultatTransmission {
  statut: 'transmise' | 'a-traiter'
  detail?: string
}

/**
 * Interface unique vers le support de publication.
 * « local » : nos tarifs et un envoi par e-mail au journal partenaire.
 * « lgdf » : l'API de Jordan (Le Guichet des Formalités), dès que la clé est fournie.
 */
export interface Connecteur {
  nom: string
  journalPour(departement: string): Promise<string>
  estimer(type: TypeAnnonce, departement: string, texte: string): Promise<DetailPrix>
  transmettre(commande: Commande): Promise<ResultatTransmission>
}
