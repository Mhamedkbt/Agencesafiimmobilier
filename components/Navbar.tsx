"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const t = useTranslations("nav");
  const locale = useLocale();
  const navRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    { href: `/${locale}`, label: t("home") },
    { href: `/${locale}/properties`, label: t("properties") },
    { href: `/${locale}/about`, label: t("about") },
    { href: `/${locale}/contact`, label: t("contact") },
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuOpen && navRef.current && !navRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 10);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      ref={navRef}
      className={`sticky top-0 z-50 bg-[#121212] transition-shadow duration-300 ${scrolled ? "shadow-lg shadow-black/25" : "shadow-md"
        }`}
    >
      <nav className="mx-auto flex h-22 max-w-7xl items-center justify-between px-4 py-[2px] sm:px-6 lg:px-8">
        <Link
          href={`/${locale}`}
          className="flex items-center"
          onClick={() => setMenuOpen(false)}
        >
          <img src="/images/logoImgFr.png" className="h-22 w-auto" alt="Agencesafiimmobilier" />
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-sm font-medium text-white transition-colors hover:text-[#D4AF37] lg:text-base"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href={`/${locale}/admin`}
            className="text-white transition-colors hover:text-[#D4AF37]"
            aria-label="Admin Login"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </Link>

          <LanguageSwitcher />

          <a
            href="tel:+212600716145"
            className="rounded-md bg-[#D4AF37] px-5 py-2.5 text-sm font-semibold text-[#1a1a1a] transition-colors hover:bg-[#D4B56A] lg:text-base"
          >
            +212 600-716145
          </a>
        </div>

        <div className="flex items-center gap-3 md:hidden">
          <Link
            href={`/${locale}/admin`}
            className="p-2 text-white transition-colors hover:text-[#D4AF37]"
            aria-label="Admin Login"
            onClick={() => setMenuOpen(false)}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </Link>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 text-white hover:text-[#D4AF37]"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <svg
              className="h-7 w-7"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              aria-hidden="true"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="border-t border-white/10 bg-[#121212] md:hidden">
          <ul className="flex flex-col px-4 py-4 sm:px-6">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block py-3 text-base font-medium text-white transition-colors hover:text-[#D4AF37]"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="pt-2">
              <a
                href="tel:+212600716145"
                className="block rounded-md bg-[#D4AF37] px-4 py-3 text-center text-base font-semibold text-[#1a1a1a] transition-colors hover:bg-[#D4B56A]"
              >
                +212 600-716145
              </a>
            </li>
            <li className="pt-4 mt-4 border-t border-white/10">
              <LanguageSwitcher />
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
