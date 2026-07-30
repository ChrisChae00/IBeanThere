import type { CoffeeDrink } from '../types';

const aeropress: CoffeeDrink = {
  slug: 'aeropress',
  categoryId: 'brewing',
  content: {
    en: {
      name: 'AeroPress',
      tagline: 'A frustrated engineer built this to fix one bad cup. It now has a world championship.',
      description:
        'Alan Adler wasn\'t trying to reinvent coffee. He was a Stanford engineer already famous for inventing a flying disc — but he couldn\'t stand how his drip machine ruined a single cup. So he built a plunger that pushes hot water through grounds using nothing but air pressure and thirty seconds of patience.\n\nIt looks like lab equipment, and in a way, it is. Steep, plunge, done — except the ritual is so tunable that thousands of competing recipes now face off every year at the World AeroPress Championship. Invert it, stretch the steep time from 30 seconds to 3 minutes, swap paper for metal — the machine doesn\'t flinch. What comes out is smooth, low in acid, and lands somewhere between espresso and pour over, which is exactly why travelers, campers, and coffee obsessives all claim it as their own.',
      origin:
        'Invented in 2005 by Alan Adler, a Stanford engineering professor and inventor of the Aerobie flying disc. He designed the AeroPress after obsessing over why conventional drip machines made bad single cups. It launched at a trade show in 2005 and became a cult favorite — particularly among travelers and outdoor enthusiasts — due to its durability and portability.',
      funFact:
        'Alan Adler invented the AeroPress at age 68, while already famous for the Aerobie frisbee. He reportedly tested over 40 different prototypes before settling on the final design.',
    },
    ko: {
      name: '에어로프레스',
      tagline: '한 엔지니어가 형편없는 커피 한 잔에 화나서 만들었다. 지금은 세계 챔피언십까지 열린다.',
      description:
        '앨런 애들러는 커피를 재발명하려던 게 아니었습니다. 이미 프리즈비로 유명해진 스탠퍼드 공대 엔지니어였을 뿐인데, 드립 머신이 싱글 컵을 망치는 꼴을 도저히 못 참았습니다. 그래서 공기 압력과 30초의 인내만으로 뜨거운 물을 원두에 밀어내는 플런저를 만들었습니다.\n\n생김새는 실험 기구에 가깝고, 실제로도 그렇습니다. 담그고, 누르고, 끝 — 그런데 이 단순한 과정이 너무 다양하게 조절 가능해서 매년 세계 에어로프레스 챔피언십에서 수천 가지 레시피가 경쟁을 벌입니다. 뒤집어 쓰고, 추출 시간을 30초에서 3분까지 늘리고, 종이 대신 금속 필터를 껴도 기계는 흔들리지 않습니다. 결과물은 부드럽고 산도가 낮으며 에스프레소와 푸어오버 사이 어딘가에 자리 잡습니다. 여행자와 캠퍼, 커피 덕후들이 저마다 이 기구를 자기 것이라 주장하는 이유입니다.',
      origin:
        '2005년 스탠퍼드 공대 교수이자 에어로비(Aerobie) 프리즈비 발명가인 앨런 애들러(Alan Adler)가 발명했습니다. 기존 드립 머신으로는 싱글 컵을 제대로 만들 수 없다는 문제에 집착한 끝에 탄생시킨 제품입니다. 2005년 무역 박람회에서 출시된 이후 내구성과 휴대성 덕분에 여행자와 아웃도어 애호가 사이에서 컬트적 인기를 얻었습니다.',
      funFact:
        '앨런 애들러는 이미 에어로비 프리즈비로 유명한 상태에서 68세에 에어로프레스를 발명했습니다. 최종 디자인에 이르기까지 40가지 이상의 프로토타입을 테스트했다고 알려져 있습니다.',
    },
  },
};

export default aeropress;
