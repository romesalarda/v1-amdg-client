/**
 * Resolves an image source to a valid absolute URL.
 * If the source is invalid or null, returns a fallback image.
 *
 * @param src - The image source path (may be relative, absolute, or null)
 * @param fallback - Fallback image path/URL (default: '/images/placeholder.png')
 * @returns A valid absolute image URL
 */
export function resolveImageUrl(
  src?: string | null,
  fallback = '/images/placeholder.png'
): string {
  const config = useRuntimeConfig()
  if (typeof src !== 'string' || src.trim() === '') {
    return fallback;
  }

  // Absolute URLs or data URIs
  if (/^(https?:\/\/|data:)/.test(src)) {
    return src;
  }

  // Any leading slash = static or public asset
  // if (src.startsWith('/')) {
  //   return src;
  // }

  // Otherwise, prepend API base URL
  const apiUrl = config.public.apiBaseUrl;
  if (!apiUrl) {
    console.warn('VITE_API_URL missing — returning fallback');
    return fallback;
  }

  const base = apiUrl.replace(/\/+$/, '');
  const path = src.replace(/^\/+/, '');

  return `${base}/${path}`;
}


/**
 * Handles image load errors by replacing the src with a fallback.
 * Safe to use directly in Vue templates as @error handler.
 *
 * @param event - The error event from the img element
 * @param fallback - Fallback image path (default: '/images/placeholder.png')
 */
export function onImageError(
  event: Event,
  fallback: string = '/images/placeholder.png'
): void {
  const img = event.target as HTMLImageElement;
  if (img && img.src !== fallback) {
    img.src = fallback;
  }
}

/**
 * Options for image file validation
 */
export interface ImageValidationOptions {
  /** Allowed MIME types (default: jpeg, png, webp) */
  allowedTypes?: string[];
  /** Maximum file size in bytes (default: 5MB) */
  maxSizeBytes?: number;
}

/**
 * Validates an image file before upload.
 * Throws an error if the file doesn't meet the requirements.
 *
 * @param file - The file to validate
 * @param options - Validation options
 * @throws {Error} If validation fails
 */
export function validateImageFile(
  file: File,
  options?: ImageValidationOptions
): void {
  const allowedTypes = options?.allowedTypes || [
    'image/jpeg',
    'image/png',
    'image/webp',
  ];
  const maxSizeBytes = options?.maxSizeBytes || 5 * 1024 * 1024; // 5MB

  // Check MIME type
  if (!allowedTypes.includes(file.type)) {
    throw new Error(
      `Invalid file type. Allowed types: ${allowedTypes.map((t) => t.split('/')[1]).join(', ')}`
    );
  }

  // Check file size
  if (file.size > maxSizeBytes) {
    const maxSizeMB = (maxSizeBytes / (1024 * 1024)).toFixed(1);
    throw new Error(`File size exceeds ${maxSizeMB}MB`);
  }
}

/**
 * Creates a blob URL for previewing an image file.
 * Caller is responsible for revoking the URL with URL.revokeObjectURL().
 *
 * @param file - The image file to preview
 * @returns A blob URL string
 */
export function createImagePreview(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Converts an image file to FormData for uploading.
 *
 * @param file - The image file to convert
 * @param fieldName - The field name for the file (default: 'image')
 * @returns FormData containing the file
 */
export function imageToFormData(file: File, fieldName: string = 'image'): FormData {
  const formData = new FormData();
  formData.append(fieldName, file);
  return formData;
}

/**
 * Picks the best available URL from a Resource object's image_urls variants.
 * Falls back to resolveImageUrl(resource.image) for records that predate variant
 * generation, so every existing usage in the codebase remains safe.
 *
 * @param resource - A Resource API object (must have at least an image field)
 * @param size - Which variant to prefer ('thumbnail' | 'medium' | 'large' | 'original')
 * @returns A valid absolute image URL, or the placeholder fallback
 */
export function getImageUrl(
  resource: { image?: string | null; image_urls?: { thumbnail?: string | null; medium?: string | null; large?: string | null; original?: string | null } | null },
  size: 'thumbnail' | 'medium' | 'large' | 'original' = 'medium',
  fallback = '/images/placeholder.png'
): string {
  const variant = resource.image_urls?.[size]
  if (variant) return variant

  // Fall back through variant sizes before giving up
  if (resource.image_urls) {
    const fallbackOrder: Array<'original' | 'large' | 'medium' | 'thumbnail'> = [
      'original', 'large', 'medium', 'thumbnail',
    ]
    for (const key of fallbackOrder) {
      if (resource.image_urls[key]) return resource.image_urls[key]!
    }
  }

  // Final fallback: raw image field (pre-variant records or no image_urls yet)
  return resolveImageUrl(resource.image, fallback)
}
