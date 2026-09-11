/*
  Every source the guide cites, in one place so a title or URL is corrected once.
  Titles stay in the language they were published in. `checked` is not stored per
  source: each drink carries the date its page's sources were last opened.
*/
export type Source = {
  title: string;
  publisher: string;
  url: string;
  /** Publication year or date, when the source gives one. */
  date?: string;
};

export const sources = {
  'unesco-turkish': {
    title: 'Turkish coffee culture and tradition',
    publisher: 'UNESCO Intangible Cultural Heritage',
    url: 'https://ich.unesco.org/en/RL/turkish-coffee-culture-and-tradition-00645',
    date: '2013',
  },
  'tdv-kahvehane': {
    title: 'Kahvehane',
    publisher: 'TDV İslâm Ansiklopedisi',
    url: 'https://islamansiklopedisi.org.tr/kahvehane',
  },
  'harvard-coffee': {
    title: 'Coffee',
    publisher: 'Harvard T.H. Chan School of Public Health, The Nutrition Source',
    url: 'https://nutritionsource.hsph.harvard.edu/food-features/coffee/',
  },
  'dpma-melitta': {
    title: 'Melitta Bentz´ coffee filters',
    publisher: 'German Patent and Trade Mark Office (DPMA)',
    url: 'https://www.dpma.de/english/our_office/publications/ingeniouswomen/110jahrekaffeefilter/index.html',
  },
  'denver-chemex': {
    title: 'Chemex Coffee Maker, 1941',
    publisher: 'Denver Art Museum',
    url: 'https://www.denverartmuseum.org/en/object/1970.118',
  },
  'patent-paolini': {
    title: 'US1797672A: Apparatus for preparing infusions, particularly for preparing coffee',
    publisher: 'Google Patents',
    url: 'https://patents.google.com/patent/US1797672A/en',
    date: '1931',
  },
  'bh-french-press': {
    title: 'The History of French Press',
    publisher: 'Barista Hustle',
    url: 'https://www.baristahustle.com/lesson/im-3-01-the-history-of-french-press/',
  },
  'aeropress-about': {
    title: 'About AeroPress, Inc. and Alan Adler',
    publisher: 'AeroPress, Inc.',
    url: 'https://aeropress.com/pages/about',
  },
  'bh-syphon-history': {
    title: 'Syphon Coffee',
    publisher: 'Barista Hustle',
    url: 'https://www.baristahustle.com/lesson/im-4-06-syphon-coffee/',
  },
  'bh-syphon-science': {
    title: 'The Science Behind Syphons',
    publisher: 'Barista Hustle',
    url: 'https://www.baristahustle.com/lesson/im-4-07-the-science-behind-syphons/',
  },
  'bialetti-moka': {
    title: 'An idea … with a mustache. Do you know who invented the Moka?',
    publisher: 'Bialetti',
    url: 'https://www.bialetti.com/it_en/inspiration/post/An-idea-with-a-mustache-do-you-know-who-invented-the-moka',
  },
  'navarini-moka': {
    title: 'Experimental investigation of steam pressure coffee extraction in a stove-top coffee maker',
    publisher: 'Applied Thermal Engineering',
    url: 'https://doi.org/10.1016/j.applthermaleng.2008.05.014',
    date: '2009',
  },
  'rao-cold-brew': {
    title: 'Acidity and Antioxidant Activity of Cold Brew Coffee',
    publisher: 'Scientific Reports',
    url: 'https://www.nature.com/articles/s41598-018-34392-w',
    date: '2018',
  },
  'cnbc-nitro': {
    title: 'Starbucks Introduces Nitro Coffee',
    publisher: 'CNBC, from Eater',
    url: 'https://www.cnbc.com/2016/05/31/starbucks-introduces-nitro-coffee.html',
    date: '2016',
  },
  'smithsonian-espresso': {
    title: 'The Long History of the Espresso Machine',
    publisher: 'Smithsonian Magazine',
    url: 'https://www.smithsonianmag.com/arts-culture/the-long-history-of-the-espresso-machine-126012814/',
    date: '2012',
  },
  'iei-espresso': {
    title: 'Certified Italian Espresso',
    publisher: 'Istituto Nazionale Espresso Italiano',
    url: 'https://iei.coffee/en/espresso-italiano-certificato/',
  },
  'etym-espresso': {
    title: 'espresso',
    publisher: 'Online Etymology Dictionary',
    url: 'https://www.etymonline.com/word/espresso',
  },
  'etym-americano': {
    title: 'americano',
    publisher: 'Online Etymology Dictionary',
    url: 'https://www.etymonline.com/word/americano',
  },
  'etym-cappuccino': {
    title: 'cappuccino',
    publisher: 'Online Etymology Dictionary',
    url: 'https://www.etymonline.com/word/cappuccino',
  },
  'etym-latte': {
    title: 'latte',
    publisher: 'Online Etymology Dictionary',
    url: 'https://www.etymonline.com/word/latte',
  },
  'etym-affogato': {
    title: 'affogato',
    publisher: 'Online Etymology Dictionary',
    url: 'https://www.etymonline.com/word/affogato',
  },
  'treccani-ristretto': {
    title: 'ristretto',
    publisher: 'Vocabolario Treccani',
    url: 'https://www.treccani.it/vocabolario/ristretto/',
  },
  'treccani-lungo': {
    title: 'lungo',
    publisher: 'Vocabolario Treccani',
    url: 'https://www.treccani.it/vocabolario/lungo/',
  },
  'treccani-caffellatte': {
    title: 'caffellatte',
    publisher: 'Vocabolario Treccani',
    url: 'https://www.treccani.it/vocabolario/caffellatte/',
  },
  'treccani-macchiare': {
    title: 'macchiare',
    publisher: 'Vocabolario Treccani',
    url: 'https://www.treccani.it/vocabolario/macchiare/',
  },
  'treccani-cappuccino': {
    title: 'cappuccino²',
    publisher: 'Vocabolario Treccani',
    url: 'https://www.treccani.it/vocabolario/cappuccino2/',
  },
  'treccani-panna': {
    title: 'panna',
    publisher: 'Vocabolario Treccani',
    url: 'https://www.treccani.it/vocabolario/panna1/',
  },
  'rae-cafe': {
    title: 'café',
    publisher: 'Real Academia Española, Diccionario de la lengua española',
    url: 'https://dle.rae.es/caf%C3%A9',
  },
  'rae-cortado': {
    title: 'cortado',
    publisher: 'Real Academia Española, Diccionario de la lengua española',
    url: 'https://dle.rae.es/cortado',
  },
  'dictcom-cortado': {
    title: 'cortado',
    publisher: 'Dictionary.com',
    url: 'https://www.dictionary.com/browse/cortado',
  },
  'dictcom-flat-white': {
    title: 'flat white',
    publisher: 'Dictionary.com',
    url: 'https://www.dictionary.com/browse/flat-white',
  },
  'pdg-flat-white': {
    title: 'What is a flat white & where did it come from?',
    publisher: 'Perfect Daily Grind',
    url: 'https://perfectdailygrind.com/2022/06/what-is-a-flat-white/',
    date: '2022',
  },
  'herald-iced': {
    title: "Koreans will 'freeze to death' for iced Americanos even in winter",
    publisher: 'The Korea Herald',
    url: 'https://www.koreaherald.com/article/3268846',
    date: '2023',
  },
  'breville-long-black': {
    title: 'Long Black',
    publisher: 'Breville',
    url: 'https://www.breville.com/us/en/coffee-journey/recipes/long-black.html',
  },
  'breville-breve': {
    title: 'Understanding the differences between breve vs. latte',
    publisher: 'Breville',
    url: 'https://www.breville.com/us/en/blog/coffee-and-espresso/breve-vs-latte.html',
  },
  'sprudge-caramel': {
    title: 'What Is A Caramel Macchiato?',
    publisher: 'Sprudge',
    url: 'https://sprudge.com/what-is-a-caramel-macchiato-177463.html',
    date: '2021',
  },
  'austria-coffeehouse': {
    title: 'Viennese Coffeehouse Culture',
    publisher: 'Austrian National Tourist Office',
    url: 'https://www.austria.info/en-us/inspiration/coffeehouse-culture/',
  },
  'epic-irish': {
    title: 'How Irish Coffee became an international hit',
    publisher: 'EPIC The Irish Emigration Museum',
    url: 'https://epicchq.com/story/how-irish-coffee-became-an-international-hit/',
  },
  'kqed-irish': {
    title: 'The True History of Irish Coffee and Its San Francisco Origins',
    publisher: 'KQED',
    url: 'https://www.kqed.org/news/11621844/the-true-history-of-irish-coffee-and-its-san-francisco-origins',
  },
  'dcn-vietnam': {
    title: 'Vietnam Coffee Report: Production Rising for Third Straight Year',
    publisher: 'Daily Coffee News',
    url: 'https://dailycoffeenews.com/2026/06/24/vietnam-coffee-report-production-rising-for-third-straight-year/',
    date: '2026',
  },
  'barista-mag-vietnam': {
    title: 'An Unfiltered History of Vietnamese Coffee',
    publisher: 'Barista Magazine',
    url: 'https://www.baristamagazine.com/an-unfiltered-history-of-vietnamese-coffee/',
  },
  'sprudge-dalgona': {
    title: 'What is Dalgona Coffee?',
    publisher: 'Sprudge',
    url: 'https://sprudge.com/coffee-basics-what-is-dalgona-coffee-177666.html',
    date: '2021',
  },
  'mt-dalgona': {
    title: '그때 특허냈으면…정일우 "\'전세계 돌풍\' 달고나 커피 내가 개발"',
    publisher: '머니투데이',
    url: 'https://www.mt.co.kr/entertainment/2026/07/22/2026072206223544791',
    date: '2026',
  },
} satisfies Record<string, Source>;

export type SourceId = keyof typeof sources;

export function getSource(id: SourceId): Source {
  return sources[id];
}
