import type { CoffeeDrink } from '../types';

const americano: CoffeeDrink = {
  slug: 'americano',
  categoryId: 'espresso',
  content: {
    en: {
      name: 'Americano',
      tagline: 'GIs thought Italian espresso was too intense. So they watered it down — and named it after themselves.',
      description:
        'American soldiers stationed in wartime Italy took one sip of straight espresso and recoiled — too thick, too fast, too far from the drip coffee they knew from home. So they did the obvious thing: they added hot water until it tasted like something they recognized. Italian baristas noticed, and started calling it "caffè americano," not entirely as a compliment.\n\nBut water isn\'t just dilution — it\'s a different drink. The same shot, cut 1:2 to 1:4 with hot water, keeps espresso\'s bitterness and depth while losing its syrupy weight, and even the pour order changes the outcome: espresso over water keeps more crema on top, water over espresso blends more evenly. What started as homesickness became one of the most ordered drinks on the planet.',
      origin:
        'The origin story is that during World War II, American soldiers stationed in Italy found straight espresso too intense, so they diluted it with hot water to mimic the drip coffee they were accustomed to back home. Italian baristas called it the "caffè americano" — the American coffee — with varying degrees of affection.',
      funFact:
        'In Korea, the iced Americano (아이스 아메리카노, or "아아" as it\'s commonly called) is arguably the most consumed café beverage in the country. It\'s a running joke that Koreans will drink iced Americano even in freezing winter — and the data supports it.',
    },
    ko: {
      name: '아메리카노',
      tagline: '미군들은 이탈리아 에스프레소가 너무 강하다고 느꼈다. 그래서 물을 탔고, 자기네 이름을 붙였다.',
      description:
        '전쟁통의 이탈리아에 주둔한 미군 병사들은 순수 에스프레소를 한 모금 마시고 움찔했습니다. 너무 진하고, 너무 빠르고, 고향의 드립 커피와는 너무 달랐습니다. 그래서 익숙한 맛이 날 때까지 뜨거운 물을 부었습니다. 이탈리아 바리스타들은 이걸 눈여겨보고 "카페 아메리카노"라 부르기 시작했는데, 딱히 칭찬은 아니었습니다.\n\n하지만 물은 그냥 희석이 아니라 다른 음료를 만듭니다. 같은 샷도 물을 1:2~1:4로 섞으면 쓴맛과 깊이는 남고 시럽 같은 무게감만 빠지며, 붓는 순서조차 결과를 바꿉니다. 물 위에 에스프레소를 부으면 크레마가 더 남고, 반대로 하면 더 균일하게 섞입니다. 향수병에서 시작한 이 음료는 결국 지구에서 가장 많이 주문되는 커피 중 하나가 됐습니다.',
      origin:
        '2차 세계대전 당시 이탈리아에 주둔한 미군들이 순수 에스프레소를 너무 강하다고 느껴 고향의 드립 커피처럼 만들기 위해 물로 희석한 것이 기원입니다. 이탈리아 바리스타들은 이것을 "카페 아메리카노(caffè americano)"라고 불렀는데, 그 안에 약간의 조롱이 담겨 있었다고 합니다.',
      funFact:
        '한국에서 아이스 아메리카노(줄여서 "아아")는 사실상 가장 많이 소비되는 카페 음료입니다. 영하의 추운 겨울에도 아이스 아메리카노를 마신다는 것은 유명한 농담인데, 실제 데이터가 이를 뒷받침합니다.',
    },
  },
};

export default americano;
