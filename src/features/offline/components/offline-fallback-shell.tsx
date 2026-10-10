'use client';

import Link from 'next/link';
import { ReactNode } from 'react';

interface OfflineFallbackShellProps {
  children: ReactNode;
}

/**
 * Generic layout shell used by all offline pages (none of which use next-intl).
 * All copy must therefore be in English with language overrides in locale.
 */
export default function OfflineFallbackShell({ children }: OfflineFallbackShellProps): JSX.Element {
  return (
    <html lang="en">
      <body className="bg-background min-h-svh flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4 text-center">{children}</div>
        <footer className="fixed bottom-8 left-8 text-sm text-muted-foreground">
          <Link
            href="https://sogo6.contextual-intelligence.org"
            className="inline-flex items-center gap-2 text-primary"
          >
            {/* prettier-ignore */}
            {'roll your own groupware ->'}
          </Link>
        </footer>
      </body>
    </html>
  );
}
