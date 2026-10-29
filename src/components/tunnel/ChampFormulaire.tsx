'use client'

import type { Champ } from '@/data/modeles'

export function ChampFormulaire({
  champ,
  valeur,
  onChange,
  id,
}: {
  champ: Champ
  valeur: string
  onChange: (v: string) => void
  id: string
}) {
  const libelle = (
    <>
      {champ.libelle}
      {champ.requis && <span aria-hidden="true"> *</span>}
    </>
  )

  if (champ.type === 'case') {
    return (
      <label className="case champ-large">
        <input type="checkbox" checked={valeur === 'oui'} onChange={(e) => onChange(e.target.checked ? 'oui' : '')} />
        <span>{champ.libelle}</span>
      </label>
    )
  }

  const large = champ.type === 'zone' || champ.nom.endsWith('adresse')
  let controle: React.ReactNode
  if (champ.type === 'zone') {
    controle = <textarea id={id} value={valeur} placeholder={champ.placeholder} rows={3} onChange={(e) => onChange(e.target.value)} />
  } else if (champ.type === 'choix') {
    controle = (
      <select id={id} value={valeur} onChange={(e) => onChange(e.target.value)}>
        <option value="">Sélectionnez…</option>
        {champ.options?.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    )
  } else {
    const attributs =
      champ.type === 'cp'
        ? { inputMode: 'numeric' as const, maxLength: 5, pattern: '\\d{5}', autoComplete: 'postal-code' }
        : champ.type === 'siren'
          ? { inputMode: 'numeric' as const, maxLength: 11 }
          : champ.type === 'nombre'
            ? { inputMode: 'decimal' as const }
            : {}
    controle = (
      <input
        id={id}
        type={champ.type === 'date' ? 'date' : 'text'}
        value={valeur}
        placeholder={champ.placeholder}
        onChange={(e) => onChange(e.target.value)}
        {...attributs}
      />
    )
  }

  return (
    <div className={`champ${large ? ' champ-large' : ''}`}>
      <label htmlFor={id}>{libelle}</label>
      {controle}
      {champ.aide && <span className="aide">{champ.aide}</span>}
    </div>
  )
}
