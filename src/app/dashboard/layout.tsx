import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { LayoutDashboard, Package, Store, Plus, ClipboardList, Truck } from 'lucide-react';

const links = [
  { href: '/dashboard', label: 'Aperçu', icon: LayoutDashboard },
  { href: '/dashboard/orders', label: 'Commandes', icon: ClipboardList },
  { href: '/dashboard/products', label: 'Produits', icon: Package },
  { href: '/dashboard/products/new', label: 'Ajouter un produit', icon: Plus },
  { href: '/dashboard/settings', label: 'Paramètres', icon: Store },
  { href: '/dashboard/settings/shipping', label: 'Livraison', icon: Truck },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 md:flex-row">
      <aside className="shrink-0 md:w-56">
        <nav className="flex gap-2 overflow-x-auto md:flex-col md:overflow-visible">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-tag px-3 py-2 font-body text-sm font-medium text-souk-ink/70 transition hover:bg-white hover:text-souk-ink"
            >
              <Icon size={16} /> {label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1">{children}</div>
    </div>
  );
}
