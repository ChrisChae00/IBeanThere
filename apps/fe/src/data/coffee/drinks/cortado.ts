import type { CoffeeDrink } from '../types';

const cortado: CoffeeDrink = {
  slug: 'cortado',
  categoryId: 'espresso',
  reviewed: '2026-09-11',
  related: ['macchiato', 'flat-white', 'cafe-latte'],
  content: {
    en: {
      name: 'Cortado',
      aka: 'In Spanish: café cortado',
      title: 'Cortado: what it is and how it compares with a macchiato and a flat white',
      description:
        'A cortado is espresso cut with a small amount of warm milk. What the Spanish name means, how much milk it has, and where it sits between a macchiato and a flat white.',
      summary:
        'A cortado is espresso “cut” with a small amount of warm milk. The Spanish dictionary of the Real Academia Española defines it as coffee with very little milk; Dictionary.com, an American dictionary, describes roughly equal parts espresso and steamed milk. Either way it is small, and the coffee leads.',
      summarySources: ['rae-cafe', 'dictcom-cortado'],
      line: 'Espresso “cut” with a small amount of warm milk, up to about equal parts.',
      facts: [
        { label: 'In the cup', value: 'Espresso and a little steamed milk' },
        { label: 'Milk', value: 'Very little, up to about as much as the espresso' },
        { label: 'Name', value: 'Spanish, from cortar, “to cut”' },
      ],
      sections: [
        {
          id: 'name',
          heading: 'What does “cortado” mean?',
          body: [
            {
              text: 'It is the past participle of the Spanish verb cortar, to cut. The Real Academia Española’s dictionary lists café cortado as “coffee with very little milk.”',
              sources: ['rae-cortado', 'rae-cafe'],
            },
            {
              text: 'Dictionary.com, an American dictionary, puts the steamed milk at approximately the same amount as the espresso.',
              sources: ['dictcom-cortado'],
            },
          ],
        },
        {
          id: 'compared',
          heading: 'Cortado, macchiato or flat white?',
          body: [
            {
              text: 'Think of them by the amount of milk. A macchiato has a spot; a cortado has a little, up to about as much as the coffee; a flat white has more, textured into fine microfoam. The table in the guide sets the espresso-and-milk drinks side by side.',
              sources: ['treccani-macchiare', 'dictcom-cortado', 'pdg-flat-white'],
            },
          ],
        },
      ],
    },
    ko: {
      name: '코르타도',
      aka: '스페인어로 café cortado',
      title: '코르타도란? 마키아토·플랫화이트와의 차이',
      description:
        '코르타도는 에스프레소에 따뜻한 우유를 조금 더해 ‘자른’ 커피입니다. 스페인어 이름의 뜻, 우유의 양, 마키아토와 플랫화이트 사이의 자리를 정리했습니다.',
      summary:
        '코르타도는 에스프레소를 따뜻한 우유 조금으로 ‘자른’ 커피입니다. 스페인 왕립 학술원 사전은 우유를 아주 조금 넣은 커피로 정의하고, 미국 사전 Dictionary.com은 에스프레소와 스팀 우유를 비슷한 양으로 섞은 음료로 설명합니다. 어느 쪽이든 작고, 커피 맛이 앞섭니다.',
      summarySources: ['rae-cafe', 'dictcom-cortado'],
      line: '에스프레소를 따뜻한 우유 조금으로 ‘자른’ 커피. 많아야 비슷한 양입니다.',
      facts: [
        { label: '재료', value: '에스프레소와 약간의 스팀 우유' },
        { label: '우유', value: '아주 조금에서 에스프레소와 비슷한 양까지' },
        { label: '이름', value: '스페인어 cortar(자르다)에서' },
      ],
      sections: [
        {
          id: 'name',
          heading: '‘코르타도’는 무슨 뜻인가',
          body: [
            {
              text: '스페인어 동사 cortar(자르다)의 과거분사입니다. 스페인 왕립 학술원(RAE) 사전은 café cortado를 ‘우유를 아주 조금 넣은 커피’로 풀이합니다.',
              sources: ['rae-cortado', 'rae-cafe'],
            },
            {
              text: '미국 사전 Dictionary.com은 스팀 우유의 양을 에스프레소와 비슷한 정도로 봅니다.',
              sources: ['dictcom-cortado'],
            },
          ],
        },
        {
          id: 'compared',
          heading: '코르타도, 마키아토, 플랫화이트는 어떻게 다른가',
          body: [
            {
              text: '우유의 양으로 나누면 쉽습니다. 마키아토는 한 점, 코르타도는 조금에서 커피와 비슷한 양까지, 플랫화이트는 그보다 많고 고운 마이크로폼으로 질감을 냅니다. 가이드의 비교표에서 우유를 넣는 에스프레소 음료를 한눈에 볼 수 있습니다.',
              sources: ['treccani-macchiare', 'dictcom-cortado', 'pdg-flat-white'],
            },
          ],
        },
      ],
    },
  },
};

export default cortado;
