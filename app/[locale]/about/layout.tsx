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
    fr: 'À Propos — Appartsimo',
    en: 'About — Appartsimo',
    ar: 'عن Appartsimo',
    es: 'Sobre Nosotros — Appartsimo',
  }
  return {
    title: titles[locale] ?? titles.fr,
    description: 'Découvrez Appartsimo, votre agence immobilière de luxe au Maroc.',
    alternates: {
      canonical: `${siteUrl}/${locale}/about`,
    },
  }
}

export default function AboutLayout({ children }: { children: ReactNode }) {
  return children
}
