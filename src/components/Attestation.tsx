/**
 * Illustration d'une attestation de parution. C'est un spécimen : les données sont
 * fictives et le document porte la mention « SPÉCIMEN » pour ne pas être pris pour un vrai.
 */
export function Attestation() {
  return (
    <div className="attestation" role="img" aria-label="Spécimen d’attestation de parution, avec un tampon « Paru ».">
      <div className="specimen" aria-hidden="true">
        SPÉCIMEN
      </div>
      <div className="attestation-tete">
        <strong>Attestation de parution</strong>
        <span className="petit muted">N° CL-EXEMPLE</span>
      </div>
      <dl>
        <dt>Annonce</dt>
        <dd>Avis de constitution</dd>
        <dt>Société</dt>
        <dd>SAS Atelier Méridien</dd>
        <dt>Support</dt>
        <dd>Journal habilité, Rhône (69)</dd>
        <dt>Parution</dt>
        <dd>2 mars 2026</dd>
      </dl>
      <p className="attestation-certifie">Le support certifie la parution de l’annonce à la date indiquée.</p>
      <div className="tampon" aria-hidden="true">
        <div>
          <strong>Paru</strong>
          <span>Journal habilité</span>
        </div>
      </div>
    </div>
  )
}
