import type { CoffeeCategory } from './types';

export const categories: CoffeeCategory[] = [
  {
    id: 'brewing',
    order: 0,
    icon: '🫖',
    depth: 0,
    accent: 'primary',
    content: {
      en: {
        name: 'Brewing',
        subtitle: 'Water, grounds, and patience — where every cup starts.',
        era: '~15th century',
      },
      ko: {
        name: '브루잉',
        subtitle: '물과 원두, 그리고 기다림 — 모든 커피가 시작된 자리.',
        era: '~15세기',
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
    depth: 1,
    accent: 'primary',
    content: {
      en: {
        name: 'Espresso Revolution',
        subtitle: 'Italy put coffee under pressure and changed everything.',
        era: '1901',
      },
      ko: {
        name: '에스프레소 혁명',
        subtitle: '이탈리아가 커피에 압력을 걸며 판도를 바꿨다.',
        era: '1901년',
      },
    },
    drinkSlugs: ['espresso', 'americano', 'ristretto', 'lungo'],
  },
  {
    id: 'milk-variations',
    order: 2,
    icon: '🥛',
    depth: 2,
    accent: 'primary',
    branchFrom: 'espresso',
    content: {
      en: {
        name: 'Milk Variations',
        subtitle: 'Italian barista culture, measured in foam.',
        era: '1930s',
      },
      ko: {
        name: '밀크 베리에이션',
        subtitle: '거품의 비율로 갈리는 이탈리아 바리스타 문화.',
        era: '1930년대',
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
    depth: 2,
    accent: 'secondary',
    branchFrom: 'espresso',
    content: {
      en: {
        name: 'Cold Brew',
        subtitle: 'Trade heat for time and the bitterness disappears.',
        era: '1960s',
      },
      ko: {
        name: '콜드 계열',
        subtitle: '열 대신 시간을 쓰면 쓴맛이 사라진다.',
        era: '1960년대',
      },
    },
    drinkSlugs: ['cold-brew', 'dutch-coffee', 'nitro', 'iced-americano'],
  },
  {
    id: 'signature',
    order: 4,
    icon: '🎨',
    depth: 3,
    accent: 'primary',
    content: {
      en: {
        name: 'Signature & Fusion',
        subtitle: 'Baristas stopped following the recipe.',
        era: 'Now',
      },
      ko: {
        name: '시그니처 & 퓨전',
        subtitle: '바리스타가 레시피를 벗어나기 시작한 지점.',
        era: '현재',
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
