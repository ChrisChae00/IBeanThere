import type { CoffeeDrink } from '../types';

const macchiato: CoffeeDrink = {
  slug: 'macchiato',
  categoryId: 'milk-variations',
  content: {
    en: {
      name: 'Macchiato',
      tagline: 'Starbucks named a 400-calorie vanilla drink after an espresso shot you finish in twenty seconds — and the two share almost nothing.',
      description:
        'Ask for a macchiato in Italy and you\'ll get an espresso with a single dollop of milk foam, maybe 10ml, gone in a few sips. Ask for one at Starbucks and you\'ll get a vanilla latte layered with caramel drizzle, built in the reverse order — milk first, espresso poured over it last. Both call themselves "macchiato," Italian for "stained," but only one earns the name honestly.\n\nThe real one is minimalist by design — a tiny mark of foam meant to soften straight espresso\'s bitterness without diluting its intensity, made for people who wanted the punch of a shot but not quite the full bite. Its mirror image, the latte macchiato, flips the ratio entirely: a splash of espresso staining a full glass of milk instead. Same word, opposite drink.',
      origin:
        'The macchiato originated in Italy as a practical solution for people who wanted the intensity of espresso but found the pure shot too bitter. A small spot of milk foam was the minimalist intervention. There\'s also "latte macchiato" — the reverse — where a small amount of espresso is added to a large glass of steamed milk, staining the milk instead.',
      funFact:
        'The Starbucks Caramel Macchiato, introduced in 1996, is made in the opposite order of a traditional macchiato: milk first, then espresso poured over the top. The "macchiato" in the name refers to the espresso "staining" the milk — technically accurate, but spiritually miles away from the Italian original.',
    },
    ko: {
      name: '마키아토',
      tagline: '스타벅스는 20초 만에 다 마시는 에스프레소의 이름을 400칼로리 바닐라 음료에 붙였다 — 공통점은 거의 없다.',
      description:
        '이탈리아에서 마키아토를 주문하면 에스프레소 위에 밀크 폼 한 방울, 약 10ml만 올라간 잔이 나와 몇 모금이면 끝납니다. 스타벅스에서 주문하면 바닐라 라떼에 캐러멜 드리즐을 올린, 순서마저 반대인 음료가 나옵니다 — 우유가 먼저, 에스프레소는 맨 마지막에 붓습니다. 둘 다 "얼룩진"이라는 뜻의 "마키아토"를 자처하지만, 그 이름값을 제대로 하는 건 하나뿐입니다.\n\n원조는 철저히 미니멀합니다. 순수 에스프레소가 너무 쓰다고 느끼지만 강도는 포기하고 싶지 않은 사람들을 위해, 폼 한 점으로 쓴맛만 살짝 눌러주는 방식입니다. 거울 반대편에 있는 라떼 마키아토는 비율을 완전히 뒤집어, 큰 잔의 우유에 에스프레소를 살짝 떨어뜨려 얼룩지게 합니다. 같은 이름, 정반대의 음료.',
      origin:
        '마키아토는 에스프레소의 강도는 원하지만 순수 샷이 너무 쓰다고 느끼는 사람들을 위한 실용적 해결책으로 이탈리아에서 탄생했습니다. 소량의 밀크 폼이 최소한의 개입이었습니다. 반대 방향의 "라떼 마키아토"도 있습니다. 큰 잔의 스팀 밀크에 소량의 에스프레소를 넣어 우유를 얼룩지게 하는 방식입니다.',
      funFact:
        '1996년 출시된 스타벅스 캐러멜 마키아토는 전통 마키아토와 반대 순서로 만들어집니다. 우유 먼저, 그 위에 에스프레소. "마키아토"라는 이름은 에스프레소가 우유를 "얼룩지게" 한다는 것을 지칭하는데, 기술적으로는 맞지만 이탈리아 원본과는 정신적으로 거리가 멉니다.',
    },
  },
};

export default macchiato;
