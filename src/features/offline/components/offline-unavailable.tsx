'use client';

import { useTranslations } from 'next-intl';

export interface OfflineUnavailableProps {
  feature: string;
}

/**
 * Small inline notice shown when a specific offline feature is disabled.
 */
export function OfflineUnavailable({ feature }: OfflineUnavailableProps): JSX.Element {
  const t = useTranslations();

  return (
    <span className="text-sm text-muted-foreground italic">
      {t('PWA.featureUnavailable', { feature })}
    </span>
  );
}
