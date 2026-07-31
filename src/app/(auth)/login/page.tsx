'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await signIn('credentials', {
      email: form.email,
      password: form.password,
      redirect: false,
    });
    setLoading(false);

    if (res?.error) {
      toast.error('Email ou mot de passe incorrect.');
      return;
    }
    toast.success('Connexion réussie !');
    router.push('/dashboard');
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-140px)] max-w-sm flex-col justify-center px-4 py-16">
      <div className="mb-8 text-center">
        <h1 className="font-display text-2xl font-bold text-souk-ink">Espace admin</h1>
        <p className="mt-1 font-body text-sm text-souk-ink/60">Connectez-vous pour gérer votre boutique</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="password">Mot de passe</Label>
          <Input
            id="password"
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          <LogIn size={16} /> {loading ? 'Connexion...' : 'Se connecter'}
        </Button>
      </form>

      <p className="mt-6 text-center font-body text-sm text-souk-ink/60">
        Première visite ?{' '}
        <Link href="/register" className="font-semibold text-souk-stamp hover:underline">
          Configurer la boutique
        </Link>
      </p>
    </div>
  );
}
