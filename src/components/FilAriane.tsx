import Link from 'next/link'

export function FilAriane({ elements }: { elements: { nom: string; href?: string }[] }) {
  return (
    <nav aria-label="Fil d’Ariane">
      <ol className="fil-ariane">
        <li>
          <Link href="/">Accueil</Link>
        </li>
        {elements.map((e) => (
          <li key={e.nom}>{e.href ? <Link href={e.href}>{e.nom}</Link> : <span aria-current="page">{e.nom}</span>}</li>
        ))}
      </ol>
    </nav>
  )
}
