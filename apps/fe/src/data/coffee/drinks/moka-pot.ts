import type { CoffeeDrink } from '../types';

const mokaPot: CoffeeDrink = {
  slug: 'moka-pot',
  categoryId: 'brewing',
  reviewed: '2026-09-11',
  related: ['espresso', 'french-press', 'siphon'],
  content: {
    en: {
      name: 'Moka pot',
      aka: 'In Italian: moka or caffettiera',
      title: 'Moka pot: how stovetop coffee works, and whether it is espresso',
      description:
        'A moka pot uses steam pressure on the stove to push water up through ground coffee. How it works, why it is not espresso, and Alfonso Bialetti’s 1933 Moka Express.',
      summary:
        'A moka pot is a three-part stovetop brewer. Water in the bottom chamber heats, pressure builds above it, and the water is forced up through a basket of ground coffee into the top chamber. It makes a small, strong coffee that is often called stovetop espresso, although it is pushed by steam in a closed pot rather than by an espresso machine’s 8–10 bar.',
      line: 'A stovetop pot where steam pressure pushes hot water up through ground coffee into a top chamber.',
      facts: [
        { label: 'In the cup', value: 'Coffee and water, strong and short' },
        { label: 'Grind', value: 'Fine to medium-fine' },
        { label: 'Heat', value: 'Stovetop' },
        { label: 'Parts', value: 'Boiler, filter basket, top chamber' },
      ],
      sections: [
        {
          id: 'how',
          heading: 'Is a moka pot espresso?',
          body: [
            {
              text: 'Not by today’s definition. In a moka pot the water in the sealed lower chamber is heated until the steam and air above it push it up through the coffee; a 2009 study in Applied Thermal Engineering measured exactly that steam-driven extraction.',
              sources: ['navarini-moka'],
            },
            {
              text: 'Espresso as it is made now depends on a machine pushing water through the coffee at around 8–10 bar, the level Achille Gaggia’s lever machines reached after the Second World War. Smithsonian Magazine notes that the earlier steam machines, which managed about 2 bar, would not count as espresso by today’s standard either.',
              sources: ['smithsonian-espresso'],
            },
          ],
        },
        {
          id: 'history',
          heading: 'Who invented the moka pot?',
          body: [
            {
              text: 'Alfonso Bialetti built the first Moka Express in 1933 in his aluminium workshop in Crusinallo, in Piedmont. Bialetti’s own account says the idea came from watching his wife use a lessiveuse, a laundry boiler whose central chimney carried boiling water up and over the clothes, that production stopped during the Second World War, and that the octagonal pot has changed only slightly since.',
              sources: ['bialetti-moka'],
            },
          ],
        },
      ],
    },
    ko: {
      name: '모카포트',
      aka: '이탈리아어로 모카, 카페티에라',
      title: '모카포트: 원리, 그리고 에스프레소인지에 대한 답',
      description:
        '모카포트는 가스레인지 위에서 생긴 증기 압력으로 물을 밀어 올려 원두를 통과시킵니다. 작동 원리, 에스프레소가 아닌 이유, 1933년 비알레티의 모카 익스프레스를 정리했습니다.',
      summary:
        '모카포트는 세 부분으로 된 스토브용 추출기입니다. 아래 칸의 물이 데워지면 그 위에 압력이 차고, 물이 원두 바스켓을 지나 위 칸으로 밀려 올라갑니다. 작고 진한 커피가 나와 ‘스토브 에스프레소’라고도 불리지만, 에스프레소 머신의 8~10바가 아니라 닫힌 주전자 안의 증기가 밀어 올리는 방식입니다.',
      line: '증기 압력으로 뜨거운 물을 원두 사이로 밀어 올려 위 칸에 모으는 스토브용 주전자.',
      facts: [
        { label: '재료', value: '원두와 물, 짧고 진함' },
        { label: '분쇄', value: '곱게 또는 약간 곱게' },
        { label: '열원', value: '가스레인지·인덕션' },
        { label: '구성', value: '물통, 바스켓, 위 칸' },
      ],
      sections: [
        {
          id: 'how',
          heading: '모카포트 커피는 에스프레소인가',
          body: [
            {
              text: '지금의 정의로는 아닙니다. 모카포트는 밀폐된 아래 칸의 물을 데워, 그 위에 찬 증기와 공기가 물을 원두 사이로 밀어 올리게 합니다. 2009년 학술지 Applied Thermal Engineering에 실린 연구가 바로 이 증기 압력 추출을 측정했습니다.',
              sources: ['navarini-moka'],
            },
            {
              text: '오늘날의 에스프레소는 머신이 약 8~10바로 물을 밀어 넣는 것을 전제로 합니다. 아킬레 가자의 레버 머신이 2차 세계대전 뒤 도달한 수준입니다. 스미스소니언 매거진은 그보다 앞선 약 2바의 증기식 머신도 지금 기준으로는 에스프레소라 부르기 어렵다고 적고 있습니다.',
              sources: ['smithsonian-espresso'],
            },
          ],
        },
        {
          id: 'history',
          heading: '모카포트는 누가 만들었나',
          body: [
            {
              text: '알폰소 비알레티가 1933년 피에몬테 크루시날로의 알루미늄 공방에서 첫 모카 익스프레스를 만들었습니다. 비알레티사의 설명에 따르면, 가운데 굴뚝으로 끓는 물을 올려 빨래 위로 쏟아지게 하던 세탁용 솥 ‘레시뵈즈’를 아내가 쓰는 모습에서 착안했고, 2차 세계대전 중에는 생산이 멈췄으며, 팔각형 모양은 그 뒤로 거의 바뀌지 않았습니다.',
              sources: ['bialetti-moka'],
            },
          ],
        },
      ],
    },
  },
};

export default mokaPot;
