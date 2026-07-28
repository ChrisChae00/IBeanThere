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
 *  1. Canvas API — works natively in Safari/iOS (the primary source of HEIC).
 *     Also resizes large photos to stay under the upload size limit.
 *  2. heic2any (WASM) — fallback for other browsers.
 *  3. Both fail → throw HeicNotSupportedError so callers can show a
 *     browser-specific hint.
 */
export async function convertHeicToWebp(file: File): Promise<File> {
  const baseName = file.name.replace(/\.[^.]+$/, '');

  try {
    return await convertViaCanvas(file, baseName);
  } catch (canvasError) {
    console.warn('Canvas HEIC conversion failed, trying heic2any:', canvasError);
    try {
      return await convertViaHeic2any(file, baseName);
    } catch (heic2anyError) {
      console.warn('heic2any conversion also failed:', heic2anyError);
      throw new HeicNotSupportedError();
    }
  }
}

async function convertViaCanvas(file: File, baseName: string): Promise<File> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);

      const canvas = document.createElement('canvas');
      const scale = Math.min(1, MAX_DIMENSION / Math.max(img.naturalWidth, img.naturalHeight));
      canvas.width = Math.round(img.naturalWidth * scale);
      canvas.height = Math.round(img.naturalHeight * scale);

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas 2D context unavailable'));
        return;
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('canvas.toBlob returned null'));
            return;
          }
          resolve(new File([blob], `${baseName}.webp`, { type: 'image/webp' }));
        },
        'image/webp',
        WEBP_QUALITY
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Browser cannot decode this HEIC file natively'));
    };

    img.src = url;
  });
}

async function convertViaHeic2any(file: File, baseName: string): Promise<File> {
  const heic2any = (await import('heic2any')).default;
  const result = await heic2any({ blob: file, toType: 'image/webp', quality: WEBP_QUALITY });
  const blob = Array.isArray(result) ? result[0] : result;
  return new File([blob], `${baseName}.webp`, { type: 'image/webp' });
}
