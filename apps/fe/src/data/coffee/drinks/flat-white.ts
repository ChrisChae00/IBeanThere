import type { CoffeeDrink } from '../types';

const flatWhite: CoffeeDrink = {
  slug: 'flat-white',
  categoryId: 'espresso',
  reviewed: '2026-09-11',
  related: ['cafe-latte', 'cappuccino', 'cortado'],
  content: {
    en: {
      name: 'Flat white',
      title: 'Flat white vs latte, and who invented it: Australia or New Zealand',
      description:
        'A flat white is espresso with steamed milk and a thin layer of fine microfoam, smaller than a latte. How it differs from a latte and a cappuccino, and the two competing origin claims.',
      summary:
        'A flat white is espresso with steamed milk textured into fine microfoam, poured so that only a thin, flat layer of foam sits on top. It is smaller than a latte and has less milk, so the coffee comes through more strongly. Australia and New Zealand both claim it.',
      line: 'Espresso with steamed milk and a thin layer of fine microfoam, smaller than a latte.',
      facts: [
        { label: 'In the cup', value: 'Espresso and steamed milk' },
        { label: 'Foam', value: 'About 0.5 cm' },
        { label: 'Size', value: 'Smaller than a latte or a cappuccino' },
        { label: 'Origin', value: 'Claimed by both Australia and New Zealand' },
      ],
      sections: [
        {
          id: 'vs-latte',
          heading: 'What is the difference between a flat white and a latte?',
          body: [
            {
              text: 'Size, milk and foam. A flat white is the smaller drink, roughly two-thirds milk, with a thin layer of foam — Perfect Daily Grind puts it at about 0.5 cm, against at least 1 cm on a cappuccino. A latte is larger, with more milk for the same espresso, so the coffee is milder.',
              sources: ['pdg-flat-white'],
            },
          ],
        },
        {
          id: 'origin',
          heading: 'Who invented the flat white, Australia or New Zealand?',
          body: [
            {
              text: 'Perfect Daily Grind calls the origin somewhat contentious, and both leading claims rest on the claimants’ own accounts. Alan Preston says he was the first café owner to put “flat white” permanently on a menu, at his Sydney café in the mid-1980s, for customers who asked for a “white coffee — flat”; his recipe used a double ristretto and milk with little foam. In New Zealand, Fraser McInnes says the name came from a cappuccino whose low-fat milk would not foam: “Sorry, it’s a flat white.”',
              sources: ['pdg-flat-white'],
            },
            {
              text: 'The words may be older than either story: Dictionary.com dates the first recorded use of “flat white” to 1970–75.',
              sources: ['dictcom-flat-white'],
            },
          ],
        },
      ],
    },
    ko: {
      name: '플랫화이트',
      title: '플랫화이트와 라테 차이, 호주와 뉴질랜드의 원조 논쟁',
      description:
        '플랫화이트는 에스프레소에 고운 마이크로폼으로 질감을 낸 우유를 얇게 올린, 라테보다 작은 음료입니다. 라테·카푸치노와의 차이와 엇갈리는 두 기원 주장을 정리했습니다.',
      summary:
        '플랫화이트는 에스프레소에 고운 마이크로폼으로 질감을 낸 스팀 우유를 부어, 위에 얇고 평평한 거품층만 남긴 음료입니다. 라테보다 작고 우유가 적어 커피 맛이 더 또렷합니다. 호주와 뉴질랜드가 모두 원조를 주장합니다.',
      line: '에스프레소에 고운 마이크로폼 우유를 얇게 올린, 라테보다 작은 음료.',
      facts: [
        { label: '재료', value: '에스프레소와 스팀 우유' },
        { label: '거품', value: '약 0.5cm' },
        { label: '크기', value: '라테나 카푸치노보다 작음' },
        { label: '기원', value: '호주와 뉴질랜드가 모두 주장' },
      ],
      sections: [
        {
          id: 'vs-latte',
          heading: '플랫화이트와 라테는 무엇이 다른가',
          body: [
            {
              text: '크기, 우유의 양, 거품입니다. 플랫화이트는 더 작은 음료로 우유가 3분의 2 정도이고 거품층이 얇습니다. 커피 매체 퍼펙트 데일리 그라인드는 플랫화이트의 거품을 약 0.5cm, 카푸치노를 최소 1cm로 봅니다. 라테는 같은 에스프레소에 우유를 더 많이 넣은 큰 음료라 커피 맛이 순합니다.',
              sources: ['pdg-flat-white'],
            },
          ],
        },
        {
          id: 'origin',
          heading: '플랫화이트는 호주에서 왔나, 뉴질랜드에서 왔나',
          body: [
            {
              text: '퍼펙트 데일리 그라인드는 기원이 ‘다소 논쟁적’이라고 적고, 두 주장 모두 당사자의 증언에 기대고 있습니다. 호주의 앨런 프레스턴은 1980년대 중반 시드니의 자기 카페에서 ‘화이트 커피, 플랫으로’를 찾는 손님들을 보고 처음으로 ‘플랫화이트’를 메뉴에 고정해 올렸다고 말합니다. 그의 레시피는 더블 리스트레토에 거품이 적은 우유였습니다. 뉴질랜드의 프레이저 매키니스는 저지방 우유로 카푸치노 거품이 나지 않자 “죄송해요, 플랫화이트예요”라고 한 데서 이름이 나왔다고 말합니다.',
              sources: ['pdg-flat-white'],
            },
            {
              text: '이 말 자체는 두 이야기보다 오래됐을 수도 있습니다. Dictionary.com은 ‘flat white’의 첫 기록을 1970~75년으로 봅니다.',
              sources: ['dictcom-flat-white'],
            },
          ],
        },
      ],
    },
  },
};

export default flatWhite;
