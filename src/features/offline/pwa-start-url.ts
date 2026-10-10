/** Start URL used when installing the PWA and when retrying offline navigation. */
export function pwaStartUrl(): string {
  return process.env.NEXT_PUBLIC_PWA_START_URL || '/';
}
