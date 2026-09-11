import type { CoffeeDrink } from '../types';

const dalgona: CoffeeDrink = {
  slug: 'dalgona',
  categoryId: 'added',
  reviewed: '2026-09-11',
  related: ['vietnamese-coffee', 'affogato', 'cafe-latte'],
  content: {
    en: {
      name: 'Dalgona coffee',
      aka: 'Also called whipped coffee',
      title: 'Dalgona coffee: what it is and how a Korean TV show named it',
      description:
        'Dalgona coffee is instant coffee, sugar and hot water whipped into a thick foam and spooned over milk. Where the name came from in 2020, and the older beaten coffee it resembles.',
      summary:
        'Dalgona coffee is instant coffee, sugar and a little hot water whipped until thick and pale, then spooned over milk, usually cold. It is named after dalgona, a Korean honeycomb toffee that the sweet foam is said to recall, and it spread worldwide in early 2020.',
      summarySources: ['sprudge-dalgona'],
      line: 'Instant coffee, sugar and hot water whipped into a thick foam and spooned over milk.',
      facts: [
        { label: 'In the cup', value: 'Instant coffee, sugar, hot water, milk' },
        { label: 'Method', value: 'Whipped by hand or with a mixer' },
        { label: 'Name', value: 'After dalgona, a Korean honeycomb toffee' },
        { label: 'Spread', value: 'Early 2020' },
      ],
      sections: [
        {
          id: 'origin',
          heading: 'Where did dalgona coffee come from?',
          body: [
            {
              text: 'The name came from Korean television. In an early-2020 episode of KBS2’s Stars’ Top Recipe at Fun-Staurant, the actor Jung Il-woo tried a whipped coffee at a restaurant in Macau and said it tasted like the dalgona sold outside schools. The drink then spread on YouTube and Instagram in Korea, and on TikTok worldwide, just as the pandemic kept people at home.',
              sources: ['mt-dalgona', 'sprudge-dalgona'],
            },
            {
              text: 'The method is older than the name. Sprudge points out that India’s beaten coffee — instant coffee, sugar and water whipped and served with milk — works the same way.',
              sources: ['sprudge-dalgona'],
            },
          ],
        },
      ],
    },
    ko: {
      name: '달고나 커피',
      aka: '휘핑 커피라고도 부릅니다',
      title: '달고나 커피: 만드는 법과 이름이 붙은 과정',
      description:
        '달고나 커피는 인스턴트커피와 설탕, 뜨거운 물을 저어 만든 거품을 우유 위에 올린 음료입니다. 2020년 이름이 붙은 과정과 비슷한 인도의 비튼 커피를 정리했습니다.',
      summary:
        '달고나 커피는 인스턴트커피와 설탕, 뜨거운 물 조금을 연한 갈색이 되도록 되직하게 저은 뒤, 대개 차가운 우유 위에 떠 올린 음료입니다. 단 거품이 설탕 과자 달고나를 떠올리게 해서 붙은 이름이고, 2020년 초 전 세계로 퍼졌습니다.',
      summarySources: ['sprudge-dalgona'],
      line: '인스턴트커피와 설탕, 뜨거운 물을 저어 만든 거품을 우유 위에 올린 음료.',
      facts: [
        { label: '재료', value: '인스턴트커피, 설탕, 뜨거운 물, 우유' },
        { label: '방법', value: '손이나 믹서로 저어 거품 내기' },
        { label: '이름', value: '설탕 과자 ‘달고나’에서' },
        { label: '유행', value: '2020년 초' },
      ],
      sections: [
        {
          id: 'origin',
          heading: '달고나 커피는 어디서 왔나',
          body: [
            {
              text: '이름은 한국 방송에서 나왔습니다. 2020년 초 KBS2 ‘신상출시 편스토랑’에서 배우 정일우가 마카오의 한 식당에서 휘핑 커피를 맛보고 “학교 앞에서 팔던 달고나 같은 맛”이라고 했고, 이후 유튜브와 인스타그램에서 크게 유행했습니다. 팬데믹으로 집에 머무는 시간이 길어지던 때라 틱톡을 타고 해외로도 번졌습니다.',
              sources: ['mt-dalgona', 'sprudge-dalgona'],
            },
            {
              text: '방법은 이름보다 오래됐습니다. 커피 매체 스프러지는 인스턴트커피와 설탕, 물을 저어 우유와 함께 내는 인도의 비튼 커피(beaten coffee)가 같은 방식이라고 짚습니다.',
              sources: ['sprudge-dalgona'],
            },
          ],
        },
      ],
    },
  },
};

export default dalgona;
