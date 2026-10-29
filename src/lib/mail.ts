import nodemailer from 'nodemailer'
import { SITE } from '@/data/site'
import type { Commande } from '@/lib/commande'
import { euros } from '@/lib/prix'

export interface Mail {
  to: string
  subject: string
  text: string
  replyTo?: string
}

const uneLigne = (s: string) => s.replace(/[\r\n]+/g, ' ').slice(0, 200)

/**
 * Envoie un e-mail texte via le SMTP configuré (OVH Zimbra).
 * Sans configuration SMTP, le message est seulement journalisé (développement).
 */
export async function envoyerMail(mail: Mail): Promise<void> {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, MAIL_FROM } = process.env
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD) {
    console.info(`[mail simulé] à ${mail.to} — ${mail.subject}\n${mail.text}`)
    return
  }
  const port = Number(SMTP_PORT || 465)
  const transport = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
  })
  await transport.sendMail({
    from: MAIL_FROM || `${SITE.nom} <${SMTP_USER}>`,
    to: mail.to,
    replyTo: mail.replyTo,
    subject: uneLigne(mail.subject),
    text: mail.text,
  })
}

export const adresseCommandes = () => process.env.MAIL_COMMANDES || SITE.email

function lignesPrix(c: Commande): string {
  const p = c.prix
  const detail =
    p.mode === 'forfait'
      ? 'Forfait réglementé'
      : `${p.caracteres} caractères × ${p.tarifCaractere?.toLocaleString('fr-FR')} € (annexe ${p.annexe})`
  return `${detail}\nMontant HT : ${euros(p.ht)}\nTVA 20 % : ${euros(p.tva)}\nTotal TTC : ${euros(p.ttc)}`
}

export function mailCommandeInterne(c: Commande, statut: string): Mail {
  return {
    to: adresseCommandes(),
    replyTo: c.client.email,
    subject: `[${c.reference}] ${statut} — ${c.typeTitre}`,
    text: [
      `Statut : ${statut}`,
      `Référence : ${c.reference}`,
      `Date : ${new Date(c.creeLe).toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}`,
      '',
      `Type : ${c.typeTitre} (${c.typeSlug})`,
      `Département de publication : ${c.departement} (code postal ${c.codePostal})`,
      `Journal : ${c.journal}`,
      '',
      'Client :',
      `${c.client.prenom} ${c.client.nom}${c.client.societe ? ` — ${c.client.societe}` : ''}`,
      `${c.client.email}${c.client.telephone ? ` — ${c.client.telephone}` : ''}`,
      '',
      lignesPrix(c),
      '',
      '----- TEXTE DE L’ANNONCE -----',
      c.texte,
      '----- FIN -----',
    ].join('\n'),
  }
}

export function mailConfirmationClient(c: Commande): Mail {
  return {
    to: c.client.email,
    replyTo: adresseCommandes(),
    subject: `Votre annonce légale ${c.reference} est confirmée`,
    text: [
      `Bonjour ${c.client.prenom},`,
      '',
      `Nous avons bien reçu votre commande ${c.reference} (${c.typeTitre}).`,
      'Un formaliste relit votre annonce avant sa transmission au journal habilité.',
      'Vous recevrez l’attestation de parution par e-mail dès la publication.',
      '',
      lignesPrix(c),
      '',
      'Texte publié :',
      c.texte,
      '',
      `Une question ? Répondez simplement à cet e-mail.`,
      '',
      `${SITE.nom} — ${SITE.domaine}`,
    ].join('\n'),
  }
}
