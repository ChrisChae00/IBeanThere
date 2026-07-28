import type { CoffeeDrink } from '../types';

const affogato: CoffeeDrink = {
  slug: 'affogato',
  categoryId: 'signature',
  content: {
    en: {
      name: 'Affogato',
      tagline: 'Espresso "drowned" in ice cream. Dessert and coffee in one.',
      description:
        'Affogato ("drowned" in Italian) is a single or double espresso shot poured directly over a scoop of vanilla gelato or ice cream. The hot espresso partially melts the cold gelato, creating a pool of coffee-cream liquid that mixes with the softened ice cream as you eat.\n\nIt\'s a dessert and a coffee simultaneously — the contrast of temperatures (scalding hot espresso against frozen gelato) and flavors (bitter coffee and sweet cream) is the entire appeal. There\'s no technique required; the fun is in how it evolves as you eat it.',
      origin:
        'Affogato originated in Italy as a dessert variation, with the exact origin uncertain. It\'s commonly associated with Milanese café culture of the mid-20th century. Despite being Italian in origin, it became globally popularized through specialty coffee culture and is now found worldwide in cafés that serve gelato.',
      funFact:
        'In Italy, there\'s debate about whether affogato belongs on the dessert menu or the coffee menu — it straddles both categories. Some traditional Italian bars serve it only after meals, while modern specialty cafés serve it any time of day.',
    },
    ko: {
      name: '아포가토',
      tagline: '아이스크림에 "익사한" 에스프레소. 디저트와 커피의 만남.',
      description:
        '"아포가토(affogato)"는 이탈리아어로 "익사한"이라는 뜻입니다. 바닐라 젤라또나 아이스크림 한 스쿱 위에 에스프레소 싱글 또는 더블 샷을 직접 붓는 음료입니다. 뜨거운 에스프레소가 차가운 젤라또를 부분적으로 녹여 부드러워진 아이스크림과 섞이는 커피-크림 액체를 만들어냅니다.\n\n동시에 디저트이자 커피입니다. 온도의 대비(뜨거운 에스프레소 대 얼어있는 젤라또)와 맛의 대비(쓴 커피와 달콤한 크림)가 모든 매력입니다. 특별한 기술이 필요 없으며, 먹으면서 변해가는 과정 자체가 재미입니다.',
      origin:
        '아포가토는 이탈리아에서 디저트 변형으로 시작되었으며 정확한 기원은 불분명합니다. 일반적으로 20세기 중반 밀라노 카페 문화와 연관됩니다. 이탈리아에서 시작되었지만 스페셜티 커피 문화를 통해 전 세계적으로 인기를 얻었으며, 지금은 젤라또를 판매하는 전 세계 카페에서 찾아볼 수 있습니다.',
      funFact:
        '이탈리아에서 아포가토가 디저트 메뉴에 속하는지 커피 메뉴에 속하는지에 대한 논쟁이 있습니다. 두 카테고리에 걸쳐 있기 때문입니다. 일부 전통 이탈리아 바는 식사 후에만 제공하고, 현대 스페셜티 카페는 하루 중 언제든 제공합니다.',
    },
  },
};

export default affogato;
