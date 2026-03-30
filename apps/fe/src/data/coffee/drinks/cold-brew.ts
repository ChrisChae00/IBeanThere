import type { CoffeeDrink } from '../types';

const coldBrew: CoffeeDrink = {
  slug: 'cold-brew',
  categoryId: 'cold-brew',
  content: {
    en: {
      name: 'Cold Brew',
      tagline: 'Time instead of heat. Smooth, low-acid, endlessly versatile.',
      description:
        'Cold brew is made by steeping coarsely ground coffee in cold or room-temperature water for 12–24 hours, then filtering. No heat is ever applied. The extended, low-temperature extraction produces a coffee concentrate that\'s noticeably smoother, lower in acidity, and naturally sweeter than hot-brewed coffee.\n\nBecause heat isn\'t involved, many of the acidic and volatile compounds that develop during hot extraction never form — which is why cold brew is easier on the stomach and has a distinctly different flavor profile than iced hot coffee. It\'s typically served diluted 1:1 with water or milk.',
      origin:
        'Cold brew has ancient roots — a cold-steeping method called "mizudashi" has been practiced in Japan for centuries. The modern Western cold brew trend exploded in the early 2010s, largely driven by Toddy (the first commercial cold brew system, invented in 1964) and the rise of ready-to-drink cold brew products. Starbucks began selling bottled cold brew in 2015, mainstreaming it globally.',
      funFact:
        'Cold brew concentrate has roughly twice the caffeine per ounce of regular coffee because the long steep extracts more caffeine than a typical hot brew. If you\'re drinking "straight" cold brew concentrate thinking it\'s already diluted — it probably isn\'t, and you may be consuming significantly more caffeine than you realize.',
    },
    ko: {
      name: '콜드브루',
      tagline: '열 대신 시간. 부드럽고, 산도 낮고, 활용도 무한한.',
      description:
        '콜드브루는 굵게 분쇄한 원두를 차갑거나 상온의 물에 12~24시간 담가 추출한 후 필터링합니다. 열은 전혀 가하지 않습니다. 장시간 저온 추출은 뜨거운 커피보다 현저히 부드럽고, 산도가 낮으며, 자연스럽게 더 달콤한 농축 커피를 만들어냅니다.\n\n열이 관여하지 않기 때문에 뜨거운 추출 중 발생하는 많은 산성 및 휘발성 화합물이 형성되지 않습니다. 이것이 콜드브루가 위에 더 부드럽고, 아이스 핫 커피와 뚜렷이 다른 맛 프로파일을 갖는 이유입니다. 보통 물이나 우유와 1:1로 희석해 제공합니다.',
      origin:
        '콜드브루의 뿌리는 오래되었습니다. 일본에서는 수백 년간 "미즈다시(水出し)"라는 냉침 방법이 행해져 왔습니다. 현대 서방의 콜드브루 트렌드는 2010년대 초 폭발했으며, 1964년 발명된 최초의 상업적 콜드브루 시스템 토디(Toddy)와 RTD(바로 마실 수 있는) 콜드브루 제품의 부상이 큰 역할을 했습니다. 스타벅스는 2015년 병입 콜드브루를 출시하며 전 세계적으로 대중화시켰습니다.',
      funFact:
        '콜드브루 농축액은 온스당 카페인이 일반 커피의 약 2배입니다. 오랜 침출이 일반적인 뜨거운 추출보다 더 많은 카페인을 끌어내기 때문입니다. 이미 희석된 것이라고 생각하고 원액 그대로 마시고 있다면 — 아마 희석된 게 아닐 것이고, 생각보다 훨씬 많은 카페인을 섭취하고 있을 수 있습니다.',
    },
  },
};

export default coldBrew;
