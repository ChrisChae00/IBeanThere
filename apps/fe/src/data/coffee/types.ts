export type Locale = 'en' | 'ko';

export type LocalizedContent = {
  name: string;
  tagline: string;
  description: string;
  origin: string;
  funFact: string;
};

export type CoffeeDrink = {
  slug: string;
  categoryId: string;
  content: Record<Locale, LocalizedContent>;
};

export type CoffeeCategory = {
  id: string;
  order: number;
  icon: string;
  colorClass: string;
  content: Record<Locale, { name: string; subtitle: string }>;
  drinkSlugs: string[];
};
