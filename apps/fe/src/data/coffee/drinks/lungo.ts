import type { CoffeeDrink } from '../types';

const lungo: CoffeeDrink = {
  slug: 'lungo',
  categoryId: 'espresso',
  content: {
    en: {
      name: 'Lungo',
      tagline: 'The long pull. More water, more extraction, more bitterness.',
      description:
        'Lungo ("long" in Italian) is espresso pulled with more water — typically 60–90ml — over a longer extraction time. Unlike an Americano where water is added after extraction, a lungo extracts through the coffee grounds for the full duration, pulling out more caffeine and bitter compounds.\n\nThe result is larger than espresso but more intense than Americano, with a distinct bitterness that comes from the extended extraction. It\'s not necessarily "stronger" — it\'s more extracted, which can actually reduce the perception of intensity in some ways while amplifying bitterness.',
      origin:
        'Lungo comes from northern Italian coffee culture, where a larger, less concentrated drink was preferred compared to the southern Italian ristretto tradition. The split between ristretto-loving south and lungo-drinking north reflects deeper regional differences in Italian coffee culture.',
      funFact:
        'Nespresso capsule machines made lungo popular globally because many of their pods are specifically designed for lungo extraction volume. Many people\'s first experience with "lungo" came not from a café but from a kitchen countertop machine.',
    },
    ko: {
      name: '룽고',
      tagline: '긴 추출. 더 많은 물, 더 많은 추출, 더 많은 쓴맛.',
      description:
        '룽고(이탈리아어로 "긴")는 더 많은 물을 사용해 — 일반적으로 60~90ml — 더 긴 추출 시간 동안 뽑은 에스프레소입니다. 추출 후 물을 추가하는 아메리카노와 달리, 룽고는 전체 시간 동안 커피 가루를 통해 추출하여 더 많은 카페인과 쓴 성분을 끌어냅니다.\n\n결과물은 에스프레소보다 크지만 아메리카노보다 강렬하며, 연장된 추출에서 오는 뚜렷한 쓴맛이 있습니다. 반드시 "더 강한" 것은 아닙니다 — 더 많이 추출된 것으로, 실제로는 강도의 느낌은 줄어들면서 쓴맛이 증폭되는 방식으로 작용할 수 있습니다.',
      origin:
        '룽고는 이탈리아 북부 커피 문화에서 나왔습니다. 남부 이탈리아의 리스트레토 전통과 달리 더 크고 덜 농축된 음료를 선호했기 때문입니다. 리스트레토를 좋아하는 남부와 룽고를 마시는 북부의 차이는 이탈리아 커피 문화의 더 깊은 지역적 차이를 반영합니다.',
      funFact:
        '네스프레소 캡슐 머신이 룽고를 전 세계적으로 대중화시켰습니다. 많은 캡슐이 룽고 추출 용량에 맞게 특별히 설계되어 있기 때문입니다. 많은 사람들의 첫 번째 "룽고" 경험은 카페가 아닌 주방 카운터탑 머신에서 왔습니다.',
    },
  },
};

export default lungo;
