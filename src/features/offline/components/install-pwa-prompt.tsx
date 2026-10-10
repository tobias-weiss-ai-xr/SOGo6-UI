'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';

interface InstallPwaPromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Prompt the user to install the PWA.
 * Only shown when:
 * - the app is served over HTTPS (or localhost)
 * - the PWA manifest is loaded
 * - the beforeinstallprompt event has fired at least once
 * - the user has not already dismissed the prompt
 */
export function InstallPwaPrompt({ open, onOpenChange }: InstallPwaPromptProps): JSX.Element {
  const t = useTranslations();

  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  const onBeforeInstallPrompt = useCallback((e: BeforeInstallPromptEvent) => {
    e.preventDefault();
    setPrompt(e);
  }, []);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
  }, [onBeforeInstallPrompt]);

  const onInstall = useCallback(async () => {
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    setPrompt(null);
    if (outcome === 'accepted') {
      onOpenChange(false);
    }
  }, [prompt, onOpenChange]);

  return (
    <Dialog open={open && Boolean(prompt)} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('PWA.installPrompt.title')}</DialogTitle>
          <DialogDescription>{t('PWA.installPrompt.description')}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('PWA.installPrompt.dismiss')}
          </Button>
          <Button onClick={onInstall}>{t('PWA.installPrompt.install')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
