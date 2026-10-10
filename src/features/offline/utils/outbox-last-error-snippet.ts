/**
 * Truncate an error message to a safe length for display in the outbox UI.
 */
const MAX_SNIPPET_LENGTH = 120;

export function outboxLastErrorSnippet(error: string): string {
  if (error.length <= MAX_SNIPPET_LENGTH) {
    return error;
  }
  return `${error.slice(0, MAX_SNIPPET_LENGTH - 3)}...`;
}
