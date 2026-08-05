# SOGo6 API Client - Usage Examples

## Table of Contents

- [Quick Start](#quick-start)
- [Authentication](#authentication)
- [Mail API](#mail-api)
- [Calendar API](#calendar-api)
- [Contact API](#contact-api)
- [Admin API](#admin-api)
- [System API](#system-api)
- [Health Checks](#health-checks)
- [Real-time with SSE](#real-time-with-sse)
- [Push Notifications](#push-notifications)
- [Token Management](#token-management)
- [Error Handling](#error-handling)

---

## Quick Start

### Import the API Client

```typescript
import { apiClient } from '@/lib/api';
```

### Make a Simple Request

```typescript
// GET request
const mailboxes = await apiClient.get<{ mailboxes: any[] }>('/api/user/v1/mail/mailboxes');

// POST request
const response = await apiClient.post('/api/user/v1/mail/messages', {
  mailboxId: 'inbox',
  to: 'recipient@example.com',
  subject: 'Hello',
  body: 'This is a test email',
});

// PUT request
const updated = await apiClient.put('/api/user/v1/user/profile', {
  display_name: 'John Doe',
});

// DELETE request
const deleted = await apiClient.delete('/api/user/v1/mail/messages/123');
```

---

## Authentication

### Login

```typescript
import { authApi } from '@/lib/api';

const loginResponse = await authApi.login({
  login: 'user@example.com',
  password: 'secret',
});

// loginResponse contains:
// {
//   jwt_token: string;
//   refresh_token: string;
//   expires_in: number;
//   token_type: 'Bearer';
//   user: { uid: string; display_name: string; email: string };
//   device_id: string;
// }
```

### Logout

```typescript
const logoutResponse = await authApi.logout();
// {
//   message: string;
//   revoked: boolean;
// }
```

### Token Refresh

```typescript
const newTokens = await authApi.refreshToken('your-refresh-token');
// Returns same structure as login()
```

### WebAuthn Authentication

```typescript
// Start registration
const registrationStart = await authApi.webAuthnRegistrationStart('user@example.com');
// { challenge, rp, user, pubKeyCredParams, authenticatorSelection, timeout }

// Finish registration
const registrationResult = await authApi.webAuthnRegistrationFinish({
  id: 'credential-id',
  rawId: 'raw-credential-id',
  type: 'public-key',
  response: {
    attestationObject: 'base64-encoded-attestation',
    clientDataJSON: 'base64-encoded-client-data',
  },
});

// Start authentication
const authStart = await authApi.webAuthnAuthStart('user@example.com');
// { challenge, rpId, allowCredentials, timeout, userVerification }

// Finish authentication
const authResult = await authApi.webAuthnAuthFinish({
  id: 'credential-id',
  rawId: 'raw-credential-id',
  type: 'public-key',
  response: {
    authenticatorData: 'base64-encoded-authenticator-data',
    clientDataJSON: 'base64-encoded-client-data',
    signature: 'base64-encoded-signature',
    userHandle: 'user-handle',
  },
});
```

---

## Mail API

### List Mailboxes

```typescript
import { mailApi } from '@/lib/api';

const mailboxes = await mailApi.listMailboxes();
// {
//   mailboxes: [
//     {
//       id: 'inbox',
//       name: 'INBOX',
//       path: 'INBOX',
//       type: 'inbox',
//       unread_count: 5,
//       total_count: 120,
//       is_subscribed: true,
//       ...
//     },
//     ...
//   ],
//   delimiter: '.',
//   root: 'INBOX'
// }
```

### List Messages

```typescript
const messages = await mailApi.listMessages('inbox', {
  page: 1,
  per_page: 50,
  sort: 'date',
  order: 'desc',
});
// {
//   messages: [
//     {
//       id: '123',
//       uid: 12345,
//       mailboxId: 'inbox',
//       from: { name: 'Sender', address: 'sender@example.com' },
//       to: [{ name: 'You', address: 'you@example.com' }],
//       subject: 'Meeting',
//       date: '2024-01-15T10:30:00Z',
//       is_unread: true,
//       is_flagged: false,
//       has_attachments: false,
//       size: 1523,
//       snippet: 'Meeting at 2pm tomorrow...',
//       ...
//     },
//     ...
//   ],
//   pagination: { page: 1, per_page: 50, total: 250, total_pages: 5 }
// }
```

### Get Message

```typescript
const message = await mailApi.getMessage('inbox', '123');
// {
//   id: '123',
//   uid: 12345,
//   mailboxId: 'inbox',
//   headers: { from: [...], to: [...], subject: '...', date: '...', ... },
//   body: { text: '...', html: '...' },
//   attachments: [...],
//   is_unread: false,
//   is_flagged: true,
//   labels: [...],
//   ...
// }
```

### Send Message

```typescript
const sent = await mailApi.sendMessage({
  mailboxId: 'drafts',
  to: ['recipient@example.com'],
  cc: ['copy@example.com'],
  bcc: ['hidden@example.com'],
  subject: 'Important Update',
  body: { text: 'Hello World', html: '<p>Hello World</p>' },
  attachments: ['/path/to/file.pdf'],
  priority: 'normal',
  read_receipt: false,
});
// { success: true, message_id: 'abc123', sent_at: '2024-01-15T10:30:00Z' }
```

### Move Message

```typescript
const result = await mailApi.moveMessage('inbox', '123', {
  to_mailbox: 'archive',
});
// { success: true, message: 'Message moved' }
```

### Search Messages

```typescript
const results = await mailApi.searchMessages('inbox', {
  query: 'from:john@ OR subject:meeting',
  since: '2024-01-01',
  until: '2024-01-31',
  has_attachment: true,
  is_unread: true,
});
```

---

## Calendar API

### List Calendars

```typescript
import { calendarApi } from '@/lib/api';

const calendars = await calendarApi.listCalendars();
// {
//   calendars: [
//     {
//       id: 'personal',
//       name: 'Personal',
//       color: '#FF5733',
//       is_primary: true,
//       is_subscribed: true,
//       permissions: { read: true, write: true, delete: true },
//       ...
//     },
//     ...
//   ]
// }
```

### List Events

```typescript
const events = await calendarApi.listEvents('personal', {
  start: '2024-01-01T00:00:00Z',
  end: '2024-01-31T23:59:59Z',
  page: 1,
  per_page: 100,
});
// {
//   events: [
//     {
//       id: 'event-123',
//       calendarId: 'personal',
//       title: 'Team Meeting',
//       description: 'Discuss project updates',
//       start: '2024-01-15T14:00:00Z',
//       end: '2024-01-15T15:00:00Z',
//       location: 'Conference Room A',
//       is_all_day: false,
//       // Repeat: event.repeat,
//       // Reminder: event.reminder,
//       attendees: [...],
//       ...
//     },
//     ...
//   ],
//   pagination: { ... }
// }
```

### Create Event

```typescript
const created = await calendarApi.createEvent('personal', {
  title: 'Team Meeting',
  description: 'Discuss project updates',
  start: '2024-01-15T14:00:00Z',
  end: '2024-01-15T15:00:00Z',
  location: 'Conference Room A',
  attendees: [
    { address: 'john@example.com', name: 'John', role: 'REQ', status: 'ACCEPTED' },
    // ...
  ],
  reminder: { method: 'email', minutes_before: 15 },
  repeat: {
    freq: 'WEEKLY',
    interval: 1,
    until: '2024-12-31',
  },
});
```

### Update Event

```typescript
const updated = await calendarApi.updateEvent('personal', 'event-123', {
  title: 'Team Meeting - Rescheduled',
  description: 'Updated description',
  start: '2024-01-16T14:00:00Z',
  end: '2024-01-16T15:00:00Z',
});
```

### Delete Event

```typescript
const result = await calendarApi.deleteEvent('personal', 'event-123');
// { success: true, message: 'Event deleted' }
```

### Get Free/Busy

```typescript
const freeBusy = await calendarApi.getFreeBusy({
  start: '2024-01-15T09:00:00Z',
  end: '2024-01-15T17:00:00Z',
  users: ['user@example.com'],
});
// {
//   freeBusy: [
//     {
//       date: '2024-01-15',
//       intervals: [
//         { start: '09:00', end: '10:00', status: 'free' },
//         { start: '10:00', end: '12:00', status: 'busy' },
//         // ...
//       ]
//     }
//   ]
// }
```

---

## Contact API

### List Address Books

```typescript
import { contactApi } from '@/lib/api';

const addressBooks = await contactApi.listAddressBooks();
// {
//   addressbooks: [
//     {
//       id: 'personal',
//       name: 'Personal Contacts',
//       is_primary: true,
//       contact_count: 150,
//       permissions: { read: true, write: true, delete: true },
//       ...
//     },
//     ...
//   ]
// }
```

### List Contacts

```typescript
const contacts = await contactApi.listContacts('personal', {
  page: 1,
  per_page: 50,
  sort: 'last_name',
  order: 'asc',
});
// {
//   contacts: [
//     {
//       id: 'contact-123',
//       addressbookId: 'personal',
//       prefix: 'Mr.',
//       first_name: 'John',
//       last_name: 'Doe',
//       suffix: 'Jr.',
//       display_name: 'John Doe',
//       nickname: 'Johnny',
//       emails: [{ address: 'john@company.com', type: 'work', label: 'Work', is_primary: true }],
//       phones: [{ number: '+1 555-123-4567', type: 'mobile', label: 'Cell', is_primary: true }],
//       addresses: [...],
//       ...
//     },
//     ...
//   ],
//   pagination: { ... }
// }
```

### Create Contact

```typescript
const created = await contactApi.createContact('personal', {
  first_name: 'Jane',
  last_name: 'Smith',
  display_name: 'Jane Smith',
  emails: [
    { address: 'jane@example.com', type: 'personal', is_primary: true },
  ],
  phones: [
    { number: '+1 555-987-6543', type: 'mobile', is_primary: true },
  ],
  addresses: [
    {
      street: '123 Main St',
      city: 'Springfield',
      region: 'MA',
      postal_code: '01234',
      country: 'USA',
      type: 'work',
      is_primary: true,
    },
  ],
  notes: 'Hello World',
});
```

### Update Contact

```typescript
const updated = await contactApi.updateContact('personal', 'contact-123', {
  first_name: 'Jane',
  last_name: 'Smith-Doe',
  display_name: 'Jane Smith-Doe',
  emails: [...],
});
```

### Delete Contact

```typescript
const result = await contactApi.deleteContact('personal', 'contact-123');
// { success: true, message: 'Contact deleted' }
```

### Search Contacts

```typescript
const results = await contactApi.searchContacts({
  query: 'john OR smith',
  addressbookId: 'personal',
  scope: 'all', // 'all' | 'current' | 'remote'
});
```

---

## Admin API

### List Users (Admin only)

```typescript
import { adminApi } from '@/lib/api';

const { users, total } = await adminApi.listUsers({
  page: 1,
  per_page: 50,
  sort: 'username',
  order: 'asc',
});
```

### Create User

```typescript
const { success, user } = await adminApi.createUser({
  username: 'newuser',
  email: 'newuser@company.com',
  password: 'SecurePassword123!',
  display_name: 'New User',
  first_name: 'New',
  last_name: 'User',
  role: 'user',
  domain_id: 'domain-1',
});
```

### Update User

```typescript
const updated = await adminApi.updateUser('user-123', {
  display_name: 'Updated Name',
  email: 'updated@company.com',
  is_active: true,
});
```

### Delete User

```typescript
const { success, message } = await adminApi.deleteUser('user-123', true); // purge_data = true
```

### Get System Statistics

```typescript
const stats = await adminApi.getStatistics();
// {
//   total_users: 150,
//   active_users: 140,
//   disabled_users: 10,
//   total_emails_sent_today: 2500,
//   total_emails_received_today: 3000,
//   total_storage_used: 15360000000, // 15 GB
//   total_storage_available: 100000000000, // 100 GB
//   storage_usage_percent: 15.36,
//   cpu_usage: 45.2,
//   memory_usage: 2048000000,
//   memory_total: 8000000000,
//   disk_usage: 75.5,
//   disk_total: 100000000000,
//   uptime: 86400, // seconds
//   last_check: '2024-01-15T10:30:00Z'
// }
```

---

## System API

### Get System Parameters

```typescript
import { systemApi } from '@/lib/api';

const params = await systemApi.getSystemParameters();
// {
//   version: '6.0.0',
//   build_date: '2024-01-01T00:00:00Z',
//   build_commit: 'abc123...',
//   product_name: 'SOGo6',
//   edge_sogod_host: 'sogo.example.com',
//   ldap_epoch: 1234567890,
//   clear_url: true,
//   statue_url: '/status',
//   time_format: 'HH:mm',
//   date_format: 'YYYY-MM-DD',
//   week_start_day: 1, // Monday
//   timezone: 'UTC',
//   auth_mechanisms: ['plain', 'saml2', 'webauthn'],
//   sso_providers: [...],
//   default_domain: 'example.com',
//   domains: ['example.com', 'test.com'],
//   locale: 'en',
//   available_languages: [...],
//   features: { mail: true, calendar: true, contacts: true, ... },
//   customization: { logo: '/logo.png', primary_color: '#0066CC', ... },
//   modules: [...],
//   integrations: [...],
//   maintenance: { mode: false, message: null, ... },
//   ...
// }
```

---

## Health Checks

### Check Health

```typescript
import { healthApi } from '@/lib/api';

const health = await healthApi.check();
// {
//   status: 'ok',
//   timestamp: '2024-01-15T10:30:00Z',
//   version: '6.0.0',
//   service: 'SOGo6',
//   checks: [
//     { name: 'database', status: 'ok', message: 'Connected', duration_ms: 5 },
//     { name: 'cache', status: 'ok', message: 'Connected', duration_ms: 3 },
//     // ...
//   ],
//   overall_health: 100,
//   uptime: 86400,
//   uptime_human: '1 day, 0 hours, 0 minutes'
// }
```

### Check Specific Component

```typescript
const dbHealth = await healthApi.checkComponents(['database']);
```

---

## Real-time with SSE

### Subscribe to Events

```typescript
import { useSse, useMailEvents, useCalendarEvents } from '@/lib/api/hooks';

// Option 1: Subscribe to all events
function EventsComponent() {
  const { status, error, subscribe, disconnect } = useSse();
  
  useEffect(() => {
    const unsubscribe = subscribe((event) => {
      console.log('Event received:', event);
      // Handle event
    });
    
    return () => {
      unsubscribe();
      disconnect();
    };
  }, [subscribe, disconnect]);
  
  return <div>Status: {status}</div>;
}

// Option 2: Subscribe to specific event types
function MailEventsComponent() {
  const { mailEvents, status } = useMailEvents();
  
  useEffect(() => {
    // mailEvents will be updated automatically
    console.log('New mail events:', mailEvents);
  }, [mailEvents]);
  
  return (
    <div>
      <p>Status: {status}</p>
      <p>Mail Events: {mailEvents.length}</p>
    </div>
  );
}

// Option 3: Subscribe to calendar events
function CalendarEventsComponent() {
  const { calendarEvents, status } = useCalendarEvents();
  
  useEffect(() => {
    console.log('Calendar events:', calendarEvents);
  }, [calendarEvents]);
  
  return (
    <div>
      <p>Status: {status}</p>
      <p>Calendar Events: {calendarEvents.length}</p>
    </div>
  );
}
```

---

## Push Notifications

### Use Push Notifications

```typescript
import { usePushNotifications } from '@/lib/api/hooks';

function NotificationsComponent() {
  const {
    permission,
    isSupported,
    subscription,
    isLoading,
    error,
    notifications,
    requestPermission,
    subscribe,
    unsubscribe,
    showNotification,
    closeNotification,
    clearNotifications,
  } = usePushNotifications();
  
  const handleSubscribe = async () => {
    if (!isSupported) {
      alert('Push notifications not supported');
      return;
    }
    
    try {
      await requestPermission();
      if (permission === 'granted') {
        const sub = await subscribe();
        console.log('Subscribed:', sub);
      }
    } catch (err) {
      console.error('Failed to subscribe:', err);
    }
  };
  
  const handleUnsubscribe = async () => {
    try {
      await unsubscribe();
      console.log('Unsubscribed');
    } catch (err) {
      console.error('Failed to unsubscribe:', err);
    }
  };
  
  const handleShowNotification = async () => {
    try {
      await showNotification({
        title: 'New Message',
        body: 'You have a new message from John Doe',
        icon: '/icons/icon-192x192.png',
        data: { url: '/mail' },
      });
    } catch (err) {
      console.error('Failed to show notification:', err);
    }
  };
  
  return (
    <div>
      <p>Permission: {permission}</p>
      <p>Supported: {isSupported ? 'Yes' : 'No'}</p>
      <p>Subscribed: {subscription ? 'Yes' : 'No'}</p>
      
      <button onClick={handleSubscribe} disabled={!isSupported}>
        Subscribe
      </button>
      
      <button onClick={handleUnsubscribe} disabled={!subscription}>
        Unsubscribe
      </button>
      
      <button onClick={handleShowNotification} disabled={!subscription}>
        Test Notification
      </button>
      
      <button onClick={clearNotifications}>
        Clear Notifications ({notifications.length})
      </button>
    </div>
  );
}
```

---

## Token Management

### Use ApiProvider in App

```typescript
// components/Providers.tsx
'use client';

import { ApiProvider } from '@/lib/api/hooks';

export function Providers({ children }: { children: React.ReactNode }) {
  return <ApiProvider>{children}</ApiProvider>;
}

// app/layout.tsx
import { Providers } from '@/components/Providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### Use API Context in Components

```typescript
'use client';

import { useApi } from '@/lib/api/hooks';

function UserProfile() {
  const { user, isAuthenticated, isLoading, error, login, logout } = useApi();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  if (!isAuthenticated) {
    return (
      <div>
        <h1>Please Login</h1>
        <button onClick={() => login({ login: 'user@example.com', password: 'secret' })}>
          Login
        </button>
      </div>
    );
  }
  
  return (
    <div>
      <h1>Profile</h1>
      <p>Name: {user?.display_name}</p>
      <p>Email: {user?.email}</p>
      <button onClick={() => logout()}>
        Logout
      </button>
    </div>
  );
}
```

---

## Error Handling

### Basic Error Handling

```typescript
import { apiClient, type ApiError } from '@/lib/api';

try {
  const data = await apiClient.get('/api/user/v1/mail/mailboxes');
  // Handle success
} catch (error) {
  const apiError = error as ApiError;
  console.log('Error:', apiError.message);
  console.log('Code:', apiError.code);
  console.log('Status:', apiError.status);
  console.log('Data:', apiError.data);
  
  switch (apiError.code) {
    case 'ERROR_AUTH_REQUIRED':
      // Redirect to login
      break;
    case 'ERROR_NOT_FOUND':
      // Show 404
      break;
    case 'ERROR_FORBIDDEN':
      // Show access denied
      break;
    case 'ERROR_RATE_LIMIT':
      // Show rate limit message
      break;
    case 'NETWORK_ERROR':
      // Show network error
      break;
    default:
      // Show generic error
      break;
  }
}
```

### With Async/Await in Component

```typescript
'use client';

import { useState } from 'react';
import { mailApi } from '@/lib/api';
import { apiClient } from '@/lib/api';

function MailboxList() {
  const [mailboxes, setMailboxes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  
  const loadMailboxes = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await mailApi.listMailboxes();
      setMailboxes(result.mailboxes || []);
    } catch (err) {
      setError(err as ApiError);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <button onClick={loadMailboxes} disabled={loading}>
        {loading ? 'Loading...' : 'Refresh'}
      </button>
      
      {error && (
        <div className="error">
          Error: {error.message} (Code: {error.code}) - Status: {error.status}
        </div>
      )}
      
      <ul>
        {mailboxes.map((mailbox) => (
          <li key={mailbox.id}>
            {mailbox.name} ({mailbox.unread_count})
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

## Best Practices

### 1. Always Handle Errors

```typescript
// ✅ Good
try {
  const data = await apiCall();
} catch (error) {
  // Handle error
}

// ❌ Bad
const data = await apiCall(); // No error handling
```

### 2. Use TypeScript Types

```typescript
// ✅ Good - Type-safe
const mailboxes: Mailbox[] = await mailApi.listMailboxes();

// ❌ Bad - No type safety
const mailboxes = await mailApi.listMailboxes();
```

### 3. Use Hooks for Automated State Management

```typescript
// ✅ Good
const { user, isAuthenticated, login, logout } = useApi();

// ❌ Bad - Manual state management
const [user, setUser] = useState(null);
const [isAuthenticated, setIsAuthenticated] = useState(false);
// ... manual token management, etc.
```

### 4. Check Authentication State Before API Calls

```typescript
const { isAuthenticated, ensureValidToken } = useApi();

const loadData = async () => {
  if (!isAuthenticated) {
    // Redirect to login or show message
    return;
  }
  
  // Ensure token is valid
  const hasValidToken = await ensureValidToken();
  if (!hasValidToken) {
    // Token expired or invalid
    return;
  }
  
  // Make API call
  const data = await apiCall();
};
```

### 5. Use Interceptors for Cross-Cutting Concerns

```typescript
// Add interceptors in your app initialization
apiClient.addInterceptor({
  request: (options) => {
    // Add custom headers
    return {
      ...options,
      headers: {
        ...options.headers,
        'X-App-Version': '1.0.0',
      },
    };
  },
});

apiClient.addInterceptor({
  response: (response) => {
    // Log responses
    console.log('Response:', response.status);
    return response;
  },
});
```

### 6. Cancel Requests on Unmount

```typescript
'use client';

import { useEffect, useRef } from 'react';
import { apiClient } from '@/lib/api';

function DataComponent() {
  const abortControllerRef = useRef<AbortController | null>(null);
  
  useEffect(() => {
    const loadData = async () => {
      abortControllerRef.current = new AbortController();
      
      try {
        const data = await apiClient.get('/api/data', {
          signal: abortControllerRef.current.signal,
        });
        // Handle data
      } catch (error) {
        if (error.name === 'AbortError') {
          // Request was cancelled - ignore
        } else {
          // Handle other errors
        }
      }
    };
    
    loadData();
    
    return () => {
      // Cancel request on unmount
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);
  
  return <div>Loading...</div>;
}
```

---

## Migration Guide

If you're migrating from the old fakeApi stubs:

### Before

```typescript
// Old approach
const mailboxes = await fetch('/fakeApi/mailboxes', {
  method: 'GET',
  headers: { 'Content-Type': 'application/json' },
}).then((res) => res.json());
```

### After

```typescript
// New approach
import { mailApi } from '@/lib/api';
const { mailboxes } = await mailApi.listMailboxes();
```

---

## API Reference

For complete API reference, see:

- [TypeScript definitions](index.ts)
- [Auth API](endpoints/auth.ts)
- [Mail API](endpoints/mail.ts)
- [Calendar API](endpoints/calendar.ts)
- [Contact API](endpoints/contact.ts)
- [User API](endpoints/user.ts)
- [Admin API](endpoints/admin.ts)
- [System API](endpoints/system.ts)
- [Health API](endpoints/health.ts)
