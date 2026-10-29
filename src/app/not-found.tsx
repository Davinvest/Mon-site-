import Link from 'next/link'

export default function PageIntrouvable() {
  return (
    <section className="section">
      <div className="conteneur" style={{ maxWidth: 640 }}>
        <span className="surtitre">Erreur 404</span>
        <h1>Cette page n’existe pas.</h1>
        <p className="chapo">Le lien est peut-être ancien, ou l’adresse mal saisie.</p>
        <div className="actions">
          <Link href="/" className="btn btn-primaire">
            Retour à l’accueil
          </Link>
          <Link href="/annonces-legales" className="btn btn-secondaire">
            Annonces légales
          </Link>
        </div>
      </div>
    </section>
  )
}
