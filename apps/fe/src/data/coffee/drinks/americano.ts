import type { CoffeeDrink } from '../types';

const americano: CoffeeDrink = {
  slug: 'americano',
  categoryId: 'espresso',
  content: {
    en: {
      name: 'Americano',
      tagline: 'Espresso stretched with hot water. Simple, but the ratio matters.',
      description:
        'An Americano is made by pouring hot water over one or two shots of espresso, typically in a 1:2–1:4 ratio of espresso to water. Despite being "diluted" espresso, it\'s not the same as drip coffee — the flavor profile is fundamentally different because the extraction method (pressure vs. gravity) produces different chemical compounds.\n\nThe Americano has a thinner body than straight espresso but retains its characteristic bitterness and depth. Adding water first vs. espresso first produces different results: espresso-over-water preserves more crema on top, while water-over-espresso incorporates better for a more even cup.',
      origin:
        'The origin story is that during World War II, American soldiers stationed in Italy found straight espresso too intense, so they diluted it with hot water to mimic the drip coffee they were accustomed to back home. Italian baristas called it the "caffè americano" — the American coffee — with varying degrees of affection.',
      funFact:
        'In Korea, the iced Americano (아이스 아메리카노, or "아아" as it\'s commonly called) is arguably the most consumed café beverage in the country. It\'s a running joke that Koreans will drink iced Americano even in freezing winter — and the data supports it.',
    },
    ko: {
      name: '아메리카노',
      tagline: '에스프레소에 물을 더한 것. 단순하지만 비율이 전부다.',
      description:
        '아메리카노는 1~2샷의 에스프레소에 뜨거운 물을 부어 만들며, 일반적으로 에스프레소:물 = 1:2~1:4 비율입니다. "희석된" 에스프레소이지만 드립 커피와는 다릅니다. 압력 추출 vs. 중력 추출이 서로 다른 화학 성분을 만들어내기 때문에 맛 프로파일 자체가 다릅니다.\n\n아메리카노는 순수 에스프레소보다 바디감이 가볍지만, 특유의 쓴맛과 깊이는 유지됩니다. 물 먼저 vs. 에스프레소 먼저에 따라 결과가 달라집니다. 물 위에 에스프레소를 부으면 크레마가 더 잘 보존되고, 에스프레소 위에 물을 부으면 더 균일하게 섞입니다.',
      origin:
        '2차 세계대전 당시 이탈리아에 주둔한 미군들이 순수 에스프레소를 너무 강하다고 느껴 고향의 드립 커피처럼 만들기 위해 물로 희석한 것이 기원입니다. 이탈리아 바리스타들은 이것을 "카페 아메리카노(caffè americano)"라고 불렀는데, 그 안에 약간의 조롱이 담겨 있었다고 합니다.',
      funFact:
        '한국에서 아이스 아메리카노(줄여서 "아아")는 사실상 가장 많이 소비되는 카페 음료입니다. 영하의 추운 겨울에도 아이스 아메리카노를 마신다는 것은 유명한 농담인데, 실제 데이터가 이를 뒷받침합니다.',
    },
  },
};

export default americano;
