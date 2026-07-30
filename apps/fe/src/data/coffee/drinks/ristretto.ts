import type { CoffeeDrink } from '../types';

const ristretto: CoffeeDrink = {
  slug: 'ristretto',
  categoryId: 'espresso',
  content: {
    en: {
      name: 'Ristretto',
      tagline: 'Cut the water in half, and a bad shot has nowhere left to hide.',
      description:
        'Pull the same dose of coffee through half the water, in the same short window, and something counterintuitive happens: the shot gets sweeter, not harsher. Extraction stops before the late-developing bitter compounds ever have time to form, leaving 15–20ml that ristretto drinkers call the purest read on a bean\'s actual flavor — and critics call too small to bother with.\n\nThat smallness is the point. Because there\'s less room to hide behind volume or milk, flaws in the roast, grind, or dose show up immediately — which is why some coffee competitions judge on ristretto specifically: it\'s harder to fake than a standard shot. In much of southern Italy, this isn\'t the boutique option — order a plain "caffè" there, and a ristretto is closer to what lands in your cup.',
      origin:
        'The ristretto emerged from traditional Italian espresso culture where shorter, sweeter shots were preferred. The term "ristretto" (meaning "restricted" or "narrow" in Italian) distinguishes it from "lungo" (long) at the other end of the spectrum. It remains the standard in many parts of southern Italy.',
      funFact:
        'Some coffee competitions judge on ristretto shots precisely because the smaller volume and compressed extraction window makes flaws — and excellence — far more apparent. A good ristretto is harder to fake than a standard espresso.',
    },
    ko: {
      name: '리스트레토',
      tagline: '물을 절반으로 줄이면, 나쁜 샷은 숨을 곳이 없어진다.',
      description:
        '같은 양의 원두를 절반의 물로, 같은 짧은 시간에 추출하면 의외의 일이 벌어집니다. 더 강하고 쓴 게 아니라 더 달콤해집니다. 추출이 일찍 끝나면서 나중에 생기는 쓴 성분들이 형성될 시간을 얻지 못하기 때문입니다. 그렇게 나온 15~20ml를 두고 리스트레토 애호가들은 원두 본연의 맛을 가장 순수하게 읽어내는 방법이라 하고, 비판자들은 신경 쓰기엔 너무 적은 양이라고 말합니다.\n\n바로 그 적은 양이 핵심입니다. 부피나 우유 뒤에 숨을 여지가 없기 때문에 로스팅, 분쇄, 도징의 결함이 곧바로 드러납니다. 일부 커피 대회가 굳이 리스트레토로 심사하는 이유도 여기 있습니다 — 일반 샷보다 속이기 어렵기 때문입니다. 이탈리아 남부 대부분 지역에서는 이게 특별한 옵션이 아닙니다. 그냥 "카페"를 주문해도, 잔에 담기는 건 리스트레토에 더 가깝습니다.',
      origin:
        '리스트레토는 더 짧고 달콤한 샷을 선호했던 이탈리아 전통 에스프레소 문화에서 나왔습니다. "리스트레토(ristretto)"는 이탈리아어로 "제한된" 또는 "좁은"이라는 뜻으로, 반대편의 "룽고(lungo)"와 구별됩니다. 이탈리아 남부의 많은 지역에서 여전히 표준입니다.',
      funFact:
        '일부 커피 대회에서는 리스트레토 샷으로 심사합니다. 더 작은 용량과 압축된 추출 시간 때문에 결함과 뛰어남이 훨씬 더 명확하게 드러나기 때문입니다. 좋은 리스트레토는 일반 에스프레소보다 속이기 어렵습니다.',
    },
  },
};

export default ristretto;
