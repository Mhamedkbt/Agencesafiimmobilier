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
    fr: 'Évaluation Gratuite — Agencesafiimmobilier',
    en: 'Free Property Evaluation — Agencesafiimmobilier',
    ar: 'تقييم عقاري مجاني — Agencesafiimmobilier',
    es: 'Evaluación Gratuita — Agencesafiimmobilier',
  }
  return {
    title: titles[locale] ?? titles.fr,
    description: 'Obtenez une évaluation gratuite de votre bien immobilier au Maroc.',
    // alternates: {
    //   canonical: `${siteUrl}/${locale}/evaluation`,
    // },
  }
}

export default function EvaluationLayout({ children }: { children: ReactNode }) {
  return children
}
