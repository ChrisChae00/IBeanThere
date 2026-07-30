import type { CoffeeDrink } from '../types';

const icedAmericano: CoffeeDrink = {
  slug: 'iced-americano',
  categoryId: 'cold-brew',
  content: {
    en: {
      name: 'Iced Americano',
      tagline:
        'There\'s a Korean phrase that means "I\'d rather freeze to death than skip my iced Americano" — and the data backs it up.',
      description:
        'Add ice to a hot Americano, and logically, that\'s all an iced Americano should be. But in South Korea it became something closer to a national identity: the default café order regardless of season, ordered in the dead of winter as reflexively as in August. Korean internet culture even coined a word for it — "얼죽아," short for "I\'ll drink iced Americano even if I freeze to death" — and it\'s less of a joke than it sounds.\n\nThe mechanics back up the obsession. Pouring espresso over ice, rather than ice over espresso, preserves more crema and shifts the flavor slightly, while the cold shock halts extraction instantly, locking the coffee at exactly the flavor it had the moment it hit the ice. Simple as the drink is, that one decision — what goes in first — is the whole difference.',
      origin:
        'The iced Americano follows logically from the Americano itself — just add ice. It became a global café staple as air conditioning and year-round cold drink preferences spread. In South Korea, it achieved near-cultural-institution status as the default café order regardless of season.',
      funFact:
        'South Korea\'s love for iced Americano in cold weather has become a globally recognized meme. In Korean internet culture, it\'s jokingly called "얼죽아" (short for "얼어 죽어도 아이스 아메리카노"), meaning "I\'ll drink iced Americano even if I freeze to death." It\'s not entirely an exaggeration.',
    },
    ko: {
      name: '아이스 아메리카노',
      tagline: '얼어 죽어도 아이스 아메리카노 — 이 말이 진짜로 통계와 맞아떨어진다.',
      description:
        '핫 아메리카노에 얼음만 넣으면 아이스 아메리카노가 된다는 게 논리적으로는 맞습니다. 하지만 한국에서는 이 음료가 거의 정체성에 가까운 것이 됐습니다. 계절과 상관없이 기본으로 주문하는 카페 메뉴, 한겨울에도 8월처럼 반사적으로 시키는 음료가 된 겁니다. 한국 인터넷 문화는 여기에 아예 단어까지 붙였습니다 — "얼죽아", 즉 "얼어 죽어도 아이스 아메리카노"라는 뜻인데, 농담치고는 꽤 진심입니다.\n\n이 집착에는 나름의 원리가 있습니다. 얼음 위에 에스프레소를 붓는 순서(반대가 아니라)가 크레마를 더 많이 보존하고 풍미를 미묘하게 바꾸며, 차가운 충격은 추출을 즉시 멈춰 얼음에 닿는 순간의 맛을 그대로 고정시킵니다. 이렇게 단순한 음료인데도, 무엇을 먼저 붓느냐 하는 그 한 가지 결정이 맛의 전부를 좌우합니다.',
      origin:
        '아이스 아메리카노는 아메리카노에서 논리적으로 이어집니다 — 그냥 얼음을 추가하는 것이죠. 에어컨과 연중 차가운 음료 선호가 확산되면서 전 세계 카페의 필수 메뉴가 되었습니다. 한국에서는 계절에 상관없이 기본 카페 주문으로 사실상 문화 기관의 지위를 얻었습니다.',
      funFact:
        '추운 날씨에도 아이스 아메리카노를 마시는 한국의 사랑은 전 세계적으로 알려진 밈이 되었습니다. 한국 인터넷 문화에서는 농담으로 "얼죽아"(얼어 죽어도 아이스 아메리카노)라고 부릅니다. 과장이 아닌 경우가 많습니다.',
    },
  },
};

export default icedAmericano;
