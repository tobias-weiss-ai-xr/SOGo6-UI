'use client';

/**
 * FocusTrap Component
 * 
 * Traps keyboard focus within a container, useful for modals, dialogs, and dropdowns.
 * 
 * WCAG 2.1: 2.4.3 Focus Order (Level A)
 * WCAG 2.1: 2.4.7 Focus Visible (Level AA)
 */

import React, { useEffect, useRef, ReactNode } from 'react';
import { trapFocus, getFirstFocusableElement } from '@/lib/accessibility/utils';

export interface FocusTrapProps {
  children: ReactNode;
  /** Whether to trap focus */
  active?: boolean;
  /** ID for the trap container */
  id?: string;
  /** Class name for the container */
  className?: string;
  /** Element to focus initially (default: first focusable) */
  initialFocus?: HTMLElement | (() => HTMLElement | null);
  /** Whether to return focus to the trigger element when deactivated */
  returnFocus?: boolean;
  /** Callback when focus trap is activated */
  onActivate?: () => void;
  /** Callback when focus trap is deactivated */
  onDeactivate?: () => void;
}

/**
 * FocusTrap component
 * 
 * This component traps keyboard focus within its children when active.
 * Useful for:
 * - Modal dialogs
 * - Dropdown menus
 * - Flyout panels
 * - Any component that needs to prevent focus from escaping
 */
export const FocusTrap = React.forwardRef<HTMLDivElement, FocusTrapProps>(function FocusTrap(
  {
    children,
    active = true,
    id,
    className = '',
    initialFocus,
    returnFocus = true,
    onActivate,
    onDeactivate,
  },
  forwardedRef
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);
  const cleanupRef = useRef<() => void | null>(null);

  useEffect(() => {
    if (active && containerRef.current) {
      // Store the currently focused element
      previousActiveElementRef.current = document.activeElement as HTMLElement;

      // Set up focus trap
      const cleanup = trapFocus(containerRef.current);
      cleanupRef.current = cleanup;

      // Focus initial element or first focusable
      if (initialFocus) {
        const focusElement = typeof initialFocus === 'function' 
          ? initialFocus() 
          : initialFocus;
        if (focusElement) {
          focusElement.focus();
        }
      } else {
        const firstFocusable = getFirstFocusableElement(containerRef.current);
        if (firstFocusable) {
          firstFocusable.focus();
        }
      }

      if (onActivate) {
        onActivate();
      }
    }

    return () => {
      // Clean up focus trap
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }

      // Return focus to previous element
      if (returnFocus && previousActiveElementRef.current) {
        previousActiveElementRef.current.focus();
      }

      if (onDeactivate) {
        onDeactivate();
      }
    };
  }, [active, initialFocus, onActivate, onDeactivate, returnFocus]);

  // Don't trap focus if not active
  if (!active) {
    return <>{children}</>;
  }

  return (
    <div
      ref={(node) => {
        containerRef.current = node
        if (typeof forwardedRef === 'function') forwardedRef(node)
        else if (forwardedRef) forwardedRef.current = node
      }}
      id={id}
      className={`focus-trap ${className}`}
      // Prevent pointer events from escaping the trap
      onPointerDown={(e) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          e.preventDefault();
        }
      }}
    >
      {children}
    </div>
  );
});

/**
 * ModalFocusTrap component specifically designed for modal dialogs
 */
export interface ModalFocusTrapProps extends FocusTrapProps {
  /** Whether clicking outside should close the modal */
  closeOnOutsideClick?: boolean;
  /** Callback when outside click occurs */
  onOutsideClick?: () => void;
}

export const ModalFocusTrap: React.FC<ModalFocusTrapProps> = ({
  children,
  active = true,
  closeOnOutsideClick = true,
  onOutsideClick,
  ...props
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (active && containerRef.current && closeOnOutsideClick) {
      const handlePointerDown = (e: PointerEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          if (onOutsideClick) {
            onOutsideClick();
          }
        }
      };

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && onOutsideClick) {
          e.preventDefault();
          onOutsideClick();
        }
      };

      document.addEventListener('pointerdown', handlePointerDown);
      document.addEventListener('keydown', handleKeyDown);

      return () => {
        document.removeEventListener('pointerdown', handlePointerDown);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [active, closeOnOutsideClick, onOutsideClick]);

  return (
    <FocusTrap ref={containerRef} active={active} {...props}>
      {children}
    </FocusTrap>
  );
};

/**
 * Hook for managing focus trap programmatically
 */
export function useFocusTrap(
  containerRef: React.RefObject<HTMLElement>,
  options: {
    active?: boolean;
    initialFocus?: HTMLElement | (() => HTMLElement | null);
    returnFocus?: boolean;
    onActivate?: () => void;
    onDeactivate?: () => void;
  } = {}
) {
  const { 
    active = true, 
    initialFocus, 
    returnFocus = true, 
    onActivate, 
    onDeactivate 
  } = options;

  const previousActiveElementRef = useRef<HTMLElement | null>(null);
  const cleanupRef = useRef<() => void | null>(null);

  useEffect(() => {
    if (active && containerRef.current) {
      // Store the currently focused element
      previousActiveElementRef.current = document.activeElement as HTMLElement;

      // Set up focus trap
      const cleanup = trapFocus(containerRef.current);
      cleanupRef.current = cleanup;

      // Focus initial element or first focusable
      if (initialFocus) {
        const focusElement = typeof initialFocus === 'function' 
          ? initialFocus() 
          : initialFocus;
        if (focusElement) {
          focusElement.focus();
        }
      } else {
        const firstFocusable = getFirstFocusableElement(containerRef.current);
        if (firstFocusable) {
          firstFocusable.focus();
        }
      }

      if (onActivate) {
        onActivate();
      }

      return () => {
        // Clean up focus trap
        if (cleanupRef.current) {
          cleanupRef.current();
          cleanupRef.current = null;
        }

        // Return focus to previous element
        if (returnFocus && previousActiveElementRef.current) {
          previousActiveElementRef.current.focus();
        }

        if (onDeactivate) {
          onDeactivate();
        }
      };
    }
  }, [active, initialFocus, onActivate, onDeactivate, returnFocus]);
}

export default FocusTrap;
