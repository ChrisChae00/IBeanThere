import type { CoffeeDrink } from '../types';

const icedAmericano: CoffeeDrink = {
  slug: 'iced-americano',
  categoryId: 'cold-brew',
  content: {
    en: {
      name: 'Iced Americano',
      tagline: 'Espresso over ice and water. The global summer standard.',
      description:
        'An iced Americano is espresso shots poured over ice with cold water — essentially the cold version of a hot Americano. The ice chills the espresso rapidly, and the water dilutes it to a drinkable strength. The espresso-first pour creates visible separation between layers before mixing.\n\nDespite its simplicity, the order of operations matters: espresso over ice (rather than ice over espresso) preserves more crema and produces a slightly different flavor. The shock of cold immediately halts further extraction and fixes the coffee at its current flavor state.',
      origin:
        'The iced Americano follows logically from the Americano itself — just add ice. It became a global café staple as air conditioning and year-round cold drink preferences spread. In South Korea, it achieved near-cultural-institution status as the default café order regardless of season.',
      funFact:
        'South Korea\'s love for iced Americano in cold weather has become a globally recognized meme. In Korean internet culture, it\'s jokingly called "얼죽아" (short for "얼어 죽어도 아이스 아메리카노"), meaning "I\'ll drink iced Americano even if I freeze to death." It\'s not entirely an exaggeration.',
    },
    ko: {
      name: '아이스 아메리카노',
      tagline: '에스프레소를 얼음과 물에 붓다. 전 세계 여름의 기준.',
      description:
        '아이스 아메리카노는 에스프레소 샷을 얼음과 찬물 위에 부은 음료입니다 — 본질적으로 핫 아메리카노의 아이스 버전입니다. 얼음이 에스프레소를 빠르게 식히고, 물이 마시기 좋은 농도로 희석합니다. 에스프레소를 먼저 부으면 섞기 전에 레이어 분리가 눈에 보입니다.\n\n단순해 보이지만 순서가 중요합니다. 얼음 위에 에스프레소를 붓는 것이(얼음을 에스프레소 위에 붓는 것이 아닌) 크레마를 더 잘 보존하고 약간 다른 풍미를 냅니다. 차가운 충격이 추출을 즉시 멈추고 커피를 현재 풍미 상태로 고정시킵니다.',
      origin:
        '아이스 아메리카노는 아메리카노에서 논리적으로 이어집니다 — 그냥 얼음을 추가하는 것이죠. 에어컨과 연중 차가운 음료 선호가 확산되면서 전 세계 카페의 필수 메뉴가 되었습니다. 한국에서는 계절에 상관없이 기본 카페 주문으로 사실상 문화 기관의 지위를 얻었습니다.',
      funFact:
        '추운 날씨에도 아이스 아메리카노를 마시는 한국의 사랑은 전 세계적으로 알려진 밈이 되었습니다. 한국 인터넷 문화에서는 농담으로 "얼죽아"(얼어 죽어도 아이스 아메리카노)라고 부릅니다. 과장이 아닌 경우가 많습니다.',
    },
  },
};

export default icedAmericano;
