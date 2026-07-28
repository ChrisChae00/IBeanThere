import type { CoffeeDrink } from '../types';

const frenchPress: CoffeeDrink = {
  slug: 'french-press',
  categoryId: 'brewing',
  content: {
    en: {
      name: 'French Press',
      tagline: 'Full-bodied, immersive, unapologetically bold.',
      description:
        'French press is an immersion brewer — coarsely ground coffee steeps directly in hot water for 4 minutes, then a metal mesh plunger is pressed down to separate grounds from liquid. With no paper filter involved, coffee oils (including cafestol and kahweol) pass freely into the cup, creating a rich, heavy body that paper-filtered methods deliberately remove.\n\nThe trade-off: a small amount of fine sediment settles at the bottom, and the cup is never quite as clean or bright as pour over. But for drinkers who want weight and depth over clarity, nothing competes with a well-made French press.',
      origin:
        'Despite the name, the French press was actually patented by an Italian designer, Attilio Calimani, in Milan in 1929. The French connection comes from a similar design patented in France. It became popular in Europe throughout the mid-20th century and later gained global status as the easiest premium home-brewing method.',
      funFact:
        'Studies show that regular French press consumption slightly raises LDL cholesterol due to the unfiltered cafestol and kahweol compounds. Paper filters in pour-over methods trap these — which is why filtered coffee is often recommended for people with cholesterol concerns.',
    },
    ko: {
      name: '프렌치프레스',
      tagline: '풍성하고, 진하고, 타협 없이 굵직한.',
      description:
        '프렌치프레스는 침지 방식의 브루어입니다. 굵게 분쇄한 원두를 뜨거운 물에 4분간 직접 담가 추출한 후, 금속 메쉬 플런저를 눌러 커피 가루와 액체를 분리합니다. 종이 필터를 사용하지 않기 때문에 커피 오일(카페스톨, 카웨올 포함)이 그대로 컵에 전달되며, 종이 필터 방식이 의도적으로 걸러내는 진한 바디감이 살아납니다.\n\n단점은 미세한 커피 찌꺼기가 바닥에 가라앉고, 푸어오버처럼 깔끔하거나 밝은 맛은 나지 않는다는 것입니다. 하지만 선명함보다 무게감과 깊이를 원하는 사람에게 잘 만든 프렌치프레스는 따라올 것이 없습니다.',
      origin:
        '이름과 달리 프렌치프레스는 사실 1929년 밀라노에서 이탈리아 디자이너 아틸리오 칼리마니(Attilio Calimani)가 특허를 낸 제품입니다. 프랑스 연결고리는 프랑스에서 비슷한 디자인이 특허를 받은 데서 비롯됩니다. 20세기 중반 유럽에서 대중화된 이후, 가장 쉬운 고급 홈브루잉 방법으로 전 세계에 자리잡았습니다.',
      funFact:
        '연구에 따르면 프렌치프레스를 꾸준히 마시면 필터링되지 않는 카페스톨과 카웨올 성분으로 인해 LDL 콜레스테롤이 약간 상승할 수 있습니다. 푸어오버의 종이 필터는 이 성분을 걸러내기 때문에, 콜레스테롤 수치가 걱정되는 분들에게 필터 커피가 자주 권장됩니다.',
    },
  },
};

export default frenchPress;
