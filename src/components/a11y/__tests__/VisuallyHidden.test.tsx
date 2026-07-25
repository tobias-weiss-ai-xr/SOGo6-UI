/**
 * VisuallyHidden Component Tests
 * 
 * Tests for accessible visually hidden components
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { VisuallyHidden, ScreenReaderOnly, IconLabel, AccessibleIcon } from '../VisuallyHidden';
import { createVisuallyHiddenStyle } from '@/lib/accessibility/utils';

describe('VisuallyHidden Component', () => {
  it('renders children but hides them visually', () => {
    render(
      <VisuallyHidden>
        <span>Hidden Text</span>
      </VisuallyHidden>
    );

    const hiddenContent = screen.getByText('Hidden Text');
    expect(hiddenContent).toBeInTheDocument();
    
    // Check that visually hidden styles are applied
    expect(hiddenContent).toHaveStyle({
      position: 'absolute',
      width: '1px',
      height: '1px',
      margin: '-1px',
      padding: '0',
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      border: '0',
      whiteSpace: 'nowrap',
    });
  });

  it('applies custom className', () => {
    render(
      <VisuallyHidden className="custom-class">
        <span>Hidden Text</span>
      </VisuallyHidden>
    );

    const hiddenContent = screen.getByText('Hidden Text');
    expect(hiddenContent).toHaveClass('visually-hidden', 'custom-class');
  });

  it('applies custom style', () => {
    render(
      <VisuallyHidden style={{ color: 'red' }}>
        <span>Hidden Text</span>
      </VisuallyHidden>
    );

    const hiddenContent = screen.getByText('Hidden Text');
    expect(hiddenContent).toHaveStyle({ color: 'red' });
  });

  it('uses custom tag', () => {
    const { container } = render(
      <VisuallyHidden tag="div">
        <span>Hidden Text</span>
      </VisuallyHidden>
    );

    const div = container.querySelector('div.visually-hidden');
    expect(div).toBeInTheDocument();
    expect(div).toContainHTML('<span>Hidden Text</span>');
  });

  it('has aria-hidden="false" to ensure screen reader access', () => {
    render(
      <VisuallyHidden>
        <span>Hidden Text</span>
      </VisuallyHidden>
    );

    const hiddenContent = screen.getByText('Hidden Text');
    expect(hiddenContent.parentElement).toHaveAttribute('aria-hidden', 'false');
  });
});

describe('ScreenReaderOnly Component', () => {
  it('is an alias for VisuallyHidden', () => {
    render(
      <ScreenReaderOnly>
        <span>Screen Reader Only</span>
      </ScreenReaderOnly>
    );

    const content = screen.getByText('Screen Reader Only');
    expect(content).toBeInTheDocument();
    expect(content).toHaveClass('visually-hidden');
  });
});

describe('IconLabel Component', () => {
  it('renders icon and hidden label', () => {
    render(
      <IconLabel icon={<span data-testid="icon">🔍</span>} label="Search" />
    );

    const icon = screen.getByTestId('icon');
    const label = screen.getByText('Search');

    expect(icon).toBeInTheDocument();
    expect(label).toBeInTheDocument();
    
    // Label should be visually hidden
    expect(label).toHaveClass('visually-hidden');
  });

  it('applies custom className', () => {
    render(
      <IconLabel 
        icon={<span>🔍</span>} 
        label="Search" 
        className="custom-icon"
      />
    );

    const iconLabel = screen.getByText('Search').parentElement;
    expect(iconLabel).toHaveClass('icon-label', 'custom-icon');
  });

  it('applies custom style', () => {
    render(
      <IconLabel 
        icon={<span>🔍</span>} 
        label="Search" 
        style={{ color: 'blue' }}
      />
    );

    const iconLabel = screen.getByText('Search').parentElement;
    expect(iconLabel).toHaveStyle({ color: 'blue' });
  });
});

describe('AccessibleIcon Component', () => {
  it('renders icon with hidden label', () => {
    render(
      <AccessibleIcon icon={<span data-testid="icon">🔍</span>} label="Search" />
    );

    const icon = screen.getByTestId('icon');
    const button = icon.closest('button');

    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'Search');
  });

  it('has button role by default', () => {
    render(
      <AccessibleIcon icon={<span>🔍</span>} label="Search Icon" />
    );

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('has custom aria-label', () => {
    render(
      <AccessibleIcon 
        icon={<span>🔍</span>} 
        label="Search Icon" 
        ariaLabel="Custom Label"
      />
    );

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Custom Label');
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(
      <AccessibleIcon 
        icon={<span>🔍</span>} 
        label="Search" 
        onClick={handleClick}
      />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('handles Enter key press', () => {
    const handleClick = jest.fn();
    render(
      <AccessibleIcon 
        icon={<span>🔍</span>} 
        label="Search" 
        onClick={handleClick}
      />
    );

    const button = screen.getByRole('button');
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('handles Space key press', () => {
    const handleClick = jest.fn();
    render(
      <AccessibleIcon 
        icon={<span>🔍</span>} 
        label="Search" 
        onClick={handleClick}
      />
    );

    const button = screen.getByRole('button');
    fireEvent.keyDown(button, { key: ' ' });
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(
      <AccessibleIcon 
        icon={<span>🔍</span>} 
        label="Search" 
        disabled={true}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });

  it('does not respond to clicks when disabled', () => {
    const handleClick = jest.fn();
    render(
      <AccessibleIcon 
        icon={<span>🔍</span>} 
        label="Search" 
        onClick={handleClick}
        disabled={true}
      />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('has proper button styles', () => {
    render(
      <AccessibleIcon icon={<span>🔍</span>} label="Search" />
    );

    const button = screen.getByRole('button');
    expect(button).toHaveStyle({
      background: 'none',
      border: 'none',
      padding: '0',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 'inherit',
      color: 'inherit',
    });
  });
});

describe('createVisuallyHiddenStyle Function', () => {
  it('returns correct visually hidden styles', () => {
    const style = createVisuallyHiddenStyle();
    
    expect(style).toEqual({
      position: 'absolute',
      width: '1px',
      height: '1px',
      margin: '-1px',
      padding: '0',
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      border: '0',
      whiteSpace: 'nowrap',
    });
  });
});

describe('Accessibility Tests', () => {
  it('VisuallyHidden content is accessible to screen readers', () => {
    render(
      <VisuallyHidden>
        <span>Screen Reader Text</span>
      </VisuallyHidden>
    );

    const hiddenContent = screen.getByText('Screen Reader Text');
    
    // Content should be in the document
    expect(hiddenContent).toBeInTheDocument();
    
    // But visually hidden
    expect(hiddenContent).toHaveStyle({
      position: 'absolute',
      width: '1px',
      height: '1px',
    });
    
    // For screen readers, we check aria-hidden attribute
    expect(hiddenContent.parentElement).toHaveAttribute('aria-hidden', 'false');
  });

  it('IconLabel provides accessible name for icon buttons', () => {
    render(
      <button aria-label="Search">
        <IconLabel icon={<span>🔍</span>} label="Search" />
      </button>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Search');
    
    // Icon should be visible
    const icon = screen.getByText('🔍');
    expect(icon).toBeInTheDocument();
    
    // Label should be hidden
    const label = screen.getByText('Search').parentElement;
    expect(label).toHaveClass('visually-hidden');
  });

  it('AccessibleIcon follows button accessibility patterns', () => {
    render(
      <AccessibleIcon icon={<span>📝</span>} label="Edit Item" />
    );

    const button = screen.getByRole('button');
    
    // Button should have accessible name
    expect(button).toHaveAttribute('aria-label', 'Edit Item');
    
    // Button should be keyboard accessible
    expect(button).toHaveStyle({ cursor: 'pointer' });
    
    // Button should have semantic HTML
    expect(button.tagName).toBe('BUTTON');
  });
});
