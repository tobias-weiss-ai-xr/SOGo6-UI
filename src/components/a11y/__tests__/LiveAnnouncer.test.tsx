/**
 * LiveAnnouncer Component Tests
 *
 * Tests for screen reader live announcements.
 * WCAG 2.1: 4.1.3 Status Messages (Level AA)
 */

import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import {
  LiveAnnouncerProvider,
  useLiveAnnouncer,
  Announce,
  LoadingAnnouncer,
  NotificationAnnouncer,
  RouteAnnouncer,
  useAnnounce,
} from '../LiveAnnouncer';

// Test component that uses the hook
const TestComponent: React.FC<{ message?: string; politeness?: 'POLITE' | 'ASSERTIVE' }> = ({
  message = 'Test announcement',
  politeness = 'POLITE',
}) => {
  const { announce } = useLiveAnnouncer();
  
  return (
    <div>
      <button onClick={() => announce(message, politeness)}>Announce</button>
    </div>
  );
};

describe('LiveAnnouncerProvider', () => {
  it('renders children', () => {
    render(
      <LiveAnnouncerProvider>
        <div data-testid="child">Child Component</div>
      </LiveAnnouncerProvider>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('renders live region containers for polite and assertive', () => {
    const { container } = render(
      <LiveAnnouncerProvider>
        <div>Content</div>
      </LiveAnnouncerProvider>
    );

    // There should be two live region containers (polite + assertive)
    const liveRegions = container.querySelectorAll('[aria-live]');
    expect(liveRegions.length).toBe(2);

    // One should be polite
    expect(container.querySelector('[aria-live="polite"]')).toBeInTheDocument();
    // One should be assertive
    expect(container.querySelector('[aria-live="assertive"]')).toBeInTheDocument();
  });
});

describe('useLiveAnnouncer hook', () => {
  it('provides announce function', () => {
    render(
      <LiveAnnouncerProvider>
        <TestComponent />
      </LiveAnnouncerProvider>
    );

    // The component should render with the announce button
    expect(screen.getByText('Announce')).toBeInTheDocument();
  });

  it('announces a polite message', () => {
    render(
      <LiveAnnouncerProvider>
        <TestComponent message="Hello screen reader" politeness="POLITE" />
      </LiveAnnouncerProvider>
    );

    fireEvent.click(screen.getByText('Announce'));

    // The polite live region should contain the message
    const politeRegion = screen.getByRole('status');
    expect(politeRegion).toHaveTextContent('Hello screen reader');
  });

  it('announces an assertive message', () => {
    render(
      <LiveAnnouncerProvider>
        <TestComponent message="Urgent message" politeness="ASSERTIVE" />
      </LiveAnnouncerProvider>
    );

    fireEvent.click(screen.getByText('Announce'));

    // The assertive live region should contain the message
    const assertiveRegion = screen.getByRole('alert');
    expect(assertiveRegion).toHaveTextContent('Urgent message');
  });

  it('throws error when used outside provider', () => {
    // Suppress console error for expected error
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => render(<TestComponent />)).toThrow(
      'useLiveAnnouncer must be used within a LiveAnnouncerProvider'
    );

    consoleSpy.mockRestore();
  });

  it('provides announceWithDelay function', () => {
    const DelayedComponent: React.FC = () => {
      const { announceWithDelay } = useLiveAnnouncer();
      return (
        <button onClick={() => announceWithDelay('Delayed message', 'POLITE', 100)}>
          Announce Delayed
        </button>
      );
    };

    render(
      <LiveAnnouncerProvider>
        <DelayedComponent />
      </LiveAnnouncerProvider>
    );

    expect(screen.getByText('Announce Delayed')).toBeInTheDocument();
  });

  it('provides clearAnnouncements function', () => {
    const ClearComponent: React.FC = () => {
      const { announce, clearAnnouncements } = useLiveAnnouncer();
      return (
        <div>
          <button onClick={() => announce('Test')}>Announce Test</button>
          <button onClick={clearAnnouncements}>Clear</button>
        </div>
      );
    };

    render(
      <LiveAnnouncerProvider>
        <ClearComponent />
      </LiveAnnouncerProvider>
    );

    fireEvent.click(screen.getByText('Announce Test'));
    fireEvent.click(screen.getByText('Clear'));

    // After clearing, the live region should be empty
    const politeRegion = screen.getByRole('status');
    expect(politeRegion).toHaveTextContent('');
  });
});

describe('Announce Component', () => {
  it('announces a message on mount', () => {
    render(
      <LiveAnnouncerProvider>
        <Announce message="Component loaded" />
      </LiveAnnouncerProvider>
    );

    const politeRegion = screen.getByRole('status');
    expect(politeRegion).toHaveTextContent('Component loaded');
  });

  it('renders custom component for display', () => {
    render(
      <LiveAnnouncerProvider>
        <Announce message="Visible text" as="span" />
      </LiveAnnouncerProvider>
    );

    // The announcement should be visible as a span
    const announcement = screen.getByText('Visible text');
    expect(announcement.tagName).toBe('SPAN');
  });

  it('applies aria-live attribute', () => {
    render(
      <LiveAnnouncerProvider>
        <Announce message="Test" politeness="ASSERTIVE" />
      </LiveAnnouncerProvider>
    );

    const announcement = screen.getByText('Test');
    expect(announcement).toHaveAttribute('aria-live', 'assertive');
  });
});

describe('LoadingAnnouncer Component', () => {
  it('announces loading state', () => {
    const { rerender } = render(
      <LiveAnnouncerProvider>
        <LoadingAnnouncer
          isLoading={true}
          loadingMessage="Fetching data..."
        />
      </LiveAnnouncerProvider>
    );

    const politeRegion = screen.getByRole('status');
    expect(politeRegion).toHaveTextContent('Fetching data...');
  });

  it('announces success state', () => {
    const { rerender } = render(
      <LiveAnnouncerProvider>
        <LoadingAnnouncer
          isLoading={false}
          hasSuccess={true}
          successMessage="Data loaded"
        />
      </LiveAnnouncerProvider>
    );

    const politeRegion = screen.getByRole('status');
    expect(politeRegion).toHaveTextContent('Data loaded');
  });

  it('announces error state assertively', () => {
    render(
      <LiveAnnouncerProvider>
        <LoadingAnnouncer
          isLoading={false}
          hasError={true}
          errorMessage="Failed to load"
        />
      </LiveAnnouncerProvider>
    );

    const assertiveRegion = screen.getByRole('alert');
    expect(assertiveRegion).toHaveTextContent('Failed to load');
  });
});

describe('NotificationAnnouncer Component', () => {
  it('announces success notification politely', () => {
    render(
      <LiveAnnouncerProvider>
        <NotificationAnnouncer
          notifications={[
            { id: '1', message: 'Operation successful', type: 'success' },
          ]}
        />
      </LiveAnnouncerProvider>
    );

    const politeRegion = screen.getByRole('status');
    expect(politeRegion).toHaveTextContent('Operation successful');
  });

  it('announces error notification assertively', () => {
    render(
      <LiveAnnouncerProvider>
        <NotificationAnnouncer
          notifications={[
            { id: '1', message: 'Operation failed', type: 'error' },
          ]}
        />
      </LiveAnnouncerProvider>
    );

    const assertiveRegion = screen.getByRole('alert');
    expect(assertiveRegion).toHaveTextContent('Operation failed');
  });

  it('does not announce duplicate notifications', () => {
    render(
      <LiveAnnouncerProvider>
        <NotificationAnnouncer
          notifications={[
            { id: '1', message: 'First notification', type: 'info' },
            { id: '1', message: 'First notification', type: 'info' },
          ]}
        />
      </LiveAnnouncerProvider>
    );

    // Should only appear once
    const politeRegion = screen.getByRole('status');
    expect(politeRegion).toHaveTextContent('First notification');
  });
});

describe('RouteAnnouncer Component', () => {
  it('announces navigation to a new route', () => {
    const { rerender } = render(
      <LiveAnnouncerProvider>
        <RouteAnnouncer path="/home" />
      </LiveAnnouncerProvider>
    );

    rerender(
      <LiveAnnouncerProvider>
        <RouteAnnouncer path="/about" />
      </LiveAnnouncerProvider>
    );

    const politeRegion = screen.getByRole('status');
    expect(politeRegion).toHaveTextContent('Navigated to /about');
  });

  it('announces navigation with title', () => {
    const { rerender } = render(
      <LiveAnnouncerProvider>
        <RouteAnnouncer path="/home" />
      </LiveAnnouncerProvider>
    );

    rerender(
      <LiveAnnouncerProvider>
        <RouteAnnouncer path="/about" title="About Us" />
      </LiveAnnouncerProvider>
    );

    const politeRegion = screen.getByRole('status');
    expect(politeRegion).toHaveTextContent('Navigated to About Us');
  });

  it('does not announce initial route', () => {
    render(
      <LiveAnnouncerProvider>
        <RouteAnnouncer path="/home" title="Home" />
      </LiveAnnouncerProvider>
    );

    const politeRegion = screen.getByRole('status');
    // Initial route should not trigger announcement
    expect(politeRegion).toHaveTextContent('');
  });
});

describe('useAnnounce hook', () => {
  it('provides announce function for one-off announcements', () => {
    const TestAnnounce: React.FC = () => {
      const { announce } = useAnnounce();
      return <button onClick={() => announce('One-off message')}>Say It</button>;
    };

    render(
      <LiveAnnouncerProvider>
        <TestAnnounce />
      </LiveAnnouncerProvider>
    );

    fireEvent.click(screen.getByText('Say It'));

    const politeRegion = screen.getByRole('status');
    expect(politeRegion).toHaveTextContent('One-off message');
  });

  it('provides announceFormState for form submissions', () => {
    const TestForm: React.FC = () => {
      const { announceFormState } = useAnnounce();
      return (
        <button onClick={() => announceFormState('success', 'Contact Form')}>
          Submit Form
        </button>
      );
    };

    render(
      <LiveAnnouncerProvider>
        <TestForm />
      </LiveAnnouncerProvider>
    );

    fireEvent.click(screen.getByText('Submit Form'));

    const politeRegion = screen.getByRole('status');
    expect(politeRegion).toHaveTextContent('Contact Form submitted successfully');
  });

  it('provides announceToast for notifications', () => {
    const TestToast: React.FC = () => {
      const { announceToast } = useAnnounce();
      return (
        <button onClick={() => announceToast('Item saved', 'success')}>
          Save
        </button>
      );
    };

    render(
      <LiveAnnouncerProvider>
        <TestToast />
      </LiveAnnouncerProvider>
    );

    fireEvent.click(screen.getByText('Save'));

    const politeRegion = screen.getByRole('status');
    expect(politeRegion).toHaveTextContent('Item saved');
  });

  it('announces errors assertively in announceToast', () => {
    const TestError: React.FC = () => {
      const { announceToast } = useAnnounce();
      return (
        <button onClick={() => announceToast('Error occurred', 'error')}>
          Trigger Error
        </button>
      );
    };

    render(
      <LiveAnnouncerProvider>
        <TestError />
      </LiveAnnouncerProvider>
    );

    fireEvent.click(screen.getByText('Trigger Error'));

    const assertiveRegion = screen.getByRole('alert');
    expect(assertiveRegion).toHaveTextContent('Error occurred');
  });
});

describe('Accessibility Compliance', () => {
  it('provides status role for polite announcements (WCAG 4.1.3)', () => {
    render(
      <LiveAnnouncerProvider>
        <TestComponent message="Status update" politeness="POLITE" />
      </LiveAnnouncerProvider>
    );

    // Polite announcements should use role="status"
    const statusRegion = screen.getByRole('status');
    expect(statusRegion).toHaveAttribute('aria-live', 'polite');
    expect(statusRegion).toHaveAttribute('aria-atomic', 'true');
  });

  it('provides alert role for assertive announcements (WCAG 4.1.3)', () => {
    render(
      <LiveAnnouncerProvider>
        <TestComponent message="Alert message" politeness="ASSERTIVE" />
      </LiveAnnouncerProvider>
    );

    // Assertive announcements should use role="alert"
    const alertRegion = screen.getByRole('alert');
    expect(alertRegion).toHaveAttribute('aria-live', 'assertive');
    expect(alertRegion).toHaveAttribute('aria-atomic', 'true');
  });

  it('live regions are visually hidden', () => {
    const { container } = render(
      <LiveAnnouncerProvider>
        <div>Content</div>
      </LiveAnnouncerProvider>
    );

    const liveRegions = container.querySelectorAll('[aria-live]');
    liveRegions.forEach(region => {
      const style = window.getComputedStyle(region);
      // Should be hidden from visual view but visible to screen readers
      expect(region).toHaveStyle({
        position: 'absolute',
        width: '1px',
        height: '1px',
        overflow: 'hidden',
      });
    });
  });
});
