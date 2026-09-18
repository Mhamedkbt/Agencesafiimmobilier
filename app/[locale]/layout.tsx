import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { getSiteUrl } from '@/lib/site'
import '../globals.css'

const siteUrl = getSiteUrl()

const montserrat = Montserrat({
  variable: '--font-montserrat',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Agencesafiimmobilier — Luxury Real Estate in Morocco',
    template: '%s | Agencesafiimmobilier',
  },
  description: 'Agencesafiimmobilier is your luxury real estate agency in Morocco. Discover off-plan apartments, ready-to-move properties in Safi.',
  keywords: [
    'immobilier maroc',
    'agence immobilière maroc',
    'villa maroc',
    'appartement maroc',
    'achat immobilier maroc',
    'location immobilier maroc',
    'luxe immobilier maroc',
    'Safi immobilier',
    'Agencesafiimmobilier',
    'real estate morocco',
    'luxury villa morocco',
  ],
  authors: [{ name: 'Agencesafiimmobilier' }],
  creator: 'Agencesafiimmobilier',
  publisher: 'Agencesafiimmobilier',
  icons: {
    icon: '/images/imgLogo.png',
    shortcut: '/images/imgLogo.png',
    apple: '/images/imgLogo.png',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_MA',
    url: siteUrl,
    siteName: 'Agencesafiimmobilier',
    title: 'Agencesafiimmobilier — Luxury Real Estate in Morocco',
    description: 'Discover exclusive properties in Morocco. Luxury real estate in Safi.',
    images: [
      {
        url: '/images/imgLogo.png',
        width: 1200,
        height: 630,
        alt: 'Agencesafiimmobilier',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Agencesafiimmobilier — Luxury Real Estate in Morocco',
    description: 'Discover exclusive properties in Morocco.',
    images: ['/images/imgLogo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

const locales = ['fr', 'en', 'ar', 'es']

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!locales.includes(locale)) notFound()

  const messages = await getMessages()
  const isRTL = locale === 'ar'

  return (
    <html
      lang={locale}
      dir={isRTL ? 'rtl' : 'ltr'}
      className={`${montserrat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

export function generateStaticParams() {
  return [{ locale: 'fr' }, { locale: 'en' }, { locale: 'ar' }, { locale: 'es' }]
}