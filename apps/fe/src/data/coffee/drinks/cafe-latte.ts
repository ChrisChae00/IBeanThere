import type { CoffeeDrink } from '../types';

const cafeLatte: CoffeeDrink = {
  slug: 'cafe-latte',
  categoryId: 'milk-variations',
  content: {
    en: {
      name: 'Café Latte',
      tagline: "Order a 'latte' in Italy, and the barista hands you a plain glass of milk — no coffee at all.",
      description:
        "\"Latte\" just means milk in Italian — order one alone in Milan and you'll get a plain glass of it, no coffee in sight. The drink the world calls a latte is actually \"caffè latte,\" a modest home staple for generations. But it took an outsider to turn it global: Starbucks built its 1980s–90s menu around it until \"latte\" became shorthand everywhere but its birthplace.\n\nThe texture is why it stuck. One or two espresso shots meet steamed milk at roughly 1:3–1:5, finished with microfoam — tiny, uniform bubbles that give it a velvety pull. That same control lets baristas pour rosettas and swans on top, and the art isn't just decoration. It's proof the temperature and texture underneath are exactly right.",
      origin:
        'The word "latte" is Italian for milk, and in Italy, ordering a "latte" will literally get you a glass of milk. The "caffè latte" concept — espresso with milk — is Italian, but the modern latte as a named café menu item popularized globally was largely driven by Starbucks in the 1980s and 90s, which helped make it a worldwide standard.',
      funFact:
        'Latte art competitions are held worldwide, and the top competitors can create incredibly detailed images — animals, landscapes, even portraits — in steamed milk using nothing but a milk pitcher and a toothpick for detail work.',
    },
    ko: {
      name: '카페라떼',
      tagline: "이탈리아에서 '라떼'를 주문하면 커피 없이 그냥 우유 한 잔이 나온다.",
      description:
        "'라떼'는 이탈리아어로 그냥 우유라는 뜻입니다. 밀라노에서 '라떼'만 시키면 에스프레소는 빠지고 정말 우유 한 잔만 나옵니다. 우리가 라떼라 부르는 음료는 사실 '카페라떼'이고, 이마저도 이탈리아에서는 오랫동안 소박한 가정용 음료에 머물렀습니다. 하지만 이 음료를 전 세계로 퍼뜨린 건 이탈리아가 아니라 외부였습니다. 1980~90년대 스타벅스가 메뉴의 중심에 놓으면서, '라떼'는 정작 발상지를 제외한 모든 곳에서 표준 용어가 됐습니다.\n\n이 음료가 자리 잡은 이유는 질감에 있습니다. 에스프레소 1~2샷에 스팀 밀크를 약 1:3~1:5 비율로 더하고, 작고 균일한 기포의 마이크로폼으로 마무리하면 벨벳 같은 목넘김이 생깁니다. 같은 컨트롤로 바리스타는 표면에 로제타와 백조를 그려내는데, 이 아트는 장식이 아니라 아래 온도와 질감이 정확하다는 증거입니다.",
      origin:
        '"라떼(latte)"는 이탈리아어로 우유를 뜻합니다. 이탈리아에서 "라떼"를 주문하면 우유 한 잔이 나옵니다. "카페 라떼" 개념은 이탈리아에서 나왔지만, 오늘날과 같이 전 세계 카페 메뉴의 표준이 된 것은 1980~90년대 스타벅스의 영향이 결정적이었습니다.',
      funFact:
        '라떼 아트 대회는 전 세계에서 열리며, 상위 경쟁자들은 밀크 피처와 이쑤시개만으로 동물, 풍경, 심지어 인물 초상화까지 스팀 밀크에 만들어냅니다.',
    },
  },
};

export default cafeLatte;
