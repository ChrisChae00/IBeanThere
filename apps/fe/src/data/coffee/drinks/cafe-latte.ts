import type { CoffeeDrink } from '../types';

const cafeLatte: CoffeeDrink = {
  slug: 'cafe-latte',
  categoryId: 'milk-variations',
  content: {
    en: {
      name: 'Café Latte',
      tagline: 'The most popular espresso drink in the world, for good reason.',
      description:
        'A café latte is one or two shots of espresso topped with steamed milk and a thin layer of microfoam. The standard ratio is roughly 1:3–1:5 espresso to milk, creating a drink that\'s creamy, mild, and approachable. The microfoam — steamed milk with tiny, uniform bubbles — gives the latte its smooth, velvety texture.\n\nLatte art became a defining feature of specialty coffee culture: skilled baristas pour steamed milk to create rosettas, tulips, and swans on the surface. It\'s not just decoration — the same control that produces consistent art produces consistent texture and temperature in the drink itself.',
      origin:
        'The word "latte" is Italian for milk, and in Italy, ordering a "latte" will literally get you a glass of milk. The "caffè latte" concept — espresso with milk — is Italian, but the modern latte as a named café menu item popularized globally was largely driven by Starbucks in the 1980s and 90s, which helped make it a worldwide standard.',
      funFact:
        'Latte art competitions are held worldwide, and the top competitors can create incredibly detailed images — animals, landscapes, even portraits — in steamed milk using nothing but a milk pitcher and a toothpick for detail work.',
    },
    ko: {
      name: '카페라떼',
      tagline: '세계에서 가장 인기 있는 에스프레소 음료. 이유가 있다.',
      description:
        '카페라떼는 1~2샷의 에스프레소에 스팀 밀크와 얇은 마이크로폼 층을 올린 음료입니다. 표준 비율은 에스프레소:우유 = 약 1:3~1:5로, 크리미하고 부드럽고 친근한 맛을 만들어냅니다. 마이크로폼 — 작고 균일한 기포를 가진 스팀 밀크 — 이 라떼 특유의 부드럽고 벨벳 같은 질감을 만듭니다.\n\n라떼 아트는 스페셜티 커피 문화의 상징이 되었습니다. 숙련된 바리스타들은 스팀 밀크를 부어 표면에 로제타, 튤립, 백조를 만들어냅니다. 단순한 장식이 아닙니다. 일관된 아트를 만드는 컨트롤이 곧 일관된 질감과 온도를 만드는 컨트롤입니다.',
      origin:
        '"라떼(latte)"는 이탈리아어로 우유를 뜻합니다. 이탈리아에서 "라떼"를 주문하면 우유 한 잔이 나옵니다. "카페 라떼" 개념은 이탈리아에서 나왔지만, 오늘날과 같이 전 세계 카페 메뉴의 표준이 된 것은 1980~90년대 스타벅스의 영향이 결정적이었습니다.',
      funFact:
        '라떼 아트 대회는 전 세계에서 열리며, 상위 경쟁자들은 밀크 피처와 이쑤시개만으로 동물, 풍경, 심지어 인물 초상화까지 스팀 밀크에 만들어냅니다.',
    },
  },
};

export default cafeLatte;
