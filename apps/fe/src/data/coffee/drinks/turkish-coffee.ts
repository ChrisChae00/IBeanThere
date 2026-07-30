import type { CoffeeDrink } from '../types';

const turkishCoffee: CoffeeDrink = {
  slug: 'turkish-coffee',
  categoryId: 'brewing',
  content: {
    en: {
      name: 'Turkish Coffee',
      tagline: 'In the Ottoman Empire, a wife could divorce her husband for one reason: he stopped making her coffee.',
      description:
        'In the Ottoman Empire, coffee was written into marriage contracts. A husband who stopped making his wife\'s daily cup could legally be divorced for it — no drink before or since has carried that kind of weight.\n\nThe method hasn\'t changed since. Coffee ground to near-powder simmers in a small copper cezve with water and sugar stirred in before heat, never after. Nothing gets filtered — you drink down to the thick, muddy last sip, then stop. In the Balkans and Middle East, what\'s left in the cup gets read like tea leaves, a ritual called tasseography practiced for centuries. UNESCO recognized the whole culture around it in 2013. Some coffee evolves. This one just got official protection for staying exactly the same.',
      origin:
        'Coffee reached the Ottoman Empire in the 15th century via Yemen and quickly became central to social life. The Turkish method of preparation — unfiltered, simmered in a cezve — spread across the empire and into Europe, becoming the template for how coffee was consumed worldwide until espresso changed everything in the 20th century. UNESCO recognized Turkish coffee culture as Intangible Cultural Heritage in 2013.',
      funFact:
        'In Ottoman times, a woman could divorce her husband if he failed to provide her with a daily supply of coffee. It was written into marriage contracts.',
    },
    ko: {
      name: '터키식 커피',
      tagline: '오스만 제국에서는 아내에게 매일 커피를 타주지 않으면 이혼당할 수 있었다.',
      description:
        '오스만 제국에서는 커피가 혼인 계약서에 명시된 의무였습니다. 남편이 아내에게 매일 커피를 타주지 않으면 이혼 사유가 될 수 있었죠. 어떤 음료도 이만큼 무거운 책임을 짊어진 적은 없습니다.\n\n방식은 그때나 지금이나 같습니다. 파우더에 가까울 정도로 곱게 간 원두를 작은 구리 체즈베에 물, 그리고 설탕을 (끓이기 전에) 넣고 천천히 끓입니다. 걸러내는 과정은 없습니다. 잔 바닥에 진한 찌꺼기가 남기 직전까지 마시고 멈추죠. 발칸반도와 중동에서는 잔에 남은 찌꺼기 모양으로 점을 치는 타세오그래피가 수백 년째 이어져 왔습니다. 2013년 유네스코는 이 문화 전체를 무형문화유산으로 지정했습니다. 대부분의 커피는 시대에 맞춰 변합니다. 이 커피는 변하지 않은 덕분에 공식적으로 보호받았습니다.',
      origin:
        '커피는 15세기 예멘을 통해 오스만 제국에 전해졌고, 빠르게 사교 생활의 중심이 되었습니다. 체즈베로 끓이는 터키식 방식은 제국 전역과 유럽으로 퍼지며, 20세기 에스프레소가 등장하기 전까지 전 세계 커피 소비의 기준이 되었습니다. 유네스코는 2013년 터키 커피 문화를 무형문화유산으로 등재했습니다.',
      funFact:
        '오스만 시대에는 남편이 아내에게 매일 커피를 제공하지 않으면, 아내가 이혼을 청구할 수 있었습니다. 결혼 계약서에 명시된 조항이었습니다.',
    },
  },
};

export default turkishCoffee;
