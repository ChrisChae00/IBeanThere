import type { CoffeeDrink } from '../types';

const cappuccino: CoffeeDrink = {
  slug: 'cappuccino',
  categoryId: 'milk-variations',
  content: {
    en: {
      name: 'Cappuccino',
      tagline: "Order a cappuccino after 11am in Rome, and the barista will know you're a tourist before you finish the sentence.",
      description:
        "In Italy, cappuccino has a curfew. Order one after a meal, or past late morning, and you've broken an unwritten rule locals take seriously — they believe milk disrupts digestion, so it stays strictly a breakfast drink. Break it in a traditional Rome or Naples bar and don't expect a scolding, just a look, maybe a gentle reminder of the time.\n\nThe drink itself is built on precision: a strict 1:1:1 ratio of espresso, steamed milk, and thick, dry foam in a 150–180ml cup. That foam is the whole point — dense enough to sip through before you hit coffee underneath, splitting the drink into two acts. Even the name is a costume: it's named for Capuchin friars, whose brown robes matched the color of the cup.",
      origin:
        'The cappuccino\'s name comes from the Capuchin friars, whose brown robes resembled the color of the drink. The modern espresso-based cappuccino emerged in Italy in the early 20th century. The "wet cappuccino" (less foam, more steamed milk) and "dry cappuccino" (all foam, minimal milk) are American variations that diverged from the Italian original.',
      funFact:
        'In Italy, there\'s an unwritten rule: cappuccino is only for the morning. If you order one after noon in a traditional bar in Rome or Naples, the barista may give you a look. Some will politely remind you of the time.',
    },
    ko: {
      name: '카푸치노',
      tagline: '로마에서 오전 11시 이후 카푸치노를 주문하면, 문장이 끝나기도 전에 바리스타는 당신이 관광객임을 알아챈다.',
      description:
        '이탈리아에서 카푸치노에는 통금 시간이 있습니다. 식사 후나 늦은 아침 이후에 주문하면, 현지인들이 진지하게 여기는 불문율을 어긴 것입니다. 우유가 소화를 방해한다고 믿기 때문에 카푸치노는 철저히 아침 음료로 남습니다. 로마나 나폴리의 전통 바에서 이 규칙을 어겨도 혼나지는 않습니다. 그저 의미심장한 눈빛, 혹은 정중하게 시간을 알려주는 정도죠.\n\n음료 자체는 정밀함으로 만들어집니다. 에스프레소, 스팀 밀크, 두껍고 단단한 폼을 1:1:1로 정확히 맞춰 150~180ml 컵에 담습니다. 이 폼이 핵심입니다. 충분히 단단해서 그걸 먼저 홀짝인 다음에야 아래의 커피에 닿게 되어, 음료를 두 장면으로 나눕니다. 이름조차 위장입니다. 갈색 수도복을 입은 카푸친 수도사에서 따온 이름으로, 수도복 색이 컵 색과 닮았기 때문입니다.',
      origin:
        '카푸치노라는 이름은 갈색 수도복을 입은 카푸친(Capuchin) 수도사에서 유래했습니다. 수도복 색깔이 음료 색과 닮았기 때문입니다. 현대적인 에스프레소 기반 카푸치노는 20세기 초 이탈리아에서 등장했습니다. "웻 카푸치노"(폼 적고 스팀 밀크 많음)와 "드라이 카푸치노"(폼만, 우유 최소)는 이탈리아 원본에서 갈라진 미국식 변형입니다.',
      funFact:
        '이탈리아에는 불문율이 있습니다. 카푸치노는 오직 아침에만. 로마나 나폴리의 전통 바에서 정오 이후에 카푸치노를 주문하면 바리스타가 의미심장한 눈빛을 보낼 수 있습니다. 정중하게 시간을 상기시켜주는 분도 있습니다.',
    },
  },
};

export default cappuccino;
