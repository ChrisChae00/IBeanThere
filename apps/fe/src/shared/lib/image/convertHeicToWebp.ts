const HEIC_MIME_TYPES = new Set([
  'image/heic',
  'image/heif',
  'image/heic-sequence',
  'image/heif-sequence',
]);

const HEIC_EXTENSIONS = new Set(['.heic', '.heif']);

// Max dimension for uploaded photos — iPhone photos are 12MP+ and don't need
// full resolution in a cafe app. Resizing to 2048px keeps quality while
// staying well under the 5MB upload limit.
const MAX_DIMENSION = 2048;
const WEBP_QUALITY = 0.8;

export function isHeicFile(file: File): boolean {
  if (HEIC_MIME_TYPES.has(file.type)) return true;

  // Fallback: some iOS/macOS browsers report empty MIME type for HEIC
  const ext = '.' + (file.name.split('.').pop()?.toLowerCase() ?? '');
  return HEIC_EXTENSIONS.has(ext);
}

export class HeicNotSupportedError extends Error {
  constructor() {
    super('HEIC conversion failed: browser does not support HEIC decoding');
    this.name = 'HeicNotSupportedError';
  }
}

/**
 * Convert a HEIC/HEIF file to WebP, resizing to MAX_DIMENSION if needed.
 *
 * Strategy:
 *  1. createImageBitmap — works natively in Safari/iOS (the primary source of
 *     HEIC), decoding off the main thread. Also resizes large photos to stay under
 *     the upload size limit.
 *  2. heic-to (libheif WASM) — fallback for browsers that cannot decode HEIC,
 *     which is every browser except Safari. It is asked for raw pixels, not an
 *     encoded image, so the resize and the single encode happen here.
 *  3. Both fail → throw HeicNotSupportedError so callers can show a
 *     browser-specific hint.
 */
export async function convertHeicToWebp(file: File): Promise<File> {
  const baseName = file.name.replace(/\.[^.]+$/, '');

  try {
    return await convertViaCanvas(file, baseName);
  } catch (canvasError) {
    console.warn('Canvas HEIC conversion failed, trying libheif:', canvasError);
    try {
      return await convertViaLibheif(file, baseName);
    } catch (libheifError) {
      console.warn('libheif conversion also failed:', libheifError);
      throw new HeicNotSupportedError();
    }
  }
}

async function convertViaCanvas(file: File, baseName: string): Promise<File> {
  /*
    `createImageBitmap` decodes off the main thread and rejects rather than firing an
    error event, so the native path is both cheaper and easier to fall through than
    the `new Image()` + object URL dance it replaces.
  */
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error('Browser cannot decode this HEIC file natively');
  }

  try {
    return await encodeBitmap(bitmap, baseName);
  } finally {
    bitmap.close();
  }
}

async function convertViaLibheif(file: File, baseName: string): Promise<File> {
  /* Loaded on demand: the decoder is a WASM bundle nobody who uploads a JPEG needs. */
  const { heicTo } = await import('heic-to');

  /*
    `type: 'bitmap'` hands back the decoded pixels instead of an encoded image. Asking
    for WebP here instead would encode the photo at full resolution, then require a
    second decode before the resize could happen — two of the three expensive steps
    exist only to throw the result away. One decode, one encode, at the size that is
    actually uploaded.
  */
  const bitmap = await heicTo({ blob: file, type: 'bitmap' });
  try {
    return await encodeBitmap(bitmap, baseName);
  } finally {
    bitmap.close();
  }
}

async function encodeBitmap(bitmap: ImageBitmap, baseName: string): Promise<File> {
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');
  ctx.drawImage(bitmap, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/webp', WEBP_QUALITY)
  );
  if (!blob) throw new Error('canvas.toBlob returned null');

  return new File([blob], `${baseName}.webp`, { type: 'image/webp' });
}
