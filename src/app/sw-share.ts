/**
 * Web Share Target API handling for PWA.
 * Allows users to share content to SOGo via the system share sheet.
 */
import { pathnameFromRequestUrl } from './sw-runtime';

export function isShareTargetRequest(
  request: Pick<Request, 'method' | 'url'>
): boolean {
  if (request.method !== 'POST') return false;
  return /\/share\/?$/.test(pathnameFromRequestUrl(request.url));
}

export async function handleShareTarget(request: Request): Promise<Response> {
  const form = await request.formData();
  const title = String(form.get('title') ?? form.get('subject') ?? '');
  const text = String(form.get('text') ?? form.get('body') ?? '');
  const sharedUrl = String(form.get('url') ?? '');
  // files would be handled in a full offline implementation
  form.getAll('files');

  // In a real implementation, you'd save this to IndexedDB or queue it
  // for the outbox coordinator to send to the server when back online.
  // For now, redirect to compose with share parameters.
  const dest = new URL('/en/u/0/INBOX?compose=1&share=1', request.url);

  // Add title/subject as search params
  if (title) dest.searchParams.set('subject', title);
  if (text) dest.searchParams.set('body', text);
  if (sharedUrl) dest.searchParams.set('url', sharedUrl);

  return Response.redirect(dest, 303);
}
