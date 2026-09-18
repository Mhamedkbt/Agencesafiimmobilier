import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { getSiteUrl } from '@/lib/site'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const siteUrl = getSiteUrl()
  const titles: Record<string, string> = {
    fr: 'Contact — Agencesafiimmobilier',
    en: 'Contact — Agencesafiimmobilier',
    ar: 'اتصل بنا — Agencesafiimmobilier',
    es: 'Contacto — Agencesafiimmobilier',
  }
  return {
    title: titles[locale] ?? titles.fr,
    description: 'Contactez Agencesafiimmobilier pour toute question sur nos propriétés au Maroc.',
    alternates: {
      canonical: `${siteUrl}/${locale}/contact`,
    },
  }
}

export default function ContactLayout({ children }: { children: ReactNode }) {
  return children
}
