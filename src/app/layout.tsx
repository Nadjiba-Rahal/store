import type { Metadata } from 'next';
import { Fraunces, Inter, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { getStore } from '@/lib/store';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  weight: ['500', '600', '700', '900'],
});
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const mono = IBM_Plex_Mono({ subsets: ['latin'], variable: '--font-mono', weight: ['400', '500'] });

export async function generateMetadata(): Promise<Metadata> {
  const store = await getStore();
  return {
    title: store?.name || 'Ma Boutique',
    description:
      store?.description ||
      'Boutique en ligne — parcourez nos produits et commandez en toute simplicité, paiement à la livraison.',
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const store = await getStore();

  return (
    <html lang="fr" className={`${fraunces.variable} ${inter.variable} ${mono.variable}`}>
      <body className="font-body">
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Navbar store={store} />
            <main className="flex-1">{children}</main>
            <Footer store={store} />
          </div>
        </Providers>
      </body>
    </html>
  );
}
