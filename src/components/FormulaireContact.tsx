'use client'

import { useState } from 'react'

export const SUJETS_CONTACT = ['Annonce légale', 'Guichet unique', 'Cabinets et démonstration', 'Partenariat', 'Autre']

export function FormulaireContact({
  sujet = 'Annonce légale',
  origine = '',
  libelleBouton = 'Envoyer le message',
}: {
  sujet?: string
  origine?: string
  libelleBouton?: string
}) {
  const [etat, setEtat] = useState<'repos' | 'envoi' | 'ok' | 'erreur'>('repos')
  const [message, setMessage] = useState('')

  async function envoyer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setEtat('envoi')
    const donnees = Object.fromEntries(new FormData(e.currentTarget).entries())
    try {
      const r = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...donnees, origine }),
      })
      const corps = await r.json()
      if (!r.ok) throw new Error(corps.erreur)
      setEtat('ok')
    } catch (err) {
      setMessage(err instanceof Error && err.message ? err.message : 'Envoi impossible.')
      setEtat('erreur')
    }
  }

  if (etat === 'ok') {
    return (
      <p className="alerte alerte-ok" role="status">
        Merci, votre message est bien parti. Nous vous répondons sous 24 h ouvrées.
      </p>
    )
  }

  return (
    <form onSubmit={envoyer}>
      <div className="grille-champs">
        <div className="champ">
          <label htmlFor="c-prenom">Prénom</label>
          <input id="c-prenom" name="prenom" type="text" autoComplete="given-name" required />
        </div>
        <div className="champ">
          <label htmlFor="c-nom">Nom</label>
          <input id="c-nom" name="nom" type="text" autoComplete="family-name" required />
        </div>
        <div className="champ">
          <label htmlFor="c-email">E-mail</label>
          <input id="c-email" name="email" type="email" autoComplete="email" required />
        </div>
        <div className="champ">
          <label htmlFor="c-tel">Téléphone (facultatif)</label>
          <input id="c-tel" name="telephone" type="tel" autoComplete="tel" />
        </div>
        <div className="champ champ-large">
          <label htmlFor="c-sujet">Sujet</label>
          <select id="c-sujet" name="sujet" defaultValue={sujet}>
            {SUJETS_CONTACT.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="champ champ-large">
          <label htmlFor="c-message">Message</label>
          <textarea id="c-message" name="message" required rows={5} />
        </div>
      </div>
      <div className="piege" aria-hidden="true">
        <label htmlFor="c-site">Site web</label>
        <input id="c-site" name="site_web" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      {etat === 'erreur' && (
        <p className="alerte alerte-erreur" role="alert">
          {message}
        </p>
      )}
      <button type="submit" className="btn btn-primaire" disabled={etat === 'envoi'}>
        {etat === 'envoi' ? 'Envoi…' : libelleBouton}
      </button>
      <p className="petit muted" style={{ marginTop: 10 }}>
        Vos données servent uniquement à répondre à votre demande. Voir notre <a href="/confidentialite">politique de confidentialité</a>.
      </p>
    </form>
  )
}
