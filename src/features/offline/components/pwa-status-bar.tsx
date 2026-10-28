'use client';

import { CheckCircle2, XCircle } from 'lucide-react';
import { startTransition, useEffect, useState } from 'react';

export interface PwaStatusBarProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onDismiss: () => void;
}

/**
 * Temporary status bar shown after PWA update or other offline-related events.
 */
export function PwaStatusBar({ message, type, onDismiss }: PwaStatusBarProps): JSX.Element {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => startTransition(() => setVisible(false)), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return <></>;

  const icon = {
    success: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    error: <XCircle className="h-4 w-4 text-red-500" />,
    info: null,
  }[type];

  const bgClass = {
    success: 'bg-green-50 dark:bg-green-900/20',
    error: 'bg-red-50 dark:bg-red-900/20',
    info: 'bg-blue-50 dark:bg-blue-900/20',
  }[type];

  const borderClass = {
    success: 'border-green-200 dark:border-green-800',
    error: 'border-red-200 dark:border-red-800',
    info: 'border-blue-200 dark:border-blue-800',
  }[type];

  const textClass = {
    success: 'text-green-700 dark:text-green-300',
    error: 'text-red-700 dark:text-red-300',
    info: 'text-blue-700 dark:text-blue-300',
  }[type];

  return (
    <div
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-md ${bgClass} ${borderClass} border shadow-sm`}
    >
      <div className="flex items-center gap-2">
        {icon}
        <span className={`text-sm ${textClass}`}>{message}</span>
        <button
          type="button"
          onClick={onDismiss}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          {/* prettier-ignore */}
          {'Dismiss'}
        </button>
      </div>
    </div>
  );
}
