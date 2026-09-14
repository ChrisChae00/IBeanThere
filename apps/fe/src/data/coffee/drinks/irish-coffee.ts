import type { CoffeeDrink } from '../types';

const irishCoffee: CoffeeDrink = {
  slug: 'irish-coffee',
  categoryId: 'added',
  reviewed: '2026-09-11',
  related: ['einspanner', 'affogato', 'americano'],
  content: {
    en: {
      name: 'Irish coffee',
      title: 'Irish coffee: what it is, the Foynes story, and how it reached San Francisco',
      description:
        'Irish coffee is hot sweetened coffee with Irish whiskey under a layer of cream. The Foynes airport story, the competing Dublin claim, and how the Buena Vista brought it to the US in 1952.',
      summary:
        'Irish coffee is hot, sweetened coffee with Irish whiskey, under a layer of cream that floats on top instead of being stirred in, so the hot coffee is drunk through the cold cream. It is usually served in a stemmed glass, and it contains alcohol.',
      line: 'Hot coffee with Irish whiskey and sugar, under a floating layer of cream.',
      facts: [
        { label: 'In the cup', value: 'Coffee, Irish whiskey, sugar, cream' },
        { label: 'Served', value: 'Hot, in a stemmed glass' },
        { label: 'Alcohol', value: 'Yes' },
      ],
      sections: [
        {
          id: 'origin',
          heading: 'Who invented Irish coffee?',
          body: [
            {
              text: 'The best-known account comes from Foynes, the flying-boat terminal on the Shannon estuary. As EPIC, the Irish emigration museum in Dublin, tells it, on a winter night in 1943 a New York-bound flight turned back in bad weather, and the chef, Joe Sheridan, added whiskey to the returning passengers’ coffee. A few weeks later he presented it in a stemmed glass topped with cream, and it went on the airport’s menu.',
              sources: ['epic-irish'],
            },
            {
              text: 'EPIC also says the story is debated. An essay by the Harvard professor John V. Kelleher argues that Michael Nugent of the Dolphin Hotel in Dublin made the drink some three years earlier; what is certain is that Sheridan’s airport made it known internationally.',
              sources: ['epic-irish', 'kqed-irish'],
            },
          ],
        },
        {
          id: 'san-francisco',
          heading: 'How did Irish coffee reach America?',
          body: [
            {
              text: 'Through San Francisco. The travel writer Stanton Delaplane had it at Shannon, and in November 1952 he and Jack Koeppler, owner of the Buena Vista café near Fisherman’s Wharf, tried to reproduce it. The cream kept sinking. KQED reports that the recipe they settled on used aged cream, whipped so that it would float, and that the café has served it the same way since.',
              sources: ['epic-irish', 'kqed-irish'],
            },
          ],
        },
      ],
    },
    ko: {
      name: '아이리시 커피',
      title: '아이리시 커피: 포인스 공항 이야기와 샌프란시스코로 건너간 과정',
      description:
        '아이리시 커피는 설탕을 넣은 뜨거운 커피에 아이리시 위스키를 더하고 크림을 띄운 음료입니다. 포인스 공항 이야기, 더블린 기원설, 1952년 부에나 비스타를 통한 미국 전파를 정리했습니다.',
      summary:
        '아이리시 커피는 설탕을 넣은 뜨거운 커피에 아이리시 위스키를 더하고, 젓지 않고 위에 크림층을 띄운 음료입니다. 차가운 크림을 지나 뜨거운 커피를 마시게 됩니다. 보통 굽 달린 유리잔에 내고, 알코올이 들어 있습니다.',
      line: '설탕을 넣은 뜨거운 커피에 아이리시 위스키를 더하고 크림을 띄운 음료.',
      facts: [
        { label: '재료', value: '커피, 아이리시 위스키, 설탕, 크림' },
        { label: '제공', value: '뜨겁게, 굽 달린 유리잔에' },
        { label: '알코올', value: '있음' },
      ],
      sections: [
        {
          id: 'origin',
          heading: '아이리시 커피는 누가 만들었나',
          body: [
            {
              text: '가장 널리 알려진 이야기는 섀넌강 어귀의 비행정 터미널 포인스에서 나옵니다. 더블린의 아일랜드 이민 박물관 EPIC에 따르면 1943년 어느 겨울밤 뉴욕행 비행기가 악천후로 되돌아왔고, 셰프 조 셰리던이 돌아온 승객들의 커피에 위스키를 넣었습니다. 몇 주 뒤 그는 이를 굽 달린 유리잔에 크림을 얹어 내놓았고, 공항 메뉴에 올랐습니다.',
              sources: ['epic-irish'],
            },
            {
              text: 'EPIC은 이 이야기에 논란이 있다고도 적습니다. 하버드 교수 존 V. 켈러허는 한 에세이에서 더블린 돌핀 호텔의 마이클 뉴전트가 3년쯤 먼저 만들었다고 주장합니다. 확실한 것은 셰리던이 일한 공항이 이 음료를 세계에 알렸다는 점입니다.',
              sources: ['epic-irish', 'kqed-irish'],
            },
          ],
        },
        {
          id: 'san-francisco',
          heading: '아이리시 커피는 어떻게 미국에 전해졌나',
          body: [
            {
              text: '샌프란시스코를 거쳤습니다. 여행 작가 스탠턴 델라플레인이 섀넌 공항에서 이 커피를 맛봤고, 1952년 11월 피셔맨스 워프 근처 부에나 비스타 카페의 주인 잭 쾨플러와 함께 재현을 시도했습니다. 크림이 계속 가라앉았습니다. KQED에 따르면 두 사람이 정착한 레시피는 숙성시킨 크림을 휘핑해 뜨게 만드는 것이었고, 카페는 지금도 같은 방식으로 냅니다.',
              sources: ['epic-irish', 'kqed-irish'],
            },
          ],
        },
      ],
    },
  },
};

export default irishCoffee;
