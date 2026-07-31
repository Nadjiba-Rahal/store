'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { MessageCircle, MapPin } from 'lucide-react';
import { wilayaLabel } from '@/constants/wilayas';
import type { StoreSettings } from '@/lib/store';

export function Footer({ store }: { store: StoreSettings | null }) {
  const storeName = store?.name || 'Ma Boutique';
  
  // React Context (useSession) is now valid because of 'use client'
  const { data: session } = useSession();
  const isStaff = session?.user?.role === 'seller' || session?.user?.role === 'admin';

  return (
    <footer className="border-t border-souk-ink/10 bg-souk-night text-souk-paper/80">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-display text-lg font-bold text-souk-paper">{storeName}</p>
            {store?.description && (
              <p className="mt-2 max-w-xs font-body text-sm text-souk-paper/60">{store.description}</p>
            )}
            {store && (
              <div className="mt-3 flex flex-wrap gap-4 font-mono text-xs text-souk-paper/50">
                <span className="flex items-center gap-1">
                  <MapPin size={13} /> {wilayaLabel(store.wilayaCode)}
                </span>
                {store.phone && (
                  <a
                    href={`https://wa.me/${store.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-souk-paper"
                  >
                    <MessageCircle size={13} /> {store.phone}
                  </a>
                )}
              </div>
            )}
          </div>
          <div className="flex gap-10 font-mono text-xs uppercase tracking-wider">
            <div className="flex flex-col gap-2">
              <span className="text-souk-gold">Explorer</span>
              <Link href="/products" className="text-souk-paper/70 hover:text-souk-paper">
                Produits
              </Link>
              <Link href="/checkout" className="text-souk-paper/70 hover:text-souk-paper">
                Mon panier
              </Link>
            </div>
            {isStaff && (
              <div className="flex flex-col gap-2">
                <span className="text-souk-gold">Boutique</span>
                <Link href="/dashboard" className="text-souk-paper/70 hover:text-souk-paper">
                  Tableau de bord
                </Link>
              </div>
            )}
          </div>
        </div>
        <p className="mt-8 border-t border-souk-paper/10 pt-6 font-mono text-[11px] text-souk-paper/40">
          © {new Date().getFullYear()} {storeName} — livraison partout en Algérie. 🇩🇿
        </p>
      </div>
    </footer>
  );
}