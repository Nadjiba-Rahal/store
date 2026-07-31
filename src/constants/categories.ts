export interface Category {
  slug: string;
  name: string;
  emoji: string;
}

export const CATEGORIES: Category[] = [
  { slug: 'fashion', name: 'Mode & Vêtements', emoji: '👗' },
  { slug: 'home', name: 'Maison & Déco', emoji: '🏺' },
  { slug: 'food', name: 'Alimentation & Épicerie', emoji: '🌿' },
  { slug: 'beauty', name: 'Beauté & Bien-être', emoji: '💄' },
  { slug: 'electronics', name: 'Électronique', emoji: '🔌' },
  { slug: 'handmade', name: 'Artisanat & Fait main', emoji: '🧵' },
  { slug: 'kids', name: 'Enfants & Bébé', emoji: '🧸' },
  { slug: 'auto', name: 'Auto & Moto', emoji: '🚗' },
  { slug: 'sports', name: 'Sport & Plein air', emoji: '⚽' },
  { slug: 'books', name: 'Livres & Papeterie', emoji: '📚' },
  { slug: 'garden', name: 'Jardin & Bricolage', emoji: '🌱' },
  { slug: 'other', name: 'Autre', emoji: '📦' },
];

export function categoryLabel(slug: string): string {
  return CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;
}
