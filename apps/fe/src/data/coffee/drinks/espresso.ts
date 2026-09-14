import type { CoffeeDrink } from '../types';

const espresso: CoffeeDrink = {
  slug: 'espresso',
  categoryId: 'espresso',
  reviewed: '2026-09-11',
  related: ['americano', 'macchiato', 'moka-pot'],
  content: {
    en: {
      name: 'Espresso',
      aka: 'Also ristretto (shorter) and lungo (longer)',
      title: 'Espresso: what it is, what the name means, and who invented the machine',
      description:
        'Espresso is a short, concentrated coffee made by forcing hot water through fine coffee at high pressure. What the name means, how the machine developed, and ristretto vs lungo.',
      summary:
        'Espresso is a short, concentrated coffee made by forcing hot water through a compact bed of finely ground coffee at high pressure. The Italian Espresso National Institute’s certified single shot is about 25 ml, topped with a fine, hazel-to-dark-brown foam called crema. Americanos, lattes, cappuccinos and flat whites all start from it.',
      summarySources: ['iei-espresso'],
      line: 'A small, concentrated coffee made by forcing hot water through fine coffee at high pressure.',
      facts: [
        { label: 'In the cup', value: 'About 25 ml for a certified Italian single' },
        { label: 'Pressure', value: 'Around 8–10 bar' },
        { label: 'On top', value: 'Crema, a fine brown foam' },
        { label: 'Shorter / longer', value: 'Ristretto / lungo' },
      ],
      sections: [
        {
          id: 'name',
          heading: 'What does “espresso” mean?',
          body: [
            {
              text: 'The Online Etymology Dictionary traces it to Italian caffè espresso, “pressed-out coffee,” from the verb esprimere, and records it in English from 1945.',
              sources: ['etym-espresso'],
            },
            {
              text: 'Speed was part of the sense from the start: Smithsonian Magazine notes that Desiderio Pavoni marketed his early machines as making coffee “on the spur of the moment.”',
              sources: ['smithsonian-espresso'],
            },
          ],
        },
        {
          id: 'history',
          heading: 'Who invented the espresso machine?',
          body: [
            {
              text: 'Several people, in steps. Angelo Moriondo of Turin patented a steam machine in 1884 that pushed water through a large bed of coffee on demand; no example of it survives. In the early 1900s Luigi Bezzera built a machine that brewed single cups directly, Desiderio Pavoni bought his patents in 1903, and at the 1906 Milan Fair the two presented “caffè espresso.”',
              sources: ['smithsonian-espresso'],
            },
            {
              text: 'Those machines ran on steam and reached about 2 bar, which gave the coffee a burnt taste and would not count as espresso today. After the Second World War, Achille Gaggia’s spring-piston lever raised the pressure to 8–10 bar, and crema arrived with it. Smithsonian relays an anecdote that customers were wary of the foam until Gaggia began calling it “caffe creme,” and notes that baristas working his levers coined the phrase “pulling a shot.”',
              sources: ['smithsonian-espresso'],
            },
          ],
        },
        {
          id: 'ristretto-lungo',
          heading: 'What are ristretto and lungo?',
          body: [
            {
              text: 'The same method at different lengths. A ristretto lets less water through the coffee, giving a smaller, denser shot; Treccani gives un caffè ristretto as its example of the sense “reduced in volume, concentrated.” A lungo lets more water through; Treccani defines lungo, for a drink, as containing more water than usual.',
              sources: ['treccani-ristretto', 'treccani-lungo'],
            },
            {
              text: 'An americano is not a lungo. In a lungo the extra water passes through the coffee and extracts more from it; in an americano a normal shot is pulled and hot water is added to the cup afterwards.',
            },
          ],
        },
      ],
    },
    ko: {
      name: '에스프레소',
      aka: '더 짧게 뽑으면 리스트레토, 길게 뽑으면 룽고',
      title: '에스프레소란? 이름의 뜻과 머신의 역사, 리스트레토·룽고 차이',
      description:
        '에스프레소는 곱게 간 원두에 높은 압력으로 뜨거운 물을 통과시켜 뽑는 짧고 진한 커피입니다. 이름의 뜻, 머신의 발달, 리스트레토와 룽고의 차이를 정리했습니다.',
      summary:
        '에스프레소는 곱게 갈아 단단히 다진 원두에 높은 압력으로 뜨거운 물을 통과시켜 뽑는 짧고 진한 커피입니다. 이탈리아 국립 에스프레소 협회(INEI)가 인증하는 한 잔은 약 25ml이고, 위에 크레마라는 곱고 갈색빛 도는 거품이 덮입니다. 아메리카노, 라테, 카푸치노, 플랫화이트가 모두 여기서 출발합니다.',
      summarySources: ['iei-espresso'],
      line: '곱게 간 원두에 높은 압력으로 뜨거운 물을 통과시켜 뽑는 짧고 진한 커피.',
      facts: [
        { label: '양', value: '이탈리아 인증 기준 한 잔 약 25ml' },
        { label: '압력', value: '약 8~10바' },
        { label: '위층', value: '크레마, 고운 갈색 거품' },
        { label: '짧게 / 길게', value: '리스트레토 / 룽고' },
      ],
      sections: [
        {
          id: 'name',
          heading: '‘에스프레소’는 무슨 뜻인가',
          body: [
            {
              text: '온라인 어원 사전(Online Etymology Dictionary)은 이 말을 ‘눌러 짜낸 커피’라는 뜻의 이탈리아어 caffè espresso에서 찾습니다. 동사 esprimere에서 왔고, 영어 기록은 1945년부터입니다.',
              sources: ['etym-espresso'],
            },
            {
              text: '속도라는 의미도 처음부터 함께였습니다. 스미스소니언 매거진에 따르면 데시데리오 파보니는 초기 머신을 ‘그 자리에서 바로’ 만드는 커피라고 광고했습니다.',
              sources: ['smithsonian-espresso'],
            },
          ],
        },
        {
          id: 'history',
          heading: '에스프레소 머신은 누가 만들었나',
          body: [
            {
              text: '여러 사람이 단계적으로 만들었습니다. 토리노의 안젤로 모리온도가 1884년 주문이 들어올 때마다 넓은 원두층에 물을 밀어 넣는 증기 머신으로 특허를 받았지만, 실물은 남아 있지 않습니다. 1900년대 초 루이지 베체라가 한 잔씩 바로 내리는 머신을 만들었고, 1903년 데시데리오 파보니가 그 특허를 사들여 1906년 밀라노 박람회에서 둘이 함께 ‘카페 에스프레소’를 선보였습니다.',
              sources: ['smithsonian-espresso'],
            },
            {
              text: '이 머신들은 증기로 약 2바까지만 압력을 냈고, 커피에서 탄 맛이 났으며 지금 기준으로는 에스프레소라 부르기 어렵습니다. 2차 세계대전 뒤 아킬레 가자의 스프링 피스톤 레버가 압력을 8~10바로 끌어올리면서 크레마가 생겼습니다. 스미스소니언은 손님들이 처음엔 이 거품을 꺼렸지만 가자가 ‘카페 크렘’이라고 부르면서 인식이 바뀌었다는 일화와, 그의 레버를 당기던 바리스타들에게서 ‘샷을 뽑는다(pulling a shot)’는 표현이 나왔다는 이야기를 전합니다.',
              sources: ['smithsonian-espresso'],
            },
          ],
        },
        {
          id: 'ristretto-lungo',
          heading: '리스트레토와 룽고는 무엇인가',
          body: [
            {
              text: '같은 방식을 다른 길이로 뽑은 것입니다. 리스트레토는 물을 적게 통과시켜 더 작고 진한 샷이 됩니다. 이탈리아어 사전 트레카니는 ‘부피를 줄인, 농축된’이라는 뜻의 예로 un caffè ristretto를 듭니다. 룽고는 물을 더 많이 통과시킵니다. 트레카니는 음료에 쓰인 lungo를 ‘평소보다 물이 많은’이라고 풀이합니다.',
              sources: ['treccani-ristretto', 'treccani-lungo'],
            },
            {
              text: '아메리카노는 룽고가 아닙니다. 룽고는 늘어난 물이 원두를 통과하며 더 많이 추출되고, 아메리카노는 보통 길이로 뽑은 샷에 뜨거운 물을 나중에 붓습니다.',
            },
          ],
        },
      ],
    },
  },
};

export default espresso;
