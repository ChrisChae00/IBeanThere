import type { CoffeeDrink } from '../types';

const einspanner: CoffeeDrink = {
  slug: 'einspanner',
  categoryId: 'added',
  reviewed: '2026-09-11',
  related: ['cappuccino', 'irish-coffee', 'americano'],
  content: {
    en: {
      name: 'Einspänner',
      aka: 'Written Einspanner without the umlaut; related to espresso con panna',
      title: 'Einspänner vs espresso con panna: the Viennese cream coffee explained',
      description:
        'An Einspänner is a Viennese coffee-house drink of espresso and hot water under whipped cream. What the name means, the story attached to it, and how it differs from espresso con panna.',
      summary:
        'An Einspänner is a Viennese coffee-house drink: espresso lengthened with hot water under a generous layer of whipped cream. Its Italian relative, espresso con panna, is a plain espresso with whipped cream on top.',
      summarySources: ['austria-coffeehouse'],
      line: 'Espresso and hot water under a thick cap of whipped cream, from Vienna’s coffee houses.',
      facts: [
        { label: 'In the cup', value: 'Espresso, hot water, whipped cream' },
        { label: 'Name', value: 'German for a one-horse carriage' },
        { label: 'Relatives', value: 'Espresso con panna, Kapuziner, Franziskaner' },
      ],
      sections: [
        {
          id: 'name',
          heading: 'Why is it called an Einspänner?',
          body: [
            {
              text: 'The word means a one-horse carriage, as the Austrian National Tourist Office’s guide to coffee-house drinks notes.',
              sources: ['austria-coffeehouse'],
            },
            {
              text: 'It is often said that the drink was made for the drivers of those carriages, with the cream keeping the coffee warm on their rounds. We did not find an early record of that, so it is best read as a story.',
            },
          ],
        },
        {
          id: 'con-panna',
          heading: 'Einspänner or espresso con panna?',
          body: [
            {
              text: 'Con panna is Italian for “with cream,” and Treccani describes panna montata, usually sweetened whipped cream, as something added to hot drinks. An espresso con panna is a single espresso under that cream; an Einspänner adds hot water beneath it, so it is longer and milder.',
              sources: ['treccani-panna', 'austria-coffeehouse'],
            },
          ],
        },
        {
          id: 'vienna',
          heading: 'What other coffees does Vienna serve?',
          body: [
            {
              text: 'Vienna names its coffees precisely. The same guide lists the Kapuziner, an espresso with a few drops of cream; the Franziskaner, espresso with hot water, hot milk and whipped cream; and the Verlängerter, espresso with the same amount of hot water.',
              sources: ['austria-coffeehouse'],
            },
          ],
        },
      ],
    },
    ko: {
      name: '아인슈페너',
      aka: '독일어로 Einspänner · 에스프레소 콘 파나와 가까운 음료',
      title: '아인슈페너와 에스프레소 콘 파나 차이: 빈의 크림 커피',
      description:
        '아인슈페너는 에스프레소와 뜨거운 물 위에 휘핑크림을 올린 빈 커피하우스의 음료입니다. 이름의 뜻, 따라붙는 이야기, 에스프레소 콘 파나와의 차이를 정리했습니다.',
      summary:
        '아인슈페너는 빈 커피하우스의 음료로, 에스프레소에 뜨거운 물을 더하고 그 위에 휘핑크림을 넉넉히 올립니다. 이탈리아의 비슷한 음료인 에스프레소 콘 파나는 물 없이 에스프레소 위에 휘핑크림만 올립니다.',
      summarySources: ['austria-coffeehouse'],
      line: '에스프레소와 뜨거운 물 위에 휘핑크림을 두껍게 올린 빈 커피하우스의 음료.',
      facts: [
        { label: '재료', value: '에스프레소, 뜨거운 물, 휘핑크림' },
        { label: '이름', value: '독일어로 ‘말 한 필이 끄는 마차’' },
        { label: '가까운 음료', value: '에스프레소 콘 파나, 카푸치너, 프란치스카너' },
      ],
      sections: [
        {
          id: 'name',
          heading: '왜 아인슈페너라고 부르나',
          body: [
            {
              text: '오스트리아 관광청의 커피하우스 음료 안내에 따르면 이 말은 말 한 필이 끄는 마차를 뜻합니다.',
              sources: ['austria-coffeehouse'],
            },
            {
              text: '마부들이 마차 위에서 마시도록 크림으로 커피를 덮어 식지 않게 했다는 이야기가 흔히 따라붙지만, 이를 뒷받침하는 옛 기록은 찾지 못했습니다. 이야기로 받아들이는 편이 좋습니다.',
            },
          ],
        },
        {
          id: 'con-panna',
          heading: '아인슈페너와 에스프레소 콘 파나는 무엇이 다른가',
          body: [
            {
              text: '콘 파나(con panna)는 이탈리아어로 ‘크림과 함께’라는 뜻이고, 트레카니 사전은 판나 몬타타(panna montata), 곧 대개 설탕을 넣고 휘핑한 크림을 뜨거운 음료에 더하는 것으로 설명합니다. 에스프레소 콘 파나는 에스프레소 한 잔 위에 그 크림을 올리고, 아인슈페너는 그 아래에 뜨거운 물을 더해 더 길고 순합니다.',
              sources: ['treccani-panna', 'austria-coffeehouse'],
            },
          ],
        },
        {
          id: 'vienna',
          heading: '빈에는 어떤 커피가 더 있나',
          body: [
            {
              text: '빈은 커피 이름을 세밀하게 나눕니다. 같은 안내는 에스프레소에 크림 몇 방울을 떨어뜨린 카푸치너(Kapuziner), 에스프레소에 뜨거운 물과 우유, 휘핑크림을 더한 프란치스카너(Franziskaner), 에스프레소에 같은 양의 뜨거운 물을 더한 페어렝어터(Verlängerter)를 소개합니다.',
              sources: ['austria-coffeehouse'],
            },
          ],
        },
      ],
    },
  },
};

export default einspanner;
