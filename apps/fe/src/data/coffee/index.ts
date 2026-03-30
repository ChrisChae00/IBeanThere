import type { CoffeeDrink, CoffeeCategory } from './types';
import { categories } from './categories';

import turkishCoffee from './drinks/turkish-coffee';
import handDrip from './drinks/hand-drip';
import pourOver from './drinks/pour-over';
import frenchPress from './drinks/french-press';
import aeropress from './drinks/aeropress';
import siphon from './drinks/siphon';
import mokaPot from './drinks/moka-pot';
import espresso from './drinks/espresso';
import americano from './drinks/americano';
import ristretto from './drinks/ristretto';
import lungo from './drinks/lungo';
import cafeLatte from './drinks/cafe-latte';
import cappuccino from './drinks/cappuccino';
import macchiato from './drinks/macchiato';
import flatWhite from './drinks/flat-white';
import cortado from './drinks/cortado';
import conPanna from './drinks/con-panna';
import breve from './drinks/breve';
import coldBrew from './drinks/cold-brew';
import dutchCoffee from './drinks/dutch-coffee';
import nitro from './drinks/nitro';
import icedAmericano from './drinks/iced-americano';
import affogato from './drinks/affogato';
import einspanner from './drinks/einspanner';
import irishCoffee from './drinks/irish-coffee';
import vietnameseCoffee from './drinks/vietnamese-coffee';
import dalgona from './drinks/dalgona';

const allDrinks: CoffeeDrink[] = [
  turkishCoffee,
  handDrip,
  pourOver,
  frenchPress,
  aeropress,
  siphon,
  mokaPot,
  espresso,
  americano,
  ristretto,
  lungo,
  cafeLatte,
  cappuccino,
  macchiato,
  flatWhite,
  cortado,
  conPanna,
  breve,
  coldBrew,
  dutchCoffee,
  nitro,
  icedAmericano,
  affogato,
  einspanner,
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

export function getCategory(id: string): CoffeeCategory | undefined {
  return categories.find(c => c.id === id);
}

export function getDrinksByCategory(categoryId: string): CoffeeDrink[] {
  const category = getCategory(categoryId);
  if (!category) return [];
  return category.drinkSlugs
    .map(slug => drinksBySlug.get(slug))
    .filter((d): d is CoffeeDrink => d !== undefined);
}

export type { CoffeeDrink, CoffeeCategory };
