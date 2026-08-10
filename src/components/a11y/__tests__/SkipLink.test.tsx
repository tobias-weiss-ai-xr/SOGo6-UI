/**
 * SkipLink Component Tests
 * 
 * Tests for accessibility skip links
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SkipLink, DefaultSkipLinks, SkipLinks } from '../SkipLink';

// Mock next-intl useTranslations hook with namespace support
const mockTranslations: Record<string, Record<string, string>> = {
  a11y: {
    skip_to_main_content: 'Skip to main content',
    skip_to_navigation: 'Skip to navigation',
    skip_to_content: 'Skip to {target}',
  },
  errors: {
    something_went_wrong: 'Something went wrong',
  },
};

jest.mock('next-intl', () => ({
  useTranslations: (namespace: string) => {
    const ns = mockTranslations[namespace] || {};
    return (key: string, params?: Record<string, string>) => {
      let msg = ns[key] || key;
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          msg = msg.replace(`{${k}}`, v);
        }
      }
      return msg;
    };
  },
}));

describe('SkipLink Component', () => {
  it('renders SkipLink correctly', () => {
    render(<SkipLink targetId="main" />);

    const skipLink = screen.getByText('Skip to main content');
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#main');
    expect(skipLink).toHaveAttribute('aria-label', 'Skip to main content');
  });

  it('applies custom label', () => {
    render(<SkipLink targetId="main" label="Custom skip label" />);
    const skipLink = screen.getByText('Custom skip label');
    expect(skipLink).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<SkipLink targetId="main" className="custom-class" />);
    const skipLink = screen.getByText('Skip to main content');
    expect(skipLink).toHaveClass('skip-link', 'custom-class');
  });

  it('handles click and focuses target element', () => {
    render(
      <>
        <SkipLink targetId="main" />
        <main id="main" data-testid="main-content">
          Main Content
        </main>
      </>
    );

    const skipLink = screen.getByText('Skip to main content');
    const mainContent = screen.getByTestId('main-content');

    expect(mainContent).not.toHaveAttribute('tabindex');
    fireEvent.click(skipLink);
    expect(mainContent).toHaveAttribute('tabindex', '-1');
    expect(mainContent).toHaveFocus();
  });

  it('uses correct label for navigation target', () => {
    render(<SkipLink targetId="navigation" />);
    const skipLink = screen.getByText('Skip to navigation');
    expect(skipLink).toBeInTheDocument();
  });

  it('has correct styles', () => {
    render(<SkipLink targetId="main" />);
    const skipLink = screen.getByText('Skip to main content');
    expect(skipLink).toHaveStyle({
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
    });
  });

  it('appears on focus', () => {
    render(<SkipLink targetId="main" />);
    const skipLink = screen.getByText('Skip to main content');
    
    expect(skipLink).toHaveStyle({ top: '-40px' });
    fireEvent.focus(skipLink);
    expect(skipLink).toHaveStyle({ top: '0' });
    fireEvent.blur(skipLink);
    expect(skipLink).toHaveStyle({ top: '-40px' });
  });
});

describe('SkipLinks Component', () => {
  it('renders multiple skip links', () => {
    render(
      <SkipLinks links={[
        { targetId: 'main' },
        { targetId: 'navigation' },
      ]} />
    );

    expect(screen.getByText('Skip to main content')).toBeInTheDocument();
    expect(screen.getByText('Skip to navigation')).toBeInTheDocument();
  });

  it('applies custom labels to individual links', () => {
    render(
      <SkipLinks links={[
        { targetId: 'main', label: 'Jump to content' },
        { targetId: 'navigation' },
      ]} />
    );

    expect(screen.getByText('Jump to content')).toBeInTheDocument();
    expect(screen.getByText('Skip to navigation')).toBeInTheDocument();
  });
});

describe('DefaultSkipLinks Component', () => {
  it('renders default skip links', () => {
    render(<DefaultSkipLinks />);
    expect(screen.getByText('Skip to main content')).toBeInTheDocument();
    expect(screen.getByText('Skip to navigation')).toBeInTheDocument();
  });
});

describe('Accessibility Tests', () => {
  it('SkipLink has correct ARIA attributes', () => {
    render(<SkipLink targetId="main" />);
    const skipLink = screen.getByText('Skip to main content');
    expect(skipLink).toHaveAttribute('href', '#main');
    expect(skipLink).toHaveAttribute('aria-label');
  });

  it('SkipLink is keyboard accessible', () => {
    render(
      <>
        <SkipLink targetId="main" />
        <main id="main">Main Content</main>
      </>
    );

    const skipLink = screen.getByText('Skip to main content');
    skipLink.focus();
    expect(skipLink).toHaveFocus();

    fireEvent.keyDown(skipLink, { key: 'Enter' });
    fireEvent.click(skipLink);
    
    const main = screen.getByText('Main Content');
    expect(main).toHaveFocus();
  });

  it('follows WCAG bypass blocks requirement', () => {
    render(
      <>
        <nav data-testid="navigation">Navigation</nav>
        <SkipLink targetId="main" />
        <main id="main" data-testid="main">Main Content</main>
      </>
    );

    const skipLink = screen.getByText('Skip to main content');
    const nav = screen.getByTestId('navigation');
    const main = screen.getByTestId('main');

    expect(skipLink).toBeInTheDocument();
    expect(nav).toBeInTheDocument();
    expect(main).toBeInTheDocument();

    fireEvent.click(skipLink);
    expect(main).toHaveFocus();
  });
});
