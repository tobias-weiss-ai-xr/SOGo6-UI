/**
 * SkipLink Component Tests
 * 
 * Tests for accessibility skip links
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SkipLink, DefaultSkipLinks, SkipLinks } from '../SkipLink';
import { NextIntlProvider } from 'next-intl';

// Mock translations
const mockMessages = {
  a11y: {
    skip_to_main_content: 'Skip to main content',
    skip_to_navigation: 'Skip to navigation',
    skip_to_content: 'Skip to {target}',
  },
  errors: {
    something_went_wrong: 'Something went wrong',
  },
};

const TestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <NextIntlProvider locale="en" messages={mockMessages}>
    {children}
  </NextIntlProvider>
);

describe('SkipLink Component', () => {
  it('renders SkipLink correctly', () => {
    render(
      <TestProvider>
        <SkipLink targetId="main" />
      </TestProvider>
    );

    const skipLink = screen.getByText('Skip to main content');
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#main');
    expect(skipLink).toHaveAttribute('aria-label', 'Skip to main content');
  });

  it('applies custom label', () => {
    render(
      <TestProvider>
        <SkipLink targetId="main" label="Custom skip label" />
      </TestProvider>
    );

    const skipLink = screen.getByText('Custom skip label');
    expect(skipLink).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <TestProvider>
        <SkipLink targetId="main" className="custom-class" />
      </TestProvider>
    );

    const skipLink = screen.getByText('Skip to main content');
    expect(skipLink).toHaveClass('skip-link', 'custom-class');
  });

  it('handles click and focuses target element', () => {
    render(
      <TestProvider>
        <SkipLink targetId="main" />
        <main id="main" data-testid="main-content">
          Main Content
        </main>
      </TestProvider>
    );

    const skipLink = screen.getByText('Skip to main content');
    const mainContent = screen.getByTestId('main-content');

    // Initially, main content should not be focusable
    expect(mainContent).not.toHaveAttribute('tabindex');

    // Click the skip link
    fireEvent.click(skipLink);

    // Main content should temporarily be focusable
    expect(mainContent).toHaveAttribute('tabindex', '-1');
    expect(mainContent).toHaveFocus();

    // After timeout, tabindex should be removed
    // This is tested by checking the cleanup in useEffect
  });

  it('uses correct label for navigation target', () => {
    render(
      <TestProvider>
        <SkipLink targetId="navigation" />
      </TestProvider>
    );

    const skipLink = screen.getByText('Skip to navigation');
    expect(skipLink).toBeInTheDocument();
  });

  it('has correct styles', () => {
    render(
      <TestProvider>
        <SkipLink targetId="main" />
      </TestProvider>
    );

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
    render(
      <TestProvider>
        <SkipLink targetId="main" />
      </TestProvider>
    );

    const skipLink = screen.getByText('Skip to main content');
    
    // Initially hidden
    expect(skipLink).toHaveStyle({ top: '-40px' });

    // On focus, should appear
    fireEvent.focus(skipLink);
    expect(skipLink).toHaveStyle({ top: '0' });

    // On blur, should hide
    fireEvent.blur(skipLink);
    expect(skipLink).toHaveStyle({ top: '-40px' });
  });
});

describe('SkipLinks Component', () => {
  it('renders multiple skip links', () => {
    render(
      <TestProvider>
        <SkipLinks links={[
          { targetId: 'main' },
          { targetId: 'navigation' },
        ]} />
      </TestProvider>
    );

    expect(screen.getByText('Skip to main content')).toBeInTheDocument();
    expect(screen.getByText('Skip to navigation')).toBeInTheDocument();
  });

  it('applies custom labels to individual links', () => {
    render(
      <TestProvider>
        <SkipLinks links={[
          { targetId: 'main', label: 'Jump to content' },
          { targetId: 'navigation' },
        ]} />
      </TestProvider>
    );

    expect(screen.getByText('Jump to content')).toBeInTheDocument();
    expect(screen.getByText('Skip to navigation')).toBeInTheDocument();
  });
});

describe('DefaultSkipLinks Component', () => {
  it('renders default skip links', () => {
    render(
      <TestProvider>
        <DefaultSkipLinks />
      </TestProvider>
    );

    expect(screen.getByText('Skip to main content')).toBeInTheDocument();
    expect(screen.getByText('Skip to navigation')).toBeInTheDocument();
  });
});

describe('Accessibility Tests', () => {
  it('SkipLink has correct ARIA attributes', () => {
    render(
      <TestProvider>
        <SkipLink targetId="main" />
      </TestProvider>
    );

    const skipLink = screen.getByText('Skip to main content');
    expect(skipLink).toHaveAttribute('href', '#main');
    expect(skipLink).toHaveAttribute('aria-label');
  });

  it('SkipLink is keyboard accessible', () => {
    render(
      <TestProvider>
        <SkipLink targetId="main" />
        <main id="main">Main Content</main>
      </TestProvider>
    );

    const skipLink = screen.getByText('Skip to main content');
    
    // Should be able to tab to the skip link
    skipLink.focus();
    expect(skipLink).toHaveFocus();

    // Should be able to activate with Enter
    fireEvent.keyDown(skipLink, { key: 'Enter' });
    fireEvent.click(skipLink);
    
    const main = screen.getByText('Main Content');
    expect(main).toHaveFocus();
  });

  it('follows WCAG bypass blocks requirement', () => {
    render(
      <TestProvider>
        <nav data-testid="navigation">Navigation</nav>
        <SkipLink targetId="main" />
        <main id="main" data-testid="main">Main Content</main>
      </TestProvider>
    );

    // WCAG 2.1: 2.4.1 Bypass Blocks (Level A)
    // A mechanism is available to bypass blocks of content that are repeated on multiple Web pages.
    
    const skipLink = screen.getByText('Skip to main content');
    const nav = screen.getByTestId('navigation');
    const main = screen.getByTestId('main');

    // Skip link should allow bypassing navigation
    expect(skipLink).toBeInTheDocument();
    expect(nav).toBeInTheDocument();
    expect(main).toBeInTheDocument();

    fireEvent.click(skipLink);
    expect(main).toHaveFocus();
  });
});
