'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { WILAYAS } from '@/constants/wilayas';
import { Store, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [alreadyConfigured, setAlreadyConfigured] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    shopName: '',
    phone: '',
    wilayaCode: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/auth/register')
      .then((r) => r.json())
      .then((data) => setAlreadyConfigured(!!data.configured))
      .finally(() => setChecking(false));
  }, []);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Une erreur est survenue.');

      toast.success('Boutique créée ! Connexion en cours...');
      const signInRes = await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      if (signInRes?.error) {
        toast.info('Compte créé, connectez-vous maintenant.');
        router.push('/login');
        return;
      }
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return <div className="mx-auto max-w-md px-4 py-24 text-center font-mono text-sm text-souk-ink/50">Chargement...</div>;
  }

  if (alreadyConfigured) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <CheckCircle2 size={40} className="mx-auto text-souk-sage" />
        <h1 className="mt-4 font-display text-2xl font-bold text-souk-ink">Boutique déjà configurée</h1>
        <p className="mt-2 font-body text-sm text-souk-ink/60">
          Un compte administrateur existe déjà pour cette boutique.
        </p>
        <Link href="/login" className="mt-6 inline-block">
          <Button>Se connecter</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="mb-8 text-center">
        <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-souk-night text-souk-paper">
          <Store size={20} />
        </span>
        <h1 className="font-display text-2xl font-bold text-souk-ink">Configuration de la boutique</h1>
        <p className="mt-1 font-body text-sm text-souk-ink/60">
          Cette étape ne peut se faire qu&apos;une seule fois — elle crée votre compte administrateur.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Votre nom</Label>
          <Input id="name" required value={form.name} onChange={(e) => update('name', e.target.value)} />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="password">Mot de passe</Label>
          <Input
            id="password"
            type="password"
            required
            minLength={8}
            value={form.password}
            onChange={(e) => update('password', e.target.value)}
          />
        </div>

        <hr className="border-souk-ink/10" />

        <div>
          <Label htmlFor="shopName">Nom de la boutique</Label>
          <Input
            id="shopName"
            required
            placeholder="ex: Bijoux Yasmine"
            value={form.shopName}
            onChange={(e) => update('shopName', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="phone">Numéro WhatsApp</Label>
          <Input
            id="phone"
            required
            placeholder="ex: 213555123456"
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="wilaya">Wilaya</Label>
          <Select
            id="wilaya"
            required
            value={form.wilayaCode}
            onChange={(e) => update('wilayaCode', e.target.value)}
          >
            <option value="">Choisir une wilaya</option>
            {WILAYAS.map((w) => (
              <option key={w.code} value={w.code}>
                {w.code} — {w.name}
              </option>
            ))}
          </Select>
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? 'Création...' : 'Créer ma boutique'}
        </Button>
      </form>

      <p className="mt-6 text-center font-body text-sm text-souk-ink/60">
        Déjà configuré ?{' '}
        <Link href="/login" className="font-semibold text-souk-stamp hover:underline">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
