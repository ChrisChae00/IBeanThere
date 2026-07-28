import type { CoffeeDrink } from '../types';

const nitro: CoffeeDrink = {
  slug: 'nitro',
  categoryId: 'cold-brew',
  content: {
    en: {
      name: 'Nitro Cold Brew',
      tagline: 'Cold brew infused with nitrogen. Creamy without a drop of cream.',
      description:
        'Nitro cold brew is cold brew coffee infused with nitrogen gas under pressure, poured from a tap like draft beer. The nitrogen creates tiny, ultra-fine bubbles that give the coffee a cascading, dark appearance and a remarkably creamy, smooth texture — without any dairy.\n\nUnlike CO₂ carbonation, nitrogen bubbles are too small to make the coffee "fizzy." The result is more of a velvety, stout-like mouthfeel. Nitrogen also mutes bitterness and enhances natural sweetness, making nitro cold brew taste noticeably different from the same cold brew served still.',
      origin:
        'Nitro cold brew was popularized by Cuvée Coffee in Austin, Texas around 2012, when they started serving cold brew on draft using nitrogen — a technique borrowed from the craft beer world. Starbucks launched nationwide nitro cold brew in 2019, bringing it into the mainstream.',
      funFact:
        'The cascading effect visible when nitro cold brew is poured — dark liquid seemingly rolling downward in the glass before settling — is caused by the nitrogen gas bubbles being denser than the surrounding liquid. It\'s essentially the same visual effect as pouring a Guinness.',
    },
    ko: {
      name: '나이트로 콜드브루',
      tagline: '질소를 주입한 콜드브루. 크림 한 방울 없이 크리미한.',
      description:
        '나이트로 콜드브루는 압력으로 질소 가스를 주입한 콜드브루를 생맥주처럼 탭에서 따르는 음료입니다. 질소는 커피에 연속적으로 흘러내리는 어두운 외관과 놀랍도록 크리미하고 부드러운 질감을 부여합니다 — 유제품 없이도요.\n\nCO₂ 탄산화와 달리 질소 기포는 너무 작아 커피를 "탄산음료"처럼 만들지 않습니다. 결과는 벨벳 같고 흑맥주 같은 마우스필에 가깝습니다. 질소는 쓴맛을 완화하고 자연스러운 단맛을 향상시켜, 같은 콜드브루를 그냥 마시는 것과 확연히 다른 맛을 냅니다.',
      origin:
        '나이트로 콜드브루는 2012년경 텍사스 오스틴의 큐베 커피(Cuvée Coffee)가 크래프트 맥주 세계에서 빌린 기술로 질소를 사용해 탭에서 콜드브루를 제공하기 시작하면서 대중화되었습니다. 스타벅스는 2019년 전국적으로 나이트로 콜드브루를 출시하며 주류로 만들었습니다.',
      funFact:
        '나이트로 콜드브루를 따를 때 보이는 캐스케이딩 효과 — 어두운 액체가 잔 속에서 아래로 흘러내리는 것처럼 보이다가 안정되는 — 는 질소 기포가 주변 액체보다 밀도가 높기 때문에 발생합니다. 본질적으로 기네스를 따를 때와 같은 시각적 효과입니다.',
    },
  },
};

export default nitro;
