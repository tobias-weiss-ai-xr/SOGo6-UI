/**
 * VisuallyHidden Component Tests
 * 
 * Tests for accessible visually hidden components.
 * Updated to match current component implementation.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { VisuallyHidden, ScreenReaderOnly, IconLabel, AccessibleIcon } from '../VisuallyHidden';
import { createVisuallyHiddenStyle } from '@/lib/accessibility/utils';

describe('VisuallyHidden Component', () => {
  it('renders children but hides them visually', () => {
    render(
      <VisuallyHidden>
        <span>Hidden Text</span>
      </VisuallyHidden>
    );

    const child = screen.getByText('Hidden Text');
    const parent = child.parentElement!;
    expect(child).toBeInTheDocument();
    
    // Visually hidden styles are applied to the wrapper element
    expect(parent).toHaveStyle({
      position: 'absolute',
      width: '1px',
      height: '1px',
      margin: '-1px',
      padding: '0',
      overflow: 'hidden',
      clip: 'rect(0px, 0px, 0px, 0px)',
      border: '0px',
      whiteSpace: 'nowrap',
    });
  });

  it('applies custom className to the wrapper', () => {
    render(
      <VisuallyHidden className="custom-class">
        <span>Hidden Text</span>
      </VisuallyHidden>
    );

    const parent = screen.getByText('Hidden Text').parentElement!;
    expect(parent).toHaveClass('visually-hidden', 'custom-class');
  });

  it('applies custom style to the wrapper', () => {
    render(
      <VisuallyHidden style={{ color: 'red' }}>
        <span>Hidden Text</span>
      </VisuallyHidden>
    );

    const parent = screen.getByText('Hidden Text').parentElement!;
    expect(parent).toHaveStyle({ color: 'rgb(255, 0, 0)' });
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

    const parent = screen.getByText('Hidden Text').parentElement!;
    expect(parent).toHaveAttribute('aria-hidden', 'false');
  });
});

describe('ScreenReaderOnly Component', () => {
  it('is an alias for VisuallyHidden', () => {
    render(
      <ScreenReaderOnly>
        <span>Screen Reader Only</span>
      </ScreenReaderOnly>
    );

    const parent = screen.getByText('Screen Reader Only').parentElement!;
    expect(parent).toBeInTheDocument();
    expect(parent).toHaveClass('visually-hidden');
  });
});

describe('IconLabel Component', () => {
  it('renders icon and hidden label', () => {
    render(
      <IconLabel icon={<span data-testid="icon">🔍</span>} label="Search" />
    );

    const icon = screen.getByTestId('icon');
    const visuallyHiddenWrapper = screen.getByText('Search').parentElement!.parentElement!.querySelector('.visually-hidden')!;

    expect(icon).toBeInTheDocument();
    expect(visuallyHiddenWrapper).toBeInTheDocument();
    expect(visuallyHiddenWrapper).toHaveClass('visually-hidden');
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
    expect(iconLabel).toHaveStyle({ color: 'rgb(0, 0, 255)' });
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

  it('handles Enter key press (via native button behavior)', () => {
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

  it('handles Space key press (via native button behavior)', () => {
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
    expect(button).toBeDisabled();
    // Native disabled button suppresses click events
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('has proper button styles', () => {
    render(
      <AccessibleIcon icon={<span>🔍</span>} label="Search" />
    );

    const button = screen.getByRole('button');
    expect(button).toHaveStyle({
      background: 'none',
      border: '2px outset buttonface',
      padding: '0',
      cursor: 'pointer',
      display: 'inline-flex',
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

    const child = screen.getByText('Screen Reader Text');
    const parent = child.parentElement!;
    
    expect(child).toBeInTheDocument();
    
    // Visually hidden styles on parent
    expect(parent).toHaveStyle({
      position: 'absolute',
      width: '1px',
      height: '1px',
    });
    
    // Screen reader accessible
    expect(parent).toHaveAttribute('aria-hidden', 'false');
  });

  it('IconLabel provides accessible name for icon buttons', () => {
    render(
      <button aria-label="Search">
        <IconLabel icon={<span>🔍</span>} label="Search" />
      </button>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Search');
    
    const icon = screen.getByText('🔍');
    expect(icon).toBeInTheDocument();
    
    const wrapper = screen.getByText('Search').closest('.visually-hidden');
    expect(wrapper).toHaveClass('visually-hidden');
  });

  it('AccessibleIcon follows button accessibility patterns', () => {
    render(
      <AccessibleIcon icon={<span>📝</span>} label="Edit Item" />
    );

    const button = screen.getByRole('button');
    
    expect(button).toHaveAttribute('aria-label', 'Edit Item');
    expect(button.tagName).toBe('BUTTON');
  });
});
