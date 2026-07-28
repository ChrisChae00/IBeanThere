import type { CoffeeDrink } from '../types';

const cortado: CoffeeDrink = {
  slug: 'cortado',
  categoryId: 'milk-variations',
  content: {
    en: {
      name: 'Cortado',
      tagline: 'Espresso "cut" with just enough milk.',
      description:
        'Cortado (from the Spanish "cortar," meaning "to cut") is a 1:1 or 1:2 ratio of espresso to warm, lightly textured milk in a 60–90ml serving. Unlike cappuccino or latte, the milk in a cortado is barely steamed — not heavily foamed — so it cuts the espresso\'s acidity and bitterness without creating a creamy, milky drink.\n\nThe cortado sits between macchiato and flat white in size and intensity. It\'s popular in Spain and Portugal, where it\'s typically served in a small glass rather than a ceramic cup.',
      origin:
        'The cortado originated in Spain — most likely in the Basque country or Galicia — and is deeply embedded in the coffee culture of Spain and Portugal (where it\'s called "garoto" in the north or "meia de leite" in a slightly larger form). It became a global specialty coffee trend in the early 2010s.',
      funFact:
        'In some parts of California, ordering a cortado at a specialty coffee bar in the early 2010s was seen as a shiboleth — a way to signal that you were "serious" about coffee. The drink became almost a status symbol in third-wave coffee circles before it normalized.',
    },
    ko: {
      name: '코르타도',
      tagline: '딱 필요한 만큼의 우유로 "자른" 에스프레소.',
      description:
        '코르타도(스페인어 "코르타르(cortar)"에서 유래, "자르다"는 뜻)는 에스프레소와 따뜻하고 가볍게 스팀한 우유를 1:1 또는 1:2 비율로 60~90ml 분량으로 제공합니다. 카푸치노나 라떼와 달리 코르타도의 우유는 거의 스팀만 한 것으로 — 풍성하게 폼을 만들지 않아 — 에스프레소의 산도와 쓴맛을 잘라내지만 크리미하고 우유 맛 강한 음료는 만들지 않습니다.\n\n코르타도는 크기와 강도에서 마키아토와 플랫화이트 사이에 위치합니다. 스페인과 포르투갈에서 인기 있으며, 도자기 컵이 아닌 작은 유리잔에 제공되는 것이 일반적입니다.',
      origin:
        '코르타도는 스페인 — 아마도 바스크 지방이나 갈리시아 — 에서 유래했으며 스페인과 포르투갈의 커피 문화에 깊이 뿌리내리고 있습니다. 2010년대 초 글로벌 스페셜티 커피 트렌드가 되었습니다.',
      funFact:
        '2010년대 초 캘리포니아의 일부 지역에서 스페셜티 커피 바에서 코르타도를 주문하는 것은 일종의 암호 같은 것이었습니다. "나 커피에 진심이야"라는 신호였죠. 일반화되기 전에 서드웨이브 커피 세계에서 거의 지위 상징이 된 음료입니다.',
    },
  },
};

export default cortado;
