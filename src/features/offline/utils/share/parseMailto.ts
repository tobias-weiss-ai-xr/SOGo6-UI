/**
 * Parse mailto: URLs for use in offline composer drafts.
 */
export interface ParsedMailto {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject?: string;
  body?: string;
}

export function parseMailto(url: string): ParsedMailto {
  const result: ParsedMailto = { to: [] };

  // Remove the "mailto:" prefix
  let rest = url.slice(7);

  // Handle addresses before the ?
  const queryStart = rest.indexOf('?');
  if (queryStart >= 0) {
    result.to = rest
      .slice(0, queryStart)
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);
    rest = rest.slice(queryStart + 1);
  } else {
    result.to = rest.split(',').map((a) => a.trim()).filter(Boolean);
    return result;
  }

  // Parse query parameters
  const params = new URLSearchParams(rest);

  if (params.has('to')) {
    result.to = params
      .getAll('to')
      .flatMap((v) => v.split(','))
      .map((a) => a.trim())
      .filter(Boolean);
  }

  if (params.has('cc')) {
    result.cc = params
      .getAll('cc')
      .flatMap((v) => v.split(','))
      .map((a) => a.trim())
      .filter(Boolean);
  }

  if (params.has('bcc')) {
    result.bcc = params
      .getAll('bcc')
      .flatMap((v) => v.split(','))
      .map((a) => a.trim())
      .filter(Boolean);
  }

  if (params.has('subject')) {
    result.subject = params.get('subject') ?? undefined;
  }

  if (params.has('body')) {
    result.body = params.get('body') ?? undefined;
  }

  return result;
}
