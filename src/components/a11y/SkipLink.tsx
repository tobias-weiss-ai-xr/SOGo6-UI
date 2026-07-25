'use client';

/**
 * SkipLink Component
 * 
 * Provides keyboard-accessible skip links for users to bypass navigation
 * and jump directly to main content areas.
 * 
 * WCAG 2.1: 2.4.1 Bypass Blocks (Level A)
 */

import React from 'react';
import { useTranslations } from 'next-intl';
import { A11Y_CONFIG } from '@/lib/accessibility/constants';

export interface SkipLinkProps {
  /** The ID of the target element to skip to */
  targetId: string;
  /** Custom label for the skip link (optional, uses translation if not provided) */
  label?: string;
  /** Additional CSS class name */
  className?: string;
}

/**
 * SkipLink component for accessibility
 * 
 * This component creates a visually hidden link that appears on focus,
 * allowing keyboard users to skip directly to main content sections.
 */
export const SkipLink: React.FC<SkipLinkProps> = ({
  targetId,
  label,
  className = '',
}) => {
  const t = useTranslations('a11y');
  
  // Use translation or fallback
  const defaultLabel = targetId === 'main' 
    ? t(A11Y_CONFIG.SKIP_TO_CONTENT_TEXT) 
    : targetId === 'navigation' 
      ? t(A11Y_CONFIG.SKIP_TO_NAVIGATION_TEXT)
      : t('skip_to_content', { target: targetId });
  
  const linkLabel = label || defaultLabel;
  
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.setAttribute('tabindex', '-1');
      target.focus();
      // Remove the tabindex after focus to keep the DOM clean
      setTimeout(() => {
        target.removeAttribute('tabindex');
      }, 100);
    }
  };

  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      className={`skip-link ${className}`}
      aria-label={linkLabel}
      style={{
        position: 'absolute',
        top: '-40px',
        left: '0',
        background: '#000',
        color: '#fff',
        padding: '8px 16px',
        zIndex: 10000,
        textDecoration: 'none',
        fontWeight: 'bold',
        borderRadius: '0 0 4px 0',
        transition: 'top 0.3s ease',
      }}
      onFocus={(e) => {
        e.currentTarget.style.top = '0';
      }}
      onBlur={(e) => {
        e.currentTarget.style.top = '-40px';
      }}
    >
      {linkLabel}
    </a>
  );
};

/**
 * SkipLinks component that provides multiple skip links
 */
export interface SkipLinksProps {
  /** Array of skip link targets */
  links: SkipLinkProps[];
  /** Container class name */
  className?: string;
}

export const SkipLinks: React.FC<SkipLinksProps> = ({ links, className = '' }) => {
  return (
    <div className={`skip-links ${className}`}>
      {links.map((link, index) => (
        <SkipLink
          key={link.targetId || index}
          targetId={link.targetId}
          label={link.label}
          className={link.className}
        />
      ))}
    </div>
  );
};

/**
 * Default SkipLinks for the application
 * 
 * Includes skip links for:
 * - Main content
 * - Navigation
 * - Sidebar (if present)
 */
export const DefaultSkipLinks: React.FC = () => {
  return (
    <SkipLinks
      links={[
        { targetId: 'main' },
        { targetId: 'navigation' },
      ]}
    />
  );
};

export default SkipLink;
