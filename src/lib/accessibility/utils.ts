/**
 * Accessibility Utility Functions
 * 
 * This file contains utility functions for accessibility improvements,
 * including focus management, keyboard navigation, and ARIA helpers.
 */

import { A11Y_CONFIG, ARIA_ATTRIBUTES, ARIA_LIVE_REGIONS, FOCUS_TRAP, KEYBOARD_KEYS, SR_ONLY_CLASS } from './constants';

/**
 * Get all focusable elements within a container
 */
export function getFocusableElements(container: HTMLElement | Document = document): HTMLElement[] {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[role="button"]:not([aria-disabled="true"])',
    '[role="link"]:not([aria-disabled="true"])',
    '[role="checkbox"]:not([aria-disabled="true"])',
    '[role="radio"]:not([aria-disabled="true"])',
    '[role="tab"]:not([aria-disabled="true"])',
    '[contenteditable]:not([contenteditable="false"])',
  ].join(', ');

  const elements = Array.from(container.querySelectorAll<HTMLElement>(focusableSelectors));
  
  // Filter out elements that are hidden or not visible
  return elements.filter(element => {
    const style = window.getComputedStyle(element);
    return (
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      style.opacity !== '0' &&
      !element.hasAttribute('aria-hidden') &&
      !element.hasAttribute('disabled') &&
      element.offsetParent !== null // visible in DOM
    );
  });
}

/**
 * Get the first focusable element within a container
 */
export function getFirstFocusableElement(container: HTMLElement | Document = document): HTMLElement | null {
  const focusableElements = getFocusableElements(container);
  return focusableElements[0] || null;
}

/**
 * Get the last focusable element within a container
 */
export function getLastFocusableElement(container: HTMLElement | Document = document): HTMLElement | null {
  const focusableElements = getFocusableElements(container);
  return focusableElements[focusableElements.length - 1] || null;
}

/**
 * Trap focus within a container (for modals, dialogs, etc.)
 */
export function trapFocus(container: HTMLElement): () => void {
  const firstFocusable = getFirstFocusableElement(container);
  const lastFocusable = getLastFocusableElement(container);

  if (!firstFocusable || !lastFocusable) {
    return () => {};
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === KEYBOARD_KEYS.TAB) {
      if (event.shiftKey) {
        // Shift + Tab: moving backwards
        if (document.activeElement === firstFocusable) {
          event.preventDefault();
          lastFocusable.focus();
        }
      } else {
        // Tab: moving forwards
        if (document.activeElement === lastFocusable) {
          event.preventDefault();
          firstFocusable.focus();
        }
      }
    }

    // Escape key to close modal
    if (event.key === KEYBOARD_KEYS.ESCAPE) {
      const closeButton = container.querySelector<HTMLElement>('[data-close], [aria-label*="close"], button[children*="close"]');
      if (closeButton) {
        event.preventDefault();
        closeButton.click();
      }
    }
  };

  container.addEventListener('keydown', handleKeyDown);
  
  // Focus the first element when trap is created
  firstFocusable.focus();

  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * Move focus to a specific element
 */
export function focusElement(element: HTMLElement | null, options?: FocusOptions): void {
  if (element && typeof element.focus === 'function') {
    element.focus(options);
    // For better visibility, scroll into view if needed
    if (element.scrollIntoView) {
      element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }
}

/**
 * Generate a unique ID for accessibility purposes
 */
export function generateA11yId(prefix: string = 'a11y'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a screen reader only element
 */
export function createSrOnlyElement(content: string, tag: string = 'span'): HTMLElement {
  const element = document.createElement(tag);
  element.className = SR_ONLY_CLASS;
  element.textContent = content;
  element.setAttribute(ARIA_ATTRIBUTES.ARIA_HIDDEN, 'true');
  return element;
}

/**
 * Announce a message to screen readers
 */
export function announceToScreenReader(message: string, politeness: keyof typeof ARIA_LIVE_REGIONS = 'POLITE'): void {
  let liveRegion = document.getElementById('a11y-live-region');
  
  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.id = 'a11y-live-region';
    liveRegion.setAttribute('role', ARIA_ROLES.STATUS);
    liveRegion.setAttribute(ARIA_ATTRIBUTES.ARIA_LIVE, politeness);
    liveRegion.setAttribute(ARIA_ATTRIBUTES.ARIA_ATOMIC, 'true');
    // Position off-screen
    liveRegion.style.position = 'absolute';
    liveRegion.style.width = '1px';
    liveRegion.style.height = '1px';
    liveRegion.style.margin = '-1px';
    liveRegion.style.padding = '0';
    liveRegion.style.overflow = 'hidden';
    liveRegion.style.clip = 'rect(0, 0, 0, 0)';
    liveRegion.style.border = '0';
    document.body.appendChild(liveRegion);
  }

  // Clear and set message to ensure it's announced
  liveRegion.textContent = '';
  // Use setTimeout to ensure the DOM update triggers the announcement
  setTimeout(() => {
    liveRegion.textContent = message;
  }, 50);
}

/**
 * Check if contrast ratio meets WCAG requirements
 */
export function getContrastRatio(color1: string, color2: string): number {
  // Convert hex colors to RGB
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return 0;
  
  // Calculate relative luminance
  const l1 = getLuminance(rgb1);
  const l2 = getLuminance(rgb2);
  
  // Ensure l1 is the lighter color
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  // Calculate contrast ratio
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if colors meet WCAG contrast requirements
 */
export function meetsContrastRequirements(
  foreground: string,
  background: string,
  largeText: boolean = false
): boolean {
  const ratio = getContrastRatio(foreground, background);
  const requiredRatio = largeText ? A11Y_CONFIG.MIN_CONTRAST_RATIO_LARGE_TEXT : A11Y_CONFIG.MIN_CONTRAST_RATIO;
  return ratio >= requiredRatio;
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Handle 3-digit hex
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  
  // Handle 6-digit hex
  if (hex.length === 6) {
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return { r, g, b };
  }
  
  return null;
}

/**
 * Calculate relative luminance from RGB
 */
function getLuminance(rgb: { r: number; g: number; b: number }): number {
  const sRgb = [rgb.r, rgb.g, rgb.b].map(c => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * sRgb[0] + 0.7152 * sRgb[1] + 0.0722 * sRgb[2];
}

/**
 * Check if an element is visible and not hidden from screen readers
 */
export function isAccessible(element: HTMLElement | null): boolean {
  if (!element) return false;
  
  // Check if element is hidden
  const style = window.getComputedStyle(element);
  if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
    return false;
  }
  
  // Check aria-hidden
  if (element.getAttribute(ARIA_ATTRIBUTES.ARIA_HIDDEN) === 'true') {
    return false;
  }
  
  // Check if any parent is hidden
  let parent: HTMLElement | null = element.parentElement;
  while (parent) {
    const parentStyle = window.getComputedStyle(parent);
    if (parentStyle.display === 'none' || parentStyle.visibility === 'hidden') {
      return false;
    }
    if (parent.getAttribute(ARIA_ATTRIBUTES.ARIA_HIDDEN) === 'true') {
      return false;
    }
    parent = parent.parentElement;
  }
  
  return true;
}

/**
 * Get the accessible name for an element
 */
export function getAccessibleName(element: HTMLElement): string {
  // Check for aria-label
  const ariaLabel = element.getAttribute(ARIA_ATTRIBUTES.ARIA_LABEL);
  if (ariaLabel) return ariaLabel;
  
  // Check for aria-labelledby
  const labelledById = element.getAttribute(ARIA_ATTRIBUTES.ARIA_LABELLEDBY);
  if (labelledById) {
    const labelledByElement = document.getElementById(labelledById);
    if (labelledByElement) return labelledByElement.textContent || '';
  }
  
  // Check for associated label (for form inputs)
  if (element.id) {
    const label = document.querySelector(`label[for="${element.id}"]`);
    if (label) return label.textContent || '';
  }
  
  // Fall back to text content or title
  return element.textContent?.trim() || element.title || '';
}

/**
 * Set aria-describedby to connect an element with its description
 */
export function setAriaDescribedBy(element: HTMLElement, descriptionId: string): void {
  const current = element.getAttribute(ARIA_ATTRIBUTES.ARIA_DESCRIBEDBY) || '';
  const ids = current.split(' ').filter(Boolean);
  if (!ids.includes(descriptionId)) {
    ids.push(descriptionId);
    element.setAttribute(ARIA_ATTRIBUTES.ARIA_DESCRIBEDBY, ids.join(' '));
  }
}

/**
 * Set aria-labelledby to connect an element with its label
 */
export function setAriaLabelledBy(element: HTMLElement, labelId: string): void {
  element.setAttribute(ARIA_ATTRIBUTES.ARIA_LABELLEDBY, labelId);
}

/**
 * Create a visually hidden element that's still accessible to screen readers
 */
export function createVisuallyHiddenStyle(): React.CSSProperties {
  return {
    position: 'absolute',
    width: '1px',
    height: '1px',
    margin: '-1px',
    padding: '0',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    border: '0',
    whiteSpace: 'nowrap',
  };
}

/**
 * Check if reduced motion is preferred
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Check if high contrast mode is preferred
 */
export function prefersHighContrast(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-contrast: high)').matches;
}

/**
 * Check if dark mode is preferred
 */
export function prefersDarkMode(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Safe click handler that works with both mouse and keyboard
 */
export function handleClick(
  event: React.MouseEvent | React.KeyboardEvent,
  callback: () => void,
  keys: string[] = ['Enter', ' ']
): void {
  if ('key' in event && keys.includes(event.key)) {
    event.preventDefault();
    callback();
  } else if (!('key' in event)) {
    callback();
  }
}

/**
 * Get the current focus outline style
 */
export function getFocusOutlineStyle(): React.CSSProperties {
  return {
    outline: `${A11Y_CONFIG.FOCUS_OUTLINE_WIDTH} solid`,
    outlineOffset: A11Y_CONFIG.FOCUS_OUTLINE_OFFSET,
  };
}

/**
 * Global keyboard event listener for shortcuts
 */
let globalKeyboardListeners: Map<string, () => void> = new Map();

export function addKeyboardShortcut(
  keyCombination: string,
  callback: () => void
): () => void {
  // Parse key combination (e.g., "Ctrl+K", "Meta+Shift+F")
  const [modifier, key] = keyCombination.split('+').map(k => k.trim());
  
  const handler = (event: KeyboardEvent) => {
    const modifierKey = getModifierKey(modifier);
    if (modifierKey && !event[modifierKey]) return;
    if (event.key === key && !isInputElement(event.target as HTMLElement)) {
      event.preventDefault();
      callback();
    }
  };
  
  document.addEventListener('keydown', handler);
  globalKeyboardListeners.set(keyCombination, handler);
  
  return () => {
    document.removeEventListener('keydown', handler);
    globalKeyboardListeners.delete(keyCombination);
  };
}

function getModifierKey(modifier: string): keyof KeyboardEvent | undefined {
  const modifierMap: Record<string, keyof KeyboardEvent> = {
    'Ctrl': 'ctrlKey',
    'Control': 'ctrlKey',
    'Shift': 'shiftKey',
    'Alt': 'altKey',
    'Meta': 'metaKey',
    'Cmd': 'metaKey',
    'Command': 'metaKey',
  };
  return modifierMap[modifier];
}

function isInputElement(element: HTMLElement | null): boolean {
  if (!element) return false;
  const tagName = element.tagName.toLowerCase();
  if (['input', 'textarea', 'select'].includes(tagName)) return true;
  if (element.isContentEditable) return true;
  return false;
}

/**
 * Clean up all global keyboard listeners
 */
export function cleanupKeyboardListeners(): void {
  globalKeyboardListeners.forEach((_, key) => {
    const [modifier, k] = key.split('+').map(k => k.trim());
    const handler = globalKeyboardListeners.get(key);
    if (handler) {
      document.removeEventListener('keydown', handler);
    }
  });
  globalKeyboardListeners.clear();
}
