import type { Metadata } from 'next'
import Link from 'next/link'
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
    <section className="section">
      <div className="conteneur" style={{ maxWidth: 720 }}>
        <p className="surtitre">Commande enregistrée</p>
        <h1>Merci, votre annonce est entre de bonnes mains.</h1>
        {demo === '1' && (
          <p className="alerte alerte-info">
            Mode démonstration : aucun paiement n’a été encaissé (Stripe n’est pas encore configuré).
          </p>
        )}
        {session && !session.paye && (
          <p className="alerte alerte-info">Votre paiement est en cours de validation. Vous recevrez un e-mail dès sa confirmation.</p>
        )}
        <div className="carte" style={{ marginTop: 20 }}>
          {reference && (
            <p>
              Référence : <strong>{reference}</strong>
            </p>
          )}
          {session?.paye && <p>Montant réglé : {euros(session.montant)} TTC</p>}
          <ol className="prose" style={{ paddingLeft: 20 }}>
            <li>Vous recevez une confirmation par e-mail{session?.email ? ` à ${session.email}` : ''}.</li>
            <li>Un formaliste relit votre annonce et la confronte à vos actes.</li>
            <li>L’annonce est transmise au journal habilité du département.</li>
            <li>L’attestation de parution vous est envoyée par e-mail, prête à joindre à votre dossier au guichet unique.</li>
          </ol>
        </div>
        <div className="actions">
          <Link href="/formalites" className="btn btn-primaire">
            Confier aussi la formalité
          </Link>
          <Link href="/" className="btn btn-secondaire">
            Retour à l’accueil
          </Link>
        </div>
      </div>
    </section>
  )
}
