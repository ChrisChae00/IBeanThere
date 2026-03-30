import type { CoffeeDrink } from '../types';

const turkishCoffee: CoffeeDrink = {
  slug: 'turkish-coffee',
  categoryId: 'brewing',
  content: {
    en: {
      name: 'Turkish Coffee',
      tagline: 'Unfiltered, uncompromising, ancient.',
      description:
        'Turkish coffee is one of the oldest brewing methods still practiced today. Finely ground coffee — almost powder-fine — is simmered in a small copper or brass pot called a cezve along with water and optional sugar. The key distinction: the grounds are never filtered out. You drink right down to the muddy bottom, then stop.\n\nThe result is intensely concentrated, with a velvety body and complex bitterness that filtered brews simply cannot replicate. Sugar, if added, goes in during brewing — never after. The ritual of reading coffee grounds left in the cup (tasseography) has been practiced for centuries across the Middle East and the Balkans.',
      origin:
        'Coffee reached the Ottoman Empire in the 15th century via Yemen and quickly became central to social life. The Turkish method of preparation — unfiltered, simmered in a cezve — spread across the empire and into Europe, becoming the template for how coffee was consumed worldwide until espresso changed everything in the 20th century. UNESCO recognized Turkish coffee culture as Intangible Cultural Heritage in 2013.',
      funFact:
        'In Ottoman times, a woman could divorce her husband if he failed to provide her with a daily supply of coffee. It was written into marriage contracts.',
    },
    ko: {
      name: '터키식 커피',
      tagline: '걸러내지 않는, 타협 없는, 가장 오래된 커피.',
      description:
        '터키식 커피는 현재까지 이어지는 가장 오래된 추출 방식 중 하나입니다. 파우더에 가까울 정도로 곱게 갈린 원두를 체즈베(cezve)라는 작은 구리 냄비에 물, 그리고 선택적으로 설탕과 함께 넣고 천천히 끓입니다. 핵심은 이 커피를 걸러내지 않는다는 것. 잔 바닥에 커피 가루가 가라앉고, 그 직전까지 마십니다.\n\n결과물은 강렬하게 농축된 바디감과 필터 커피로는 절대 만들 수 없는 복합적인 쓴맛을 가집니다. 설탕을 넣는다면 끓이기 전에 넣어야 하며, 다 마신 후 잔에 남은 커피 찌꺼기 모양으로 점을 치는 타세오그래피(tasseography)는 수백 년간 이어온 문화입니다.',
      origin:
        '커피는 15세기 예멘을 통해 오스만 제국에 전해졌고, 빠르게 사교 생활의 중심이 되었습니다. 체즈베로 끓이는 터키식 방식은 제국 전역과 유럽으로 퍼지며, 20세기 에스프레소가 등장하기 전까지 전 세계 커피 소비의 기준이 되었습니다. 유네스코는 2013년 터키 커피 문화를 무형문화유산으로 등재했습니다.',
      funFact:
        '오스만 시대에는 남편이 아내에게 매일 커피를 제공하지 않으면, 아내가 이혼을 청구할 수 있었습니다. 결혼 계약서에 명시된 조항이었습니다.',
    },
  },
};

export default turkishCoffee;
