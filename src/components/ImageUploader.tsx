'use client';

import { useRef, useState } from 'react';
import { Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function ImageUploader({
  images,
  onChange,
  max = 4,
}: {
  images: string[];
  onChange: (images: string[]) => void;
  max?: number;
}) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    if (images.length >= max) {
      toast.error(`Maximum ${max} photos par produit.`);
      return;
    }

    setUploading(true);
    try {
      const file = files[0];
      const base64 = await fileToBase64(file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onChange([...images, data.url]);
    } catch (err: any) {
      toast.error(err.message || "Échec de l'envoi de l'image.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {images.map((url, i) => (
          <div key={url} className="relative h-24 w-24 overflow-hidden rounded-tag border border-souk-ink/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(images.filter((_, idx) => idx !== i))}
              className="absolute right-1 top-1 rounded-full bg-souk-ink/70 p-0.5 text-white"
              aria-label="Supprimer la photo"
            >
              <X size={12} />
            </button>
          </div>
        ))}

        {images.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-tag border-2 border-dashed border-souk-ink/20 text-souk-ink/50 transition hover:border-souk-night hover:text-souk-night"
          >
            {uploading ? <Loader2 size={20} className="animate-spin" /> : <ImageIcon size={20} />}
            <span className="font-mono text-[10px]">{uploading ? 'Envoi...' : 'Ajouter'}</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <p className="mt-2 font-mono text-[11px] text-souk-ink/40">
        {images.length}/{max} photos — JPG ou PNG, max 5 Mo chacune.
      </p>
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
