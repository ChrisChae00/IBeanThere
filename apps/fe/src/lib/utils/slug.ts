/**
 * Generate a URL-friendly slug from a string
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Get cafe URL path using slug if available, otherwise fallback to ID
 */
export function getCafePath(cafe: { id: string; slug?: string }, locale: string = 'en'): string {
  if (cafe.slug) {
    return `/${locale}/cafes/${cafe.slug}`;
  }
  return `/${locale}/cafes/${cafe.id}`;
}

