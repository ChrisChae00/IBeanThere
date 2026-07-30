import type { CoffeeDrink } from '../types';

const pourOver: CoffeeDrink = {
  slug: 'pour-over',
  categoryId: 'brewing',
  content: {
    en: {
      name: 'Pour Over',
      tagline: 'The most famous pour-over on earth wasn\'t designed by a barista. It was designed by a chemist — and MoMA still owns one.',
      description:
        'Peter Schlumbohm didn\'t design the Chemex like a coffee maker — he designed it like a lab instrument, because he was a chemist, not a barista. That mindset stuck: MoMA now keeps one in its permanent collection, and it turned up in James Bond\'s apartment in the original films, on the strength of pure form.\n\nBut pour over earned its place in specialty coffee through what it does, not just how it looks. It became the third-wave movement\'s signature method because it hides nothing — you taste the coffee, not the technique. Grind size, water at 90–96°C, and a 30-45 second bloom that lets trapped CO₂ escape before extraction begins: get those right and nothing stands between you and the bean. Hario\'s V60, launched in 2004, turned chasing that precision into a global obsession among baristas.',
      origin:
        'The Chemex was invented in 1941 by Peter Schlumbohm, a chemist who designed it as much as a scientific instrument as a coffee brewer. The Hario V60, now the most widely used pour over in specialty coffee, was introduced by the Japanese glass company Hario in 2004 and became the object of intense global obsession among baristas.',
      funFact:
        'The Chemex appears in the permanent collection of MoMA (Museum of Modern Art) in New York. It was also spotted in the apartment of James Bond in the original films.',
    },
    ko: {
      name: '푸어오버',
      tagline: '케멕스를 디자인한 사람은 바리스타가 아니라 화학자였다 — 그리고 지금 그 커피포트는 뉴욕 현대미술관에 있다.',
      description:
        '피터 슐룸봄은 케멕스를 커피 기구가 아니라 실험 기구처럼 설계했습니다. 그는 바리스타가 아니라 화학자였으니까요. 그 접근은 결실을 맺어, 지금 뉴욕 현대미술관(MoMA)은 케멕스를 영구 소장품으로 두고 있고, 오리지널 007 영화 속 제임스 본드의 아파트에도 등장했습니다. 순전히 형태의 힘이었죠.\n\n하지만 푸어오버가 스페셜티 커피의 표준이 된 이유는 외형이 아니라 기능입니다. 아무것도 숨기지 않는 방식이기 때문에 2000년대 서드웨이브 운동의 상징이 되었습니다 — 기술이 아니라 커피 자체의 맛을 느끼게 하죠. 분쇄도, 90~96°C의 물 온도, 로스팅 중 갇힌 CO₂를 빼내는 30~45초의 블룸까지 제대로 맞추면 원두와 나 사이에 아무것도 남지 않습니다. 2004년 출시된 하리오 V60은 이 정밀함을 좇는 일을 전 세계 바리스타들의 집착으로 바꿔놓았습니다.',
      origin:
        '케멕스는 1941년 화학자 피터 슐룸봄(Peter Schlumbohm)이 발명했습니다. 그는 이것을 커피 기구인 동시에 과학 기구로 디자인했습니다. 현재 스페셜티 커피에서 가장 널리 사용되는 하리오 V60은 일본 유리 회사 하리오(Hario)가 2004년 출시한 제품으로, 전 세계 바리스타들의 집착 대상이 되었습니다.',
      funFact:
        '케멕스는 뉴욕 현대미술관(MoMA) 영구 소장품에 포함되어 있습니다. 제임스 본드 오리지널 영화 속 그의 아파트에서도 등장한 바 있습니다.',
    },
  },
};

export default pourOver;
