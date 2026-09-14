import type { CoffeeDrink } from '../types';

const aeropress: CoffeeDrink = {
  slug: 'aeropress',
  categoryId: 'brewing',
  reviewed: '2026-09-11',
  related: ['french-press', 'pour-over', 'espresso'],
  content: {
    en: {
      name: 'AeroPress',
      title: 'AeroPress: how it brews and who invented it',
      description:
        'The AeroPress steeps coffee briefly in a plastic chamber and pushes it through a paper filter by hand. How it compares with a French press, and how Alan Adler came to make it.',
      summary:
        'The AeroPress is a hand-powered brewer. Coffee and hot water mix in a plastic chamber, then a plunger pushes the coffee through a small paper filter into the cup. It combines steeping, as in a French press, with a paper filter, as in pour-over.',
      line: 'A plastic chamber where coffee steeps briefly, then is pushed through a paper filter by hand.',
      facts: [
        { label: 'In the cup', value: 'Coffee and water, paper-filtered' },
        { label: 'Method', value: 'A short steep, then hand pressure' },
        { label: 'Gear', value: 'Chamber, plunger, paper filter' },
        { label: 'On sale since', value: '2005' },
      ],
      sections: [
        {
          id: 'history',
          heading: 'Who invented the AeroPress?',
          body: [
            {
              text: 'Alan Adler, an engineer who taught a course on sensors at Stanford and whose company made the Aerobie flying ring. According to AeroPress, Inc., he began experimenting with coffee makers in 2003 because he was unhappy with the single cups he could make at home, went through more than 30 prototypes in two years, and introduced the AeroPress at Coffee Fest Seattle in November 2005.',
              sources: ['aeropress-about'],
            },
          ],
        },
        {
          id: 'vs-french-press',
          heading: 'How is it different from a French press?',
          body: [
            {
              text: 'Both steep the coffee in water, but the AeroPress then forces it through paper rather than holding the grounds back with mesh. The paper catches the fine particles and oils a press lets through, so the cup is cleaner and lighter; Harvard’s Nutrition Source notes that filtered coffee contains almost none of the cholesterol-raising diterpenes found in unfiltered brews.',
              sources: ['harvard-coffee'],
            },
          ],
        },
      ],
    },
    ko: {
      name: '에어로프레스',
      title: '에어로프레스: 추출 원리와 발명 이야기',
      description:
        '에어로프레스는 플라스틱 챔버에서 원두를 잠시 우린 뒤 손으로 눌러 종이 필터로 거르는 도구입니다. 프렌치프레스와의 차이와 앨런 애들러가 만든 과정을 정리했습니다.',
      summary:
        '에어로프레스는 손힘으로 추출하는 도구입니다. 플라스틱 챔버에서 원두와 뜨거운 물을 섞은 뒤, 플런저로 눌러 작은 종이 필터를 통해 잔으로 밀어 냅니다. 프렌치프레스처럼 우리고, 푸어오버처럼 종이로 거릅니다.',
      line: '플라스틱 챔버에서 잠시 우린 커피를 손으로 눌러 종이 필터로 거르는 방식.',
      facts: [
        { label: '재료', value: '원두와 물, 종이 필터로 거름' },
        { label: '방식', value: '짧게 우린 뒤 손으로 누름' },
        { label: '도구', value: '챔버, 플런저, 종이 필터' },
        { label: '출시', value: '2005년' },
      ],
      sections: [
        {
          id: 'history',
          heading: '에어로프레스는 누가 만들었나',
          body: [
            {
              text: '스탠퍼드에서 센서 강의를 했고, 비행 원반 에어로비를 만든 회사를 운영하던 엔지니어 앨런 애들러입니다. 에어로프레스사에 따르면 그는 집에서 한 잔을 제대로 내리기 어렵다는 불만에서 2003년 실험을 시작했고, 2년 동안 30개가 넘는 시제품을 거쳐 2005년 11월 시애틀의 커피 페스트에서 에어로프레스를 선보였습니다.',
              sources: ['aeropress-about'],
            },
          ],
        },
        {
          id: 'vs-french-press',
          heading: '프렌치프레스와 무엇이 다른가',
          body: [
            {
              text: '둘 다 원두를 물에 우리지만, 에어로프레스는 금속 망으로 가루를 막는 대신 종이로 밀어 거릅니다. 프레스에서 넘어오던 고운 입자와 기름을 종이가 잡아 주기 때문에 더 깔끔하고 가볍습니다. 하버드 공중보건대학원의 Nutrition Source는 필터 커피에 콜레스테롤을 높이는 디테르펜이 거의 없다고 설명합니다.',
              sources: ['harvard-coffee'],
            },
          ],
        },
      ],
    },
  },
};

export default aeropress;
