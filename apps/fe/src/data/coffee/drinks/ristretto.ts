import type { CoffeeDrink } from '../types';

const ristretto: CoffeeDrink = {
  slug: 'ristretto',
  categoryId: 'espresso',
  content: {
    en: {
      name: 'Ristretto',
      tagline: 'Half the volume, twice the argument.',
      description:
        'Ristretto is a "restricted" espresso — the same dose of coffee extracted with roughly half the water in the same time, yielding 15–20ml. The result is sweeter, more intense, and lower in bitterness than standard espresso. Because extraction is cut short, the late-stage bitter compounds never develop.\n\nRistretto advocates argue it\'s the purest expression of the coffee\'s best flavors. Critics say it\'s too small to be satisfying. In Italy, ordering a "caffè" in many regions will get you something closer to a ristretto than what the rest of the world calls espresso.',
      origin:
        'The ristretto emerged from traditional Italian espresso culture where shorter, sweeter shots were preferred. The term "ristretto" (meaning "restricted" or "narrow" in Italian) distinguishes it from "lungo" (long) at the other end of the spectrum. It remains the standard in many parts of southern Italy.',
      funFact:
        'Some coffee competitions judge on ristretto shots precisely because the smaller volume and compressed extraction window makes flaws — and excellence — far more apparent. A good ristretto is harder to fake than a standard espresso.',
    },
    ko: {
      name: '리스트레토',
      tagline: '절반의 용량, 두 배의 논쟁.',
      description:
        '리스트레토는 "제한된" 에스프레소입니다. 같은 양의 원두를 같은 시간 동안 절반의 물로 추출해 15~20ml를 얻습니다. 결과는 일반 에스프레소보다 더 달고, 더 강렬하고, 쓴맛은 적습니다. 추출을 일찍 멈추기 때문에 나중에 발생하는 쓴 성분들이 개발되지 않습니다.\n\n리스트레토 지지자들은 이것이 커피의 최고 풍미를 가장 순수하게 담아낸 것이라고 주장합니다. 비판자들은 너무 작아 만족스럽지 않다고 합니다. 이탈리아의 많은 지역에서 "카페(caffè)"를 주문하면 세상이 에스프레소라고 부르는 것보다 리스트레토에 가까운 샷이 나옵니다.',
      origin:
        '리스트레토는 더 짧고 달콤한 샷을 선호했던 이탈리아 전통 에스프레소 문화에서 나왔습니다. "리스트레토(ristretto)"는 이탈리아어로 "제한된" 또는 "좁은"이라는 뜻으로, 반대편의 "룽고(lungo)"와 구별됩니다. 이탈리아 남부의 많은 지역에서 여전히 표준입니다.',
      funFact:
        '일부 커피 대회에서는 리스트레토 샷으로 심사합니다. 더 작은 용량과 압축된 추출 시간 때문에 결함과 뛰어남이 훨씬 더 명확하게 드러나기 때문입니다. 좋은 리스트레토는 일반 에스프레소보다 속이기 어렵습니다.',
    },
  },
};

export default ristretto;
