'use client';

/**
 * KeyboardNavigator Component and Utilities
 * 
 * Provides keyboard navigation functionality for custom components,
 * ensuring they are fully accessible via keyboard.
 * 
 * WCAG 2.1: 2.1.1 Keyboard (Level A)
 * WCAG 2.1: 2.1.2 No Keyboard Trap (Level A)
 */

import React, { useEffect, useRef, ReactNode, KeyboardEvent } from 'react';
import { KEYBOARD_KEYS } from '@/lib/accessibility/constants';

/**
 * Keyboard navigation directions
 */
export type KeyboardDirection = 'up' | 'down' | 'left' | 'right' | 'next' | 'previous';

/**
 * Keyboard event handler type
 */
export type KeyboardEventHandler = (event: KeyboardEvent) => boolean | void;

/**
 * Keyboard shortcut configuration
 */
export interface KeyboardShortcut {
  /** Keys to trigger the shortcut (e.g., 'Enter', ' ', 'ArrowDown') */
  keys: (string | KeyboardDirection)[];
  /** Handler function */
  handler: () => void;
  /** Optional modifier keys */
  modifiers?: {
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    meta?: boolean;
  };
  /** Whether to prevent default behavior */
  preventDefault?: boolean;
}

/**
 * Maps keyboard directions to key names
 */
const DIRECTION_KEYS: Record<KeyboardDirection, string[]> = {
  up: ['ArrowUp'],
  down: ['ArrowDown'],
  left: ['ArrowLeft'],
  right: ['ArrowRight'],
  next: ['Tab', 'ArrowDown', 'ArrowRight'],
  previous: ['Shift+Tab', 'ArrowUp', 'ArrowLeft'],
};

/**
 * Keyboard navigation browser for a list of items (for dropdowns, menus, etc.)
 */
export interface KeyboardListNavigatorProps {
  children: ReactNode;
  /** Current selected index */
  selectedIndex: number;
  /** Total number of items */
  itemCount: number;
  /** Callback when selection changes */
  onSelectionChange: (newIndex: number) => void;
  /** Callback when Enter/Space is pressed */
  onSelect?: (index: number) => void;
  /** Callback when Escape is pressed */
  onEscape?: () => void;
  /** Whether to allow circular navigation */
  circular?: boolean;
  /** Orientation ('vertical' or 'horizontal') */
  orientation?: 'vertical' | 'horizontal';
  /** Class name */
  className?: string;
}

export const KeyboardListNavigator: React.FC<KeyboardListNavigatorProps> = ({
  children,
  selectedIndex,
  itemCount,
  onSelectionChange,
  onSelect,
  onEscape,
  circular = true,
  orientation = 'vertical',
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: KeyboardEvent) => {
    let newIndex = selectedIndex;
    let handled = false;

    switch (e.key) {
      case KEYBOARD_KEYS.ARROW_DOWN:
        if (orientation === 'vertical') {
          newIndex = circular ? (selectedIndex + 1) % itemCount : Math.min(selectedIndex + 1, itemCount - 1);
          handled = true;
        }
        break;

      case KEYBOARD_KEYS.ARROW_UP:
        if (orientation === 'vertical') {
          newIndex = circular ? (selectedIndex - 1 + itemCount) % itemCount : Math.max(selectedIndex - 1, 0);
          handled = true;
        }
        break;

      case KEYBOARD_KEYS.ARROW_RIGHT:
        if (orientation === 'horizontal') {
          newIndex = circular ? (selectedIndex + 1) % itemCount : Math.min(selectedIndex + 1, itemCount - 1);
          handled = true;
        }
        break;

      case KEYBOARD_KEYS.ARROW_LEFT:
        if (orientation === 'horizontal') {
          newIndex = circular ? (selectedIndex - 1 + itemCount) % itemCount : Math.max(selectedIndex - 1, 0);
          handled = true;
        }
        break;

      case KEYBOARD_KEYS.HOME:
        newIndex = 0;
        handled = true;
        break;

      case KEYBOARD_KEYS.END:
        newIndex = itemCount - 1;
        handled = true;
        break;

      case KEYBOARD_KEYS.ENTER:
      case KEYBOARD_KEYS.SPACE:
        if (onSelect && selectedIndex >= 0 && selectedIndex < itemCount) {
          e.preventDefault();
          onSelect(selectedIndex);
          handled = true;
        }
        break;

      case KEYBOARD_KEYS.ESCAPE:
        if (onEscape) {
          e.preventDefault();
          onEscape();
          handled = true;
        }
        break;
    }

    if (handled) {
      e.preventDefault();
      if (newIndex !== selectedIndex && newIndex >= 0 && newIndex < itemCount) {
        onSelectionChange(newIndex);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={`keyboard-list-navigator ${className}`}
      role="listbox"
      aria-activedescendant={`item-${selectedIndex}`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  );
};

/**
 * Keyboard navigation for a grid (2D navigation)
 */
export interface KeyboardGridNavigatorProps {
  children: ReactNode;
  /** Current position: { row, col } */
  position: { row: number; col: number };
  /** Grid dimensions: { rows, cols } */
  dimensions: { rows: number; cols: number };
  /** Callback when position changes */
  onPositionChange: (newPosition: { row: number; col: number }) => void;
  /** Callback when Enter/Space is pressed */
  onSelect?: (position: { row: number; col: number }) => void;
  /** Callback when Escape is pressed */
  onEscape?: () => void;
  /** Whether to allow circular navigation */
  circular?: boolean;
  /** Class name */
  className?: string;
}

export const KeyboardGridNavigator: React.FC<KeyboardGridNavigatorProps> = ({
  children,
  position,
  dimensions,
  onPositionChange,
  onSelect,
  onEscape,
  circular = false,
  className = '',
}) => {
  const handleKeyDown = (e: KeyboardEvent) => {
    let newPosition = { ...position };
    let handled = false;

    switch (e.key) {
      case KEYBOARD_KEYS.ARROW_DOWN:
        newPosition.row = circular 
          ? (position.row + 1) % dimensions.rows 
          : Math.min(position.row + 1, dimensions.rows - 1);
        handled = true;
        break;

      case KEYBOARD_KEYS.ARROW_UP:
        newPosition.row = circular 
          ? (position.row - 1 + dimensions.rows) % dimensions.rows 
          : Math.max(position.row - 1, 0);
        handled = true;
        break;

      case KEYBOARD_KEYS.ARROW_RIGHT:
        newPosition.col = circular 
          ? (position.col + 1) % dimensions.cols 
          : Math.min(position.col + 1, dimensions.cols - 1);
        handled = true;
        break;

      case KEYBOARD_KEYS.ARROW_LEFT:
        newPosition.col = circular 
          ? (position.col - 1 + dimensions.cols) % dimensions.cols 
          : Math.max(position.col - 1, 0);
        handled = true;
        break;

      case KEYBOARD_KEYS.HOME:
        newPosition = { row: 0, col: 0 };
        handled = true;
        break;

      case KEYBOARD_KEYS.END:
        newPosition = { row: dimensions.rows - 1, col: dimensions.cols - 1 };
        handled = true;
        break;

      case KEYBOARD_KEYS.PAGE_UP:
        newPosition.row = Math.max(position.row - 5, 0);
        handled = true;
        break;

      case KEYBOARD_KEYS.PAGE_DOWN:
        newPosition.row = Math.min(position.row + 5, dimensions.rows - 1);
        handled = true;
        break;

      case KEYBOARD_KEYS.ENTER:
      case KEYBOARD_KEYS.SPACE:
        if (onSelect && position.row >= 0 && position.row < dimensions.rows && 
            position.col >= 0 && position.col < dimensions.cols) {
          e.preventDefault();
          onSelect(position);
          handled = true;
        }
        break;

      case KEYBOARD_KEYS.ESCAPE:
        if (onEscape) {
          e.preventDefault();
          onEscape();
          handled = true;
        }
        break;
    }

    if (handled) {
      e.preventDefault();
      if (newPosition.row !== position.row || newPosition.col !== position.col) {
        onPositionChange(newPosition);
      }
    }
  };

  return (
    <div
      className={`keyboard-grid-navigator ${className}`}
      role="grid"
      aria-activedescendant={`cell-${position.row}-${position.col}`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  );
};

/**
 * Hook for managing keyboard navigation in custom components
 */
export function useKeyboardNavigation(
  handlers: Record<string, KeyboardEventHandler>,
  dependencies: any[] = []
) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const handler = Object.entries(handlers).find(([keyPattern]) => {
        const keys = keyPattern.split('+').map(k => k.trim());
        const modifiers = keys.filter(k => ['Ctrl', 'Shift', 'Alt', 'Meta', 'Cmd'].includes(k));
        const key = keys.find(k => !['Ctrl', 'Shift', 'Alt', 'Meta', 'Cmd'].includes(k));
        
        if (!key) return false;
        
        // Check modifiers
        const shift = event.shiftKey || modifiers.includes('Shift');
        const ctrl = event.ctrlKey || event.metaKey || modifiers.includes('Ctrl') || modifiers.includes('Cmd') || modifiers.includes('Meta');
        const alt = event.altKey || modifiers.includes('Alt');
        
        if (modifiers.length > 0 && !shift && !ctrl && !alt) return false;
        
        return event.key === key;
      });
      
      if (handler) {
        const result = (handler[1] as KeyboardEventHandler)(event);
        if (result === true) {
          event.preventDefault();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers, ...dependencies]);
}

/**
 * Hook for simple keyboard shortcuts
 */
export function useKeyboardShortcut(
  shortcut: string,
  callback: () => void,
  dependencies: any[] = []
) {
  useEffect(() => {
    const keys = shortcut.split('+').map(k => k.trim());
    const modifiers = keys.filter(k => ['Ctrl', 'Shift', 'Alt', 'Meta', 'Cmd'].includes(k));
    const key = keys.find(k => !['Ctrl', 'Shift', 'Alt', 'Meta', 'Cmd'].includes(k));
    
    if (!key) {
      console.warn(`Invalid keyboard shortcut: ${shortcut}`);
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      const shift = event.shiftKey || modifiers.includes('Shift');
      const ctrl = event.ctrlKey || event.metaKey || modifiers.includes('Ctrl') || modifiers.includes('Cmd') || modifiers.includes('Meta');
      const alt = event.altKey || modifiers.includes('Alt');
      
      // Check if all modifiers are pressed
      const allModifiersPressed = modifiers.length === 0 || (
        (!shift || modifiers.includes('Shift')) &&
        (!ctrl || modifiers.includes('Ctrl') || modifiers.includes('Cmd') || modifiers.includes('Meta')) &&
        (!alt || modifiers.includes('Alt'))
      );
      
      if (allModifiersPressed && event.key === key && !isInputElement(event.target as HTMLElement)) {
        event.preventDefault();
        callback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcut, callback, ...dependencies]);
}

function isInputElement(element: HTMLElement | null): boolean {
  if (!element) return false;
  const tagName = element.tagName.toLowerCase();
  if (['input', 'textarea', 'select'].includes(tagName)) return true;
  if (element.isContentEditable) return true;
  if (element.getAttribute('role') === 'textbox') return true;
  return false;
}

/**
 * Keyboard navigation for a tab list
 */
export interface KeyboardTabListProps {
  children: ReactNode;
  selectedIndex: number;
  onChange: (newIndex: number) => void;
  circular?: boolean;
  className?: string;
}

export const KeyboardTabList: React.FC<KeyboardTabListProps> = ({
  children,
  selectedIndex,
  onChange,
  circular = true,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const tabCount = React.Children.count(children);

  const handleKeyDown = (e: KeyboardEvent) => {
    let newIndex = selectedIndex;
    let handled = false;

    switch (e.key) {
      case KEYBOARD_KEYS.ARROW_RIGHT:
        newIndex = circular ? (selectedIndex + 1) % tabCount : Math.min(selectedIndex + 1, tabCount - 1);
        handled = true;
        break;

      case KEYBOARD_KEYS.ARROW_LEFT:
        newIndex = circular ? (selectedIndex - 1 + tabCount) % tabCount : Math.max(selectedIndex - 1, 0);
        handled = true;
        break;

      case KEYBOARD_KEYS.HOME:
        newIndex = 0;
        handled = true;
        break;

      case KEYBOARD_KEYS.END:
        newIndex = tabCount - 1;
        handled = true;
        break;
    }

    if (handled) {
      e.preventDefault();
      if (newIndex !== selectedIndex && newIndex >= 0 && newIndex < tabCount) {
        onChange(newIndex);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={`keyboard-tab-list ${className}`}
      role="tablist"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-activedescendant={`tab-${selectedIndex}`}
    >
      {children}
    </div>
  );
};

/**
 * Keyboard navigation for tab panels
 */
export interface KeyboardTabPanelProps {
  children: ReactNode;
  index: number;
  selectedIndex: number;
  className?: string;
}

export const KeyboardTabPanel: React.FC<KeyboardTabPanelProps> = ({
  children,
  index,
  selectedIndex,
  className = '',
}) => {
  return (
    <div
      className={`keyboard-tab-panel ${className}`}
      role="tabpanel"
      tabIndex={selectedIndex === index ? 0 : -1}
      id={`tab-${index}`}
      aria-hidden={selectedIndex !== index}
    >
      {selectedIndex === index && children}
    </div>
  );
};

export default KeyboardListNavigator;
