import type { CoffeeDrink } from '../types';

const pourOver: CoffeeDrink = {
  slug: 'pour-over',
  categoryId: 'brewing',
  reviewed: '2026-09-11',
  related: ['french-press', 'aeropress', 'cold-brew'],
  content: {
    en: {
      name: 'Pour-over',
      aka: 'Also called hand drip or filter coffee',
      title: 'Pour-over (hand drip) coffee: what it is and who invented the filter',
      description:
        'Pour-over, or hand drip, is filter coffee made by pouring hot water over ground coffee by hand. How it differs from French press, and the dated history of the paper filter.',
      summary:
        'Pour-over is filter coffee made by hand: hot water is poured slowly over ground coffee sitting in a filter, and gravity draws the coffee through into a cup or carafe. In Korea and Japan the same method is usually called hand drip. The filter holds back the grounds and most of the oils, so the cup is light-bodied and clear.',
      line: 'Hot water poured by hand over ground coffee in a filter, dripping through into the cup.',
      facts: [
        { label: 'In the cup', value: 'Coffee and water, filtered' },
        { label: 'Grind', value: 'Medium-fine' },
        { label: 'Gear', value: 'A dripper and a filter, usually paper' },
        { label: 'Body', value: 'Light, with almost no sediment' },
      ],
      sections: [
        {
          id: 'paper-filter',
          heading: 'Who invented the coffee filter?',
          body: [
            {
              text: 'On 20 June 1908 Melitta Bentz, a housewife in Dresden, registered a coffee filter with the Imperial Patent Office in Berlin: a cup with a domed underside and angled holes, lined with paper. Until then, the German Patent and Trade Mark Office notes, coffee was usually made by letting the grounds settle in the pot or by sieving them, which left grit and an unpleasant aftertaste in the cup.',
              sources: ['dpma-melitta'],
            },
            {
              text: 'The Chemex, designed in 1941 by the chemist Peter Schlumbohm, borrowed the same idea from the laboratory: a glass flask with a paper filter in its neck. The Denver Art Museum holds one in its collection.',
              sources: ['denver-chemex'],
            },
          ],
        },
        {
          id: 'vs-french-press',
          heading: 'How is pour-over different from a French press?',
          body: [
            {
              text: 'The filter is the difference. In a French press the grounds steep in the water and a metal mesh holds them back, so fine particles and coffee oils reach the cup. A paper filter catches both. Harvard’s Nutrition Source notes that filtered coffee contains almost none of the diterpenes, found in unfiltered coffee, that can raise LDL cholesterol.',
              sources: ['harvard-coffee'],
            },
          ],
        },
        {
          id: 'ordering',
          heading: 'What does “hand drip” mean on a café menu?',
          body: [
            {
              text: 'Usually one cup brewed to order by pouring, often from a coffee you choose on the menu. It takes a few minutes longer than an espresso drink, and it is the plainest way to taste what a particular coffee is like.',
            },
          ],
        },
      ],
    },
    ko: {
      name: '푸어오버',
      aka: '핸드드립, 필터 커피라고도 부릅니다',
      title: '푸어오버(핸드드립) 커피란? 방식과 필터의 역사',
      description:
        '푸어오버, 곧 핸드드립은 분쇄한 원두 위에 뜨거운 물을 손으로 부어 내리는 필터 커피입니다. 프렌치프레스와의 차이와 종이 필터의 역사를 정리했습니다.',
      summary:
        '푸어오버는 손으로 내리는 필터 커피입니다. 필터에 담은 원두 가루 위로 뜨거운 물을 천천히 부으면, 커피가 중력으로 걸러져 잔이나 서버로 떨어집니다. 한국과 일본에서는 보통 핸드드립이라고 부릅니다. 필터가 가루와 기름 성분 대부분을 걸러 내기 때문에 맛이 가볍고 깔끔합니다.',
      line: '필터에 담은 원두 가루 위로 뜨거운 물을 손으로 부어 잔으로 떨어뜨리는 방식.',
      facts: [
        { label: '재료', value: '원두와 물, 필터로 거름' },
        { label: '분쇄', value: '중간보다 약간 고운 굵기' },
        { label: '도구', value: '드리퍼와 필터(주로 종이)' },
        { label: '바디감', value: '가볍고 찌꺼기가 거의 없음' },
      ],
      sections: [
        {
          id: 'paper-filter',
          heading: '커피 필터는 누가 만들었나',
          body: [
            {
              text: '1908년 6월 20일, 드레스덴의 주부 멜리타 벤츠가 베를린 제국특허청에 커피 필터를 등록했습니다. 바닥이 둥글고 비스듬한 구멍을 낸 컵에 종이를 깐 형태였습니다. 독일 특허상표청은 그 전까지 커피를 대개 가루가 가라앉기를 기다리거나 체로 걸러 마셨고, 그래서 잔에 가루와 텁텁한 뒷맛이 남았다고 설명합니다.',
              sources: ['dpma-melitta'],
            },
            {
              text: '1941년 화학자 페터 슐룸봄이 디자인한 케멕스는 같은 원리를 실험실에서 가져왔습니다. 유리 플라스크 목에 종이 필터를 끼운 모양입니다. 덴버 미술관이 실물을 소장하고 있습니다.',
              sources: ['denver-chemex'],
            },
          ],
        },
        {
          id: 'vs-french-press',
          heading: '프렌치프레스와 무엇이 다른가',
          body: [
            {
              text: '차이는 필터에 있습니다. 프렌치프레스는 가루를 물에 담가 우린 뒤 금속 망으로 거르기 때문에 미세한 입자와 커피 기름이 잔에 들어옵니다. 종이 필터는 둘 다 걸러 냅니다. 하버드 공중보건대학원의 Nutrition Source는 거르지 않은 커피에 LDL 콜레스테롤을 높일 수 있는 디테르펜이 들어 있고, 필터 커피에는 거의 없다고 설명합니다.',
              sources: ['harvard-coffee'],
            },
          ],
        },
        {
          id: 'ordering',
          heading: '카페 메뉴의 ‘핸드드립’은 무엇을 뜻하나',
          body: [
            {
              text: '대개 주문을 받은 뒤 한 잔씩 부어 내리는 커피이고, 메뉴에 있는 원두 가운데 하나를 고르는 경우가 많습니다. 에스프레소 음료보다 몇 분 더 걸리지만, 한 가지 원두의 맛을 가장 그대로 느낄 수 있는 방법입니다.',
            },
          ],
        },
      ],
    },
  },
};

export default pourOver;
