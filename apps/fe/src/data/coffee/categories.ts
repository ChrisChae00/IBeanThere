import type { CoffeeCategory } from './types';

export const categories: CoffeeCategory[] = [
  {
    id: 'brewing',
    order: 0,
    icon: '🫖',
    colorClass: 'brewing',
    content: {
      en: {
        name: 'Brewing',
        subtitle: 'The origin of it all · ~15th century',
      },
      ko: {
        name: '브루잉',
        subtitle: '커피의 시초 · ~15세기',
      },
    },
    drinkSlugs: [
      'turkish-coffee',
      'hand-drip',
      'pour-over',
      'french-press',
      'aeropress',
      'siphon',
      'moka-pot',
    ],
  },
  {
    id: 'espresso',
    order: 1,
    icon: '☕',
    colorClass: 'espresso',
    content: {
      en: {
        name: 'Espresso Revolution',
        subtitle: '1901 Italy · The game changer',
      },
      ko: {
        name: '에스프레소 혁명',
        subtitle: '1901년 이탈리아 · 커피의 판도를 바꾸다',
      },
    },
    drinkSlugs: ['espresso', 'americano', 'ristretto', 'lungo'],
  },
  {
    id: 'milk-variations',
    order: 2,
    icon: '🥛',
    colorClass: 'milk',
    content: {
      en: {
        name: 'Milk Variations',
        subtitle: 'Italian barista culture',
      },
      ko: {
        name: '밀크 베리에이션',
        subtitle: '이탈리아 바리스타 문화',
      },
    },
    drinkSlugs: [
      'cafe-latte',
      'cappuccino',
      'macchiato',
      'flat-white',
      'cortado',
      'con-panna',
      'breve',
    ],
  },
  {
    id: 'cold-brew',
    order: 3,
    icon: '🧊',
    colorClass: 'cold',
    content: {
      en: {
        name: 'Cold Brew',
        subtitle: 'The discovery of cold extraction',
      },
      ko: {
        name: '콜드 계열',
        subtitle: '저온 추출의 발견',
      },
    },
    drinkSlugs: ['cold-brew', 'dutch-coffee', 'nitro', 'iced-americano'],
  },
  {
    id: 'signature',
    order: 4,
    icon: '✨',
    colorClass: 'signature',
    content: {
      en: {
        name: 'Signature & Fusion',
        subtitle: 'Modern · Born from creativity',
      },
      ko: {
        name: '시그니처 & 퓨전',
        subtitle: '현대 · 바리스타의 실험에서 탄생',
      },
    },
    drinkSlugs: [
      'affogato',
      'einspanner',
      'irish-coffee',
      'vietnamese-coffee',
      'dalgona',
    ],
  },
];
