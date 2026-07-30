import type { CoffeeDrink } from '../types';

const espresso: CoffeeDrink = {
  slug: 'espresso',
  categoryId: 'espresso',
  content: {
    en: {
      name: 'Espresso',
      tagline:
        'A machine built to brew coffee faster for factory workers accidentally created the foundation of every café drink on earth.',
      description:
        'In 1901, Luigi Bezzera wasn\'t chasing flavor — he was chasing speed, patenting a machine to get coffee into tired Italian workers\' hands faster. Desiderio Pavoni commercialized it. But it was Achille Gaggia, in 1948, pushing the pressure to 9 bars just to brew even quicker, who stumbled onto something nobody had ordered: crema, the reddish-brown foam that would come to define the drink.\n\nThat accident became the standard. Today, 9 bars of pressure force hot water through tightly-packed, finely-ground coffee for 25–30 seconds, yielding a 25–35ml shot that\'s less about the bean than the extraction — the same coffee can pour bright and fruity or thick and bittersweet, depending only on grind, dose, and pressure. Strip away the milk, the ice, the syrup, and every café drink on the planet reduces to this one shot.',
      origin:
        'The first espresso machine patent was filed in 1901 by Luigi Bezzera in Milan. The goal was efficiency — brewing coffee faster for busy Italian workers. Desiderio Pavoni bought the patent and commercialized the machine, and by the 1920s, the bar espresso machine was standard in Italian cafés. The modern 9-bar standard was set by Achille Gaggia in 1948, who also discovered crema while experimenting with higher pressure.',
      funFact:
        'The word "espresso" does not mean "express" in the sense of speed — it comes from the Italian "esprimere," meaning "to press out" or "to express." That said, the fast prep time was definitely a selling point.',
    },
    ko: {
      name: '에스프레소',
      tagline: '바쁜 노동자들에게 커피를 더 빨리 내주려던 기계가, 알고 보니 모든 카페 음료의 기반을 만들어냈다.',
      description:
        '1901년, 루이지 베체라는 맛이 아니라 속도를 좇고 있었습니다. 지친 이탈리아 노동자들에게 커피를 더 빨리 내주기 위한 기계를 특허 냈을 뿐입니다. 데지데리오 파보니가 이를 상업화했습니다. 하지만 1948년, 그저 더 빠르게 추출하려고 압력을 9바까지 끌어올린 아킬레 가기아가 아무도 주문한 적 없는 무언가를 우연히 발견했습니다. 바로 크레마, 이후 이 음료를 정의하게 될 붉은 갈색 거품이었습니다.\n\n그 우연이 표준이 되었습니다. 오늘날 에스프레소는 9바의 압력으로 곱게 분쇄해 꽉 채운 원두를 25~30초 동안 통과시켜 25~35ml의 샷을 뽑아냅니다. 원두보다 추출이 중요해서, 같은 원두도 분쇄도와 도징, 압력에 따라 밝고 과일 향 나는 커피가 되기도, 진하고 씁쓸한 에스프레소가 되기도 합니다. 우유도, 얼음도, 시럽도 다 걷어내면 세상 모든 카페 음료는 결국 이 한 샷으로 귀결됩니다.',
      origin:
        '최초의 에스프레소 머신 특허는 1901년 밀라노의 루이지 베체라(Luigi Bezzera)가 신청했습니다. 목표는 효율성 — 바쁜 이탈리아 노동자들을 위해 더 빠르게 커피를 만드는 것이었습니다. 데지데리오 파보니(Desiderio Pavoni)가 특허를 사들여 상업화했고, 1920년대에는 이탈리아 카페의 표준이 되었습니다. 현대적인 9바 기준은 1948년 아킬레 가기아(Achille Gaggia)가 확립했으며, 더 높은 압력을 실험하다 크레마도 발견했습니다.',
      funFact:
        '"에스프레소(espresso)"는 속도를 의미하는 "익스프레스(express)"에서 온 단어가 아닙니다. 이탈리아어 "에스프리메레(esprimere)"에서 왔으며 "눌러서 내다" 또는 "표현하다"는 뜻입니다. 물론 빠른 제조 시간도 분명 매력이었지만요.',
    },
  },
};

export default espresso;
