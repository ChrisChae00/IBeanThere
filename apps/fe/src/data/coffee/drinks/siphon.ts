import type { CoffeeDrink } from '../types';

const siphon: CoffeeDrink = {
  slug: 'siphon',
  categoryId: 'brewing',
  reviewed: '2026-09-11',
  related: ['moka-pot', 'french-press', 'pour-over'],
  content: {
    en: {
      name: 'Siphon coffee',
      aka: 'Also called syphon or vacuum pot',
      title: 'Siphon (vacuum pot) coffee: how it works and who invented it',
      description:
        'A siphon brewer uses steam to push water up to the coffee and a vacuum to pull it back down. How the two glass chambers work, and what is known about its 19th-century origin.',
      summary:
        'A siphon brewer has two glass chambers stacked over a heat source. Steam pressure pushes hot water from the lower chamber into the upper one, where it steeps with the coffee; when the heat is taken away, the steam condenses and the brewed coffee is drawn back down through a filter, leaving the grounds above.',
      line: 'Two glass chambers: steam pushes water up to the coffee, and a vacuum pulls the brew back down.',
      facts: [
        { label: 'In the cup', value: 'Coffee and water, filtered' },
        { label: 'Method', value: 'Steeping, moved by steam and vacuum' },
        { label: 'Brewing water', value: 'Just below boiling' },
        { label: 'Gear', value: 'Two glass chambers, a filter, a burner' },
      ],
      sections: [
        {
          id: 'how',
          heading: 'How does a siphon coffee maker work?',
          body: [
            {
              text: 'Heating the lower chamber builds steam pressure, which pushes the water up a tube into the upper chamber. It only needs enough pressure to overcome gravity and the atmosphere, so the water that reaches the coffee stays below 100 °C. When the heat is removed, the steam condenses and leaves a partial vacuum; atmospheric pressure then pushes the coffee back down through the filter.',
              sources: ['bh-syphon-science'],
            },
          ],
        },
        {
          id: 'history',
          heading: 'Who invented the siphon?',
          body: [
            {
              text: 'The record is thin. Barista Hustle credits Johann Nörremberg, a physics teacher who in 1826 built a steam-driven brewer to show his students what steam could do, and described it in a German physics journal the following year without patenting it. Earlier vacuum brewers, it notes, had relied on mechanical pumps.',
              sources: ['bh-syphon-history'],
            },
            {
              text: 'Other histories name different inventors in Berlin and Lyon in the 1830s and 1840s. We could not check their patents directly, so they are left out here.',
            },
          ],
        },
      ],
    },
    ko: {
      name: '사이폰 커피',
      aka: '배큐엄 포트라고도 부릅니다',
      title: '사이폰 커피: 작동 원리와 발명의 기록',
      description:
        '사이폰은 증기로 물을 원두까지 밀어 올리고, 진공으로 커피를 다시 끌어내리는 추출기입니다. 두 유리 용기의 원리와 19세기 기원에 대해 알려진 것을 정리했습니다.',
      summary:
        '사이폰은 열원 위에 유리 용기 두 개를 위아래로 겹친 추출기입니다. 아래 용기에서 생긴 증기 압력이 뜨거운 물을 위 용기로 밀어 올리면 그곳에서 원두와 함께 우러나고, 불을 끄면 증기가 식으면서 커피가 필터를 지나 다시 아래로 빨려 내려갑니다. 가루는 위에 남습니다.',
      line: '증기가 물을 원두까지 밀어 올리고, 진공이 커피를 다시 끌어내리는 두 개의 유리 용기.',
      facts: [
        { label: '재료', value: '원두와 물, 필터로 거름' },
        { label: '방식', value: '증기와 진공으로 옮기며 우림' },
        { label: '추출 온도', value: '끓는점보다 약간 낮음' },
        { label: '도구', value: '유리 용기 두 개, 필터, 버너' },
      ],
      sections: [
        {
          id: 'how',
          heading: '사이폰은 어떻게 작동하나',
          body: [
            {
              text: '아래 용기를 데우면 증기 압력이 생겨 물을 관을 따라 위 용기로 밀어 올립니다. 중력과 대기압을 이길 만큼만 압력이 있으면 되기 때문에, 원두에 닿는 물은 100°C보다 낮게 유지됩니다. 불을 끄면 증기가 응결하면서 부분 진공이 생기고, 대기압이 커피를 필터 너머 아래로 밀어 내립니다.',
              sources: ['bh-syphon-science'],
            },
          ],
        },
        {
          id: 'history',
          heading: '사이폰은 누가 만들었나',
          body: [
            {
              text: '기록이 많지 않습니다. 바리스타 허슬은 물리 교사 요한 뇌렘베르크가 1826년 학생들에게 증기의 힘을 보여 주려고 증기식 추출기를 만들었고, 이듬해 독일 물리학 학술지에 설명을 실었지만 특허는 내지 않았다고 봅니다. 그보다 앞선 진공 추출기들은 기계식 펌프를 썼다고 합니다.',
              sources: ['bh-syphon-history'],
            },
            {
              text: '1830~40년대 베를린과 리옹의 다른 발명가를 드는 자료도 있지만, 해당 특허를 직접 확인하지 못해 여기에는 적지 않았습니다.',
            },
          ],
        },
      ],
    },
  },
};

export default siphon;
