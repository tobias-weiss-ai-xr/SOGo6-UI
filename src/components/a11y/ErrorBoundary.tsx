'use client';

/**
 * Accessible Error Boundary Component
 * 
 * Provides a user-friendly error UI with proper accessibility features.
 * Catches JavaScript errors anywhere in the component tree.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  className?: string;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Default error messages (can be overridden by translations)
 */
const DEFAULT_ERROR_MESSAGES = {
  title: 'Something went wrong',
  description: 'An unexpected error occurred. Please try again later.',
  tryAgain: 'Try Again',
  contactSupport: 'Contact Support',
};

/**
 * ErrorBoundary component class (must be class component)
 */
class ErrorBoundaryComponent extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught error:', error, errorInfo);
    
    // Log error to error reporting service
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default accessible error fallback
      return (
        <div
          className={`error-boundary ${this.props.className || ''}`}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          style={{
            padding: '2rem',
            border: '2px solid #d32f2f',
            borderRadius: '8px',
            backgroundColor: '#ffebee',
            color: '#d32f2f',
            margin: '1rem 0',
          }}
        >
          <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.5rem' }}>
            Something went wrong
          </h2>
          <p style={{ margin: '0 0 1rem 0' }}>
            An unexpected error occurred. Please try again later.
          </p>
          <p style={{ fontFamily: 'monospace', fontSize: '0.875rem', wordBreak: 'break-word' }}>
            {this.state.error?.message}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#d32f2f',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
            aria-label="Try again"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * AccessibleErrorFallback component for consistent error displays
 */
export interface AccessibleErrorFallbackProps {
  error?: Error | null;
  title?: string;
  message?: string;
  onRetry?: () => void;
  onSupport?: () => void;
  className?: string;
}

export const AccessibleErrorFallback: React.FC<AccessibleErrorFallbackProps> = ({
  error,
  title,
  message,
  onRetry,
  onSupport,
  className = '',
}) => {
  const defaultTitle = 'Something went wrong';
  const defaultMessage = 'An unexpected error occurred. Please try again later.';
  const tryAgainText = 'Try Again';
  const contactSupportText = 'Contact Support';

  return (
    <div
      className={`accessible-error-fallback ${className}`}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <h2 className="error-title">
        {title || defaultTitle}
      </h2>
      
      {message && (
        <p className="error-message">
          {message}
        </p>
      )}
      
      {error && (
        <p className="error-details">
          {error.message}
        </p>
      )}
      
      <div className="error-actions">
        {onRetry && (
          <button
            onClick={onRetry}
            className="error-action-button retry-button"
            aria-label={tryAgainText}
          >
            {tryAgainText}
          </button>
        )}
        
        {onSupport && (
          <button
            onClick={onSupport}
            className="error-action-button support-button"
            aria-label={contactSupportText}
          >
            {contactSupportText}
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * HOC to wrap components with error boundary
 */
export const withErrorBoundary = (
  WrappedComponent: React.ComponentType<any>,
  fallback?: ReactNode
) => {
  return class ErrorBoundaryWrapper extends React.Component<ErrorBoundaryProps> {
    render() {
      return (
        <ErrorBoundaryComponent fallback={fallback}>
          <WrappedComponent {...this.props} />
        </ErrorBoundaryComponent>
      );
    }
  };
};

export { ErrorBoundaryComponent as ErrorBoundary };
export default ErrorBoundaryComponent;
