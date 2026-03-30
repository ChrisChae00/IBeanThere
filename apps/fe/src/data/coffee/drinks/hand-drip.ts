import type { CoffeeDrink } from '../types';

const handDrip: CoffeeDrink = {
  slug: 'hand-drip',
  categoryId: 'brewing',
  content: {
    en: {
      name: 'Hand Drip',
      tagline: 'Slow, deliberate, and deeply personal.',
      description:
        'Hand drip is a broad term for any manual pour-over brewing method where hot water is poured by hand over coffee grounds held in a filter. The brewer controls everything — water temperature, pour rate, bloom time, and total extraction — making it the most expressive method for showcasing a coffee\'s origin character.\n\nUnlike espresso, hand drip favors clarity over intensity. The result is a clean, nuanced cup where floral, fruity, or tea-like notes can shine through without interference from pressure or metal filters. It takes patience, but the reward is a cup that feels genuinely crafted.',
      origin:
        'The modern hand drip tradition traces back to Melitta Bentz, a German housewife who invented the paper filter in 1908 after being frustrated by over-extracted coffee from cloth filters. Japan later elevated hand drip into an art form — the Japanese "café culture" of the mid-20th century made slow pour technique a matter of precision and pride.',
      funFact:
        'In Japan, some specialty coffee bars time their pours to the second. There are baristas who have spent decades perfecting a single pouring motion — the spiral pour — to achieve perfectly even extraction.',
    },
    ko: {
      name: '핸드드립',
      tagline: '느리고, 섬세하고, 지극히 개인적인.',
      description:
        '핸드드립은 필터에 담긴 커피 가루 위로 손으로 직접 뜨거운 물을 붓는 모든 수동 추출 방식을 통칭합니다. 물 온도, 붓는 속도, 뜸 들이기 시간, 총 추출량 — 모든 것을 브루어가 직접 제어합니다. 그래서 커피 본연의 원산지 캐릭터를 가장 잘 표현할 수 있는 방법이기도 합니다.\n\n에스프레소와 달리 핸드드립은 강도보다 선명도를 추구합니다. 꽃 향, 과일 향, 티 계열의 뉘앙스가 압력이나 금속 필터의 방해 없이 그대로 살아납니다. 시간이 걸리지만, 결과물은 진짜 만들어진 한 잔의 느낌입니다.',
      origin:
        '현대 핸드드립의 기원은 1908년 독일의 주부 멜리타 벤츠(Melitta Bentz)까지 거슬러 올라갑니다. 천 필터의 잡맛에 지친 그녀가 종이 필터를 발명한 것이 출발점입니다. 이후 일본이 핸드드립을 예술의 경지로 끌어올렸습니다. 20세기 중반 일본 커피 문화는 느린 드립 기술을 정밀함과 자부심의 문제로 만들었습니다.',
      funFact:
        '일본의 일부 스페셜티 카페에서는 물 붓는 시간을 초 단위로 잽니다. 수십 년에 걸쳐 나선형 붓기 동작 하나를 완성하는 바리스타도 있습니다.',
    },
  },
};

export default handDrip;
