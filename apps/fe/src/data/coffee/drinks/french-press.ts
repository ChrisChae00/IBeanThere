import type { CoffeeDrink } from '../types';

const frenchPress: CoffeeDrink = {
  slug: 'french-press',
  categoryId: 'brewing',
  content: {
    en: {
      name: 'French Press',
      tagline: 'It\'s called a French press. An Italian patented it first, in Milan, in 1929.',
      description:
        'The name is a lie, sort of. The "French" press was actually patented by an Italian designer, Attilio Calimani, in Milan in 1929 — the French connection only exists because a similar design was patented in France around the same time. Somehow the wrong nationality won the branding war.\n\nWhat it actually does is simple: coarse grounds steep in hot water for four minutes, then a metal mesh plunger separates the two — no paper filter to strip out the coffee\'s natural oils. That\'s why French press tastes heavier and bolder than pour over, with cafestol and kahweol compounds intact (the same oils paper filters trap, which is why they\'re linked to a small bump in LDL cholesterol). A little sediment at the bottom is the price of that weight — and for drinkers who want depth over clarity, it\'s a price worth paying.',
      origin:
        'Despite the name, the French press was actually patented by an Italian designer, Attilio Calimani, in Milan in 1929. The French connection comes from a similar design patented in France. It became popular in Europe throughout the mid-20th century and later gained global status as the easiest premium home-brewing method.',
      funFact:
        'Studies show that regular French press consumption slightly raises LDL cholesterol due to the unfiltered cafestol and kahweol compounds. Paper filters in pour-over methods trap these — which is why filtered coffee is often recommended for people with cholesterol concerns.',
    },
    ko: {
      name: '프렌치프레스',
      tagline: '\'프렌치\'프레스는 사실 1929년 밀라노에서 이탈리아 디자이너가 특허를 낸 제품이다.',
      description:
        '이름부터 어폐가 있습니다. "프렌치"프레스는 사실 1929년 밀라노에서 이탈리아 디자이너 아틸리오 칼리마니가 특허를 낸 제품입니다. 프랑스라는 이름이 붙은 건 비슷한 시기 프랑스에서 유사한 디자인이 특허를 받았기 때문일 뿐이죠. 어쩌다 보니 국적이 틀린 쪽이 이름 경쟁에서 이겼습니다.\n\n작동 방식은 단순합니다. 굵게 간 원두를 뜨거운 물에 4분간 담근 뒤, 금속 메쉬 플런저로 가루와 액체를 분리합니다. 종이 필터가 없으니 커피 본연의 오일이 그대로 남죠. 그래서 프렌치프레스는 푸어오버보다 무겁고 굵직한 맛을 냅니다. 카페스톨과 카웨올 성분이 살아있기 때문인데(종이 필터가 걸러내는 바로 그 성분), 이게 LDL 콜레스테롤을 살짝 올린다는 연구도 있습니다. 바닥에 남는 미세한 찌꺼기는 그 묵직함의 대가입니다. 선명함보다 깊이를 원하는 사람에게는 충분히 치를 만한 값이죠.',
      origin:
        '이름과 달리 프렌치프레스는 사실 1929년 밀라노에서 이탈리아 디자이너 아틸리오 칼리마니(Attilio Calimani)가 특허를 낸 제품입니다. 프랑스 연결고리는 프랑스에서 비슷한 디자인이 특허를 받은 데서 비롯됩니다. 20세기 중반 유럽에서 대중화된 이후, 가장 쉬운 고급 홈브루잉 방법으로 전 세계에 자리잡았습니다.',
      funFact:
        '연구에 따르면 프렌치프레스를 꾸준히 마시면 필터링되지 않는 카페스톨과 카웨올 성분으로 인해 LDL 콜레스테롤이 약간 상승할 수 있습니다. 푸어오버의 종이 필터는 이 성분을 걸러내기 때문에, 콜레스테롤 수치가 걱정되는 분들에게 필터 커피가 자주 권장됩니다.',
    },
  },
};

export default frenchPress;
