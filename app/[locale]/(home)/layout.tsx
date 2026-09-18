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
    fr: 'Accueil — Agencesafiimmobilier | Immobilier de Luxe au Maroc',
    en: 'Home — Agencesafiimmobilier | Luxury Real Estate in Morocco',
    ar: 'الرئيسية — Agencesafiimmobilier | عقارات فاخرة في المغرب',
    es: 'Inicio — Agencesafiimmobilier | Inmuebles de Lujo en Marruecos',
  }
  const descs: Record<string, string> = {
    fr: 'Agencesafiimmobilier — Immobilier de luxe au Maroc, Safi.',
    en: 'Agencesafiimmobilier — Luxury real estate in Morocco, Safi.',
    ar: 'Agencesafiimmobilier — عقارات فاخرة وخدمة كونسierge في المغرب. الدار البيضاء.',
    es: 'Agencesafiimmobilier — Inmuebles de lujo en Marruecos.',
  }
  return {
    title: titles[locale] ?? titles.fr,
    description: descs[locale] ?? descs.fr,
    alternates: {
      canonical: `${siteUrl}/${locale}`,
      languages: {
        'fr': `${siteUrl}/fr`,
        'en': `${siteUrl}/en`,
        'ar': `${siteUrl}/ar`,
        'es': `${siteUrl}/es`,
      },
    },
  }
}

export default function HomeLayout({ children }: { children: ReactNode }) {
  return children
}
