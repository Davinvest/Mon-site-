import { FilAriane } from './FilAriane'

export function PageLegale({ titre, majLe, children }: { titre: string; majLe: string; children: React.ReactNode }) {
  return (
    <section className="section" style={{ paddingTop: 40 }}>
      <div className="conteneur">
        <FilAriane elements={[{ nom: titre }]} />
        <article className="prose">
          <h1>{titre}</h1>
          <p className="petit muted">Dernière mise à jour : {majLe}</p>
          {children}
        </article>
      </div>
    </section>
  )
}
