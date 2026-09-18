"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useEffect, useLayoutEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { TestimonialsSlider } from "@/components/TestimonialsSlider";
import { useTranslations, useLocale } from "next-intl";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://Agencesafiimmobilier.vercel.app/";

export const dynamic = "force-dynamic";

const isVideoUrl = (url: string): boolean => {
  return /\.(mp4|webm|mov|avi|quicktime)(\?|$)/i.test(url);
};

interface Property {
  id: string;
  title: string | null;
  city: string | null;
  price: number | null;
  surface: number | null;
  type: string | null;
  status: string | null;
  images: string[] | null;
  featured: boolean | null;
  description: string | null;
  created_at: string | null;
}

const statsData = [
  { target: 50, suffix: "+", labelKey: "stat_properties" },
  { target: 7, suffix: "+", labelKey: "stat_years_experience" },
  { target: 3, suffix: "+", labelKey: "stat_cities" },
  { target: 24, suffix: "/7", labelKey: "stat_support" }, // Fixed: 24 animates, /7 displays nicely alongside it!

];

const serviceKeys = [
  { titleKey: "service1_title", descKey: "service1_desc", icon: "building" },
  { titleKey: "service2_title", descKey: "service2_desc", icon: "home" },
  { titleKey: "service3_title", descKey: "service3_desc", icon: "payment" },
  { titleKey: "service4_title", descKey: "service4_desc", icon: "consult" },
  { titleKey: "service5_title", descKey: "service5_desc", icon: "vip" },
  { titleKey: "service6_title", descKey: "service6_desc", icon: "airport" },
] as const;

function ServiceIcon({ type }: { type: string }) {
  const className = "h-8 w-8";
  switch (type) {
    case "building":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      );
    case "home":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      );
    case "payment":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case "consult":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      );
    case "vip":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      );
    case "airport":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      );
    default:
      return null;
  }
}

export default function Home() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("home");
  const [city, setCity] = useState("Safi");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(true);

  // Entire screen loading control state
  const [pageLoading, setPageLoading] = useState(true);

  // States for animated counters
  const [counts, setCounts] = useState([0, 0, 0, 0]);
  const statsRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  const heroRef = useRef<HTMLElement>(null);
  const [heroReady, setHeroReady] = useState(false);
  const [heroParallax, setHeroParallax] = useState({ x: 0, y: 0 });

  // BLOCK SCROLLING EFFECT — only while loading overlay is visible
  useLayoutEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    const releaseScroll = () => {
      html.classList.remove("home-scroll-lock");
      html.style.overflow = "";
      html.style.height = "";
      body.style.overflow = "";
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.width = "";
      body.style.height = "";
      body.style.touchAction = "";
      window.dispatchEvent(new Event("resize"));
    };

    if (!pageLoading) {
      releaseScroll();
      return;
    }

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    const blockTouch = (e: TouchEvent) => {
      e.preventDefault();
    };

    document.addEventListener("touchmove", blockTouch, { passive: false });

    return () => {
      document.removeEventListener("touchmove", blockTouch);
      releaseScroll();
    };
  }, [pageLoading]);

  useEffect(() => {
    if (pageLoading) {
      setHeroReady(false);
      return;
    }
    const timer = setTimeout(() => setHeroReady(true), 50);
    return () => clearTimeout(timer);
  }, [pageLoading]);

  useEffect(() => {
    if (pageLoading) return;

    const handleMouseMove = (e: MouseEvent) => {
      const el = heroRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setHeroParallax({ x: x * 24, y: y * 16 });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [pageLoading]);

  useEffect(() => {
    const fetchFeaturedProperties = async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("featured", true)
        .order("created_at", { ascending: false })
        .limit(6);

      if (error) {
        console.error("Error fetching featured properties:", error);
        setLoadingProperties(false);
        setPageLoading(false);
        return;
      }

      setFeaturedProperties(data ?? []);
      setLoadingProperties(false);

      // Small intentional timeout so the screen animation feels professional and fluid
      setTimeout(() => {
        setPageLoading(false);
      }, 600);
    };

    fetchFeaturedProperties();
  }, []);

  // Scroll-triggered counter effect
  useEffect(() => {
    if (pageLoading) return;

    const currentRef = statsRef.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;

          const duration = 1500;
          const frameRate = 1000 / 60;
          const totalFrames = Math.round(duration / frameRate);
          let frame = 0;

          const timer = setInterval(() => {
            frame++;
            const progress = frame / totalFrames;
            const easeProgress = progress * (2 - progress);

            const nextCounts = statsData.map((stat) =>
              Math.floor(easeProgress * stat.target)
            );

            setCounts(nextCounts);

            if (frame >= totalFrames) {
              setCounts(statsData.map(s => s.target));
              clearInterval(timer);
            }
          }, frameRate);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(currentRef);
    return () => observer.disconnect();
  }, [pageLoading]);

  function handleSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (type) params.set("type", type);
    if (status) params.set("status", status);
    const query = params.toString();
    router.push(query ? `/${locale}/properties?${query}` : `/${locale}/properties`);
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'RealEstateAgent',
            name: 'Agencesafiimmobilier',
            description: 'Luxury Real Estate in Morocco',
            url: siteUrl,
            logo: `${siteUrl}/images/logoImgFr.png`,
            image: `${siteUrl}/images/logoImgFr.png`,
            telephone: '+212600716145',
            email: 'Agencesafiimmobilier@gmail.com',
            address: {
              '@type': 'PostalAddress',
              addressLocality: 'Safi',
              addressCountry: 'MA',
            },
            areaServed: [
              'Safi',
            ],
            sameAs: [],
            openingHours: 'Mo-Sa 09:00-18:00',
          }),
        }}
      />
      {/* Perfect Full Screen Entry Spinner */}
      {pageLoading && (
        <div className="fixed inset-0 z-[9999] flex h-[100dvh] w-full touch-none overscroll-none flex-col items-center justify-center bg-[#121212] transition-all duration-500">
          <div className="relative flex h-20 w-20 items-center justify-center">
            {/* Inner dynamic ring */}
            <div className="absolute h-full w-full rounded-full border-4 border-[#D4AF37]/10"></div>
            <div className="absolute h-full w-full rounded-full border-4 border-t-[#D4AF37] border-r-transparent border-b-transparent border-l-transparent animate-spin duration-700"></div>
            {/* Secondary reverse counter pulse inner core ring */}
            <div className="absolute h-12 w-12 rounded-full border-[3px] border-b-[white] border-t-transparent border-r-transparent border-l-transparent animate-[spin_1s_linear_infinite_reverse] opacity-40"></div>
          </div>
          <p className="mt-6 text-sm font-semibold tracking-widest text-[#D4AF37] uppercase animate-pulse">
            {t("loading_brand")}
          </p>
        </div>
      )}

      {!pageLoading && (
        <>
          {/* Dynamic Animated Hero Section */}
          <section
            ref={heroRef}
            className="relative flex min-h-[90vh] items-center justify-center bg-[#12121225] px-4 py-20 sm:px-6 lg:px-8 overflow-hidden"
          >
            <div className="absolute inset-0 z-0 overflow-hidden">
              <div
                className="absolute inset-[-8%] will-change-transform"
                style={{
                  transform: `translate3d(${heroParallax.x}px, ${heroParallax.y}px, 0)`,
                  transition: "transform 0.22s cubic-bezier(0.22, 1, 0.36, 1)",
                }}
              >
                <div className="relative h-full w-full animate-[aliveBackground_30s_ease-in-out_infinite]">
                  <Image
                    src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1920&q=80"
                    alt="Moroccan Modern Architecture"
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover object-center scale-125 opacity-40"
                  />
                </div>
              </div>

              <div className="absolute inset-0 bg-gradient-to-br from-[#121212]/80 via-[#121212]/65 to-[#121212]/85 mix-blend-multiply" />
              <div
                className="pointer-events-none absolute inset-0 opacity-30 animate-[heroShimmer_8s_ease-in-out_infinite]"
                style={{
                  background:
                    "linear-gradient(105deg, transparent 40%, rgba(201,165,90,0.15) 50%, transparent 60%)",
                  backgroundSize: "200% 100%",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#121212]/40" />

              {/* Floating gold ambient orbs */}
              <div className="pointer-events-none absolute -left-16 top-1/4 h-64 w-64 rounded-full bg-[#D4AF37]/10 blur-3xl animate-[heroOrbFloat_12s_ease-in-out_infinite]" />
              <div className="pointer-events-none absolute -right-10 bottom-1/4 h-48 w-48 rounded-full bg-[#D4AF37]/15 blur-3xl animate-[heroOrbFloat_10s_ease-in-out_2s_infinite]" />
              <div className="pointer-events-none absolute left-1/2 top-10 h-32 w-32 -translate-x-1/2 rounded-full bg-white/5 blur-2xl animate-[heroOrbPulse_6s_ease-in-out_infinite]" />
            </div>

            <style jsx global>{`
          @keyframes aliveBackground {
            0%, 100% { transform: scale(1.15) translate(0, 0) rotate(0deg); }
            33% { transform: scale(1.2) translate(-24px, 14px) rotate(0.6deg); }
            66% { transform: scale(1.18) translate(18px, -18px) rotate(-0.4deg); }
          }
          @keyframes heroWordIn {
            from {
              opacity: 0;
              transform: translateY(24px) rotateX(8deg);
              filter: blur(4px);
            }
            to {
              opacity: 1;
              transform: translateY(0) rotateX(0deg);
              filter: blur(0);
            }
          }
          @keyframes heroSubtitleIn {
            from {
              opacity: 0;
              transform: translateY(14px);
              letter-spacing: 0.08em;
            }
            to {
              opacity: 1;
              transform: translateY(0);
              letter-spacing: normal;
            }
          }
          @keyframes heroLineExpand {
            from { transform: scaleX(0); opacity: 0; }
            to { transform: scaleX(1); opacity: 1; }
          }
          @keyframes heroFormIn {
            from {
              opacity: 0;
              transform: translateY(24px) scale(0.98);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          @keyframes heroShimmer {
            0%, 100% { background-position: 200% 0; }
            50% { background-position: -200% 0; }
          }
          @keyframes heroOrbFloat {
            0%, 100% { transform: translateY(0) scale(1); opacity: 0.6; }
            50% { transform: translateY(-28px) scale(1.08); opacity: 1; }
          }
          @keyframes heroOrbPulse {
            0%, 100% { transform: translateX(-50%) scale(1); opacity: 0.4; }
            50% { transform: translateX(-50%) scale(1.2); opacity: 0.7; }
          }
          @keyframes heroScrollBounce {
            0%, 100% { transform: translateY(0); opacity: 0.5; }
            50% { transform: translateY(8px); opacity: 1; }
          }
          @keyframes heroGlowPulse {
            0%, 100% { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 0 rgba(201, 165, 90, 0); }
            50% { box-shadow: 0 30px 60px -10px rgba(0, 0, 0, 0.5), 0 0 40px -8px rgba(201, 165, 90, 0.35); }
          }
        `}</style>

            <div className="relative z-10 mx-auto w-full max-w-5xl text-center">
              <div
                className={`mx-auto mb-8 flex items-center justify-center gap-3 transition-all duration-300 ${heroReady ? "opacity-100" : "opacity-0"
                  }`}
              >
                <span
                  className={`h-px w-12 origin-right bg-gradient-to-r from-transparent to-[#D4AF37] ${heroReady ? "animate-[heroLineExpand_0.45s_ease-out_forwards]" : "scale-x-0 opacity-0"
                    }`}
                />
                <span
                  className={`text-xs font-semibold uppercase tracking-[0.35em] text-[#D4AF37] ${heroReady ? "animate-[heroSubtitleIn_0.45s_ease-out_0.05s_forwards] opacity-0" : "opacity-0"
                    }`}
                >
                  {t("loading_brand")}
                </span>
                <span
                  className={`h-px w-12 origin-left bg-gradient-to-l from-transparent to-[#D4AF37] ${heroReady ? "animate-[heroLineExpand_0.45s_ease-out_forwards]" : "scale-x-0 opacity-0"
                    }`}
                />
              </div>

              <h1 className="perspective-[1000px] text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl drop-shadow-md">
                {t("hero_title")
                  .split(" ")
                  .map((word, i) => (
                    <span
                      key={`${word}-${i}`}
                      className={`inline-block mr-[0.25em] last:mr-0 ${heroReady
                        ? "animate-[heroWordIn_0.38s_cubic-bezier(0.22,1,0.36,1)_forwards] opacity-0"
                        : "opacity-0"
                        }`}
                      style={{ animationDelay: heroReady ? `${0.06 + i * 0.035}s` : undefined }}
                    >
                      {word}
                    </span>
                  ))}
              </h1>

              <p
                className={`mx-auto mt-6 max-w-2xl text-lg text-gray-200 sm:text-xl drop-shadow-sm font-light ${heroReady
                  ? "animate-[heroSubtitleIn_0.5s_ease-out_0.28s_forwards] opacity-0"
                  : "opacity-0"
                  }`}
              >
                {t("hero_subtitle")}
              </p>

              <form
                onSubmit={handleSearch}
                className={`mx-auto mt-12 w-full max-w-4xl rounded-2xl bg-white p-4 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4)] sm:p-6 transition-all duration-300 hover:shadow-[0_30px_60px_-10px_rgba(0,0,0,0.5)] ${heroReady
                  ? "animate-[heroFormIn_0.5s_cubic-bezier(0.22,1,0.36,1)_0.42s_forwards,heroGlowPulse_4s_ease-in-out_1s_infinite] opacity-0"
                  : "opacity-0"
                  }`}
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-2">
                  <div className="text-left px-2">
                    <label htmlFor="city" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#121212]">
                      {t("search_city_label")}
                    </label>
                    <input
                      id="city"
                      type="text"
                      placeholder={t("search_city_placeholder")}
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-3 text-[#121212] transition-all placeholder:text-gray-400 focus:border-[#D4AF37] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30"
                    />
                  </div>

                  <div className="text-left px-2">
                    <label htmlFor="type" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#121212]">
                      {t("search_type_label")}
                    </label>
                    <select
                      id="type"
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-3 text-[#121212] transition-all focus:border-[#D4AF37] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30"
                    >
                      <option value="">{t("search_type_placeholder")}</option>
                      <option value="apartment">{t("apartment")}</option>
                      <option value="villa">{t("villa")}</option>
                      <option value="studio">{t("studio")}</option>
                      <option value="riad">{t("riad")}</option>
                      <option value="land">{t("land")}</option>
                      <option value="commercial">{t("commercial")}</option>
                    </select>
                  </div>

                  <div className="text-left px-2">
                    <label htmlFor="status" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#121212]">
                      {t("search_status_label")}
                    </label>
                    <select
                      id="status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-3 text-[#121212] transition-all focus:border-[#D4AF37] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30"
                    >
                      <option value="">{t("search_status_placeholder")}</option>
                      <option value="sale">{t("sale")}</option>
                      <option value="rent">{t("rent")}</option>
                    </select>
                  </div>

                  <div className="flex items-end px-2 pt-2 sm:pt-0">
                    <button
                      type="submit"
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#D4AF37] px-6 py-3 text-base font-bold text-[#121212] shadow-md transition-all hover:bg-[#D4B56A] hover:shadow-lg active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:ring-offset-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      {t("search_button")}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            <div
              className={`pointer-events-none absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 ${heroReady
                ? "animate-[heroSubtitleIn_0.35s_ease-out_0.55s_forwards,heroScrollBounce_2s_ease-in-out_0.9s_infinite] opacity-0"
                : "opacity-0"
                }`}
              aria-hidden
            >
              <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-white/50">Scroll</span>
              <svg className="h-5 w-5 text-[#D4AF37]/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </section>

          {/* Featured Properties Section */}
          <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-[#121212] sm:text-4xl">
                  {t("featured_title")}
                </h2>
                <p className="mt-3 text-lg text-gray-500">
                  {t("featured_subtitle")}
                </p>
              </div>

              {loadingProperties && (
                <div className="mt-16 flex flex-col items-center justify-center gap-12">
                  <div className="relative flex h-14 w-14 items-center justify-center">
                    <div className="absolute h-full w-full rounded-full border-4 border-[#121212]/10"></div>
                    <div className="absolute h-full w-full rounded-full border-4 border-t-[#D4AF37] border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                  </div>
                  <div className="grid w-full grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg animate-pulse">
                        <div className="h-48 w-full bg-gray-200" />
                        <div className="p-6 space-y-3">
                          <div className="flex gap-2">
                            <div className="h-6 w-16 bg-gray-200 rounded-full" />
                            <div className="h-6 w-16 bg-gray-200 rounded-full" />
                          </div>
                          <div className="h-6 w-3/4 bg-gray-200 rounded" />
                          <div className="h-4 w-1/2 bg-gray-200 rounded" />
                          <div className="h-4 w-full bg-gray-200 rounded" />
                          <div className="h-10 w-full bg-gray-200 rounded-lg mt-4" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!loadingProperties && featuredProperties.length === 0 && (
                <div className="mt-12 flex flex-col items-center justify-center py-16 text-center">
                  <div className="rounded-full bg-gray-100 p-6 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-gray-400"
                      fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <p className="text-xl font-semibold text-[#121212]">{t("featured_empty")}</p>
                  <p className="mt-2 text-gray-500">{t("featured_empty_sub")}</p>
                </div>
              )}

              {!loadingProperties && featuredProperties.length > 0 && (
                <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {featuredProperties.map((property) => (
                    <article
                      key={property.id}
                      className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)] 
                           transition-all duration-300 hover:scale-101 hover:shadow-[0_12px_30px_rgba(0,0,0,0.12)]
                           w-[95%] mx-auto md:w-full"
                    >
                      <div className="relative h-64 w-full overflow-hidden bg-gray-50">
                        {property.images && property.images.length > 0 ? (
                          isVideoUrl(property.images[0]) ? (
                            <div className="h-full w-full">
                              <video
                                src={property.images[0]}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                muted autoPlay loop playsInline preload="metadata"
                              />
                              <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-xs text-white text-[10px] tracking-wider font-semibold px-2.5 py-1 rounded-md flex items-center gap-1 z-10">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                                VIDEO
                              </div>
                            </div>
                          ) : (
                            <img
                              src={property.images[0]}
                              alt={property.title ?? "Property"}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          )
                        ) : (
                          <div className="h-full w-full bg-gradient-to-br from-[#121212] to-[#121212] flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                          </div>
                        )}

                        <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
                          {property.type && (
                            <span className="rounded-lg bg-[#121212] px-3 py-1.5 text-xs font-medium text-white capitalize shadow-sm backdrop-blur-xs">
                              {property.type}
                            </span>
                          )}
                          {property.status && (
                            <span className="rounded-lg border border-[#121212]/20 bg-white px-3 py-1.5 text-xs font-medium text-[#121212] capitalize shadow-sm">
                              {property.status}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col p-6">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-[#121212] tracking-tight line-clamp-1 group-hover:text-[#D4AF37] transition-colors duration-200">
                            {property.title ?? "Untitled Property"}
                          </h3>
                          <p className="mt-1.5 text-sm text-gray-400 font-light tracking-wide flex items-center gap-1.5">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400/80 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {property.city ?? "—"}
                          </p>
                        </div>

                        <div className="mt-3 pt-4 border-t border-gray-50 flex items-center justify-between">
                          <p className="text-lg font-bold text-[#121212] tracking-tight">
                            {property.price
                              ? `${property.price.toLocaleString()} MAD`
                              : t("price_on_request")}
                          </p>
                          <p className="text-sm text-gray-400 font-light tracking-wide">
                            {property.surface ? `${property.surface} m²` : "—"}
                          </p>
                        </div>

                        <Link
                          href={`/${locale}/properties/${property.id}`}
                          className="mt-5 block w-full rounded-xl bg-[#D4AF37] py-3.5 text-center 
                                 text-sm font-semibold text-[#121212] transition-all duration-200 
                                 hover:bg-[#D4B56A] shadow-xs hover:shadow-sm"
                        >
                          {t("view_details")}
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {!loadingProperties && featuredProperties.length > 0 && (
                <div className="mt-14 text-center">
                  <Link
                    href={`/${locale}/properties`}
                    className="inline-block rounded-xl border-2 border-[#121212] px-10 py-3.5 
                           font-semibold text-[#121212] transition-all duration-200 
                           hover:bg-[#121212] hover:text-white"
                  >
                    {t("view_all")}
                  </Link>
                </div>
              )}
            </div>
          </section>

          {/* Stats Counter Section */}
          <section ref={statsRef} className="bg-[#121212] px-4 py-20 sm:px-6 lg:px-8">
            <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-10 gap-x-4 lg:grid-cols-4">
              {statsData.map((stat, idx) => (
                <div key={stat.labelKey} className="text-center border-r last:border-0 border-white/10 px-2">
                  <p className="text-4xl font-extrabold text-[#D4AF37] sm:text-5xl tabular-nums tracking-tight">
                    {counts[idx]}{stat.suffix}
                  </p>
                  <p className="mt-2 text-sm font-medium tracking-wide text-white/90 sm:text-base">
                    {t(stat.labelKey)}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* About Section */}
          <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
            <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-[#121212] sm:text-4xl">
                  {t("about_title")}
                </h2>
                <p className="mt-6 leading-relaxed text-gray-600 font-light">
                  {t("about_p1")}
                </p>
                <Link
                  href={`/${locale}/contact`}
                  className="mt-8 inline-block rounded-xl bg-[#D4AF37] px-8 py-3.5 font-bold text-[#121212] shadow-sm transition-all hover:bg-[#D4B56A] hover:shadow"
                >
                  {t("contact_us")}
                </Link>
              </div>
              <div className="relative h-[450px] overflow-hidden rounded-2xl shadow-xl bg-gray-100 group">
                <Image
                  src="/images/modern-luxury-villa-pool-medulin.jpg"
                  alt="Luxury Morocco Riad Interior Architecture"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121212]/20 to-transparent pointer-events-none" />
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
                  {t("services_title")}
                </h2>
                <p className="mx-auto mt-3 max-w-2xl text-lg text-gray-600">
                  {t("services_subtitle")}
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
                    <h3 className="relative text-xl font-bold text-[#121212]">{t(service.titleKey)}</h3>
                    <p className="relative mt-2 text-sm leading-relaxed text-gray-600">
                      {t(service.descKey)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <TestimonialsSlider />
        </>
      )}
    </>
  );
}
