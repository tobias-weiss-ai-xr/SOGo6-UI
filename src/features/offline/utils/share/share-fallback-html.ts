/**
 * Fallback HTML content for sharing when offline.
 * Used to provide a user-friendly message when sharing features are unavailable.
 */
export function getShareFallbackHtml(feature: string): string {
  return `
    <div style="padding: 20px; text-align: center; color: #666;">
      <h3>$SOGo6 Offline</h3>
      <p>The "${feature}" feature is not available while offline.</p>
      <p>Please reconnect to the internet to share this item.</p>
    </div>
  `;
}
