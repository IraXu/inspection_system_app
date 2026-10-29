export const buildImageUrl = (prompt, size = 'landscape_4_3') =>
  `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prompt)}&image_size=${size}`

export const buildRectifySampleUrl = (itemName) =>
  buildImageUrl(`rectified and cleaned scene for ${itemName}, tidy and compliant, CCTV still frame`)
