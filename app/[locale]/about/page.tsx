'use client'

import Image from 'next/image'
import { useEffect, useState, useRef } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { TestimonialsSlider } from '../../../components/TestimonialsSlider'

interface HighlightItem {
  value: string
  label: string
}

const serviceKeys = [
  { titleKey: 'service1_title', descKey: 'service1_desc', icon: 'building' },
  { titleKey: 'service2_title', descKey: 'service2_desc', icon: 'home' },
  { titleKey: 'service3_title', descKey: 'service3_desc', icon: 'payment' },
  { titleKey: 'service4_title', descKey: 'service4_desc', icon: 'consult' },
  { titleKey: 'service5_title', descKey: 'service5_desc', icon: 'vip' },
  { titleKey: 'service6_title', descKey: 'service6_desc', icon: 'airport' },
] as const

function ServiceIcon({ type }: { type: string }) {
  const className = 'h-8 w-8'
  switch (type) {
    case 'building':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    case 'home':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    case 'payment':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    case 'consult':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      )
    case 'vip':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )
    case 'airport':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      )
    default:
      return null
  }
}

const CounterItem = ({ item }: { item: HighlightItem }) => {
  const [count, setCount] = useState<string | number>(0)
  const elementRef = useRef<HTMLParagraphElement>(null)
  const hasAnimated = useRef<boolean>(false)

  useEffect(() => {
    const target = elementRef.current
    if (!target) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          const numericTarget = parseInt(item.value, 10)

          if (isNaN(numericTarget)) {
            setCount(item.value)
            return
          }

          const duration = 2000
          const frameDuration = 1000 / 60
          const totalFrames = Math.round(duration / frameDuration)
          let frame = 0

          const counter = setInterval(() => {
            frame++
            const progress = frame / totalFrames
            const easeOutProgress = progress * (2 - progress)
            const currentCount = Math.floor(easeOutProgress * numericTarget)

            if (frame >= totalFrames) {
              clearInterval(counter)
              setCount(item.value)
            } else {
              const suffix = item.value.replace(/[0-9]/g, '')
              setCount(`${currentCount}${suffix}`)
            }
          }, frameDuration)
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(target)
    return () => observer.disconnect()
  }, [item.value])

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#D4AF37]/30 hover:shadow-md">
      <p ref={elementRef} className="text-3xl font-bold tabular-nums text-[#D4AF37] sm:text-4xl">
        {count}
      </p>
      <p className="mt-2 text-sm font-semibold text-[#121212] sm:text-base">
        {item.label}
      </p>
    </div>
  )
}

export default function AboutPage() {
  const t = useTranslations('about')
  const tHome = useTranslations('home')
  const [currentSlide, setCurrentSlide] = useState<number>(0)

  const values = [
    {
      title: t('value1_title'),
      description: t('value1_desc'),
      icon: (
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24"
          strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      ),
    },
    {
      title: t('value2_title'),
      description: t('value2_desc'),
      icon: (
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24"
          strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        </svg>
      ),
    },
    {
      title: t('value3_title'),
      description: t('value3_desc'),
      icon: (
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24"
          strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
      ),
    },
  ]

  const highlights = [
    { value: '3+', label: t('stat_experience') },
    { value: '20+', label: t('stat_sold') },
    { value: '30+', label: t('stat_clients') },
    { value: '24/7', label: t('stat_support') },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#121212] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#121212]/60 via-transparent to-[#D4AF37]/10" />
        <div className="pointer-events-none absolute -right-20 top-0 h-64 w-64 rounded-full bg-[#D4AF37]/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl text-center">
          <div className="mx-auto mb-5 h-1 w-16 rounded-full bg-[#D4AF37]" />
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            {t('title')}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg font-light text-gray-200 sm:text-xl">
            {t('subtitle')}
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="bg-white px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="text-2xl font-bold text-[#121212] sm:text-3xl">
              {t('story_title')}
            </h2>
            <div className="mt-2 h-1 w-16 rounded-full bg-[#D4AF37]" />
            <p className="mt-6 leading-relaxed text-gray-600">
              {t('story_p1')}
            </p>
            <p className="mt-4 leading-relaxed text-gray-600">
              <span className="font-semibold text-[#121212]">{t('mission_label')}</span>{' '}
              {t('mission_text')}{' '}
              <span className="font-semibold text-[#121212]">{t('vision_label')}</span>{' '}
              {t('vision_text')}
            </p>
          </div>
          <div className="group relative aspect-4/3 overflow-hidden rounded-2xl shadow-xl ring-1 ring-[#D4AF37]/20">
            <Image
              src="/images/modern-luxury-villa-pool-medulin.jpg"
              alt="Luxury villa with pool in Morocco"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#121212]/30 to-transparent" />
          </div>
        </div>
      </section>





      {/* Services Section */}
      <section className="relative overflow-hidden bg-gray-50 px-4 py-20 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute -left-24 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-[#D4AF37]/5 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-64 w-64 rounded-full bg-[#121212]/5 blur-3xl" />
        <div className="relative mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-[#121212] sm:text-4xl">
              {tHome('services_title')}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-lg text-gray-600">
              {tHome('services_subtitle')}
            </p>
            <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-[#D4AF37]" />
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {serviceKeys.map((service, index) => (
              <div
                key={service.titleKey}
                className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-[#D4AF37]/40 hover:shadow-[0_16px_40px_rgba(0,0,0,0.12)]"
              >
                <span className="pointer-events-none absolute -right-2 -top-4 text-7xl font-black leading-none text-[#121212]/[0.04] select-none">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="relative mb-5 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-[#121212] text-white ring-1 ring-[#D4AF37]/20 transition-colors duration-300 group-hover:bg-[#121212] group-hover:text-white">
                  <ServiceIcon type={service.icon} />
                </div>
                <h3 className="relative text-xl font-bold text-[#121212]">{tHome(service.titleKey)}</h3>
                <p className="relative mt-2 text-sm leading-relaxed text-gray-600">
                  {tHome(service.descKey)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>






      {/* Values */}
      <section className="relative overflow-hidden bg-[#121212] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#121212]/40 to-transparent" />
        <div className="relative mx-auto max-w-7xl">
          <h2 className="text-center text-2xl font-bold text-white sm:text-3xl">
            {t('values_title')}
          </h2>
          <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-[#D4AF37]" />
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {values.map((value) => (
              <div
                key={value.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-sm transition-all duration-300 hover:border-[#D4AF37]/30 hover:bg-white/10"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#121212] text-[#D4AF37] ring-2 ring-[#D4AF37]/40">
                  {value.icon}
                </div>
                <h3 className="mt-5 text-lg font-bold text-white">
                  {value.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-300">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-2xl font-bold text-[#121212] sm:text-3xl">
            {t('why_title')}
          </h2>
          <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-[#D4AF37]" />
          <div className="mt-12 grid grid-cols-2 gap-6 lg:grid-cols-4">
            {highlights.map((item) => (
              <CounterItem key={item.label} item={item} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialsSlider />
    </div>
  )
}
