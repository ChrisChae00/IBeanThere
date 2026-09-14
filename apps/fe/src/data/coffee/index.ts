import type { CoffeeDrink, CoffeeCategory, CategoryId } from './types';
import { categories } from './categories';

import pourOver from './drinks/pour-over';
import frenchPress from './drinks/french-press';
import aeropress from './drinks/aeropress';
import mokaPot from './drinks/moka-pot';
import siphon from './drinks/siphon';
import turkishCoffee from './drinks/turkish-coffee';
import coldBrew from './drinks/cold-brew';
import espresso from './drinks/espresso';
import americano from './drinks/americano';
import macchiato from './drinks/macchiato';
import cortado from './drinks/cortado';
import flatWhite from './drinks/flat-white';
import cappuccino from './drinks/cappuccino';
import cafeLatte from './drinks/cafe-latte';
import einspanner from './drinks/einspanner';
import affogato from './drinks/affogato';
import irishCoffee from './drinks/irish-coffee';
import vietnameseCoffee from './drinks/vietnamese-coffee';
import dalgona from './drinks/dalgona';

const allDrinks: CoffeeDrink[] = [
  pourOver,
  frenchPress,
  aeropress,
  mokaPot,
  siphon,
  turkishCoffee,
  coldBrew,
  espresso,
  americano,
  macchiato,
  cortado,
  flatWhite,
  cappuccino,
  cafeLatte,
  einspanner,
  affogato,
  irishCoffee,
  vietnameseCoffee,
  dalgona,
];

const drinksBySlug = new Map(allDrinks.map(d => [d.slug, d]));

export function getAllDrinks(): CoffeeDrink[] {
  return allDrinks;
}

export function getDrinkBySlug(slug: string): CoffeeDrink | undefined {
  return drinksBySlug.get(slug);
}

export function getAllCategories(): CoffeeCategory[] {
  return [...categories].sort((a, b) => a.order - b.order);
}

export function getCategory(id: CategoryId): CoffeeCategory | undefined {
  return categories.find(c => c.id === id);
}

export function getDrinksByCategory(categoryId: CategoryId): CoffeeDrink[] {
  const category = getCategory(categoryId);
  if (!category) return [];
  return category.drinkSlugs
    .map(slug => drinksBySlug.get(slug))
    .filter((d): d is CoffeeDrink => d !== undefined);
}

/** The most recent date any page's sources were checked. */
export function getLastReviewed(): string {
  return allDrinks.reduce((latest, d) => (d.reviewed > latest ? d.reviewed : latest), '');
}

export type { CoffeeDrink, CoffeeCategory };
