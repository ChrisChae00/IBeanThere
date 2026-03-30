import type { CoffeeDrink } from '../types';

const aeropress: CoffeeDrink = {
  slug: 'aeropress',
  categoryId: 'brewing',
  content: {
    en: {
      name: 'AeroPress',
      tagline: 'The engineer\'s coffee maker. Forgiving, fast, and endlessly hackable.',
      description:
        'The AeroPress combines immersion and pressure brewing in a single plastic cylinder. Coffee steep in hot water for 30–60 seconds, then air pressure created by pushing the plunger forces the liquid through a micro-filter and into the cup. The result is a smooth, low-acid coffee with surprisingly rich body — often described as halfway between espresso and pour over.\n\nWhat makes AeroPress unique is its flexibility. You can invert it (the "inverted method"), adjust steep time from 30 seconds to 3 minutes, use different water temperatures, and swap in metal or paper filters. There are thousands of published recipes and an annual World AeroPress Championship where competitors brew with wildly different techniques.',
      origin:
        'Invented in 2005 by Alan Adler, a Stanford engineering professor and inventor of the Aerobie flying disc. He designed the AeroPress after obsessing over why conventional drip machines made bad single cups. It launched at a trade show in 2005 and became a cult favorite — particularly among travelers and outdoor enthusiasts — due to its durability and portability.',
      funFact:
        'Alan Adler invented the AeroPress at age 68, while already famous for the Aerobie frisbee. He reportedly tested over 40 different prototypes before settling on the final design.',
    },
    ko: {
      name: '에어로프레스',
      tagline: '엔지니어가 만든 커피 기구. 관용적이고, 빠르고, 끝없이 실험 가능한.',
      description:
        '에어로프레스는 침지와 압력 추출을 하나의 플라스틱 실린더에서 결합한 방식입니다. 커피를 뜨거운 물에 30~60초 담근 후, 플런저를 누르는 공기 압력이 액체를 마이크로 필터를 통해 컵으로 밀어냅니다. 결과물은 에스프레소와 푸어오버의 중간 어딘가로 표현되는, 부드럽고 산도가 낮으며 의외로 진한 바디감을 가진 커피입니다.\n\n에어로프레스의 특징은 유연성입니다. 뒤집어 사용하는 "인버티드 방법", 30초에서 3분까지 조절 가능한 추출 시간, 다양한 물 온도, 금속 또는 종이 필터 선택 — 수천 가지 레시피가 존재하며, 매년 세계 에어로프레스 챔피언십이 열립니다.',
      origin:
        '2005년 스탠퍼드 공대 교수이자 에어로비(Aerobie) 프리즈비 발명가인 앨런 애들러(Alan Adler)가 발명했습니다. 기존 드립 머신으로는 싱글 컵을 제대로 만들 수 없다는 문제에 집착한 끝에 탄생시킨 제품입니다. 2005년 무역 박람회에서 출시된 이후 내구성과 휴대성 덕분에 여행자와 아웃도어 애호가 사이에서 컬트적 인기를 얻었습니다.',
      funFact:
        '앨런 애들러는 이미 에어로비 프리즈비로 유명한 상태에서 68세에 에어로프레스를 발명했습니다. 최종 디자인에 이르기까지 40가지 이상의 프로토타입을 테스트했다고 알려져 있습니다.',
    },
  },
};

export default aeropress;
