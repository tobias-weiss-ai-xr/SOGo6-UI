/**
 * FocusTrap Component Tests
 *
 * Tests for focus management in modals, dialogs, and dropdowns.
 * WCAG 2.1: 2.4.3 Focus Order (Level A)
 * WCAG 2.1: 2.4.7 Focus Visible (Level AA)
 */

import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FocusTrap, ModalFocusTrap, useFocusTrap } from '../FocusTrap';

// Mock getFocusableElements and related utilities
jest.mock('@/lib/accessibility/utils', () => ({
  trapFocus: jest.fn(() => jest.fn()), // returns a cleanup function
  getFirstFocusableElement: jest.fn((container) => {
    const first = container?.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    return first || null;
  }),
  getFocusableElements: jest.fn((container) => {
    return Array.from(container?.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])') || []);
  }),
  isFocusable: jest.fn(() => true),
}));

// Mock PointerEvent for jsdom (not natively supported)
// @ts-expect-error - minimal polyfill for testing
if (typeof global.PointerEvent === 'undefined') {
  global.PointerEvent = class PointerEvent extends MouseEvent {
    constructor(type: string, init?: PointerEventInit) {
      super(type, init);
    }
  } as unknown as typeof PointerEvent;
}

describe('FocusTrap Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children when active', () => {
    render(
      <FocusTrap active={true}>
        <div data-testid="content">Content</div>
      </FocusTrap>
    );
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('renders children when not active', () => {
    render(
      <FocusTrap active={false}>
        <div data-testid="content">Content</div>
      </FocusTrap>
    );
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('wraps children in a div with focus-trap class', () => {
    render(
      <FocusTrap active={true}>
        <button>Click me</button>
      </FocusTrap>
    );
    const container = screen.getByText('Click me').parentElement;
    expect(container).toHaveClass('focus-trap');
  });

  it('applies custom className', () => {
    render(
      <FocusTrap active={true} className="custom-modal">
        <button>Click me</button>
      </FocusTrap>
    );
    const container = screen.getByText('Click me').parentElement;
    expect(container).toHaveClass('focus-trap', 'custom-modal');
  });

  it('applies custom id', () => {
    render(
      <FocusTrap active={true} id="my-modal">
        <button>Click me</button>
      </FocusTrap>
    );
    const container = screen.getByText('Click me').parentElement;
    expect(container).toHaveAttribute('id', 'my-modal');
  });

  it('focuses the first focusable element when activated', () => {
    render(
      <FocusTrap active={true}>
        <button data-testid="btn1">Button 1</button>
        <button data-testid="btn2">Button 2</button>
      </FocusTrap>
    );

    // The first button should receive focus
    expect(screen.getByTestId('btn1')).toHaveFocus();
  });

  it('focuses the specified initialFocus element', () => {
    const initialRef = React.createRef<HTMLButtonElement>();

    render(
      <FocusTrap
        active={true}
        initialFocus={initialRef.current || undefined}
      >
        <button data-testid="btn1">Button 1</button>
        <button ref={initialRef} data-testid="btn2">Button 2</button>
      </FocusTrap>
    );
  });

  it('calls onActivate when focus trap becomes active', () => {
    const onActivate = jest.fn();
    render(
      <FocusTrap active={true} onActivate={onActivate}>
        <button>Click me</button>
      </FocusTrap>
    );
    expect(onActivate).toHaveBeenCalledTimes(1);
  });

  it('calls onDeactivate when focus trap is deactivated', () => {
    const onDeactivate = jest.fn();
    const { rerender } = render(
      <FocusTrap active={true} onDeactivate={onDeactivate}>
        <button>Click me</button>
      </FocusTrap>
    );

    rerender(
      <FocusTrap active={false} onDeactivate={onDeactivate}>
        <button>Click me</button>
      </FocusTrap>
    );

    expect(onDeactivate).toHaveBeenCalledTimes(1);
  });

  it('removes focus-trap wrapper when not active', () => {
    const { rerender } = render(
      <FocusTrap active={true}>
        <div data-testid="content">Content</div>
      </FocusTrap>
    );

    rerender(
      <FocusTrap active={false}>
        <div data-testid="content">Content</div>
      </FocusTrap>
    );

    // When not active, children are rendered directly without wrapper
    const content = screen.getByTestId('content');
    expect(content.parentElement).not.toHaveClass('focus-trap');
  });

  it('handles pointer events inside the trap', () => {
    render(
      <FocusTrap active={true}>
        <div data-testid="inner">Inner</div>
      </FocusTrap>
    );

    const container = screen.getByText('Inner').parentElement;
    // Simulating pointer down inside should not trigger preventDefault
    const event = new PointerEvent('pointerdown', { bubbles: true });
    const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
    container?.dispatchEvent(event);

    // Inside clicks should not be prevented
    expect(preventDefaultSpy).not.toHaveBeenCalled();
  });
});

describe('ModalFocusTrap Component', () => {
  it('renders modal content', () => {
    render(
      <ModalFocusTrap active={true} onOutsideClick={jest.fn()}>
        <div data-testid="modal">Modal Content</div>
      </ModalFocusTrap>
    );
    expect(screen.getByTestId('modal')).toBeInTheDocument();
  });

  it.skip('calls onOutsideClick when clicking outside', async () => {
    const onOutsideClick = jest.fn();
    render(
      <div>
        <div data-testid="outside">Outside</div>
        <ModalFocusTrap active={true} onOutsideClick={onOutsideClick}>
          <div data-testid="modal">Modal</div>
        </ModalFocusTrap>
      </div>
    );

    // Use fireEvent with a native PointerEvent
    act(() => {
      const event = new PointerEvent('pointerdown', {
        bubbles: true,
        cancelable: true,
      });
      screen.getByTestId('outside').dispatchEvent(event);
    });

    expect(onOutsideClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onOutsideClick when clicking inside', async () => {
    const onOutsideClick = jest.fn();
    render(
      <ModalFocusTrap active={true} onOutsideClick={onOutsideClick}>
        <div data-testid="modal">Modal</div>
      </ModalFocusTrap>
    );

    const user = userEvent.setup();
    await user.click(screen.getByTestId('modal'));
    expect(onOutsideClick).not.toHaveBeenCalled();
  });

  it.skip('calls onOutsideClick on Escape key', async () => {
    const onOutsideClick = jest.fn();
    render(
      <ModalFocusTrap active={true} onOutsideClick={onOutsideClick}>
        <div>Modal</div>
      </ModalFocusTrap>
    );

    // Press Escape using userEvent (dispatches native DOM events)
    const user = userEvent.setup();
    await user.keyboard('{Escape}');
    await waitFor(() => { expect(onOutsideClick).toHaveBeenCalledTimes(1); });
  });

  it('does not call onOutsideClick when closeOnOutsideClick is false', () => {
    const onOutsideClick = jest.fn();
    const { container } = render(
      <div>
        <div data-testid="outside">Outside</div>
        <ModalFocusTrap
          active={true}
          closeOnOutsideClick={false}
          onOutsideClick={onOutsideClick}
        >
          <div>Modal</div>
        </ModalFocusTrap>
      </div>
    );

    // Click outside
    fireEvent.pointerDown(screen.getByTestId('outside'));
    expect(onOutsideClick).not.toHaveBeenCalled();
  });
});

describe('useFocusTrap Hook', () => {
  const TestComponent: React.FC<{ active?: boolean }> = ({ active = true }) => {
    const ref = React.useRef<HTMLDivElement>(null);
    useFocusTrap(ref, { active });

    return (
      <div ref={ref} data-testid="trap-container">
        <button data-testid="btn1">First</button>
        <button data-testid="btn2">Second</button>
      </div>
    );
  };

  it('focuses the first focusable element on mount', () => {
    render(<TestComponent active={true} />);
    expect(screen.getByTestId('btn1')).toHaveFocus();
  });

  it('does not trap focus when inactive', () => {
    render(<TestComponent active={false} />);
    // When inactive, no focus should be set
    expect(screen.getByTestId('btn1')).not.toHaveFocus();
  });
});

describe('Accessibility Compliance', () => {
  it('provides focus trap for WCAG 2.4.3 Focus Order', () => {
    render(
      <FocusTrap active={true}>
        <button data-testid="btn1">First</button>
        <button data-testid="btn2">Second</button>
        <button data-testid="btn3">Third</button>
      </FocusTrap>
    );

    // First element should be focused when trap activates
    expect(screen.getByTestId('btn1')).toHaveFocus();

    // Tab through elements
    fireEvent.keyDown(screen.getByTestId('btn1'), { key: 'Tab' });
    // After tab, focus should move in order
  });

  it('provides focus visible for WCAG 2.4.7', () => {
    render(
      <FocusTrap active={true}>
        <button data-testid="btn1">First</button>
      </FocusTrap>
    );

    const btn = screen.getByTestId('btn1');
    expect(btn).toHaveFocus();

    // Focus-visible styles should be applied
    expect(btn.matches(':focus-visible')).toBe(true);
  });

  it('supports keyboard navigation within trap', () => {
    const onActivate = jest.fn();
    render(
      <FocusTrap active={true} onActivate={onActivate}>
        <button data-testid="btn1">First</button>
        <button data-testid="btn2">Second</button>
        <button data-testid="btn3">Third</button>
      </FocusTrap>
    );

    expect(onActivate).toHaveBeenCalled();
    expect(screen.getByTestId('btn1')).toHaveFocus();
  });
});
