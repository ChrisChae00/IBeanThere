export const TRENDING_CAFES_COUNT = 3;

const googlePhotoLimit = Number(
  process.env.NEXT_PUBLIC_GOOGLE_PLACE_PHOTO_PER_PAGE_LIMIT ?? '3'
);
if (!Number.isInteger(googlePhotoLimit) || googlePhotoLimit < 0 || googlePhotoLimit > 12) {
  throw new Error('NEXT_PUBLIC_GOOGLE_PLACE_PHOTO_PER_PAGE_LIMIT must be an integer from 0 to 12');
}
export const GOOGLE_PLACE_PHOTO_PER_PAGE_LIMIT = googlePhotoLimit;
export const TRENDING_CAFES_COLUMNS = 1;
// One page = one API request. 12 divides evenly into the 2/3/4-column grid.
export const CAFE_GRID_ITEMS_PER_PAGE = 12;
export const SMALL_CARD_IMAGE_HEIGHT = 120;
export const LARGE_CARD_IMAGE_HEIGHT = 200;
