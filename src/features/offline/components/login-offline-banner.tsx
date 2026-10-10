'use client';

import { AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

export interface LoginOfflineBannerProps {
  visible: boolean;
}

/**
 * Banner shown on the login page when offline.
 * Uses a simpler layout than the general offline banner.
 */
export function LoginOfflineBanner({ visible }: LoginOfflineBannerProps): JSX.Element | null {
  const t = useTranslations();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted || !visible) return null;

  return (
    <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md border border-yellow-200 dark:border-yellow-800">
      <AlertTriangle className="h-4 w-4" />
      <span className="text-sm">{t('Login.offlineNotice')}</span>
    </div>
  );
}
