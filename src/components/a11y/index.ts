/**
 * Accessibility Components Index
 * 
 * This file exports all accessibility-related components and utilities.
 * Import from this file for a clean API.
 */

// Constants and utilities
export * from '@/lib/accessibility/constants';
export * from '@/lib/accessibility/utils';

// Core components
export {
  SkipLink,
  SkipLinks,
  DefaultSkipLinks,
  type SkipLinkProps,
  type SkipLinksProps,
} from './SkipLink';

export {
  VisuallyHidden,
  ScreenReaderOnly,
  IconLabel,
  AccessibleIcon,
  type VisuallyHiddenProps,
  type IconLabelProps,
  type AccessibleIconProps,
} from './VisuallyHidden';

export {
  FocusTrap,
  ModalFocusTrap,
  useFocusTrap,
  type FocusTrapProps,
  type ModalFocusTrapProps,
} from './FocusTrap';

export {
  LiveAnnouncerProvider,
  useLiveAnnouncer,
  Announce,
  LoadingAnnouncer,
  NotificationAnnouncer,
  RouteAnnouncer,
  useAnnounce,
  type PolitenessLevel,
  type Announcement,
  type LiveAnnouncerContextType,
  type LiveAnnouncerProviderProps,
  type AnnounceProps,
  type LoadingAnnouncerProps,
  type NotificationAnnouncerProps,
  type RouteAnnouncerProps,
} from './LiveAnnouncer';

export {
  ErrorBoundary,
  AccessibleErrorFallback,
  withErrorBoundary,
  type ErrorBoundaryProps,
  type ErrorBoundaryState,
  type AccessibleErrorFallbackProps,
} from './ErrorBoundary';

export {
  KeyboardListNavigator,
  KeyboardGridNavigator,
  KeyboardTabList,
  KeyboardTabPanel,
  useKeyboardNavigation,
  useKeyboardShortcut,
  type KeyboardDirection,
  type KeyboardEventHandler,
  type KeyboardShortcut,
  type KeyboardListNavigatorProps,
  type KeyboardGridNavigatorProps,
  type KeyboardTabListProps,
  type KeyboardTabPanelProps,
} from './KeyboardNavigator';
