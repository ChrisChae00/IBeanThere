import type { CoffeeDrink } from '../types';

const coldBrew: CoffeeDrink = {
  slug: 'cold-brew',
  categoryId: 'brewing',
  reviewed: '2026-09-11',
  related: ['americano', 'french-press', 'pour-over'],
  content: {
    en: {
      name: 'Cold brew',
      aka: 'Including cold drip, sold in Korea as Dutch coffee, and nitro cold brew',
      title: 'Cold brew vs Dutch coffee (cold drip) and nitro: what each one is',
      description:
        'Cold brew steeps coffee in cold water for hours. How it differs from cold drip, known in Korea as Dutch coffee, what nitro adds, and what a study found about its acidity.',
      summary:
        'Cold brew is coffee made without heat: ground coffee steeps in cold or room-temperature water for many hours and is then filtered, usually as a concentrate that is diluted and served over ice. Cold drip, sold in Korea as Dutch coffee, gets there another way, with cold water dripping through the coffee one drop at a time.',
      line: 'Coffee extracted with cold water over many hours instead of with heat.',
      facts: [
        { label: 'In the cup', value: 'Coffee and water, brewed cold' },
        { label: 'Time', value: 'Hours rather than minutes' },
        { label: 'Served', value: 'Usually over ice, often diluted from a concentrate' },
        { label: 'Variants', value: 'Cold drip (Dutch coffee), nitro' },
      ],
      sections: [
        {
          id: 'acidity',
          heading: 'Is cold brew less acidic?',
          body: [
            {
              text: 'Less than is often claimed. A 2018 study in Scientific Reports brewed six coffees hot and cold at the same coffee-to-water ratio. The pH of the two was comparable, between 4.85 and 5.13, but the hot brews had more titratable acid and higher antioxidant activity. Cold brew can taste softer; measured by pH, it is not much less acidic.',
              sources: ['rao-cold-brew'],
            },
          ],
        },
        {
          id: 'dutch-coffee',
          heading: 'What is Dutch coffee, and how is it different?',
          body: [
            {
              text: 'Dutch coffee is cold drip. Instead of sitting in water, the coffee sits under a reservoir of cold or iced water that drips onto it slowly, and the concentrate collects below. Steeped cold brew and cold drip both avoid heat; they differ in how the water meets the coffee.',
            },
            {
              text: 'The name is usually explained by a story of Dutch traders brewing coffee cold on their ships. We found no record that supports the story, so treat it as the origin of a name rather than of a method.',
            },
          ],
        },
        {
          id: 'nitro',
          heading: 'What is nitro cold brew?',
          body: [
            {
              text: 'Cold brew infused with nitrogen and poured from a tap, which gives it a creamy texture. Reporting on the drink in 2016, Eater noted that claims to the first nitro coffee vary between 2011 and 2012, that Portland-based Stumptown installed nitrogen taps in its cafés in June 2013, and that Starbucks planned to serve it in more than 500 US stores by the end of that summer.',
              sources: ['cnbc-nitro'],
            },
          ],
        },
      ],
    },
    ko: {
      name: '콜드브루',
      aka: '더치커피(콜드 드립), 니트로 콜드브루 포함',
      title: '콜드브루와 더치커피 차이, 그리고 니트로 콜드브루',
      description:
        '콜드브루는 찬물에 원두를 몇 시간씩 우려 만드는 커피입니다. 더치커피(콜드 드립)와의 차이, 니트로가 더하는 것, 산도에 대한 연구 결과를 정리했습니다.',
      summary:
        '콜드브루는 열 없이 만드는 커피입니다. 분쇄한 원두를 찬물이나 상온의 물에 몇 시간씩 담가 우린 뒤 걸러 내며, 보통 원액으로 만들어 물로 희석하고 얼음 위에 따릅니다. 한국에서 더치커피라 부르는 콜드 드립은 다른 길로 같은 곳에 닿습니다. 찬물을 한 방울씩 원두 위로 떨어뜨려 내립니다.',
      line: '열 대신 시간을 들여, 찬물로 몇 시간에 걸쳐 뽑아내는 커피.',
      facts: [
        { label: '재료', value: '원두와 물, 차갑게 추출' },
        { label: '시간', value: '분이 아니라 시간 단위' },
        { label: '제공', value: '대개 얼음 위에, 원액을 희석해서' },
        { label: '갈래', value: '콜드 드립(더치커피), 니트로' },
      ],
      sections: [
        {
          id: 'acidity',
          heading: '콜드브루는 산도가 낮은가',
          body: [
            {
              text: '흔히 말하는 만큼은 아닙니다. 2018년 학술지 Scientific Reports에 실린 연구는 원두 여섯 종을 같은 비율로 뜨겁게, 차갑게 내려 비교했습니다. pH는 4.85~5.13 사이로 비슷했지만, 적정 산도와 항산화 활성은 뜨겁게 내린 쪽이 더 높았습니다. 콜드브루가 더 부드럽게 느껴질 수는 있어도, pH로 재면 산도가 크게 낮지는 않습니다.',
              sources: ['rao-cold-brew'],
            },
          ],
        },
        {
          id: 'dutch-coffee',
          heading: '더치커피는 콜드브루와 무엇이 다른가',
          body: [
            {
              text: '더치커피는 콜드 드립입니다. 원두를 물에 담가 두는 대신, 위에 둔 찬물이나 얼음물이 원두 위로 천천히 떨어지고 아래에 원액이 모입니다. 우려내는 콜드브루와 떨어뜨리는 콜드 드립은 둘 다 열을 쓰지 않고, 물이 원두를 만나는 방식만 다릅니다.',
            },
            {
              text: '이름은 흔히 네덜란드 상인들이 배 위에서 찬물로 커피를 내렸다는 이야기로 설명됩니다. 이를 뒷받침하는 기록은 찾지 못했으니, 방식의 기원이 아니라 이름의 유래로만 받아들이는 편이 좋습니다.',
            },
          ],
        },
        {
          id: 'nitro',
          heading: '니트로 콜드브루는 무엇인가',
          body: [
            {
              text: '콜드브루에 질소를 녹여 탭으로 따르는 음료로, 질감이 크리미해집니다. 2016년 이터(Eater)의 보도에 따르면 최초의 니트로 커피가 2011년이냐 2012년이냐는 주장이 엇갈리고, 포틀랜드의 스텀프타운이 2013년 6월 매장에 질소 탭을 설치했으며, 스타벅스는 그해 여름까지 미국 500여 개 매장에서 판매할 계획이었습니다.',
              sources: ['cnbc-nitro'],
            },
          ],
        },
      ],
    },
  },
};

export default coldBrew;
