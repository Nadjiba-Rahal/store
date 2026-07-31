'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import { Menu, X, LayoutDashboard, LogOut, ShoppingBag, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/components/CartProvider';
import type { StoreSettings } from '@/lib/store';

export function Navbar({ store }: { store: StoreSettings | null }) {
  const { data: session, status } = useSession();
  const { count, openCart } = useCart();
  const [open, setOpen] = useState(false);
  const storeName = store?.name || 'Ma Boutique';
  const initial = storeName.trim().charAt(0).toUpperCase() || 'M';
  const isStaff = status === 'authenticated' && (session?.user?.role === 'seller' || session?.user?.role === 'admin');

  return (
    <header className="sticky top-0 z-50 border-b border-souk-ink/10 bg-souk-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-2">
          {store?.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={store.logo} alt={storeName} className="h-9 w-9 shrink-0 rounded-full object-cover" />
          ) : (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-souk-night font-display text-lg font-bold text-souk-paper">
              {initial}
            </span>
          )}
          <span className="truncate font-display text-xl font-bold tracking-tight text-souk-ink">
            {storeName}
          </span>
        </Link>

        <nav className="hidden items-center gap-6 font-body text-sm font-medium text-souk-ink/80 md:flex">
          <Link href="/products" className="flex items-center gap-1.5 transition hover:text-souk-ink">
            <Search size={15} /> Tous les produits
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={openCart}
            className="relative flex h-10 w-10 items-center justify-center rounded-tag text-souk-ink transition hover:bg-souk-ink/5"
            aria-label="Ouvrir le panier"
          >
            <ShoppingBag size={20} />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-souk-stamp px-1 font-mono text-[10px] font-bold text-white">
                {count}
              </span>
            )}
          </button>

          <div className="hidden items-center gap-2 md:flex">
            {isStaff && (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    <LayoutDashboard size={16} /> Tableau de bord
                  </Button>
                </Link>
                <Button variant="secondary" size="sm" onClick={() => signOut({ callbackUrl: '/' })}>
                  <LogOut size={16} /> Déconnexion
                </Button>
              </>
            )}
          </div>

          <button
            className="text-souk-ink md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-souk-ink/10 bg-souk-paper px-4 pb-4 pt-2 md:hidden">
          <div className="flex flex-col gap-2">
            <Link href="/products" className="py-2 text-sm font-medium" onClick={() => setOpen(false)}>
              Tous les produits
            </Link>
            {isStaff && (
              <>
                <Link href="/dashboard" className="py-2 text-sm font-medium" onClick={() => setOpen(false)}>
                  Tableau de bord
                </Link>
                <Button variant="secondary" size="sm" onClick={() => signOut({ callbackUrl: '/' })}>
                  Déconnexion
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}