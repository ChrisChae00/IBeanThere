import type { CoffeeDrink } from '../types';

const coldBrew: CoffeeDrink = {
  slug: 'cold-brew',
  categoryId: 'cold-brew',
  content: {
    en: {
      name: 'Cold Brew',
      tagline:
        'Cold brew never sees a single degree of heat — it just waits. Twelve hours later, it\'s sweeter than coffee that was scalded to make it.',
      description:
        'Hot brewing rushes flavor out of coffee in minutes, using heat to force extraction — and drags along the sharp, acidic compounds that come with it. Cold brew refuses the shortcut. Coarse grounds sit in room-temperature or cold water for 12 to 24 hours, no heat involved, letting time do what temperature usually does.\n\nThe payoff shows up in the cup: because those heat-triggered acidic and volatile compounds never form, cold brew comes out smoother, lower in acid, and naturally sweeter than the same beans brewed hot and chilled. It\'s also stronger than it looks — the long steep pulls out roughly twice the caffeine per ounce of a regular brew, which is why the concentrate in your fridge is meant to be cut 1:1 with water or milk, not sipped straight.',
      origin:
        'Cold brew has ancient roots — a cold-steeping method called "mizudashi" has been practiced in Japan for centuries. The modern Western cold brew trend exploded in the early 2010s, largely driven by Toddy (the first commercial cold brew system, invented in 1964) and the rise of ready-to-drink cold brew products. Starbucks began selling bottled cold brew in 2015, mainstreaming it globally.',
      funFact:
        'Cold brew concentrate has roughly twice the caffeine per ounce of regular coffee because the long steep extracts more caffeine than a typical hot brew. If you\'re drinking "straight" cold brew concentrate thinking it\'s already diluted — it probably isn\'t, and you may be consuming significantly more caffeine than you realize.',
    },
    ko: {
      name: '콜드브루',
      tagline: '콜드브루는 24시간 동안 열을 한 번도 만나지 않는다. 그런데 뜨겁게 우린 커피보다 더 달다.',
      description:
        '뜨거운 추출은 열의 힘을 빌려 몇 분 만에 커피에서 풍미를 뽑아내지만, 그 과정에서 날카롭고 산성인 성분들도 함께 딸려 나옵니다. 콜드브루는 이 지름길을 거부합니다. 굵게 간 원두를 상온이나 차가운 물에 12~24시간 담가두고, 열 대신 시간이 그 일을 하게 둡니다.\n\n그 결과는 잔에서 그대로 드러납니다. 열로 인해 생기는 산성·휘발성 성분들이 애초에 형성되지 않기 때문에, 같은 원두를 뜨겁게 추출해 식힌 것보다 훨씬 부드럽고, 산도가 낮고, 자연스럽게 더 달콤합니다. 그리고 보기보다 훨씬 강합니다. 긴 침출이 일반 추출보다 온스당 약 2배 많은 카페인을 뽑아내기 때문에, 냉장고 속 그 농축액은 원액 그대로 마시라고 만든 게 아니라 물이나 우유와 1:1로 희석해 마시라고 만든 것입니다.',
      origin:
        '콜드브루의 뿌리는 오래되었습니다. 일본에서는 수백 년간 "미즈다시(水出し)"라는 냉침 방법이 행해져 왔습니다. 현대 서방의 콜드브루 트렌드는 2010년대 초 폭발했으며, 1964년 발명된 최초의 상업적 콜드브루 시스템 토디(Toddy)와 RTD(바로 마실 수 있는) 콜드브루 제품의 부상이 큰 역할을 했습니다. 스타벅스는 2015년 병입 콜드브루를 출시하며 전 세계적으로 대중화시켰습니다.',
      funFact:
        '콜드브루 농축액은 온스당 카페인이 일반 커피의 약 2배입니다. 오랜 침출이 일반적인 뜨거운 추출보다 더 많은 카페인을 끌어내기 때문입니다. 이미 희석된 것이라고 생각하고 원액 그대로 마시고 있다면 — 아마 희석된 게 아닐 것이고, 생각보다 훨씬 많은 카페인을 섭취하고 있을 수 있습니다.',
    },
  },
};

export default coldBrew;
