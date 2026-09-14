import type { CoffeeDrink } from '../types';

const affogato: CoffeeDrink = {
  slug: 'affogato',
  categoryId: 'added',
  reviewed: '2026-09-11',
  related: ['espresso', 'einspanner', 'dalgona'],
  content: {
    en: {
      name: 'Affogato',
      aka: 'In Italian: affogato al caffè',
      title: 'Affogato: the espresso dessert, and what its name means',
      description:
        'An affogato is hot espresso poured over a scoop of ice cream and eaten as a dessert. What the Italian name means, and how it differs from Viennese Eiskaffee.',
      summary:
        'An affogato is a dessert more than a drink: hot espresso poured over a scoop of ice cream, usually vanilla, and eaten with a spoon as the two melt together. The name is Italian for “drowned.”',
      summarySources: ['etym-affogato'],
      line: 'A scoop of ice cream with a shot of hot espresso poured over it, eaten as dessert.',
      facts: [
        { label: 'In the cup', value: 'Ice cream and espresso' },
        { label: 'Served', value: 'As a dessert, with a spoon' },
        { label: 'Name', value: 'Italian for “drowned”' },
      ],
      sections: [
        {
          id: 'name',
          heading: 'What does “affogato” mean?',
          body: [
            {
              text: '“Drowned,” from the ice cream’s point of view. The Online Etymology Dictionary defines it as hot espresso poured over vanilla ice cream and served as a dessert, and records the word in English by 1999.',
              sources: ['etym-affogato'],
            },
            {
              text: 'Who first served it, and when, is not documented in any source we found.',
            },
          ],
        },
        {
          id: 'eiskaffee',
          heading: 'Is it the same as Eiskaffee?',
          body: [
            {
              text: 'Close, but not the same. Vienna’s Eiskaffee, as the Austrian National Tourist Office describes it, is espresso with cold milk and two scoops of vanilla ice cream — a drink. The affogato has no milk and is eaten rather than drunk.',
              sources: ['austria-coffeehouse'],
            },
          ],
        },
      ],
    },
    ko: {
      name: '아포가토',
      aka: '이탈리아어로 affogato al caffè',
      title: '아포가토: 에스프레소 디저트와 이름의 뜻',
      description:
        '아포가토는 아이스크림 위에 뜨거운 에스프레소를 부어 먹는 디저트입니다. 이탈리아어 이름의 뜻과 빈의 아이스카페와의 차이를 정리했습니다.',
      summary:
        '아포가토는 음료라기보다 디저트입니다. 아이스크림 한 스쿱(주로 바닐라) 위에 뜨거운 에스프레소를 붓고, 둘이 녹아 섞이는 동안 숟가락으로 떠먹습니다. 이름은 이탈리아어로 ‘물에 빠진’이라는 뜻입니다.',
      summarySources: ['etym-affogato'],
      line: '아이스크림 위에 뜨거운 에스프레소 한 샷을 부어 떠먹는 디저트.',
      facts: [
        { label: '재료', value: '아이스크림과 에스프레소' },
        { label: '제공', value: '디저트로, 숟가락과 함께' },
        { label: '이름', value: '이탈리아어로 ‘물에 빠진’' },
      ],
      sections: [
        {
          id: 'name',
          heading: '‘아포가토’는 무슨 뜻인가',
          body: [
            {
              text: '아이스크림 입장에서 ‘빠져 버린’이라는 뜻입니다. 온라인 어원 사전은 이를 바닐라 아이스크림에 뜨거운 에스프레소를 부어 디저트로 내는 것으로 정의하고, 영어 기록은 1999년 무렵부터로 봅니다.',
              sources: ['etym-affogato'],
            },
            {
              text: '누가, 언제 처음 만들었는지는 우리가 찾은 어느 자료에도 기록돼 있지 않습니다.',
            },
          ],
        },
        {
          id: 'eiskaffee',
          heading: '빈의 아이스카페와 같은 것인가',
          body: [
            {
              text: '비슷하지만 다릅니다. 오스트리아 관광청이 소개하는 빈의 아이스카페(Eiskaffee)는 에스프레소에 찬 우유와 바닐라 아이스크림 두 스쿱을 넣은 음료입니다. 아포가토에는 우유가 없고, 마시기보다 떠먹습니다.',
              sources: ['austria-coffeehouse'],
            },
          ],
        },
      ],
    },
  },
};

export default affogato;
