import type { CoffeeDrink } from '../types';

const pourOver: CoffeeDrink = {
  slug: 'pour-over',
  categoryId: 'brewing',
  content: {
    en: {
      name: 'Pour Over',
      tagline: 'The third-wave standard bearer.',
      description:
        'Pour over refers specifically to cone-shaped or flat-bottomed brewers — Chemex, V60, Kalita Wave — where coffee drips through a paper filter into a vessel below. The method became the signature of the third-wave coffee movement in the 2000s, prioritizing transparency: you taste the coffee, not the brewing process.\n\nThe key variables are grind size, water temperature (90–96°C), and bloom — a 30-45 second pre-infusion where the grounds absorb a small amount of water and degas, releasing CO₂ trapped during roasting. A proper bloom ensures even extraction and prevents channeling.',
      origin:
        'The Chemex was invented in 1941 by Peter Schlumbohm, a chemist who designed it as much as a scientific instrument as a coffee brewer. The Hario V60, now the most widely used pour over in specialty coffee, was introduced by the Japanese glass company Hario in 2004 and became the object of intense global obsession among baristas.',
      funFact:
        'The Chemex appears in the permanent collection of MoMA (Museum of Modern Art) in New York. It was also spotted in the apartment of James Bond in the original films.',
    },
    ko: {
      name: '푸어오버',
      tagline: '스페셜티 커피의 상징.',
      description:
        '푸어오버는 케멕스, V60, 칼리타 웨이브처럼 원추형 또는 평평한 바닥의 브루어를 통해 종이 필터로 커피를 추출하는 방식입니다. 2000년대 스페셜티 커피 운동의 상징적 방식으로 자리잡았으며, 핵심 철학은 투명성 — 추출 방식이 아닌 커피 자체의 맛을 느끼도록 합니다.\n\n주요 변수는 분쇄도, 물 온도(90~96°C), 그리고 블룸(bloom)입니다. 블룸은 30~45초 동안 소량의 물로 원두를 적셔 로스팅 중 갇힌 CO₂를 방출시키는 사전 추출 과정으로, 균일한 추출을 위해 꼭 필요한 단계입니다.',
      origin:
        '케멕스는 1941년 화학자 피터 슐룸봄(Peter Schlumbohm)이 발명했습니다. 그는 이것을 커피 기구인 동시에 과학 기구로 디자인했습니다. 현재 스페셜티 커피에서 가장 널리 사용되는 하리오 V60은 일본 유리 회사 하리오(Hario)가 2004년 출시한 제품으로, 전 세계 바리스타들의 집착 대상이 되었습니다.',
      funFact:
        '케멕스는 뉴욕 현대미술관(MoMA) 영구 소장품에 포함되어 있습니다. 제임스 본드 오리지널 영화 속 그의 아파트에서도 등장한 바 있습니다.',
    },
  },
};

export default pourOver;
