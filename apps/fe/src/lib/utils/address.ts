/**
 * Extracts the city name from a full address string
 * Handles various address formats including OSM format
 * 
 * NOTE: This is a simple pattern-based approach for current use cases.
 * For global scale, consider:
 * 1. Using structured address data from backend (OSM already provides 'city' field)
 * 2. Integrating address parsing libraries (e.g., node-postal, libpostal)
 * 3. Leveraging OSM address structure (city, state, country fields)
 * 
 * @param address - Full address string
 * @returns City name or original address if city cannot be determined
 */
export function extractCity(address: string | null | undefined): string {
  if (!address) return '';

  const trimmed = address.trim();
  if (!trimmed) return '';

  // Split by comma and clean up each part
  const parts = trimmed.split(',').map(part => part.trim()).filter(Boolean);

  if (parts.length === 0) return trimmed;

  // Common patterns:
  // 1. "Street, City, State/Province, Country" - city is usually 2nd from end (before state/country)
  // 2. "Street, Neighborhood, City, State, Country" - city is usually 3rd from end
  // 3. OSM format: "Street, Area, City, Region, State, Postal, Country"
  
  // Try to find city by common patterns
  // City is typically before state/province and after street/neighborhood
  
  // Check if there's a postal code pattern (helps identify position)
  const postalCodePattern = /\b[A-Z0-9]{3,}\s?[A-Z0-9]{3,}\b/;
  const hasPostalCode = parts.some(part => postalCodePattern.test(part));
  
  // Common state/province indicators
  const stateIndicators = [
    'ontario', 'quebec', 'british columbia', 'alberta', 'manitoba',
    'saskatchewan', 'nova scotia', 'new brunswick', 'newfoundland',
    'prince edward island', 'northwest territories', 'yukon', 'nunavut',
    'california', 'new york', 'texas', 'florida', 'illinois', 'pennsylvania',
    'ohio', 'georgia', 'north carolina', 'michigan', 'new jersey'
  ];
  
  // Find state/province position
  let stateIndex = -1;
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i].toLowerCase();
    if (stateIndicators.some(state => part.includes(state))) {
      stateIndex = i;
      break;
    }
  }
  
  // If we found a state, city is likely the element before it
  if (stateIndex > 0) {
    const candidate = parts[stateIndex - 1];
    const candidateLower = candidate.toLowerCase();
    
    // Check if the candidate is a region/metropolitan area (e.g., "Region of Waterloo")
    // If so, the actual city is likely the element before the region
    const regionPatterns = [
      /^region of /i,
      /^metro /i,
      /^metropolitan /i,
      /^greater /i,
      /^county of /i,
      /^district of /i
    ];
    
    if (regionPatterns.some(pattern => pattern.test(candidate))) {
      // Region found, city is likely before it
      if (stateIndex > 1) {
        return parts[stateIndex - 2];
      }
    }
    
    return candidate;
  }
  
  // If there's a postal code, city is likely before it
  if (hasPostalCode) {
    const postalIndex = parts.findIndex(part => postalCodePattern.test(part));
    if (postalIndex > 0) {
      return parts[postalIndex - 1];
    }
  }
  
  // Fallback: if address has 3+ parts, city is likely the 2nd from end
  // (before state/country)
  if (parts.length >= 3) {
    // Skip last part (usually country) and second-to-last might be state
    // So city could be 2nd or 3rd from end
    const candidateIndex = parts.length - 3;
    if (candidateIndex >= 0) {
      const candidate = parts[candidateIndex];
      // If it looks like a city (not too long, doesn't contain numbers)
      if (candidate.length < 50 && !/^\d+/.test(candidate)) {
        return candidate;
      }
    }
  }
  
  // If address has 2 parts, second part might be city
  if (parts.length === 2) {
    return parts[1];
  }
  
  // Last resort: return the part that's most likely to be a city
  // (not the first which is usually street, not the last which is usually country)
  if (parts.length > 2) {
    return parts[parts.length - 2];
  }
  
  // If we can't determine, return original address
  return trimmed;
}

