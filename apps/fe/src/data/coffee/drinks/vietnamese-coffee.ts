import type { CoffeeDrink } from '../types';

const vietnameseCoffee: CoffeeDrink = {
  slug: 'vietnamese-coffee',
  categoryId: 'added',
  reviewed: '2026-09-11',
  related: ['pour-over', 'dalgona', 'cold-brew'],
  content: {
    en: {
      name: 'Vietnamese coffee',
      aka: 'Iced with condensed milk: cà phê sữa đá',
      title: 'Vietnamese coffee: the phin filter, condensed milk, and robusta',
      description:
        'Vietnamese coffee is dark-roasted coffee dripped through a small metal phin, usually with sweetened condensed milk. What goes in it, how to order it, and how coffee reached Vietnam.',
      summary:
        'Vietnamese coffee usually means strong, dark-roasted coffee dripped slowly through a phin — a small metal filter that sits on top of the cup — then mixed with sweetened condensed milk. Over ice it is cà phê sữa đá; black, it is cà phê đen.',
      summarySources: ['barista-mag-vietnam'],
      line: 'Dark-roasted coffee dripped through a small metal phin filter, usually over condensed milk.',
      facts: [
        { label: 'Brewer', value: 'Phin, a small metal drip filter' },
        { label: 'Coffee', value: 'Mostly robusta, usually dark-roasted' },
        { label: 'Sweetener', value: 'Sweetened condensed milk' },
        { label: 'To order', value: 'cà phê đen (black), cà phê sữa (with milk), đá (iced)' },
      ],
      sections: [
        {
          id: 'robusta',
          heading: 'What coffee is used?',
          body: [
            {
              text: 'Mostly robusta, because that is most of what Vietnam grows. Daily Coffee News, reporting the US Department of Agriculture’s forecast, puts the country’s 2026/27 harvest at 32.5 million 60-kilogram bags, 31.4 million of them robusta and 1.1 million arabica.',
              sources: ['dcn-vietnam'],
            },
            {
              text: 'The traditional cup is dark-roasted, sometimes with chicory or corn in the blend, and condensed milk offsets its dark, smoky flavour.',
              sources: ['barista-mag-vietnam'],
            },
          ],
        },
        {
          id: 'history',
          heading: 'How did coffee reach Vietnam?',
          body: [
            {
              text: 'Under French colonial rule in the 19th century. Barista Magazine’s history starts with a French priest who brought an arabica tree to Vietnam in 1857. Condensed milk is usually explained by fresh milk being hard to find, and to keep, when coffee arrived — a reasonable account, though not one we could trace to a primary source.',
              sources: ['barista-mag-vietnam'],
            },
          ],
        },
      ],
    },
    ko: {
      name: '베트남 커피',
      aka: '연유를 넣은 아이스는 cà phê sữa đá(카페 쓰어 다)',
      title: '베트남 커피: 핀 필터, 연유, 그리고 로부스타',
      description:
        '베트남 커피는 강하게 볶은 원두를 작은 금속 필터 핀으로 내려 연유와 섞는 커피입니다. 재료, 주문하는 법, 커피가 베트남에 들어온 경위를 정리했습니다.',
      summary:
        '베트남 커피는 보통 강하게 볶은 진한 커피를 핀(phin), 곧 잔 위에 올리는 작은 금속 필터로 천천히 내려 가당 연유와 섞은 것을 말합니다. 얼음에 부으면 카페 쓰어 다(cà phê sữa đá), 블랙은 카페 덴(cà phê đen)입니다.',
      summarySources: ['barista-mag-vietnam'],
      line: '강하게 볶은 원두를 작은 금속 필터 핀으로 내려, 대개 연유와 섞는 커피.',
      facts: [
        { label: '도구', value: '핀, 작은 금속 드립 필터' },
        { label: '원두', value: '주로 로부스타, 대개 강배전' },
        { label: '단맛', value: '가당 연유' },
        { label: '주문', value: 'cà phê đen(블랙), cà phê sữa(연유), đá(아이스)' },
      ],
      sections: [
        {
          id: 'robusta',
          heading: '어떤 원두를 쓰나',
          body: [
            {
              text: '주로 로부스타입니다. 베트남에서 나는 커피 대부분이 로부스타이기 때문입니다. 미국 농무부 전망을 전한 데일리 커피 뉴스에 따르면 2026/27년 베트남 수확량은 60kg 자루 3,250만 개이고, 그중 3,140만 개가 로부스타, 110만 개가 아라비카입니다.',
              sources: ['dcn-vietnam'],
            },
            {
              text: '전통적인 한 잔은 강하게 볶고 치커리나 옥수수를 섞기도 하며, 연유가 그 어둡고 스모키한 맛을 눌러 줍니다.',
              sources: ['barista-mag-vietnam'],
            },
          ],
        },
        {
          id: 'history',
          heading: '커피는 어떻게 베트남에 들어왔나',
          body: [
            {
              text: '19세기 프랑스 식민 통치 시기입니다. 바리스타 매거진은 1857년 한 프랑스 신부가 아라비카 나무를 들여온 데서 시작한다고 정리합니다. 연유를 넣게 된 것은 커피가 들어왔을 때 신선한 우유를 구하고 보관하기 어려웠기 때문이라고 흔히 설명하는데, 그럴듯하지만 1차 자료로는 확인하지 못했습니다.',
              sources: ['barista-mag-vietnam'],
            },
          ],
        },
      ],
    },
  },
};

export default vietnameseCoffee;
