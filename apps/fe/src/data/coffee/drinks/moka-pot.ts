import type { CoffeeDrink } from '../types';

const mokaPot: CoffeeDrink = {
  slug: 'moka-pot',
  categoryId: 'brewing',
  content: {
    en: {
      name: 'Moka Pot',
      tagline: 'Italy\'s kitchen espresso. Stovetop intensity without the machine.',
      description:
        'The moka pot brews by forcing water pressurized by steam through finely ground coffee using steam pressure — typically 1–2 bar, far below the 9 bar of espresso machines. The result is a strong, concentrated, and slightly bitter brew with a richer body than drip coffee but a different character than true espresso.\n\nMoka pot coffee is more viscous and bold than pour over, with a heavier mouthfeel and caramelized notes. The "crema" that sometimes forms on top isn\'t the same as espresso crema — it\'s more of an emulsion. In Italy, the moka is as much a kitchen fixture as the stove itself.',
      origin:
        'Invented by Alfonso Bialetti in 1933 in Italy, the Bialetti Moka Express became one of the most iconic product designs of the 20th century. By the 1950s, it was in nearly every Italian home. Alfonso\'s son Renato grew the company into a global brand. In 2013, Alfonso Bialetti\'s ashes were interred in a giant moka pot-shaped urn — a fitting tribute.',
      funFact:
        'In 2013, Alfonso Bialetti\'s ashes were placed inside a giant moka pot-shaped urn. When his son Renato (who ran the company) died, he reportedly requested the same. The family that invented the moka pot is literally resting in one.',
    },
    ko: {
      name: '모카포트',
      tagline: '이탈리아의 주방 에스프레소. 머신 없이 만드는 스토브 탑 진한 커피.',
      description:
        '모카포트는 증기 압력으로 가압된 물을 곱게 간 원두에 통과시켜 추출합니다. 일반적으로 1~2바(bar)의 압력으로, 에스프레소 머신의 9바보다 훨씬 낮습니다. 결과물은 강하고 농축되어 있으며 약간 쓴 맛이 나고, 드립 커피보다 진한 바디감을 갖지만 진짜 에스프레소와는 다른 개성을 가집니다.\n\n모카포트 커피는 푸어오버보다 점도가 높고 굵직하며, 무거운 질감과 카라멜화된 풍미를 냅니다. 위에 생기는 "크레마"는 에스프레소 크레마와는 다른, 일종의 에멀전입니다. 이탈리아에서 모카포트는 가스레인지만큼이나 주방의 필수품입니다.',
      origin:
        '1933년 이탈리아의 알폰소 비알레티(Alfonso Bialetti)가 발명한 비알레티 모카 익스프레스는 20세기 가장 상징적인 제품 디자인 중 하나가 되었습니다. 1950년대에는 이탈리아 가정 대부분에 자리잡았고, 그의 아들 레나토가 회사를 글로벌 브랜드로 성장시켰습니다.',
      funFact:
        '2013년, 알폰소 비알레티의 유골은 거대한 모카포트 모양의 유골함에 안치되었습니다. 회사를 이끌었던 그의 아들 레나토도 같은 방식을 요청했다고 전해집니다. 모카포트를 발명한 가족이 말 그대로 모카포트 속에 잠들어 있는 것입니다.',
    },
  },
};

export default mokaPot;
