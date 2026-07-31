'use client';

import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'sonner';
import { CartProvider } from '@/components/CartProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CartProvider>
        {children}
        <Toaster position="top-center" richColors />
      </CartProvider>
    </SessionProvider>
  );
}
