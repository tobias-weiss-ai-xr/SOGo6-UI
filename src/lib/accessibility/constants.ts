/**
 * Accessibility Constants and Configuration
 * 
 * This file contains accessibility-related constants, ARIA attributes,
 * and configuration for WCAG 2.1 AA compliance.
 */

/**
 * WCAG 2.1 AA Compliance Configuration
 */
export const A11Y_CONFIG = {
  // Color contrast ratios (minimum for WCAG 2.1 AA)
  MIN_CONTRAST_RATIO: 4.5,
  MIN_CONTRAST_RATIO_LARGE_TEXT: 3.0,
  
  // Focus indicator requirements
  FOCUS_OUTLINE_WIDTH: '2px',
  FOCUS_OUTLINE_OFFSET: '2px',
  
  // Time limits
  TIMEOUT_WARNING_TIME: 30000, // 30 seconds before timeout
  TIMEOUT_EXTENSION_TIME: 60000, // 60 seconds extension
  
  // skip to content link text
  SKIP_TO_CONTENT_TEXT: 'skip_to_main_content',
  SKIP_TO_NAVIGATION_TEXT: 'skip_to_navigation',
} as const;

/**
 * Common ARIA live regions for screen reader announcements
 */
export const ARIA_LIVE_REGIONS = {
  POLITE: 'polite',
  ASSERTIVE: 'assertive',
  OFF: 'off',
} as const;

/**
 * Common ARIA roles
 */
export const ARIA_ROLES = {
  ALERT: 'alert',
  ALERTDIALOG: 'alertdialog',
  APPLICATION: 'application',
  ARTICLE: 'article',
  BANNER: 'banner',
  BUTTON: 'button',
  CELL: 'cell',
  CHECKBOX: 'checkbox',
  COLUMNHEADER: 'columnheader',
  COMBOBOX: 'combobox',
  COMPLEMENTARY: 'complementary',
  CONTENTINFO: 'contentinfo',
  DEFINITION: 'definition',
  DIALOG: 'dialog',
  DIRECTORY: 'directory',
  DOCUMENT: 'document',
  FEED: 'feed',
  FORM: 'form',
  GRID: 'grid',
  GRIDCELL: 'gridcell',
  GROUP: 'group',
  HEADING: 'heading',
  IMG: 'img',
  LINK: 'link',
  LIST: 'list',
  LISTBOX: 'listbox',
  LISTITEM: 'listitem',
  LOG: 'log',
  MAIN: 'main',
  MARQUEE: 'marquee',
  MATH: 'math',
  MENU: 'menu',
  MENUBAR: 'menubar',
  MENUITEM: 'menuitem',
  MENUITEMCHECKBOX: 'menuitemcheckbox',
  MENUITEMRADIO: 'menuitemradio',
  NAVIGATION: 'navigation',
  NONE: 'none',
  NOTE: 'note',
  OPTION: 'option',
  PRESENTATION: 'presentation',
  PROGRESSBAR: 'progressbar',
  RADIO: 'radio',
  RADIOGROUP: 'radiogroup',
  REGION: 'region',
  ROW: 'row',
  ROWGROUP: 'rowgroup',
  ROWHEADER: 'rowheader',
  SCROLLBAR: 'scrollbar',
  SEARCH: 'search',
  SEARCHBOX: 'searchbox',
  SECTION: 'section',
  SELECT: 'select',
  SEPARATOR: 'separator',
  SLIDER: 'slider',
  SPINBUTTON: 'spinbutton',
  STATUS: 'status',
  SWITCH: 'switch',
  TAB: 'tab',
  TABLE: 'table',
  TABLIST: 'tablist',
  TABPANEL: 'tabpanel',
  TERM: 'term',
  TEXTBOX: 'textbox',
  TIMER: 'timer',
  TOOLBAR: 'toolbar',
  TOOLTIP: 'tooltip',
  TREE: 'tree',
  TREEGRID: 'treegrid',
  TREEITEM: 'treeitem',
} as const;

/**
 * Common ARIA attributes
 */
export const ARIA_ATTRIBUTES = {
  // State attributes
  ARIA_BUSY: 'aria-busy',
  ARIA_CHECKED: 'aria-checked',
  ARIA_DISABLED: 'aria-disabled',
  ARIA_EXPANDED: 'aria-expanded',
  ARIA_HASPOPUP: 'aria-haspopup',
  ARIA_HIDDEN: 'aria-hidden',
  ARIA_MODAL: 'aria-modal',
  ARIA_MULTILINE: 'aria-multiline',
  ARIA_MULTISELECTABLE: 'aria-multiselectable',
  ARIA_PRESSED: 'aria-pressed',
  ARIA_READONLY: 'aria-readonly',
  ARIA_REQUIRED: 'aria-required',
  ARIA_SELECTED: 'aria-selected',
  ARIA_SORT: 'aria-sort',
  
  // Property attributes
  ARIA_ACTIVEDESCENDANT: 'aria-activedescendant',
  ARIA_ATOMIC: 'aria-atomic',
  ARIA_AUTOCOMPLETE: 'aria-autocomplete',
  ARIA_COLCOUNT: 'aria-colcount',
  ARIA_COLINDEX: 'aria-colindex',
  ARIA_COLSPAN: 'aria-colspan',
  ARIA_CONTROL: 'aria-controls',
  ARIA_CURRENT: 'aria-current',
  ARIA_DESCRIBEDBY: 'aria-describedby',
  ARIA_ERRORMESSAGE: 'aria-errormessage',
  ARIA_FLOWTO: 'aria-flowto',
  ARIA_LABEL: 'aria-label',
  ARIA_LABELLEDBY: 'aria-labelledby',
  ARIA_LEVEL: 'aria-level',
  ARIA_LIVE: 'aria-live',
  ARIA_OWNS: 'aria-owns',
  ARIA_POSINSET: 'aria-posinset',
  ARIA_RELEVANT: 'aria-relevant',
  ARIA_ROLEDESCRIPTION: 'aria-roledescription',
  ARIA_ROWCOUNT: 'aria-rowcount',
  ARIA_ROWINDEX: 'aria-rowindex',
  ARIA_ROWSPAN: 'aria-rowspan',
  ARIA_SETSIZE: 'aria-setsize',
  ARIA_VALUEMIN: 'aria-valuemin',
  ARIA_VALUENOW: 'aria-valuenow',
  ARIA_VALUETEXT: 'aria-valuetext',
  
  // Drag and drop attributes
  ARIA_DROP_EFFECT: 'aria-dropeffect',
  ARIA_GRABBED: 'aria-grabed',
  
  // Keyboard attributes
  ARIA_KEYSHORTCUTS: 'aria-keyshortcuts',
} as const;

/**
 * Keyboard navigation constants
 */
export const KEYBOARD_KEYS = {
  TAB: 'Tab',
  SHIFT: 'Shift',
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown',
  BACKSPACE: 'Backspace',
  DELETE: 'Delete',
  TYPING: /^[a-z0-9\s]$/i,
} as const;

/**
 * Focus trap constants
 */
export const FOCUS_TRAP = {
  FIRST_FOCUSABLE: 'data-first-focusable',
  LAST_FOCUSABLE: 'data-last-focusable',
  FOCUS_FAILSAFE: 'data-focus-failsafe',
} as const;

/**
 * Screen reader only utility class name
 */
export const SR_ONLY_CLASS = 'sr-only';

/**
 * Tooltip constants
 */
export const TOOLTIP = {
  DELAY_SHOW: 300, // ms
  DELAY_HIDE: 100, // ms
  POSITION: {
    TOP: 'top',
    BOTTOM: 'bottom',
    LEFT: 'left',
    RIGHT: 'right',
  },
} as const;

/**
 * Error message constants
 */
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'required_field_error',
  INVALID_FORMAT: 'invalid_format_error',
  INVALID_EMAIL: 'invalid_email_error',
  PASSWORD_MISMATCH: 'password_mismatch_error',
  MIN_LENGTH: 'min_length_error',
  MAX_LENGTH: 'max_length_error',
  GENERIC_ERROR: 'generic_error',
} as const;

/**
 * Success message constants
 */
export const SUCCESS_MESSAGES = {
  ACTION_COMPLETE: 'action_complete',
  SAVE_SUCCESS: 'save_success',
  DELETE_SUCCESS: 'delete_success',
  UPDATE_SUCCESS: 'update_success',
} as const;

export type A11yConfigType = typeof A11Y_CONFIG;
export type AriaLiveRegionType = typeof ARIA_LIVE_REGIONS;
export type AriaRolesType = typeof ARIA_ROLES;
