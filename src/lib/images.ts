/**
 * Hostnames next/image may load experience photos from. Must match the API's
 * IMAGE_HOSTS so a listing can never save a URL the site can't render.
 */
export const IMAGE_HOSTS = ["images.unsplash.com"];

export function isAllowedImageUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && IMAGE_HOSTS.includes(url.hostname);
  } catch {
    return false;
  }
}
