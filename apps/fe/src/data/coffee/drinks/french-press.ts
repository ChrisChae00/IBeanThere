import type { CoffeeDrink } from '../types';

const frenchPress: CoffeeDrink = {
  slug: 'french-press',
  categoryId: 'brewing',
  reviewed: '2026-09-11',
  related: ['pour-over', 'aeropress', 'cold-brew'],
  content: {
    en: {
      name: 'French press',
      aka: 'Also called a cafetière or a plunger',
      title: 'French press coffee: how it works and where the design came from',
      description:
        'A French press steeps coarse coffee in hot water, then presses a metal mesh filter through it. Why it tastes heavier than filter coffee, and the patents behind the design.',
      summary:
        'A French press brews by immersion: coarse grounds sit in hot water for a few minutes, then a plunger with a metal mesh filter pushes them to the bottom of the pot. The mesh lets coffee oils and very fine particles through, so the cup is fuller-bodied and slightly cloudier than filter coffee.',
      line: 'Coarse coffee steeped in hot water, then held back by pressing a metal mesh filter down through the pot.',
      facts: [
        { label: 'In the cup', value: 'Coffee and water, strained through metal mesh' },
        { label: 'Grind', value: 'Coarse' },
        { label: 'Method', value: 'Steep, then press' },
        { label: 'Body', value: 'Heavy, with a little sediment' },
      ],
      sections: [
        {
          id: 'history',
          heading: 'Is the French press actually French?',
          body: [
            {
              text: 'Partly. Two French inventors, Mayer and Delforge, patented a plunger device in 1852, but Barista Hustle’s history of the brewer found no evidence that their design was ever produced.',
              sources: ['bh-french-press'],
            },
            {
              text: 'The design most presses still follow comes from Milan. Ugo Paolini’s coffee press — a vessel with a piston-like filter held in place by a spring — was filed in Italy in 1928 and in the United States in 1929, with the rights assigned to Attilio Calimani and Giulio Moneta. The US patent was granted in 1931.',
              sources: ['patent-paolini', 'bh-french-press'],
            },
          ],
        },
        {
          id: 'oils',
          heading: 'Why does French press coffee taste heavier?',
          body: [
            {
              text: 'Only a mesh stands between the grounds and the cup, so the coffee’s oils come through with it. Those oils carry diterpenes such as cafestol, which Harvard’s Nutrition Source says can raise LDL cholesterol; filtered coffee contains almost none. Pouring the finished press through a paper filter removes them if that matters to you, at the cost of some of the body.',
              sources: ['harvard-coffee'],
            },
          ],
        },
      ],
    },
    ko: {
      name: '프렌치프레스',
      aka: '카페티에르, 플런저라고도 부릅니다',
      title: '프렌치프레스 커피: 원리와 설계의 기원',
      description:
        '프렌치프레스는 굵게 간 원두를 뜨거운 물에 우린 뒤 금속 망 필터를 눌러 거르는 도구입니다. 필터 커피보다 묵직한 이유와 설계의 특허 기록을 정리했습니다.',
      summary:
        '프렌치프레스는 담가 우리는 방식입니다. 굵게 간 원두를 뜨거운 물에 몇 분 담가 둔 뒤, 금속 망이 달린 플런저를 눌러 가루를 바닥으로 밀어 냅니다. 망은 커피 기름과 아주 고운 입자를 통과시키기 때문에, 필터 커피보다 묵직하고 약간 탁합니다.',
      line: '굵게 간 원두를 뜨거운 물에 우린 뒤, 금속 망 필터를 눌러 가루를 걸러 내는 방식.',
      facts: [
        { label: '재료', value: '원두와 물, 금속 망으로 거름' },
        { label: '분쇄', value: '굵게' },
        { label: '방식', value: '우린 뒤 누름' },
        { label: '바디감', value: '묵직하고 약간의 앙금' },
      ],
      sections: [
        {
          id: 'history',
          heading: '프렌치프레스는 정말 프랑스에서 왔나',
          body: [
            {
              text: '절반만 맞습니다. 1852년 프랑스의 발명가 마이어와 델포르주가 플런저 장치로 특허를 받았지만, 바리스타 허슬은 이 설계가 실제로 생산됐다는 증거를 찾지 못했다고 적고 있습니다.',
              sources: ['bh-french-press'],
            },
            {
              text: '지금 쓰는 프레스 대부분의 원형은 밀라노에서 나왔습니다. 스프링으로 고정되는 피스톤형 필터를 단 우고 파올리니의 커피 프레스가 1928년 이탈리아에, 1929년 미국에 출원됐고, 권리는 아틸리오 칼리마니와 줄리오 모네타에게 넘어갔습니다. 미국 특허는 1931년에 등록됐습니다.',
              sources: ['patent-paolini', 'bh-french-press'],
            },
          ],
        },
        {
          id: 'oils',
          heading: '왜 필터 커피보다 묵직한가',
          body: [
            {
              text: '가루와 잔 사이에 금속 망 하나뿐이라 커피 기름이 함께 넘어옵니다. 이 기름에는 카페스톨 같은 디테르펜이 들어 있는데, 하버드 공중보건대학원의 Nutrition Source는 이것이 LDL 콜레스테롤을 높일 수 있고 필터 커피에는 거의 없다고 설명합니다. 신경이 쓰인다면 다 우린 커피를 종이 필터에 한 번 더 거르면 됩니다. 대신 묵직함도 일부 사라집니다.',
              sources: ['harvard-coffee'],
            },
          ],
        },
      ],
    },
  },
};

export default frenchPress;
