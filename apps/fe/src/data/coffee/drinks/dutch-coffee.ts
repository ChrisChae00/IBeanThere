import type { CoffeeDrink } from '../types';

const dutchCoffee: CoffeeDrink = {
  slug: 'dutch-coffee',
  categoryId: 'cold-brew',
  content: {
    en: {
      name: 'Dutch Coffee',
      tagline: 'Drop by drop. Hours of slow drip.',
      description:
        'Dutch coffee (also called cold drip or slow drip) is made by slowly dripping cold water through coffee grounds over 3–8 hours — not steeping, but dripping. The water moves through the grounds by gravity at a very slow rate (1–3 drops per second), producing a concentrated, complex coffee with different flavor characteristics than cold brew.\n\nBecause the contact time between water and each coffee particle is shorter (the water passes through rather than sitting), dutch coffee can have more brightness and acidity than cold brew. The slow extraction also allows different flavor compounds to develop, creating a unique flavor profile.',
      origin:
        'Despite the name, the historical origins of Dutch coffee are debated. One theory is that Dutch traders introduced a cold-brewing method to Indonesia and Japan during the colonial era, which was then refined in Japan. The modern "Dutch coffee" apparatus — the tall tower with upper water reservoir, coffee grounds chamber, and lower collection vessel — became popular in Korea and Japan in the 2000s.',
      funFact:
        'In Korea, Dutch coffee has a devoted following and is often marketed as a premium, artisanal product. Some Korean cafés age their Dutch coffee like wine — refrigerating it for weeks or months to develop richer, more complex flavors. A well-aged Dutch coffee concentrate can reportedly take on notes similar to fine spirits.',
    },
    ko: {
      name: '더치커피',
      tagline: '한 방울씩. 수 시간의 천천한 드립.',
      description:
        '더치커피(콜드 드립 또는 슬로 드립이라고도 함)는 차가운 물을 커피 가루에 3~8시간에 걸쳐 천천히 한 방울씩 떨어뜨려 만듭니다. 담그는 것이 아니라 드리핑입니다. 물이 중력에 의해 매우 느린 속도(초당 1~3방울)로 가루를 통과하며, 콜드브루와 다른 풍미 특성을 가진 농축되고 복합적인 커피를 만들어냅니다.\n\n물과 각 커피 입자의 접촉 시간이 더 짧기 때문에(물이 담기는 것이 아니라 통과함), 더치커피는 콜드브루보다 밝음과 산도가 있을 수 있습니다. 느린 추출은 또한 다른 풍미 화합물이 발전할 수 있도록 하여 독특한 맛 프로파일을 만들어냅니다.',
      origin:
        '이름에도 불구하고 더치커피의 역사적 기원은 논쟁 중입니다. 한 이론은 네덜란드 상인들이 식민지 시대에 인도네시아와 일본에 냉침 방법을 소개했고, 이후 일본에서 정교하게 발전했다는 것입니다. 상단의 물 저장소, 커피 가루 챔버, 하단 수집 용기가 있는 현대적인 "더치커피" 장치는 2000년대 한국과 일본에서 인기를 얻었습니다.',
      funFact:
        '한국에서 더치커피는 헌신적인 팬층을 보유하고 있으며 프리미엄 수제 제품으로 마케팅되는 경우가 많습니다. 일부 한국 카페는 더치커피를 와인처럼 숙성시킵니다 — 더 풍부하고 복합적인 풍미를 발전시키기 위해 몇 주에서 몇 달 동안 냉장 보관합니다. 잘 숙성된 더치커피 농축액은 고급 주류와 유사한 향이 날 수 있다고 합니다.',
    },
  },
};

export default dutchCoffee;
