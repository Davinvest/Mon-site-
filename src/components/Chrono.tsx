'use client'

import { useEffect, useState } from 'react'

/** Étapes de la démonstration et instant (en secondes) où chacune se termine. */
const ETAPES = [
  { nom: 'Formulaire complété', a: 0.5 },
  { nom: 'Annonce rédigée, mentions contrôlées', a: 1.7 },
  { nom: 'Tarif de l’État calculé', a: 2.6 },
  { nom: 'Transmise au journal habilité', a: 4.3 },
  { nom: 'Attestation de parution disponible', a: 5.9 },
  { nom: 'Brouillon INPI prêt à relire', a: 7.6 },
]

const FIN = ETAPES[ETAPES.length - 1].a
const PAUSE = 2.8

/**
 * Chronomètre de démonstration : un dossier fictif qui avance sous les yeux du visiteur,
 * puis recommence. Les durées sont illustratives et annoncées comme telles.
 */
export function Chrono() {
  const [t, setT] = useState(0)

  useEffect(() => {
    const fige = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const debut = performance.now()
    const id = window.setInterval(() => {
      if (fige) {
        setT(FIN)
        window.clearInterval(id)
        return
      }
      const ecoule = ((performance.now() - debut) / 1000) % (FIN + PAUSE)
      setT(Math.min(ecoule, FIN))
    }, 100)
    return () => window.clearInterval(id)
  }, [])

  const enCours = ETAPES.findIndex((e) => t < e.a)
  const secondes = String(Math.floor(t)).padStart(2, '0')
  const dixiemes = Math.floor((t % 1) * 10)

  return (
    <div className="chrono" role="img" aria-label="Démonstration animée : un dossier fictif passe de la saisie à l’attestation de parution en quelques secondes.">
      <div className="chrono-tete">
        <div className="chrono-dossier">
          Dossier exemple
          <strong>SAS Atelier Méridien · Constitution</strong>
        </div>
        <div className="chrono-temps">
          <strong>
            00:{secondes},{dixiemes}
          </strong>
          depuis la saisie
        </div>
      </div>
      <div className="chrono-barre">
        <span style={{ width: `${(t / FIN) * 100}%` }} />
      </div>
      <ol className="chrono-etapes">
        {ETAPES.map((e, i) => {
          const fait = t >= e.a
          const classe = fait ? 'fait' : i === enCours ? 'en-cours' : ''
          return (
            <li key={e.nom} className={classe}>
              <span className="chrono-coche">✓</span>
              <span>{e.nom}</span>
              <span className="chrono-etat">{fait ? 'Fait' : i === enCours ? 'En cours' : '—'}</span>
            </li>
          )
        })}
      </ol>
      <p className="chrono-note">Démonstration : dossier fictif, durées illustratives.</p>
    </div>
  )
}
