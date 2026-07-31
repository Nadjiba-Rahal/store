import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role: 'seller' | 'admin';
      shopId: string | null;
      shopSlug: string | null;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: 'seller' | 'admin';
    shopId: string | null;
    shopSlug: string | null;
  }
}