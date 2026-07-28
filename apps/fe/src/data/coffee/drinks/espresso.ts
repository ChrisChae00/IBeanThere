import type { CoffeeDrink } from '../types';

const espresso: CoffeeDrink = {
  slug: 'espresso',
  categoryId: 'espresso',
  content: {
    en: {
      name: 'Espresso',
      tagline: 'Nine bars of pressure. Thirty seconds. The foundation of everything.',
      description:
        'Espresso is brewed by forcing hot water through finely-ground, tightly-packed coffee under 9 bars of pressure for 25–30 seconds, yielding a 25–35ml concentrated shot. The result: an intense, syrupy liquid topped with crema — a reddish-brown foam of emulsified coffee oils and CO₂ that signals a properly extracted shot.\n\nEspresso is less about the bean and more about the extraction. The same coffee that produces a bright, fruity pour over can become a thick, bittersweet espresso depending on grind size, dose, and pressure. It\'s also the base for virtually every café milk drink on the planet.',
      origin:
        'The first espresso machine patent was filed in 1901 by Luigi Bezzera in Milan. The goal was efficiency — brewing coffee faster for busy Italian workers. Desiderio Pavoni bought the patent and commercialized the machine, and by the 1920s, the bar espresso machine was standard in Italian cafés. The modern 9-bar standard was set by Achille Gaggia in 1948, who also discovered crema while experimenting with higher pressure.',
      funFact:
        'The word "espresso" does not mean "express" in the sense of speed — it comes from the Italian "esprimere," meaning "to press out" or "to express." That said, the fast prep time was definitely a selling point.',
    },
    ko: {
      name: '에스프레소',
      tagline: '9바의 압력. 30초. 모든 것의 기반.',
      description:
        '에스프레소는 9바의 압력으로 곱게 분쇄된 원두를 통해 뜨거운 물을 25~30초 동안 강제 통과시켜 25~35ml의 농축 샷을 추출합니다. 결과물은 강렬하고 시럽 같은 액체 위에 크레마 — 유화된 커피 오일과 CO₂로 이루어진 붉은 갈색 거품 — 가 올려져 있습니다. 이 크레마가 제대로 추출된 에스프레소의 신호입니다.\n\n에스프레소는 원두보다 추출에 관한 것입니다. 밝고 과일 향 나는 푸어오버를 만들던 같은 원두가 분쇄도, 도징, 압력에 따라 진하고 씁쓸한 에스프레소가 될 수 있습니다. 또한 세상 모든 카페 밀크 음료의 베이스입니다.',
      origin:
        '최초의 에스프레소 머신 특허는 1901년 밀라노의 루이지 베체라(Luigi Bezzera)가 신청했습니다. 목표는 효율성 — 바쁜 이탈리아 노동자들을 위해 더 빠르게 커피를 만드는 것이었습니다. 데지데리오 파보니(Desiderio Pavoni)가 특허를 사들여 상업화했고, 1920년대에는 이탈리아 카페의 표준이 되었습니다. 현대적인 9바 기준은 1948년 아킬레 가기아(Achille Gaggia)가 확립했으며, 더 높은 압력을 실험하다 크레마도 발견했습니다.',
      funFact:
        '"에스프레소(espresso)"는 속도를 의미하는 "익스프레스(express)"에서 온 단어가 아닙니다. 이탈리아어 "에스프리메레(esprimere)"에서 왔으며 "눌러서 내다" 또는 "표현하다"는 뜻입니다. 물론 빠른 제조 시간도 분명 매력이었지만요.',
    },
  },
};

export default espresso;
