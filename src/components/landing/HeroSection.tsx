'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, HandCoins, CreditCard, Truck } from 'lucide-react';

interface HeroSectionProps {
  storeName: string;
  description?: string;
  heroImage?: string;
  heroTitle?: string;
  heroSubtitle?: string;
}

const badges = [
  { icon: HandCoins, label: 'Paiement à la livraison (COD)', delay: '0s' },
  { icon: CreditCard, label: 'Paiement sécurisé par carte EDAHABIA / CIB', delay: '1.3s' },
  { icon: Truck, label: 'Livraison dans les 69 wilayas 🇩🇿', delay: '2.6s' },
];

export function HeroSection({ storeName, description, heroImage, heroTitle, heroSubtitle }: HeroSectionProps) {
  const title = heroTitle || storeName;
  const subtitle =
    heroSubtitle ||
    description ||
    'Parcourez nos produits et commandez en quelques clics. Paiement à la livraison, partout dans les 69 wilayas.';

  return (
    <section className="relative overflow-hidden border-b border-souk-ink/10">
      <div className="relative h-[70vh] min-h-[420px] w-full sm:h-[80vh]">
        {heroImage ? (
          <Image src={heroImage} alt={title} fill priority sizes="100vw" className="object-cover" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-souk-night via-souk-nightlight to-souk-ink" />
        )}
        {/* Readability gradient over the banner image */}
        <div className="absolute inset-0 bg-gradient-to-t from-souk-ink/80 via-souk-ink/30 to-souk-ink/10" />

        <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col justify-center px-4 sm:px-6">
          <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-white backdrop-blur animate-fade-in">
            Livraison partout en Algérie 🇩🇿
          </span>

          <h1 className="max-w-xl font-display text-4xl font-bold leading-[1.05] text-white sm:text-6xl">
            {title}
          </h1>

          <p className="mt-5 max-w-md font-body text-base text-white/85">{subtitle}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 font-body text-sm font-semibold text-souk-ink transition-all hover:bg-souk-goldlight"
            >
              Parcourir les produits <ArrowRight size={18} />
            </Link>
            <Link
              href="/checkout"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/40 px-6 py-3 font-body text-sm font-semibold text-white transition-all hover:bg-white/10"
            >
              Voir mon panier
            </Link>
          </div>
        </div>

        {/* Floating trust badges */}
        <div className="pointer-events-none absolute inset-x-0 bottom-6 z-10 hidden justify-center gap-4 px-4 md:flex">
          {badges.map(({ icon: Icon, label, delay }) => (
            <div
              key={label}
              className="ticket-edge pointer-events-auto flex animate-float items-center gap-2 rounded-lg bg-white/90 px-4 py-3 shadow-lg backdrop-blur"
              style={{ animationDelay: delay }}
            >
              <Icon size={18} className="shrink-0 text-souk-stamp" />
              <p className="whitespace-nowrap font-body text-xs font-medium text-souk-ink">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stacked badges on small screens (floating layout doesn't fit) */}
      <div className="grid grid-cols-1 gap-3 bg-souk-paper p-4 sm:grid-cols-3 md:hidden">
        {badges.map(({ icon: Icon, label }) => (
          <div key={label} className="ticket-edge flex items-center gap-2 rounded-lg bg-white p-3 shadow-sm">
            <Icon size={18} className="shrink-0 text-souk-stamp" />
            <p className="font-body text-xs font-medium text-souk-ink">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
