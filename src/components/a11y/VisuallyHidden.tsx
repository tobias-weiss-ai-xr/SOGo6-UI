'use client';

/**
 * VisuallyHidden Component
 * 
 * A component that is visually hidden but still accessible to screen readers.
 * 
 * WCAG 2.1: This helps provide accessible names for elements that shouldn't
 * be visually displayed but need to be announced to screen reader users.
 */

import React, { ReactNode } from 'react';
import { createVisuallyHiddenStyle } from '@/lib/accessibility/utils';

export interface VisuallyHiddenProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  tag?: keyof JSX.IntrinsicElements;
}

/**
 * VisuallyHidden component
 * 
 * This component renders its children in a way that is:
 * - Visually hidden (not displayed on screen)
 * - Still accessible to screen readers
 * - Still focusable (if it contains interactive elements)
 * 
 * Use cases:
 * - Accessible labels for icons
 * - Descriptions for complex graphics
 * - Hidden headings for screen readers
 * - Instructions for form fields
 */
export const VisuallyHidden: React.FC<VisuallyHiddenProps> = ({
  children,
  className = '',
  style = {},
  tag: Tag = 'span',
}) => {
  const visuallyHiddenStyle = createVisuallyHiddenStyle();
  
  return (
    <Tag
      className={`visually-hidden ${className}`}
      style={{ ...visuallyHiddenStyle, ...style }}
      aria-hidden="false" // Explicitly set to false to ensure it's not hidden from screen readers
    >
      {children}
    </Tag>
  );
};

/**
 * ScreenReaderOnly component (alias for VisuallyHidden)
 */
export const ScreenReaderOnly = VisuallyHidden;

/**
 * IconLabel component for accessible icons
 * 
 * Provides an accessible label for an icon that describe its purpose
 * without cluttering the visual interface.
 */
export interface IconLabelProps {
  icon: ReactNode;
  label: string;
  className?: string;
  style?: React.CSSProperties;
}

export const IconLabel: React.FC<IconLabelProps> = ({
  icon,
  label,
  className = '',
  style = {},
}) => {
  return (
    <span className={`icon-label ${className}`} style={style}>
      {icon}
      <VisuallyHidden>{label}</VisuallyHidden>
    </span>
  );
};

/**
 * AccessibleIcon component that wraps an icon with a label
 */
export interface AccessibleIconProps {
  icon: ReactNode;
  label: string;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  ariaLabel?: string;
}

export const AccessibleIcon: React.FC<AccessibleIconProps> = ({
  icon,
  label,
  className = '',
  onClick,
  disabled = false,
  ariaLabel,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onClick && !disabled) {
      onClick();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ' && onClick && !disabled) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <button
      type="button"
      className={`accessible-icon ${className}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      aria-label={ariaLabel || label}
      aria-disabled={disabled}
      style={{
        background: 'none',
        border: 'none',
        padding: '0',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 'inherit',
        color: 'inherit',
      }}
    >
      {icon}
      <VisuallyHidden>{label}</VisuallyHidden>
    </button>
  );
};

export default VisuallyHidden;
