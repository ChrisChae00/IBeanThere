import type { CoffeeDrink } from '../types';

const cafeLatte: CoffeeDrink = {
  slug: 'cafe-latte',
  categoryId: 'espresso',
  reviewed: '2026-09-11',
  related: ['cappuccino', 'flat-white', 'macchiato'],
  content: {
    en: {
      name: 'Café latte',
      aka: 'In Italian: caffè latte or caffellatte; usually just “latte”',
      title: 'Café latte: what it is, what “latte” means, and latte vs cappuccino',
      description:
        'A café latte is espresso with plenty of steamed milk and a thin layer of foam. Why “latte” alone means milk in Italy, how it differs from a cappuccino and a flat white, and what a breve is.',
      summary:
        'A café latte is espresso topped up with plenty of steamed milk and a thin layer of foam, the largest and milkiest of the classic espresso drinks. In Italian latte simply means milk, so in Italy you ask for a caffè latte or caffellatte.',
      line: 'Espresso with plenty of steamed milk and a thin layer of foam.',
      facts: [
        { label: 'In the cup', value: 'Espresso, steamed milk, a thin layer of foam' },
        { label: 'Milk', value: 'The most of the classic espresso drinks' },
        { label: 'Variations', value: 'Iced latte, breve (with half-and-half)' },
      ],
      sections: [
        {
          id: 'name',
          heading: 'Why does “latte” mean milk?',
          body: [
            {
              text: 'Because it does, in Italian. Treccani defines caffellatte as a drink of coffee and milk, taken mostly in the morning at breakfast. English borrowed the short form: the Online Etymology Dictionary dates “latte” for espresso with milk to around 1990.',
              sources: ['treccani-caffellatte', 'etym-latte'],
            },
          ],
        },
        {
          id: 'compared',
          heading: 'Latte, cappuccino or flat white?',
          body: [
            {
              text: 'The difference is the milk: how much, and how much of it is foam. A latte has the most milk and a thin layer of foam; a cappuccino has less milk under at least 1 cm of foam; a flat white is smaller than both, with about 0.5 cm. The table in the guide sets them side by side.',
              sources: ['pdg-flat-white'],
            },
          ],
        },
        {
          id: 'breve',
          heading: 'What is a breve?',
          body: [
            {
              text: 'A latte-style drink made with steamed half-and-half, a mix of milk and cream, instead of milk. The extra fat makes it richer and heavier.',
              sources: ['breville-breve'],
            },
          ],
        },
      ],
    },
    ko: {
      name: '카페라테',
      aka: '이탈리아어로 caffè latte, caffellatte · 흔히 ‘라테’',
      title: '카페라테란? ‘라테’의 뜻과 카푸치노·플랫화이트와의 차이',
      description:
        '카페라테는 에스프레소에 스팀 우유를 넉넉히 붓고 얇은 거품을 올린 음료입니다. 이탈리아에서 ‘라테’가 우유를 뜻하는 이유, 카푸치노·플랫화이트와의 차이, 브레베를 정리했습니다.',
      summary:
        '카페라테는 에스프레소에 스팀 우유를 넉넉히 붓고 얇은 거품층으로 마무리한 음료로, 고전적인 에스프레소 음료 가운데 가장 크고 우유가 많습니다. 이탈리아어로 latte는 그냥 우유라서, 이탈리아에서는 카페 라테나 카펠라테라고 주문합니다.',
      line: '에스프레소에 스팀 우유를 넉넉히 붓고 얇은 거품을 올린 음료.',
      facts: [
        { label: '재료', value: '에스프레소, 스팀 우유, 얇은 거품' },
        { label: '우유', value: '고전 에스프레소 음료 중 가장 많음' },
        { label: '변형', value: '아이스 라테, 브레베(하프앤하프)' },
      ],
      sections: [
        {
          id: 'name',
          heading: '‘라테’는 왜 우유라는 뜻인가',
          body: [
            {
              text: '이탈리아어로 정말 우유이기 때문입니다. 트레카니 사전은 카펠라테(caffellatte)를 주로 아침 식사 때 마시는 커피와 우유 음료로 풀이합니다. 영어는 줄임말을 가져갔고, 온라인 어원 사전은 에스프레소와 우유를 뜻하는 ‘latte’를 1990년 무렵부터로 봅니다.',
              sources: ['treccani-caffellatte', 'etym-latte'],
            },
          ],
        },
        {
          id: 'compared',
          heading: '라테, 카푸치노, 플랫화이트는 어떻게 다른가',
          body: [
            {
              text: '차이는 우유에 있습니다. 얼마나 넣는지, 그중 얼마가 거품인지. 라테는 우유가 가장 많고 거품이 얇으며, 카푸치노는 우유가 적고 거품이 1cm 이상, 플랫화이트는 둘보다 작고 거품이 약 0.5cm입니다. 가이드의 비교표에서 나란히 볼 수 있습니다.',
              sources: ['pdg-flat-white'],
            },
          ],
        },
        {
          id: 'breve',
          heading: '브레베는 무엇인가',
          body: [
            {
              text: '우유 대신 우유와 크림을 섞은 하프앤하프를 스팀해 만든 라테식 음료입니다. 지방이 많아 더 진하고 묵직합니다.',
              sources: ['breville-breve'],
            },
          ],
        },
      ],
    },
  },
};

export default cafeLatte;
