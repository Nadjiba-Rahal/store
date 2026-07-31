'use client';

import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';

export function AIDescriptionGenerator({
  name,
  category,
  onGenerated,
}: {
  name: string;
  category: string;
  onGenerated: (text: string) => void;
}) {
  const [loading, setLoading] = useState(false);

  async function generate() {
    if (!name || !category) {
      toast.error('Ajoutez un nom et une catégorie avant de générer.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, category }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onGenerated(data.description);
      toast.success('Description générée avec Gemini ✨');
    } catch (err: any) {
      toast.error(err.message || 'Échec de la génération.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button type="button" variant="ghost" size="sm" onClick={generate} disabled={loading}>
      {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
      {loading ? 'Génération...' : 'Générer avec IA'}
    </Button>
  );
}
