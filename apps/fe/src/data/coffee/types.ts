import type { SourceId } from './sources';

export type Locale = 'en' | 'ko';

/** A paragraph and the sources that back it, printed right under it. */
export type Paragraph = {
  text: string;
  sources?: SourceId[];
};

/** One question the page answers. `id` is the section's anchor, shared by both locales. */
export type Section = {
  id: string;
  heading: string;
  body: Paragraph[];
};

export type DrinkCopy = {
  name: string;
  /** Other names the reader may know it by. */
  aka?: string;
  /** <title>. Unique per page. */
  title: string;
  /** Meta and structured-data description. Says the same thing the summary does. */
  description: string;
  /** The answer, first thing under the heading. Readable on its own. */
  summary: string;
  /** Backing for any figure or name the summary states that no section repeats. */
  summarySources?: SourceId[];
  /** One-line definition, used wherever the drink is listed. */
  line: string;
  facts: { label: string; value: string }[];
  sections: Section[];
};

export type CoffeeDrink = {
  slug: string;
  categoryId: CategoryId;
  /** The day the sources on this page were last checked. Change it only when they are. */
  reviewed: string;
  /** Up to three slugs, in the order worth reading them. */
  related: string[];
  content: Record<Locale, DrinkCopy>;
};

export type CategoryId = 'brewing' | 'espresso' | 'added';

export type CoffeeCategory = {
  id: CategoryId;
  order: number;
  /** Which map prompt closes a page in this category. */
  cta: 'cafe' | 'beans';
  content: Record<Locale, { name: string; definition: string }>;
  drinkSlugs: string[];
};
