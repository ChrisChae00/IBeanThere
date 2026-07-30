import type { CoffeeDrink } from '../types';

const handDrip: CoffeeDrink = {
  slug: 'hand-drip',
  categoryId: 'brewing',
  content: {
    en: {
      name: 'Hand Drip',
      tagline: 'One frustrated housewife\'s fix in 1908 became an art some baristas now spend decades perfecting to the second.',
      description:
        'In 1908, a German housewife named Melitta Bentz was sick of gritty, over-extracted coffee seeping through cloth filters. So she made her own paper one — and in doing so, handed total control of the brew to whoever\'s holding the kettle. Water temperature, pour rate, bloom time: every variable became a choice instead of an accident.\n\nThat control is why hand drip shows off a coffee\'s character better than almost any other method — clean, nuanced, no pressure or metal filter getting in the way. Japan took it furthest: mid-century café culture turned the pour into a discipline of its own, and some baristas there have spent decades refining a single spiral pour to the second, chasing perfectly even extraction one drop at a time.',
      origin:
        'The modern hand drip tradition traces back to Melitta Bentz, a German housewife who invented the paper filter in 1908 after being frustrated by over-extracted coffee from cloth filters. Japan later elevated hand drip into an art form — the Japanese "café culture" of the mid-20th century made slow pour technique a matter of precision and pride.',
      funFact:
        'In Japan, some specialty coffee bars time their pours to the second. There are baristas who have spent decades perfecting a single pouring motion — the spiral pour — to achieve perfectly even extraction.',
    },
    ko: {
      name: '핸드드립',
      tagline: '1908년, 커피 찌꺼기에 질린 독일 주부가 만든 필터 하나가 붓는 사람에게 모든 결정권을 넘겼다.',
      description:
        '1908년, 독일의 주부 멜리타 벤츠는 천 필터를 통과한 커피에서 자꾸 씁쓸한 찌꺼기가 씹히는 것에 질려버렸습니다. 그래서 직접 종이 필터를 만들었죠. 그 결과, 추출의 모든 결정권이 물을 붓는 사람에게 넘어갔습니다. 물 온도, 붓는 속도, 뜸 들이기 시간 — 우연이 아니라 선택의 영역이 된 것입니다.\n\n이런 통제력 덕분에 핸드드립은 다른 어떤 방식보다 원두 본연의 캐릭터를 잘 드러냅니다. 압력도, 금속 필터의 방해도 없이 선명하고 섬세한 맛이 살아납니다. 일본은 이걸 극한까지 밀어붙였습니다. 20세기 중반 일본 커피 문화는 붓는 행위 자체를 하나의 수련으로 만들었고, 일부 바리스타는 나선형으로 붓는 동작 하나를 초 단위로 완성하기 위해 수십 년을 쏟았습니다.',
      origin:
        '현대 핸드드립의 기원은 1908년 독일의 주부 멜리타 벤츠(Melitta Bentz)까지 거슬러 올라갑니다. 천 필터의 잡맛에 지친 그녀가 종이 필터를 발명한 것이 출발점입니다. 이후 일본이 핸드드립을 예술의 경지로 끌어올렸습니다. 20세기 중반 일본 커피 문화는 느린 드립 기술을 정밀함과 자부심의 문제로 만들었습니다.',
      funFact:
        '일본의 일부 스페셜티 카페에서는 물 붓는 시간을 초 단위로 잽니다. 수십 년에 걸쳐 나선형 붓기 동작 하나를 완성하는 바리스타도 있습니다.',
    },
  },
};

export default handDrip;
