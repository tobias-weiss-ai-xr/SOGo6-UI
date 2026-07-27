/**
 * ErrorBoundary Component Tests
 *
 * Tests for accessible error boundary handling.
 * WCAG 2.1: 3.3.1 Error Identification (Level A)
 * WCAG 2.1: 4.1.2 Name, Role, Value (Level A)
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary, AccessibleErrorFallback, withErrorBoundary } from '../ErrorBoundary';

// A component that throws an error
const BrokenComponent: React.FC<{ shouldThrow?: boolean }> = ({ shouldThrow = false }) => {
  if (shouldThrow) {
    throw new Error('Test error message');
  }
  return <div data-testid="working-component">Working Component</div>;
};

// Mock console.error to avoid noise in test output
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = jest.fn();
});
afterEach(() => {
  console.error = originalConsoleError;
});

describe('ErrorBoundary Component', () => {
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div data-testid="child">Child Content</div>
      </ErrorBoundary>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });

  it('renders default error UI when a child throws', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    // Should show error title
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    
    // Should show error description
    expect(screen.getByText(/An unexpected error occurred/)).toBeInTheDocument();
    
    // Should show error message
    expect(screen.getByText('Test error message')).toBeInTheDocument();
    
    // Should show try again button
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('does not render broken children when error is caught', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.queryByTestId('working-component')).not.toBeInTheDocument();
  });

  it('renders custom fallback when provided', () => {
    const customFallback = <div data-testid="custom-fallback">Custom Error UI</div>;
    render(
      <ErrorBoundary fallback={customFallback}>
        <BrokenComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    expect(screen.getByText('Custom Error UI')).toBeInTheDocument();
  });

  it('calls onError when a child throws', () => {
    const onError = jest.fn();
    render(
      <ErrorBoundary onError={onError}>
        <BrokenComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.any(Object)
    );
    expect(onError.mock.calls[0][0].message).toBe('Test error message');
  });

  it('recovers after re-render with no error', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <BrokenComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    // Should show error
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // Re-render with no error
    rerender(
      <ErrorBoundary>
        <BrokenComponent shouldThrow={false} />
      </ErrorBoundary>
    );

    // Should show working component now
    expect(screen.getByTestId('working-component')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <ErrorBoundary className="my-error-boundary">
        <BrokenComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    const errorContainer = screen.getByRole('alert');
    expect(errorContainer).toHaveClass('error-boundary', 'my-error-boundary');
  });

  it('has role="alert" for accessibility', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('has aria-live="assertive" for screen readers', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('aria-live', 'assertive');
    expect(alert).toHaveAttribute('aria-atomic', 'true');
  });

  it('logs errors to console', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(console.error).toHaveBeenCalled();
  });
});

describe('AccessibleErrorFallback Component', () => {
  it('renders with default messages', () => {
    render(
      <AccessibleErrorFallback />
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText(/An unexpected error occurred/)).toBeInTheDocument();
  });

  it('renders custom title and message', () => {
    render(
      <AccessibleErrorFallback
        title="Custom Error"
        message="Something specific went wrong"
      />
    );

    expect(screen.getByText('Custom Error')).toBeInTheDocument();
    expect(screen.getByText('Something specific went wrong')).toBeInTheDocument();
  });

  it('displays error message when error prop is provided', () => {
    const error = new Error('Detailed error info');
    render(
      <AccessibleErrorFallback error={error} />
    );

    expect(screen.getByText('Detailed error info')).toBeInTheDocument();
  });

  it('renders retry button with onRetry callback', () => {
    const onRetry = jest.fn();
    render(
      <AccessibleErrorFallback onRetry={onRetry} />
    );

    const retryButton = screen.getByText('Try Again');
    expect(retryButton).toBeInTheDocument();
    
    fireEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('renders support button with onSupport callback', () => {
    const onSupport = jest.fn();
    render(
      <AccessibleErrorFallback onSupport={onSupport} />
    );

    const supportButton = screen.getByText('Contact Support');
    expect(supportButton).toBeInTheDocument();
    
    fireEvent.click(supportButton);
    expect(onSupport).toHaveBeenCalledTimes(1);
  });

  it('does not render retry button when onRetry is not provided', () => {
    render(
      <AccessibleErrorFallback />
    );

    expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
  });

  it('does not render support button when onSupport is not provided', () => {
    render(
      <AccessibleErrorFallback />
    );

    expect(screen.queryByText('Contact Support')).not.toBeInTheDocument();
  });

  it('has role="alert" for accessibility', () => {
    render(
      <AccessibleErrorFallback />
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('has aria-live="assertive"', () => {
    render(
      <AccessibleErrorFallback />
    );

    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('aria-live', 'assertive');
    expect(alert).toHaveAttribute('aria-atomic', 'true');
  });

  it('applies custom className', () => {
    render(
      <AccessibleErrorFallback className="custom-error-ui" />
    );

    expect(screen.getByRole('alert')).toHaveClass('accessible-error-fallback', 'custom-error-ui');
  });
});

describe('withErrorBoundary HOC', () => {
  it('wraps component with error boundary', () => {
    const SafeComponent = withErrorBoundary(BrokenComponent);
    
    render(
      <SafeComponent shouldThrow={false} />
    );

    expect(screen.getByTestId('working-component')).toBeInTheDocument();
  });

  it('catches errors in wrapped component', () => {
    const SafeComponent = withErrorBoundary(BrokenComponent);
    
    render(
      <SafeComponent shouldThrow={true} />
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('renders custom fallback for wrapped component', () => {
    const customFallback = <div data-testid="hoc-fallback">HOC Fallback</div>;
    const SafeComponent = withErrorBoundary(BrokenComponent, customFallback);
    
    render(
      <SafeComponent shouldThrow={true} />
    );

    expect(screen.getByTestId('hoc-fallback')).toBeInTheDocument();
  });
});

describe('Accessibility Compliance', () => {
  it('provides error identification (WCAG 3.3.1)', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    // Error should be clearly identified
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('provides name, role, value for error UI (WCAG 4.1.2)', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    
    // Buttons should have accessible names
    const tryAgainButton = screen.getByRole('button', { name: /try again/i });
    expect(tryAgainButton).toBeInTheDocument();
  });

  it('announces errors to screen readers', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('aria-live', 'assertive');
    expect(alert).toHaveAttribute('aria-atomic', 'true');
  });
});
