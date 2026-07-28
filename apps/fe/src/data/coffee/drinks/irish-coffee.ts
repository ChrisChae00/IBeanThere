import type { CoffeeDrink } from '../types';

const irishCoffee: CoffeeDrink = {
  slug: 'irish-coffee',
  categoryId: 'signature',
  content: {
    en: {
      name: 'Irish Coffee',
      tagline: 'Hot coffee, Irish whiskey, and cream. Born from a cold airport night.',
      description:
        'Irish coffee is hot coffee mixed with Irish whiskey and sugar, topped with a layer of lightly whipped cream that sits on top rather than mixing in. The traditional method involves warming the glass, dissolving the sugar in the coffee, adding whiskey, then floating the cream over the back of a spoon.\n\nThe combination works because the whiskey\'s warmth and sweetness complement the coffee\'s bitterness, while the cream provides a contrasting coolness and richness. It\'s both a cocktail and a coffee, occupying an unusual category that spans drinks and desserts.',
      origin:
        'Irish coffee was invented in 1943 by Joe Sheridan, a chef at Foynes airbase (now Shannon Airport) in Ireland. On a cold winter night, he added whiskey to the coffee of American passengers whose flight had turned back due to weather. When one passenger asked if the coffee was Brazilian, Sheridan reportedly replied, "No, that\'s Irish coffee." The drink was later introduced to the US by travel writer Stanton Delaplane, who brought the recipe to the Buena Vista Café in San Francisco.',
      funFact:
        'The Buena Vista Café in San Francisco is said to have served over 65 million Irish coffees since 1952. They make them assembly-line style — rows of glasses, all being filled simultaneously. The café considers it a point of pride to maintain the same recipe and technique since its introduction.',
    },
    ko: {
      name: '아이리시 커피',
      tagline: '뜨거운 커피, 아이리시 위스키, 크림. 추운 공항의 밤에서 태어났다.',
      description:
        '아이리시 커피는 아이리시 위스키와 설탕을 넣은 뜨거운 커피 위에 가볍게 휘핑한 크림을 섞이지 않게 올린 음료입니다. 전통적인 방법은 잔을 예열하고, 설탕을 커피에 녹이고, 위스키를 추가한 다음 스푼 뒷면을 이용해 크림을 띄우는 것입니다.\n\n조합이 잘 맞는 이유는 위스키의 온기와 달콤함이 커피의 쓴맛을 보완하고, 크림이 대조적인 시원함과 풍부함을 제공하기 때문입니다. 칵테일이자 커피이며, 음료와 디저트를 아우르는 특이한 카테고리를 차지합니다.',
      origin:
        '아이리시 커피는 1943년 아일랜드 포인스 공군 기지(현재 섀넌 공항)의 요리사 조 셰리던(Joe Sheridan)이 발명했습니다. 추운 겨울 밤, 기상 악화로 비행기가 되돌아온 미국 승객들의 커피에 위스키를 추가한 것이 시작이었습니다. 승객 중 한 명이 브라질 커피냐고 묻자 셰리던이 "아니요, 이건 아이리시 커피입니다"라고 답했다고 전해집니다. 이후 여행 작가 스탠튼 들라플레인(Stanton Delaplane)이 레시피를 미국 샌프란시스코의 부에나 비스타 카페에 소개했습니다.',
      funFact:
        '샌프란시스코의 부에나 비스타 카페는 1952년 이후 6,500만 잔 이상의 아이리시 커피를 제공했다고 전해집니다. 조립 라인 방식으로 만들며 — 여러 잔이 동시에 채워집니다. 이 카페는 도입 이후 동일한 레시피와 기술을 유지하는 것을 자랑스럽게 여깁니다.',
    },
  },
};

export default irishCoffee;
