import type { CoffeeDrink } from '../types';

const americano: CoffeeDrink = {
  slug: 'americano',
  categoryId: 'espresso',
  reviewed: '2026-09-11',
  related: ['espresso', 'cold-brew', 'cafe-latte'],
  content: {
    en: {
      name: 'Americano',
      aka: 'In Italian: caffè americano. Iced, it is an iced americano',
      title: 'Americano: what it is, where the name comes from, and how it differs from a long black',
      description:
        'An americano is espresso diluted with hot water. What the dictionaries say about the name, how it differs from a long black and a lungo, and how the iced americano became a Korean staple.',
      summary:
        'An americano is espresso diluted with hot water, giving a longer, milder cup that keeps espresso’s flavour. Poured over ice with cold water, it is an iced americano. Unlike a lungo, the water is added after the shot is pulled rather than run through the coffee.',
      line: 'Espresso lengthened with hot water, served hot or over ice.',
      facts: [
        { label: 'In the cup', value: 'Espresso and hot water' },
        { label: 'Iced', value: 'Espresso, cold water and ice' },
        { label: 'Close relatives', value: 'Long black, Viennese Verlängerter' },
        { label: 'Not the same as', value: 'A lungo, where the water runs through the coffee' },
      ],
      sections: [
        {
          id: 'origin',
          heading: 'Where does the name “americano” come from?',
          body: [
            {
              text: 'The usual story is that American soldiers in Italy during the Second World War watered down espresso to make it taste like the coffee they drank at home. It is repeated almost everywhere, but we did not find a wartime record of it, and the dictionaries point somewhere else.',
            },
            {
              text: 'The Online Etymology Dictionary records “americano” in English by 1964 and traces it to Spanish café americano, a Central American term from the 1950s that disparaged the kind of coffee believed to be favoured in the United States. So the name is documented as a comment on American taste; the GI story may be true, but it is still a story.',
              sources: ['etym-americano'],
            },
          ],
        },
        {
          id: 'long-black',
          heading: 'Americano or long black?',
          body: [
            {
              text: 'The same two ingredients in the opposite order. A long black is made by pouring espresso into a cup of hot water; Breville’s recipe describes it as an americano made in reverse.',
              sources: ['breville-long-black'],
            },
            {
              text: 'Vienna’s coffee houses have their own version. The Austrian National Tourist Office describes the Verlängerter, “the lengthened one,” as an espresso diluted with the same amount of hot water.',
              sources: ['austria-coffeehouse'],
            },
          ],
        },
        {
          id: 'iced',
          heading: 'How popular is the iced americano in Korea?',
          body: [
            {
              text: 'Popular enough to have its own slang. The Korea Herald reported in 2023 that Starbucks Korea’s iced drinks made up 77% of the drinks it sold that year up to 23 November, up from 74% in 2022, and more than half even in January. The same article describes eoljuka — short for “even if I freeze to death, iced americano” — as the name for people who drink it through the winter.',
              sources: ['herald-iced'],
            },
          ],
        },
      ],
    },
    ko: {
      name: '아메리카노',
      aka: '이탈리아어로 caffè americano, 차갑게는 아이스 아메리카노',
      title: '아메리카노 유래와 뜻, 롱블랙과의 차이',
      description:
        '아메리카노는 에스프레소에 뜨거운 물을 더한 커피입니다. 이름에 대해 사전이 말하는 것, 롱블랙·룽고와의 차이, 한국의 아이스 아메리카노를 정리했습니다.',
      summary:
        '아메리카노는 에스프레소에 뜨거운 물을 더해 에스프레소의 맛은 살리면서 더 길고 순하게 만든 커피입니다. 찬물과 얼음에 부으면 아이스 아메리카노가 됩니다. 룽고와 달리 물은 원두를 통과시키지 않고, 샷을 뽑은 뒤에 더합니다.',
      line: '에스프레소에 뜨거운 물을 더해 길게 만든 커피. 뜨겁게도, 얼음 위에도.',
      facts: [
        { label: '재료', value: '에스프레소와 뜨거운 물' },
        { label: '아이스', value: '에스프레소, 찬물, 얼음' },
        { label: '가까운 음료', value: '롱블랙, 빈의 페어렝어터' },
        { label: '다른 음료', value: '룽고(물이 원두를 통과함)' },
      ],
      sections: [
        {
          id: 'origin',
          heading: '‘아메리카노’라는 이름은 어디서 왔나',
          body: [
            {
              text: '흔히 2차 세계대전 때 이탈리아에 주둔한 미군이 에스프레소에 물을 타 고향의 커피처럼 마신 데서 나왔다고 합니다. 거의 모든 곳에서 되풀이되는 이야기지만 전쟁 당시의 기록은 찾지 못했고, 사전은 다른 방향을 가리킵니다.',
            },
            {
              text: '온라인 어원 사전은 영어에서 ‘americano’가 1964년에는 쓰였다고 기록하며, 그 출처를 1950년대 중앙아메리카 스페인어 café americano로 봅니다. 미국 사람들이 즐긴다고 여겨진 묽은 커피를 낮춰 부르던 말입니다. 이름은 미국식 입맛에 대한 평으로 기록돼 있는 셈이고, 미군 이야기는 사실일 수도 있지만 아직은 이야기입니다.',
              sources: ['etym-americano'],
            },
          ],
        },
        {
          id: 'long-black',
          heading: '아메리카노와 롱블랙은 무엇이 다른가',
          body: [
            {
              text: '같은 두 재료를 반대 순서로 붓습니다. 롱블랙은 뜨거운 물이 담긴 잔에 에스프레소를 부어 만듭니다. 브레빌의 레시피는 이를 거꾸로 만든 아메리카노라고 설명합니다.',
              sources: ['breville-long-black'],
            },
            {
              text: '빈의 커피하우스에도 비슷한 음료가 있습니다. 오스트리아 관광청은 ‘늘린 것’이라는 뜻의 페어렝어터(Verlängerter)를 에스프레소에 같은 양의 뜨거운 물을 더한 커피로 소개합니다.',
              sources: ['austria-coffeehouse'],
            },
          ],
        },
        {
          id: 'iced',
          heading: '한국에서 아이스 아메리카노는 얼마나 마시나',
          body: [
            {
              text: '따로 이름이 붙을 만큼입니다. 코리아헤럴드는 2023년, 스타벅스코리아에서 그해 11월 23일까지 팔린 음료의 77%가 아이스 음료였고 2022년에는 74%였으며, 1월에도 절반을 넘었다고 보도했습니다. 같은 기사는 겨울에도 아이스 아메리카노를 고집하는 사람을 ‘얼죽아(얼어 죽어도 아이스 아메리카노)’라 부른다고 소개합니다.',
              sources: ['herald-iced'],
            },
          ],
        },
      ],
    },
  },
};

export default americano;
