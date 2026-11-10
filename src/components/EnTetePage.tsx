import { FilAriane } from './FilAriane'

/** Liste de références de textes, en petites étiquettes. */
export function Refs({ refs }: { refs: readonly string[] }) {
  return (
    <ul className="refs" aria-label="Textes de référence">
      {refs.map((r) => (
        <li key={r} className="ref-legale">
          {r}
        </li>
      ))}
    </ul>
  )
}

/**
 * En-tête commun des pages intérieures : fil d'Ariane, surtitre, slogan de la page,
 * chapô, références de textes et boutons.
 */
export function EnTetePage({
  ariane,
  surtitre,
  titre,
  chapo,
  refs,
  large = false,
  children,
}: {
  ariane: { nom: string; href?: string }[]
  surtitre: string
  titre: React.ReactNode
  chapo?: React.ReactNode
  refs?: readonly string[]
  /** Titre long : laisse plus de largeur avant le retour à la ligne */
  large?: boolean
  children?: React.ReactNode
}) {
  return (
    <section className={`entete-page${large ? ' entete-page-large' : ''}`}>
      <div className="conteneur">
        <FilAriane elements={ariane} />
        <p className="surtitre">{surtitre}</p>
        <h1>{titre}</h1>
        {chapo && <p className="chapo">{chapo}</p>}
        {children && <div className="actions">{children}</div>}
        {refs && <Refs refs={refs} />}
      </div>
    </section>
  )
}
