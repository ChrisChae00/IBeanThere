import type { CoffeeDrink } from '../types';

const siphon: CoffeeDrink = {
  slug: 'siphon',
  categoryId: 'brewing',
  content: {
    en: {
      name: 'Siphon',
      tagline: 'It looks like a chemistry experiment about to go wrong. It\'s just coffee — and it\'s cleaner than a French press.',
      description:
        'Two glass globes, a flame, and a coffee that has to fight its way uphill before it\'s allowed to come back down — siphon brewing looks less like making coffee and more like a chemistry demo mid-malfunction. Heat builds vapor pressure in the lower globe, forcing water up into the grounds waiting above; pull the heat away and the resulting vacuum drags the brewed coffee back down through a filter.\n\nThe theater isn\'t the point, though — it\'s a side effect of a genuinely precise method. What comes out is cleaner than French press but rounder than paper-filtered pour over, with a clarity and delicate sweetness that takes 5–8 minutes of full attention to earn. Some Tokyo kissaten have used the same siphon units since the 1960s — decades of running the same small drama, one cup at a time.',
      origin:
        'The siphon was invented in Germany in the 1830s and refined throughout the 19th century. It peaked in popularity in the mid-20th century in Japan, where Kōno and Hario developed refined versions that remain popular in high-end cafés. In Japan, siphon coffee is often served as a premium "theater" experience at counter-style specialty bars.',
      funFact:
        'Siphon brewers were so popular in mid-century Japan that many older coffee shops still use them exclusively — decades-old machines maintained with devotion. Some Tokyo kissaten (traditional coffee shops) use the same siphon units purchased in the 1960s.',
    },
    ko: {
      name: '사이폰',
      tagline: '당장 터질 듯한 화학 실험처럼 보이지만, 사실은 그냥 커피다 — 프렌치프레스보다도 깨끗한.',
      description:
        '두 개의 유리 구, 불꽃, 그리고 위로 억지로 밀려 올라갔다가 다시 허락을 받고서야 내려오는 커피. 사이폰 추출은 커피를 내린다기보다 잘못되기 직전의 화학 실험처럼 보입니다. 열이 아래 구에 증기압을 만들어 물을 위 챔버의 원두로 밀어 올리고, 열을 치우면 생기는 진공이 추출된 커피를 필터를 통해 다시 아래로 끌어내립니다.\n\n하지만 이 연극 같은 과정은 사실 정교함의 부산물일 뿐입니다. 결과물은 프렌치프레스보다 깨끗하면서 종이 필터 푸어오버보다 둥근 바디를 지니고 있고, 5~8분간 온전히 집중해야 얻을 수 있는 선명함과 섬세한 단맛을 냅니다. 도쿄의 일부 킷사텐은 1960년대에 산 사이폰을 지금도 그대로 씁니다 — 같은 작은 연극을 한 잔씩, 수십 년째 반복하고 있는 것입니다.',
      origin:
        '사이폰은 1830년대 독일에서 발명되어 19세기에 걸쳐 발전했습니다. 20세기 중반 일본에서 코노(Kōno)와 하리오(Hario)가 정교하게 발전시켜 최고의 인기를 누렸으며, 지금도 고급 카페에서 즐겨 사용됩니다. 일본에서 사이폰 커피는 카운터형 스페셜티 바의 프리미엄 "연극" 경험으로 제공됩니다.',
      funFact:
        '20세기 중반 일본에서 사이폰 브루어는 매우 인기가 높아 많은 오래된 커피숍이 수십 년이 지난 지금도 이것만 사용합니다. 도쿄의 일부 킷사텐(전통 커피숍)에서는 1960년대에 구매한 사이폰을 여전히 사용하고 있습니다.',
    },
  },
};

export default siphon;
