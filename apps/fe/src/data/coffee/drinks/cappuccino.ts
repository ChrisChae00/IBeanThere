import type { CoffeeDrink } from '../types';

const cappuccino: CoffeeDrink = {
  slug: 'cappuccino',
  categoryId: 'milk-variations',
  content: {
    en: {
      name: 'Cappuccino',
      tagline: 'The classic Italian morning ritual.',
      description:
        'A traditional cappuccino is a balanced 1:1:1 ratio of espresso, steamed milk, and thick milk foam — served in a 150–180ml cup. The thick, dry foam on top distinguishes it from a latte and gives it a distinctly different texture: you sip through the foam, which creates a two-part experience of foam and coffee beneath.\n\nIn Italy, cappuccino is strictly a morning drink. Ordering one after 11am — especially after a meal — is considered a cultural faux pas that marks you as a tourist. Italians believe the milk interferes with digestion when consumed with food.',
      origin:
        'The cappuccino\'s name comes from the Capuchin friars, whose brown robes resembled the color of the drink. The modern espresso-based cappuccino emerged in Italy in the early 20th century. The "wet cappuccino" (less foam, more steamed milk) and "dry cappuccino" (all foam, minimal milk) are American variations that diverged from the Italian original.',
      funFact:
        'In Italy, there\'s an unwritten rule: cappuccino is only for the morning. If you order one after noon in a traditional bar in Rome or Naples, the barista may give you a look. Some will politely remind you of the time.',
    },
    ko: {
      name: '카푸치노',
      tagline: '이탈리아의 고전적인 아침 의식.',
      description:
        '전통 카푸치노는 에스프레소, 스팀 밀크, 두꺼운 밀크 폼의 1:1:1 균형 비율로 150~180ml 컵에 제공됩니다. 위에 올라간 두껍고 단단한 폼이 라떼와 구별되며 독특한 질감을 만듭니다. 폼을 통해 홀짝이면서 위의 폼과 아래의 커피를 두 단계로 경험하게 됩니다.\n\n이탈리아에서 카푸치노는 엄격히 아침 음료입니다. 오전 11시 이후, 특히 식사 후에 주문하는 것은 관광객임을 드러내는 문화적 실수로 여겨집니다. 이탈리아인들은 우유가 음식과 함께 소화를 방해한다고 믿습니다.',
      origin:
        '카푸치노라는 이름은 갈색 수도복을 입은 카푸친(Capuchin) 수도사에서 유래했습니다. 수도복 색깔이 음료 색과 닮았기 때문입니다. 현대적인 에스프레소 기반 카푸치노는 20세기 초 이탈리아에서 등장했습니다. "웻 카푸치노"(폼 적고 스팀 밀크 많음)와 "드라이 카푸치노"(폼만, 우유 최소)는 이탈리아 원본에서 갈라진 미국식 변형입니다.',
      funFact:
        '이탈리아에는 불문율이 있습니다. 카푸치노는 오직 아침에만. 로마나 나폴리의 전통 바에서 정오 이후에 카푸치노를 주문하면 바리스타가 의미심장한 눈빛을 보낼 수 있습니다. 정중하게 시간을 상기시켜주는 분도 있습니다.',
    },
  },
};

export default cappuccino;
