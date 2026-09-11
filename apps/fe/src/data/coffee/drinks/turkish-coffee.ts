import type { CoffeeDrink } from '../types';

const turkishCoffee: CoffeeDrink = {
  slug: 'turkish-coffee',
  categoryId: 'brewing',
  reviewed: '2026-09-11',
  related: ['french-press', 'espresso', 'moka-pot'],
  content: {
    en: {
      name: 'Turkish coffee',
      aka: 'In Turkish: Türk kahvesi',
      title: 'Turkish coffee: how it is made and what is known of its history',
      description:
        'Turkish coffee is powder-fine coffee simmered with water in a small pot and served unfiltered. How it is made, why the sugar is chosen before brewing, and its documented history.',
      summary:
        'Turkish coffee is coffee ground to a fine powder and brewed slowly with cold water in a small pot until it foams, then poured into a small cup without being filtered. The grounds settle to the bottom, so it is sipped slowly and left before the sediment.',
      line: 'Powder-fine coffee brewed slowly with water, and sugar if wanted, in a small pot and served unfiltered.',
      facts: [
        { label: 'In the cup', value: 'Coffee and water, with or without sugar; unfiltered' },
        { label: 'Grind', value: 'A fine powder' },
        { label: 'Pot', value: 'A cezve, also called an ibrik' },
        { label: 'Served', value: 'In a small cup with a glass of water' },
      ],
      sections: [
        {
          id: 'how',
          heading: 'How is Turkish coffee made?',
          body: [
            {
              text: 'Freshly roasted beans are ground to a fine powder, and the coffee, cold water and sugar go into the pot together and are brewed slowly over heat to produce a foam. It is served in small cups with a glass of water, as UNESCO’s description of the tradition sets out.',
              sources: ['unesco-turkish'],
            },
            {
              text: 'Because the sugar is brewed in rather than stirred in afterwards, decide how sweet you want it when you order. And because nothing is filtered, the coffee keeps the oils a paper filter would catch: Harvard’s Nutrition Source lists Turkish coffee among the unfiltered brews whose diterpenes can raise LDL cholesterol.',
              sources: ['harvard-coffee'],
            },
          ],
        },
        {
          id: 'history',
          heading: 'Where does Turkish coffee come from?',
          body: [
            {
              text: 'Coffee houses opened in Istanbul in the early 1550s. The TDV Encyclopedia of Islam records that the chronicler Âlî Mustafa Efendi dated them to 1553, while İbrahim Peçevi, writing in the 17th century, credited two men — Hakem from Aleppo and Şems from Damascus — with opening the first in the Tahtakale district in 1554–55.',
              sources: ['tdv-kahvehane'],
            },
            {
              text: 'In 2013 UNESCO inscribed Turkish coffee culture and tradition on its list of the Intangible Cultural Heritage of Humanity. The listing describes the coffee as a sign of hospitality with a place in ceremonies such as engagements, and notes that the grounds left in the cup are often used to tell fortunes.',
              sources: ['unesco-turkish'],
            },
            {
              text: 'A story widely repeated online holds that an Ottoman wife could divorce a husband who failed to keep her supplied with coffee. We did not find a primary source for it.',
            },
          ],
        },
      ],
    },
    ko: {
      name: '터키식 커피',
      aka: '튀르키예어로 Türk kahvesi',
      title: '터키식 커피: 만드는 법과 기록으로 확인되는 역사',
      description:
        '터키식 커피는 가루처럼 간 원두를 작은 주전자에 물과 함께 끓여 거르지 않고 마시는 커피입니다. 만드는 법, 설탕을 먼저 정하는 이유, 기록으로 남은 역사를 정리했습니다.',
      summary:
        '터키식 커피는 가루처럼 곱게 간 원두를 찬물과 함께 작은 주전자에 넣고, 거품이 오를 때까지 천천히 끓여 거르지 않고 작은 잔에 따르는 커피입니다. 가루가 잔 바닥에 가라앉기 때문에 천천히 마시다가 앙금 앞에서 멈춥니다.',
      line: '가루처럼 간 원두를 물(원하면 설탕까지)과 함께 작은 주전자에 천천히 끓여 거르지 않고 따르는 커피.',
      facts: [
        { label: '재료', value: '원두와 물, 설탕은 선택 · 거르지 않음' },
        { label: '분쇄', value: '고운 가루' },
        { label: '도구', value: '체즈베(이브릭이라고도 함)' },
        { label: '제공', value: '작은 잔, 물 한 잔과 함께' },
      ],
      sections: [
        {
          id: 'how',
          heading: '터키식 커피는 어떻게 만드나',
          body: [
            {
              text: '갓 볶은 원두를 고운 가루로 갈고, 커피와 찬물, 설탕을 한꺼번에 주전자에 넣어 불 위에서 천천히 끓이며 거품을 냅니다. 유네스코가 정리한 이 전통의 설명에 따르면 작은 잔에 물 한 잔을 곁들여 냅니다.',
              sources: ['unesco-turkish'],
            },
            {
              text: '설탕을 나중에 젓는 게 아니라 함께 끓이기 때문에, 단맛은 주문할 때 정해야 합니다. 또 거르지 않으니 종이 필터가 잡아 줄 기름 성분이 그대로 남습니다. 하버드 공중보건대학원의 Nutrition Source는 터키식 커피를 LDL 콜레스테롤을 높일 수 있는 디테르펜이 든, 거르지 않은 커피의 예로 듭니다.',
              sources: ['harvard-coffee'],
            },
          ],
        },
        {
          id: 'history',
          heading: '터키식 커피는 어디서 왔나',
          body: [
            {
              text: '이스탄불에 커피하우스가 생긴 것은 1550년대 초입니다. TDV 이슬람 백과사전에 따르면 당대 역사가 알리 무스타파 에펜디는 1553년으로 기록했고, 17세기 역사가 이브라힘 페체비는 알레포 출신 하켐과 다마스쿠스 출신 셈스가 1554~55년 타흐타칼레에 첫 커피하우스를 열었다고 적었습니다.',
              sources: ['tdv-kahvehane'],
            },
            {
              text: '유네스코는 2013년 ‘터키 커피 문화와 전통’을 인류무형문화유산 대표목록에 올렸습니다. 등재 설명은 이 커피를 환대의 표시이자 약혼식 같은 의례의 일부로 소개하고, 잔에 남은 가루로 점을 치는 경우가 많다고 적고 있습니다.',
              sources: ['unesco-turkish'],
            },
            {
              text: '오스만 시대에 남편이 커피를 대 주지 않으면 아내가 이혼할 수 있었다는 이야기가 온라인에 널리 퍼져 있지만, 이를 뒷받침하는 1차 자료는 찾지 못했습니다.',
            },
          ],
        },
      ],
    },
  },
};

export default turkishCoffee;
