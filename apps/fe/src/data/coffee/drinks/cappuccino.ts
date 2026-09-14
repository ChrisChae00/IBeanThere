import type { CoffeeDrink } from '../types';

const cappuccino: CoffeeDrink = {
  slug: 'cappuccino',
  categoryId: 'espresso',
  reviewed: '2026-09-11',
  related: ['cafe-latte', 'flat-white', 'macchiato'],
  content: {
    en: {
      name: 'Cappuccino',
      title: 'Cappuccino: what it is, how it differs from a latte, and why it is named after friars',
      description:
        'A cappuccino is espresso with steamed milk under a thick layer of foam. The Italian certified proportions, how it differs from a latte, and what the name has to do with Capuchin friars.',
      summary:
        'A cappuccino is espresso with steamed milk and a thick layer of milk foam, in a smaller cup than a latte. The Italian Espresso National Institute’s certified cappuccino is 25 ml of espresso with 100 ml of steamed milk, its foam a tight mesh of very fine bubbles.',
      summarySources: ['iei-espresso'],
      line: 'Espresso with steamed milk and a thick layer of foam, in a smaller cup than a latte.',
      facts: [
        { label: 'In the cup', value: 'Espresso, steamed milk, foam' },
        { label: 'Certified Italian recipe', value: '25 ml espresso, 100 ml steamed milk' },
        { label: 'Foam', value: 'At least 1 cm by competition rules' },
        { label: 'Name', value: 'From the colour of the Capuchin friars’ habit' },
      ],
      sections: [
        {
          id: 'vs-latte',
          heading: 'What is the difference between a cappuccino and a latte?',
          body: [
            {
              text: 'Foam and proportion. A cappuccino has less milk and much more foam, so it is smaller, tastes more of the coffee and feels lighter in the mouth; a latte is larger and milkier with a thin layer on top. Perfect Daily Grind notes that barista competitions require at least 1 cm of foam on a cappuccino, about twice what a flat white carries.',
              sources: ['pdg-flat-white'],
            },
          ],
        },
        {
          id: 'name',
          heading: 'Why is it called a cappuccino?',
          body: [
            {
              text: 'For its colour. Treccani defines cappuccino as a drink of espresso and milk “so called for its colour,” and the Online Etymology Dictionary links that colour to the brown hoods of the Capuchin friars, recording the word in English from 1948.',
              sources: ['treccani-cappuccino', 'etym-cappuccino'],
            },
            {
              text: 'Vienna named a different drink after the same friars: its Kapuziner is an espresso with a few drops of cream.',
              sources: ['austria-coffeehouse'],
            },
          ],
        },
      ],
    },
    ko: {
      name: '카푸치노',
      title: '카푸치노란? 라테와의 차이와 수도사에게서 온 이름',
      description:
        '카푸치노는 에스프레소에 스팀 우유와 두꺼운 거품층을 올린 음료입니다. 이탈리아 인증 비율, 라테와의 차이, 카푸친 수도회와 이름의 관계를 정리했습니다.',
      summary:
        '카푸치노는 에스프레소에 스팀 우유와 두꺼운 우유 거품을 올린 음료로, 라테보다 작은 잔에 담습니다. 이탈리아 국립 에스프레소 협회(INEI)가 인증하는 카푸치노는 에스프레소 25ml에 스팀 우유 100ml이고, 거품은 아주 고운 기포가 촘촘하게 짜인 상태여야 합니다.',
      summarySources: ['iei-espresso'],
      line: '에스프레소에 스팀 우유와 두꺼운 거품층을 올린, 라테보다 작은 음료.',
      facts: [
        { label: '재료', value: '에스프레소, 스팀 우유, 거품' },
        { label: '이탈리아 인증 레시피', value: '에스프레소 25ml, 스팀 우유 100ml' },
        { label: '거품', value: '대회 규정상 1cm 이상' },
        { label: '이름', value: '카푸친 수도복의 색에서' },
      ],
      sections: [
        {
          id: 'vs-latte',
          heading: '카푸치노와 라테는 무엇이 다른가',
          body: [
            {
              text: '거품과 비율입니다. 카푸치노는 우유가 적고 거품이 훨씬 많아 잔이 작고, 커피 맛이 더 나며 입에 가볍게 느껴집니다. 라테는 더 크고 우유가 많으며 거품은 얇습니다. 퍼펙트 데일리 그라인드에 따르면 바리스타 대회는 카푸치노에 최소 1cm의 거품을 요구하는데, 플랫화이트의 두 배쯤입니다.',
              sources: ['pdg-flat-white'],
            },
          ],
        },
        {
          id: 'name',
          heading: '왜 카푸치노라고 부르나',
          body: [
            {
              text: '색 때문입니다. 이탈리아어 사전 트레카니는 카푸치노를 ‘그 색 때문에 그렇게 불리는’ 에스프레소와 우유 음료로 정의하고, 온라인 어원 사전은 그 색을 카푸친 수도사들이 쓰던 갈색 두건과 연결하며 영어 기록을 1948년부터로 봅니다.',
              sources: ['treccani-cappuccino', 'etym-cappuccino'],
            },
            {
              text: '빈은 같은 수도사의 이름을 다른 음료에 붙였습니다. 빈의 카푸치너(Kapuziner)는 에스프레소에 크림을 몇 방울 떨어뜨린 커피입니다.',
              sources: ['austria-coffeehouse'],
            },
          ],
        },
      ],
    },
  },
};

export default cappuccino;
