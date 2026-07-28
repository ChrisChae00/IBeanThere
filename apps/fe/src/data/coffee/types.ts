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

/** Which side of the two-tone ladder a stage sits on. Siblings alternate. */
export type CategoryAccent = 'primary' | 'secondary';

export type CoffeeCategory = {
  id: string;
  order: number;
  icon: string;
  /** Depth in the lineage tree. Drives the colour ladder: deeper = denser. */
  depth: number;
  accent: CategoryAccent;
  /** Set when this stage grew out of another one rather than following it. */
  branchFrom?: string;
  content: Record<Locale, { name: string; subtitle: string; era: string }>;
  drinkSlugs: string[];
};
