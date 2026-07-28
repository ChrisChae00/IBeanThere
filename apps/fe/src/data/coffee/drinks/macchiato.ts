import type { CoffeeDrink } from '../types';

const macchiato: CoffeeDrink = {
  slug: 'macchiato',
  categoryId: 'milk-variations',
  content: {
    en: {
      name: 'Macchiato',
      tagline: 'Espresso "stained" with just a dash of milk foam.',
      description:
        'The word "macchiato" means "stained" or "marked" in Italian. A traditional caffè macchiato is simply an espresso with a small dollop of milk foam on top — typically 5–10ml. The foam marks the espresso, cutting slightly the bitterness while preserving most of its intensity and concentration.\n\nNote: the Starbucks "Caramel Macchiato" has essentially nothing to do with the traditional Italian macchiato. It\'s a layered vanilla latte with caramel drizzle, named misleadingly. The traditional macchiato is tiny, intense, and takes about 20 seconds to drink.',
      origin:
        'The macchiato originated in Italy as a practical solution for people who wanted the intensity of espresso but found the pure shot too bitter. A small spot of milk foam was the minimalist intervention. There\'s also "latte macchiato" — the reverse — where a small amount of espresso is added to a large glass of steamed milk, staining the milk instead.',
      funFact:
        'The Starbucks Caramel Macchiato, introduced in 1996, is made in the opposite order of a traditional macchiato: milk first, then espresso poured over the top. The "macchiato" in the name refers to the espresso "staining" the milk — technically accurate, but spiritually miles away from the Italian original.',
    },
    ko: {
      name: '마키아토',
      tagline: '밀크 폼 한 방울로 "얼룩진" 에스프레소.',
      description:
        '"마키아토(macchiato)"는 이탈리아어로 "얼룩진" 또는 "표시된"이라는 뜻입니다. 전통적인 카페 마키아토는 에스프레소 위에 작은 밀크 폼 한 방울만 올린 것 — 보통 5~10ml입니다. 폼이 에스프레소에 표시되어 쓴맛을 약간 줄여주면서 강도와 농도는 대부분 유지합니다.\n\n주의: 스타벅스의 "캐러멜 마키아토"는 전통 이탈리아 마키아토와 본질적으로 관계가 없습니다. 바닐라 라떼에 캐러멜 드리즐을 올린 레이어 음료로, 이름이 오해를 불러일으킵니다. 전통 마키아토는 작고, 강렬하고, 마시는 데 약 20초 걸립니다.',
      origin:
        '마키아토는 에스프레소의 강도는 원하지만 순수 샷이 너무 쓰다고 느끼는 사람들을 위한 실용적 해결책으로 이탈리아에서 탄생했습니다. 소량의 밀크 폼이 최소한의 개입이었습니다. 반대 방향의 "라떼 마키아토"도 있습니다. 큰 잔의 스팀 밀크에 소량의 에스프레소를 넣어 우유를 얼룩지게 하는 방식입니다.',
      funFact:
        '1996년 출시된 스타벅스 캐러멜 마키아토는 전통 마키아토와 반대 순서로 만들어집니다. 우유 먼저, 그 위에 에스프레소. "마키아토"라는 이름은 에스프레소가 우유를 "얼룩지게" 한다는 것을 지칭하는데, 기술적으로는 맞지만 이탈리아 원본과는 정신적으로 거리가 멉니다.',
    },
  },
};

export default macchiato;
