import { DEPARTEMENTS } from '@/data/departements'
import { calculerPrix } from '@/lib/prix'
import { envoyerMail, mailCommandeInterne } from '@/lib/mail'
import type { Connecteur } from './types'

export const connecteurLocal: Connecteur = {
  nom: 'local',

  async journalPour(departement) {
    const journal = process.env.JOURNAL_PARTENAIRE_NOM || 'Journal habilité partenaire'
    return `${journal} (${DEPARTEMENTS[departement] ?? departement})`
  },

  async estimer(type, departement, texte) {
    return calculerPrix(type, departement, texte)
  },

  async transmettre(commande) {
    // Sans API partenaire, la commande arrive par e-mail à l'équipe, qui la transmet au journal.
    await envoyerMail(mailCommandeInterne(commande, 'Commande confirmée — annonce à transmettre au journal'))
    return { statut: 'a-traiter', detail: 'Transmise à l’équipe Comptoir Légal.' }
  },
}
