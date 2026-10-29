import Link from 'next/link'

export function Logo() {
  return (
    <Link href="/" className="logo" aria-label="Comptoir Légal — accueil">
      <span className="logo-marque" aria-hidden="true">
        CL
      </span>
      Comptoir Légal
    </Link>
  )
}
