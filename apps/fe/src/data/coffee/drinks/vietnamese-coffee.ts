import type { CoffeeDrink } from '../types';

const vietnameseCoffee: CoffeeDrink = {
  slug: 'vietnamese-coffee',
  categoryId: 'signature',
  content: {
    en: {
      name: 'Vietnamese Coffee',
      tagline: 'Strong Robusta, sweetened condensed milk, and time.',
      description:
        'Vietnamese coffee (cà phê sữa đá) is strong dark-roast Robusta coffee dripped through a single-serve phin filter directly over sweetened condensed milk, then served over ice. The condensed milk is thick, sweet, and caramelized — when the strong, slightly bitter coffee falls into it, the contrast and gradual mixing creates a distinct, rich flavor.\n\nThe phin filter is a simple, stackable metal drip filter that brews slowly — 4–5 minutes for a single cup. The whole experience is meant to be unhurried. Vietnamese café culture traditionally involves sitting, waiting for the phin to drip, and enjoying the process.',
      origin:
        'Vietnamese coffee culture developed during the French colonial period (19th–20th centuries) when the French introduced coffee cultivation to Vietnam. Because fresh milk was scarce, sweetened condensed milk (imported from France) became the standard addition. Vietnam is now the world\'s second-largest coffee producer, growing primarily Robusta beans which are stronger and more bitter than Arabica.',
      funFact:
        'Vietnam produces primarily Robusta beans, which contain about twice the caffeine of Arabica beans. A single cup of Vietnamese coffee can pack more caffeine than a double espresso. When tourists order it thinking it\'s "just coffee," they\'re sometimes blindsided by the intensity.',
    },
    ko: {
      name: '베트남 커피',
      tagline: '진한 로부스타, 연유, 그리고 시간.',
      description:
        '베트남 커피(까페 쓰어 다, cà phê sữa đá)는 1인용 핀(phin) 필터로 강한 다크 로스트 로부스타 커피를 연유 위에 직접 드리핑한 후 얼음 위에 제공합니다. 연유는 진하고, 달콤하고, 카라멜화되어 있습니다. 강하고 약간 쓴 커피가 연유 속으로 떨어지면 대비와 점진적인 혼합이 독특하고 진한 풍미를 만들어냅니다.\n\n핀 필터는 단순하고 쌓을 수 있는 금속 드립 필터로 한 컵에 4~5분 정도 천천히 추출합니다. 전체 경험은 서두르지 않도록 설계되어 있습니다. 베트남 카페 문화는 전통적으로 앉아서 핀이 드리핑되기를 기다리며 그 과정을 즐기는 것을 포함합니다.',
      origin:
        '베트남 커피 문화는 프랑스가 베트남에 커피 재배를 도입한 프랑스 식민지 시대(19~20세기)에 발전했습니다. 신선한 우유가 부족했기 때문에 (프랑스에서 수입한) 연유가 표준 첨가물이 되었습니다. 베트남은 현재 세계 2위의 커피 생산국으로, 주로 아라비카보다 더 강하고 쓴 로부스타 원두를 재배합니다.',
      funFact:
        '베트남은 주로 로부스타 원두를 생산하는데, 로부스타의 카페인 함량은 아라비카의 약 2배입니다. 베트남 커피 한 잔은 더블 에스프레소보다 더 많은 카페인을 함유할 수 있습니다. "그냥 커피"라고 생각하고 주문한 관광객들이 그 강도에 놀라는 경우가 있습니다.',
    },
  },
};

export default vietnameseCoffee;
