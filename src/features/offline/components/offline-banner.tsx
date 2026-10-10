'use client';

import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';

export interface OfflineBannerProps {
  visible: boolean;
  onDismiss: () => void;
}

/**
 * Banner shown when the browser is offline.
 * Only renders on the client side.
 */
export function OfflineBanner({ visible, onDismiss }: OfflineBannerProps): JSX.Element | null {
  const t = useTranslations();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const onRetry = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  }, []);

  if (!mounted || !visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 flex items-center justify-center gap-4 p-4 bg-destructive/20 border-t border-destructive/30">
      <span className="text-sm font-medium text-destructive">{t('PWA.offlineBanner.label')}</span>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onDismiss}>
          {t('general.dismiss')}
        </Button>
        <Button size="sm" onClick={onRetry}>
          {t('general.retry')}
        </Button>
      </div>
    </div>
  );
}
