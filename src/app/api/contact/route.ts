import { NextResponse, type NextRequest } from 'next/server'
import { adresseCommandes, envoyerMail } from '@/lib/mail'

const EMAIL = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[a-z]{2,}$/i
const SUJETS = ['Rappel formalité', 'Devis formalité', 'Annonce légale', 'Démo CRM / API', 'Partenariat', 'Autre']

export async function POST(req: NextRequest) {
  let c: Record<string, unknown>
  try {
    c = await req.json()
  } catch {
    return NextResponse.json({ erreur: 'Requête invalide.' }, { status: 400 })
  }
  const s = (k: string, max = 200) => (typeof c[k] === 'string' ? (c[k] as string).trim().slice(0, max) : '')

  // Champ piège invisible : rempli uniquement par les robots.
  if (s('site_web')) return NextResponse.json({ ok: true })

  const prenom = s('prenom', 80)
  const nom = s('nom', 80)
  const email = s('email', 160)
  const telephone = s('telephone', 30)
  const sujet = SUJETS.includes(s('sujet')) ? s('sujet') : 'Autre'
  const message = s('message', 5000)
  const origine = s('origine', 200)

  if (!prenom || !nom) return NextResponse.json({ erreur: 'Indiquez vos nom et prénom.' }, { status: 400 })
  if (!EMAIL.test(email)) return NextResponse.json({ erreur: 'Adresse e-mail invalide.' }, { status: 400 })
  if (!message && !telephone) return NextResponse.json({ erreur: 'Laissez un message ou un numéro de téléphone.' }, { status: 400 })

  try {
    await envoyerMail({
      to: adresseCommandes(),
      replyTo: email,
      subject: `[Contact] ${sujet} — ${prenom} ${nom}`,
      text: [`Sujet : ${sujet}`, `Page : ${origine}`, `Nom : ${prenom} ${nom}`, `E-mail : ${email}`, `Téléphone : ${telephone || '—'}`, '', message].join('\n'),
    })
  } catch (e) {
    console.error('Contact non envoyé', e)
    return NextResponse.json({ erreur: 'Envoi impossible pour le moment. Écrivez-nous directement par e-mail.' }, { status: 502 })
  }
  return NextResponse.json({ ok: true })
}
