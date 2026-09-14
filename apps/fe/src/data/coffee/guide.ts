import type { Locale } from './types';
import type { SourceId } from './sources';

/*
  The two pieces of the guide page that belong to no single drink: the milk table and
  the list of dates. Both carry their sources, the same way a drink's paragraphs do.
*/

export type MilkRow = {
  slug: string;
  content: Record<Locale, { milk: string; foam: string }>;
};

/** Least milk to most. Recipes vary by café; these are the definitions the sources give. */
export const milkRows: MilkRow[] = [
  {
    slug: 'macchiato',
    content: {
      en: { milk: 'A spot of milk or foam', foam: 'Only the spot itself' },
      ko: { milk: '우유나 거품 한 점', foam: '얹은 한 점이 전부' },
    },
  },
  {
    slug: 'cortado',
    content: {
      en: { milk: 'Very little, up to about as much as the espresso', foam: 'Not part of the definition' },
      ko: { milk: '아주 조금에서 에스프레소와 비슷한 양까지', foam: '정의에 없음' },
    },
  },
  {
    slug: 'flat-white',
    content: {
      en: { milk: 'About two-thirds of a small cup', foam: 'Thin, about 0.5 cm' },
      ko: { milk: '작은 잔의 3분의 2쯤', foam: '얇게, 약 0.5cm' },
    },
  },
  {
    slug: 'cappuccino',
    content: {
      en: { milk: '100 ml to 25 ml of espresso, in the Italian certified recipe', foam: 'Thick, at least 1 cm' },
      ko: { milk: '이탈리아 인증 기준 에스프레소 25ml에 100ml', foam: '두껍게, 1cm 이상' },
    },
  },
  {
    slug: 'cafe-latte',
    content: {
      en: { milk: 'The most of any of these', foam: 'A thin layer' },
      ko: { milk: '이 가운데 가장 많음', foam: '얇게' },
    },
  },
];

export const milkSources: SourceId[] = [
  'treccani-macchiare',
  'rae-cafe',
  'dictcom-cortado',
  'pdg-flat-white',
  'iei-espresso',
];

export type DatedEvent = {
  /** Shown as written: a year, a decade, or a range. */
  when: Record<Locale, string>;
  slug: string;
  text: Record<Locale, string>;
  sources: SourceId[];
};

/*
  Only what a source dates. Each line links to the page that explains it; none of them
  is presented as the cause of the next.
*/
export const datedEvents: DatedEvent[] = [
  {
    when: { en: '1550s', ko: '1550년대' },
    slug: 'turkish-coffee',
    text: {
      en: 'Istanbul’s first coffee houses open; chroniclers give 1553 and 1554–55.',
      ko: '이스탄불에 첫 커피하우스가 문을 엽니다. 연대기에 따라 1553년, 1554~55년으로 기록됩니다.',
    },
    sources: ['tdv-kahvehane'],
  },
  {
    when: { en: '1826', ko: '1826' },
    slug: 'siphon',
    text: {
      en: 'Johann Nörremberg builds a steam-driven brewer to demonstrate steam to his students.',
      ko: '요한 뇌렘베르크가 학생들에게 증기의 힘을 보여 주려고 증기식 추출기를 만듭니다.',
    },
    sources: ['bh-syphon-history'],
  },
  {
    when: { en: '1884', ko: '1884' },
    slug: 'espresso',
    text: {
      en: 'Angelo Moriondo of Turin patents a steam machine for making coffee on demand.',
      ko: '토리노의 안젤로 모리온도가 주문 즉시 커피를 만드는 증기 머신으로 특허를 받습니다.',
    },
    sources: ['smithsonian-espresso'],
  },
  {
    when: { en: '1906', ko: '1906' },
    slug: 'espresso',
    text: {
      en: 'Luigi Bezzera and Desiderio Pavoni present “caffè espresso” at the Milan Fair.',
      ko: '루이지 베체라와 데시데리오 파보니가 밀라노 박람회에서 ‘카페 에스프레소’를 선보입니다.',
    },
    sources: ['smithsonian-espresso'],
  },
  {
    when: { en: '1908', ko: '1908' },
    slug: 'pour-over',
    text: {
      en: 'Melitta Bentz registers her paper coffee filter in Berlin.',
      ko: '멜리타 벤츠가 베를린에 종이 커피 필터를 등록합니다.',
    },
    sources: ['dpma-melitta'],
  },
  {
    when: { en: '1928', ko: '1928' },
    slug: 'french-press',
    text: {
      en: 'Ugo Paolini files the plunger design most French presses still follow.',
      ko: '우고 파올리니가 지금의 프렌치프레스 대부분이 따르는 플런저 설계를 출원합니다.',
    },
    sources: ['patent-paolini'],
  },
  {
    when: { en: '1933', ko: '1933' },
    slug: 'moka-pot',
    text: {
      en: 'Alfonso Bialetti makes the first Moka Express.',
      ko: '알폰소 비알레티가 첫 모카 익스프레스를 만듭니다.',
    },
    sources: ['bialetti-moka'],
  },
  {
    when: { en: '1941', ko: '1941' },
    slug: 'pour-over',
    text: {
      en: 'Peter Schlumbohm designs the Chemex.',
      ko: '페터 슐룸봄이 케멕스를 디자인합니다.',
    },
    sources: ['denver-chemex'],
  },
  {
    when: { en: '1943', ko: '1943' },
    slug: 'irish-coffee',
    text: {
      en: 'Irish coffee is said to be first served at Foynes airport; a Dublin hotel is also credited.',
      ko: '포인스 공항에서 아이리시 커피가 처음 나왔다고 전해집니다. 더블린의 한 호텔을 원조로 보는 주장도 있습니다.',
    },
    sources: ['epic-irish'],
  },
  {
    when: { en: 'After 1945', ko: '1945년 이후' },
    slug: 'espresso',
    text: {
      en: 'Achille Gaggia’s lever machines raise the pressure to 8–10 bar, and crema appears.',
      ko: '아킬레 가자의 레버 머신이 압력을 8~10바로 끌어올리고, 크레마가 생깁니다.',
    },
    sources: ['smithsonian-espresso'],
  },
  {
    when: { en: '1952', ko: '1952' },
    slug: 'irish-coffee',
    text: {
      en: 'The Buena Vista in San Francisco sets out to reproduce Irish coffee.',
      ko: '샌프란시스코의 부에나 비스타가 아이리시 커피 재현에 나섭니다.',
    },
    sources: ['epic-irish', 'kqed-irish'],
  },
  {
    when: { en: 'Mid-1980s', ko: '1980년대 중반' },
    slug: 'flat-white',
    text: {
      en: 'Alan Preston says he put “flat white” on his Sydney menu; a Wellington barista makes a rival claim.',
      ko: '앨런 프레스턴이 시드니 메뉴에 ‘플랫화이트’를 올렸다고 말합니다. 웰링턴의 한 바리스타도 원조를 주장합니다.',
    },
    sources: ['pdg-flat-white'],
  },
  {
    when: { en: '1996', ko: '1996' },
    slug: 'macchiato',
    text: {
      en: 'Starbucks introduces the Caramel Macchiato.',
      ko: '스타벅스가 카라멜 마키아토를 내놓습니다.',
    },
    sources: ['sprudge-caramel'],
  },
  {
    when: { en: '2005', ko: '2005' },
    slug: 'aeropress',
    text: {
      en: 'Alan Adler introduces the AeroPress at Coffee Fest Seattle.',
      ko: '앨런 애들러가 시애틀 커피 페스트에서 에어로프레스를 선보입니다.',
    },
    sources: ['aeropress-about'],
  },
  {
    when: { en: '2011–13', ko: '2011~13' },
    slug: 'cold-brew',
    text: {
      en: 'Nitro cold brew appears in US cafés; Stumptown installs nitrogen taps in 2013.',
      ko: '미국 카페에 니트로 콜드브루가 등장하고, 2013년 스텀프타운이 질소 탭을 설치합니다.',
    },
    sources: ['cnbc-nitro'],
  },
  {
    when: { en: '2013', ko: '2013' },
    slug: 'turkish-coffee',
    text: {
      en: 'UNESCO inscribes Turkish coffee culture and tradition as intangible heritage.',
      ko: '유네스코가 터키 커피 문화와 전통을 인류무형문화유산으로 등재합니다.',
    },
    sources: ['unesco-turkish'],
  },
  {
    when: { en: '2020', ko: '2020' },
    slug: 'dalgona',
    text: {
      en: 'Dalgona coffee spreads from a Korean TV show to the rest of the world.',
      ko: '달고나 커피가 한국 방송에서 시작해 전 세계로 퍼집니다.',
    },
    sources: ['mt-dalgona', 'sprudge-dalgona'],
  },
];
