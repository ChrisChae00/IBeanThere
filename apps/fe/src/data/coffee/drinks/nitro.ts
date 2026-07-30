import type { CoffeeDrink } from '../types';

const nitro: CoffeeDrink = {
  slug: 'nitro',
  categoryId: 'cold-brew',
  content: {
    en: {
      name: 'Nitro Cold Brew',
      tagline:
        'It looks like a pint of Guinness, pours like one, and cascades like one. There\'s not a drop of beer or cream in it.',
      description:
        'Cuvée Coffee in Austin didn\'t invent a new coffee technique in 2012 — they borrowed one from the beer world next door. Force cold brew through a tap under nitrogen pressure, the same way a brewery pours a stout, and the gas breaks into bubbles so fine the coffee turns velvety without a single drop of dairy. Starbucks took it national in 2019, and the trick went mainstream.\n\nThose tiny nitrogen bubbles are denser than the coffee around them, which is why a fresh pour visibly cascades — dark liquid appearing to roll downward before settling, the exact optical trick you\'d see pouring a Guinness. Unlike CO₂, nitrogen doesn\'t turn the drink fizzy; instead it mutes bitterness and rounds out sweetness, so the same cold brew tastes noticeably different once it\'s been on tap.',
      origin:
        'Nitro cold brew was popularized by Cuvée Coffee in Austin, Texas around 2012, when they started serving cold brew on draft using nitrogen — a technique borrowed from the craft beer world. Starbucks launched nationwide nitro cold brew in 2019, bringing it into the mainstream.',
      funFact:
        'The cascading effect visible when nitro cold brew is poured — dark liquid seemingly rolling downward in the glass before settling — is caused by the nitrogen gas bubbles being denser than the surrounding liquid. It\'s essentially the same visual effect as pouring a Guinness.',
    },
    ko: {
      name: '나이트로 콜드브루',
      tagline: '따르는 모습도, 흘러내리는 모습도 기네스 한 잔과 똑같다. 그런데 맥주도 크림도 한 방울 안 들어갔다.',
      description:
        '2012년 텍사스 오스틴의 큐베 커피는 완전히 새로운 커피 기술을 발명한 게 아니라, 옆 동네 맥주 업계에서 기술 하나를 빌려왔습니다. 양조장이 흑맥주를 따르듯 질소 압력으로 콜드브루를 탭에서 뽑아내면, 기체가 아주 미세한 기포로 쪼개지면서 유제품 없이도 커피가 벨벳처럼 부드러워집니다. 2019년 스타벅스가 이를 전국화하면서 이 기술은 주류가 됐습니다.\n\n이 작은 질소 기포들은 주변 커피보다 밀도가 높아서, 갓 따른 잔에서는 어두운 액체가 아래로 흘러내리는 것처럼 보이다가 서서히 가라앉습니다. 기네스를 따를 때와 정확히 같은 시각적 착시입니다. CO₂와 달리 질소는 음료를 탄산음료처럼 만들지 않는 대신 쓴맛을 누그러뜨리고 단맛을 살려내, 같은 콜드브루라도 탭을 거치고 나면 확연히 다른 맛이 납니다.',
      origin:
        '나이트로 콜드브루는 2012년경 텍사스 오스틴의 큐베 커피(Cuvée Coffee)가 크래프트 맥주 세계에서 빌린 기술로 질소를 사용해 탭에서 콜드브루를 제공하기 시작하면서 대중화되었습니다. 스타벅스는 2019년 전국적으로 나이트로 콜드브루를 출시하며 주류로 만들었습니다.',
      funFact:
        '나이트로 콜드브루를 따를 때 보이는 캐스케이딩 효과 — 어두운 액체가 잔 속에서 아래로 흘러내리는 것처럼 보이다가 안정되는 — 는 질소 기포가 주변 액체보다 밀도가 높기 때문에 발생합니다. 본질적으로 기네스를 따를 때와 같은 시각적 효과입니다.',
    },
  },
};

export default nitro;
