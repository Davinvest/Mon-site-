import type { Metadata } from 'next'
import Link from 'next/link'
import { Attestation } from '@/components/Attestation'
import { JETONS_PAR_ANNONCE } from '@/data/formalites'
import { stripe, stripeActif } from '@/lib/paiement'
import { euros } from '@/lib/prix'

export const metadata: Metadata = { title: 'Commande confirmée', robots: { index: false } }

async function lireSession(id: string) {
  if (!stripeActif() || !/^cs_[A-Za-z0-9_]+$/.test(id)) return null
  try {
    const s = await stripe().checkout.sessions.retrieve(id)
    return { reference: s.metadata?.reference ?? '', paye: s.payment_status === 'paid', montant: (s.amount_total ?? 0) / 100, email: s.customer_email ?? '' }
  } catch {
    return null
  }
}

export default async function Confirmation({ searchParams }: { searchParams: Promise<{ session_id?: string; ref?: string; demo?: string }> }) {
  const { session_id, ref, demo } = await searchParams
  const session = session_id ? await lireSession(session_id) : null
  const reference = session?.reference || (ref && /^CL-[\w-]+$/.test(ref) ? ref : '')

  return (
    <section className="entete-page" style={{ borderBottom: 0 }}>
      <div className="conteneur duo">
        <div>
          <p className="surtitre">Commande enregistrée</p>
          <h1>
            C’est parti. <em>Votre annonce est en route.</em>
          </h1>
          {demo === '1' && (
            <p className="alerte alerte-info">Démonstration : aucun paiement n’a été encaissé et aucune annonce n’est réellement publiée.</p>
          )}
          {session && !session.paye && (
            <p className="alerte alerte-info">Votre paiement est en cours de validation. Vous recevrez un e-mail dès sa confirmation.</p>
          )}
          {reference && (
            <p className="chapo">
              Référence : <strong style={{ color: 'var(--text)' }}>{reference}</strong>
              {session?.paye ? ` · ${euros(session.montant)} TTC réglés` : ''}
            </p>
          )}
          <ol className="prose" style={{ paddingLeft: 20 }}>
            <li>Une confirmation part par e-mail{session?.email ? ` à ${session.email}` : ''}.</li>
            <li>L’annonce est transmise au journal habilité du département.</li>
            <li>L’attestation de parution vous revient par e-mail, prête à joindre à votre dossier au guichet unique.</li>
            <li>Si vous avez un espace cabinet, {JETONS_PAR_ANNONCE} jetons sont crédités à son portefeuille.</li>
          </ol>
          <div className="actions">
            <Link href="/formalites" className="btn btn-primaire">
              Préparer la formalité au guichet unique
            </Link>
            <Link href="/" className="btn btn-secondaire">
              Retour à l’accueil
            </Link>
          </div>
        </div>
        <div>
          <p className="surtitre">Ce que vous allez recevoir</p>
          <Attestation />
        </div>
      </div>
    </section>
  )
}
