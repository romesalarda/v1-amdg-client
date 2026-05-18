/**
 * Pure canvas-based image crop utility.
 *
 * Given a source URL and crop coordinates in natural image pixels,
 * renders the cropped region and returns a JPEG Blob — no server round-trip needed.
 */

export interface CropBox {
  x: number // left edge, natural image pixels
  y: number // top edge, natural image pixels
  w: number // width, natural image pixels
  h: number // height, natural image pixels
}

/**
 * Crops `src` to `naturalCrop` and resolves with a JPEG Blob.
 * Loads the image anonymously so it can be used in Canvas even when served from S3.
 */
export async function cropImageToBlob(
  src: string,
  naturalCrop: CropBox,
  quality = 0.92,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(naturalCrop.w)
      canvas.height = Math.round(naturalCrop.h)

      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('Could not get 2D context'))

      ctx.drawImage(
        img,
        naturalCrop.x,
        naturalCrop.y,
        naturalCrop.w,
        naturalCrop.h,
        0,
        0,
        canvas.width,
        canvas.height,
      )

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Canvas toBlob returned null'))
        },
        'image/jpeg',
        quality,
      )
    }

    img.onerror = () => reject(new Error('Failed to load image for crop — check CORS headers'))
    img.src = src
  })
}

/**
 * Draws the current crop region onto a canvas element (for live preview).
 * Pass the canvas element and the source image element; dimensions are taken
 * from the canvas element itself so CSS can control the preview size.
 */
export function drawPreview(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  naturalCrop: CropBox,
): void {
  const ctx = canvas.getContext('2d')
  if (!ctx || !img.complete) return

  // Match canvas buffer to its CSS display size to avoid blurry preview
  const rect = canvas.getBoundingClientRect()
  canvas.width = rect.width || canvas.clientWidth
  canvas.height = rect.height || canvas.clientHeight

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(
    img,
    naturalCrop.x,
    naturalCrop.y,
    naturalCrop.w,
    naturalCrop.h,
    0,
    0,
    canvas.width,
    canvas.height,
  )
}
