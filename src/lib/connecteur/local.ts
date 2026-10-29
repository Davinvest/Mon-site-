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
    // Le formaliste relit l'annonce puis la transmet au journal partenaire.
    await envoyerMail(mailCommandeInterne(commande, 'Commande confirmée — annonce à relire et transmettre'))
    return { statut: 'a-traiter', detail: 'Transmise à l’équipe Comptoir Légal pour relecture.' }
  },
}
