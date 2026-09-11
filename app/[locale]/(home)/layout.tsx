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
    fr: 'Accueil — Appartsimo | Immobilier de Luxe au Maroc',
    en: 'Home — Appartsimo | Luxury Real Estate in Morocco',
    ar: 'الرئيسية — Appartsimo | عقارات فاخرة في المغرب',
    es: 'Inicio — Appartsimo | Inmuebles de Lujo en Marruecos',
  }
  const descs: Record<string, string> = {
    fr: 'Appartsimo — Immobilier de luxe au Maroc, Casablanca.',
    en: 'Appartsimo — Luxury real estate in Morocco, Casablanca.',
    ar: 'Appartsimo — عقارات فاخرة وخدمة كونسierge في المغرب. الدار البيضاء.',
    es: 'Appartsimo — Inmuebles de lujo en Marruecos.',
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
