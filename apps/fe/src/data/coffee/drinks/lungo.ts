import type { CoffeeDrink } from '../types';

const lungo: CoffeeDrink = {
  slug: 'lungo',
  categoryId: 'espresso',
  content: {
    en: {
      name: 'Lungo',
      tagline:
        'A lungo extracts more caffeine and more bitterness than an espresso — yet somehow tastes weaker. Both are true at once.',
      description:
        'An Americano dilutes espresso after the fact — water goes in once the shot is done. A lungo does the opposite: it pulls 60–90ml of water straight through the grounds for the full brew time, so the water keeps extracting long after a normal shot would\'ve stopped. Therefore it pulls out more caffeine, more bitter compounds, more of everything the grounds have to give.\n\nBut more extracted isn\'t the same as more intense. Bitterness climbs while the perceived punch often drops — the very compounds that read as "strength" get diluted even as new, harsher ones appear. It\'s why northern Italy, with its taste for bigger, less concentrated coffee, embraced lungo while the south stayed loyal to ristretto — and why most people\'s first lungo came not from a barista, but from a Nespresso machine on a kitchen counter.',
      origin:
        'Lungo comes from northern Italian coffee culture, where a larger, less concentrated drink was preferred compared to the southern Italian ristretto tradition. The split between ristretto-loving south and lungo-drinking north reflects deeper regional differences in Italian coffee culture.',
      funFact:
        'Nespresso capsule machines made lungo popular globally because many of their pods are specifically designed for lungo extraction volume. Many people\'s first experience with "lungo" came not from a café but from a kitchen countertop machine.',
    },
    ko: {
      name: '룽고',
      tagline: '룽고는 에스프레소보다 카페인도 쓴맛도 더 많이 뽑아낸다. 그런데 마셔보면 오히려 더 약하게 느껴진다. 둘 다 사실이다.',
      description:
        '아메리카노는 추출이 끝난 후에 물을 타는 음료입니다. 룽고는 정반대입니다. 60~90ml의 물을 커피 가루에 처음부터 끝까지 통과시켜, 일반 샷이라면 이미 멈췄을 시점까지 계속 추출합니다. 그래서 같은 원두에서 카페인도, 쓴 성분도, 더 많은 것들을 끌어냅니다.\n\n하지만 더 많이 추출됐다고 더 강하게 느껴지는 건 아닙니다. 쓴맛은 올라가지만 체감되는 강도는 오히려 낮아지곤 합니다. "강함"으로 느껴지던 성분들은 희석되는데 더 거친 성분들만 새로 나타나기 때문입니다. 더 크고 덜 농축된 커피를 선호한 이탈리아 북부가 룽고를 받아들이고 남부가 리스트레토에 남은 이유도 여기 있습니다. 그리고 대부분의 사람들이 처음 마신 "룽고"는 바리스타가 아니라 주방 카운터의 네스프레소 머신에서 나왔다는 사실도요.',
      origin:
        '룽고는 이탈리아 북부 커피 문화에서 나왔습니다. 남부 이탈리아의 리스트레토 전통과 달리 더 크고 덜 농축된 음료를 선호했기 때문입니다. 리스트레토를 좋아하는 남부와 룽고를 마시는 북부의 차이는 이탈리아 커피 문화의 더 깊은 지역적 차이를 반영합니다.',
      funFact:
        '네스프레소 캡슐 머신이 룽고를 전 세계적으로 대중화시켰습니다. 많은 캡슐이 룽고 추출 용량에 맞게 특별히 설계되어 있기 때문입니다. 많은 사람들의 첫 번째 "룽고" 경험은 카페가 아닌 주방 카운터탑 머신에서 왔습니다.',
    },
  },
};

export default lungo;
