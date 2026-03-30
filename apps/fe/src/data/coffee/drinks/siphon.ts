import type { CoffeeDrink } from '../types';

const siphon: CoffeeDrink = {
  slug: 'siphon',
  categoryId: 'brewing',
  content: {
    en: {
      name: 'Siphon',
      tagline: 'Theater and science in one glass vessel.',
      description:
        'Siphon (or vacuum pot) brewing is arguably the most dramatic method in coffee. Two chambers are connected — water in the lower globe is heated until vapor pressure pushes it up into the upper chamber where coffee grounds wait. Once heat is removed, the vacuum pulls the brewed coffee back down through a cloth or metal filter.\n\nThe result is remarkably clean — cleaner than French press but with more body than paper filters allow. The process takes 5–8 minutes and requires full attention, but produces a cup with clarity, sweetness, and delicate texture that other methods struggle to match.',
      origin:
        'The siphon was invented in Germany in the 1830s and refined throughout the 19th century. It peaked in popularity in the mid-20th century in Japan, where Kōno and Hario developed refined versions that remain popular in high-end cafés. In Japan, siphon coffee is often served as a premium "theater" experience at counter-style specialty bars.',
      funFact:
        'Siphon brewers were so popular in mid-century Japan that many older coffee shops still use them exclusively — decades-old machines maintained with devotion. Some Tokyo kissaten (traditional coffee shops) use the same siphon units purchased in the 1960s.',
    },
    ko: {
      name: '사이폰',
      tagline: '하나의 유리 기구 속 연극과 과학.',
      description:
        '사이폰(진공 포트) 추출은 커피 방법 중 가장 극적인 방식으로 꼽힙니다. 두 개의 유리 챔버가 연결되어 있고, 아래 구에서 물을 가열하면 증기압이 물을 위 챔버로 밀어 올려 커피 가루와 만나게 합니다. 열을 제거하면 진공이 추출된 커피를 천이나 금속 필터를 통해 다시 아래로 끌어당깁니다.\n\n결과물은 놀라울 정도로 깔끔합니다. 프렌치프레스보다 선명하고, 종이 필터보다 바디감이 있습니다. 5~8분의 주의 깊은 과정이 필요하지만, 그 결과로 나오는 선명함, 단맛, 섬세한 텍스처는 다른 방식이 따라가기 어렵습니다.',
      origin:
        '사이폰은 1830년대 독일에서 발명되어 19세기에 걸쳐 발전했습니다. 20세기 중반 일본에서 코노(Kōno)와 하리오(Hario)가 정교하게 발전시켜 최고의 인기를 누렸으며, 지금도 고급 카페에서 즐겨 사용됩니다. 일본에서 사이폰 커피는 카운터형 스페셜티 바의 프리미엄 "연극" 경험으로 제공됩니다.',
      funFact:
        '20세기 중반 일본에서 사이폰 브루어는 매우 인기가 높아 많은 오래된 커피숍이 수십 년이 지난 지금도 이것만 사용합니다. 도쿄의 일부 킷사텐(전통 커피숍)에서는 1960년대에 구매한 사이폰을 여전히 사용하고 있습니다.',
    },
  },
};

export default siphon;
