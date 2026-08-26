import { DynamicImageItem } from "../api/imageApi";

/**
 * Returns dynamic uploaded image URL if valid admin upload exists.
 * Returns null if no image was uploaded by admin or if image was removed.
 */
export function getDynamicImageSrc(
  dynamicImage?: DynamicImageItem | null
): string | null {
  if (!dynamicImage || !dynamicImage.is_active) {
    return null;
  }

  const url = dynamicImage.desktop_image_url;
  if (!url || typeof url !== "string" || !url.startsWith("http")) {
    return null;
  }

  return url;
}
