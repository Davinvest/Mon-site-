import type { Metadata } from 'next'
import { Tunnel } from '@/components/tunnel/Tunnel'

export const metadata: Metadata = {
  title: 'Publier une annonce légale',
  description: 'Choisissez votre annonce, complétez-la, payez au tarif réglementé : attestation de parution envoyée par e-mail.',
  alternates: { canonical: '/tunnel' },
}

export default async function PageTunnel({ searchParams }: { searchParams: Promise<{ type?: string; annule?: string }> }) {
  const { type, annule } = await searchParams
  return <Tunnel key={type ?? 'nouveau'} typeInitial={type} annule={annule === '1'} />
}
