const KNOWN_FRANCHISE_KEYWORDS = [
  'tim hortons',
  'tim hortons\'',
  'starbucks',
  'mcdonald\'s',
  'mcdonalds',
  'dunkin',
  'second cup',
  'coffee time',
  'aroma espresso',
  'williams',
  'philz coffee',
  'blue bottle',
  'peet\'s coffee',
  'peets coffee',
  'dutch bros',
  'costa coffee',
  'nero',
  'costa',
  'the coffee bean',
  'pret a manger',
  'pret',
  'jamba juice',
  'krispy kreme',
  'donut',
  'taco bell',
  'subway',
  'burger king',
  'wendy\'s',
  'a&w',
  'kfc',
  'pizza hut',
  'domino\'s',
  'little caesars'
];

export function isFranchise(name: string): boolean {
  const lowerName = name.toLowerCase();
  
  return KNOWN_FRANCHISE_KEYWORDS.some(keyword => 
    lowerName.includes(keyword.toLowerCase())
  );
}

export function getFranchiseType(name: string): 'fast_food' | 'coffee_chain' | 'restaurant_chain' | 'local' {
  const lowerName = name.toLowerCase();
  
  const coffeeChains = ['tim hortons', 'starbucks', 'dunkin', 'second cup', 'coffee time', 'aroma', 'philz', 'blue bottle', 'peet\'s', 'dutch bros', 'costa', 'nero'];
  const fastFood = ['mcdonald', 'taco bell', 'subway', 'burger king', 'wendy\'s', 'a&w', 'kfc', 'donut'];
  const restaurants = ['pizza hut', 'domino', 'little caesar'];
  
  if (coffeeChains.some(chain => lowerName.includes(chain))) {
    return 'coffee_chain';
  }
  if (fastFood.some(food => lowerName.includes(food))) {
    return 'fast_food';
  }
  if (restaurants.some(rest => lowerName.includes(rest))) {
    return 'restaurant_chain';
  }
  
  return 'local';
}

export function extractFranchiseName(name: string): string | null {
  const lowerName = name.toLowerCase();
  
  for (const keyword of KNOWN_FRANCHISE_KEYWORDS) {
    if (lowerName.includes(keyword.toLowerCase())) {
      return keyword;
    }
  }
  
  return null;
}

