# SOGo6 UI API Client

This directory contains the TypeScript API client library for interacting with the SOGo6 backend server.

## Structure

```
lib/api/
├── index.ts              # Central export point
├── router.ts             # API routing (real vs fake)
├── client/
│   ├── base-client.ts    # Base HTTP client with fetch
│   ├── config.ts         # Configuration and environment
│   └── types.ts          # Shared type definitions
└── endpoints/
    ├── auth.ts           # Authentication endpoints
    ├── mail.ts           # Email endpoints
    ├── calendar.ts       # Calendar endpoints
    ├── contact.ts        # Contact endpoints
    ├── user.ts           # User profile endpoints
    ├── admin.ts          # Admin endpoints
    ├── system.ts         # System information endpoints
    └── health.ts         # Health check endpoints
```

## Installation

The API client is automatically included in the project. No additional installation needed.

## Usage

### Basic Usage

```typescript
import { apiClient } from '@/lib/api';

// GET request
const users = await apiClient.get<{ users: any[] }>('/api/user/v1/users');

// POST request
const response = await apiClient.post('/api/user/v1/auth/login', { username, password });

// PUT request
const updated = await apiClient.put('/api/user/v1/user/profile', { display_name: 'John Doe' });

// DELETE request
const deleted = await apiClient.delete('/api/user/v1/mail/messages/123');
```

### Using Specific API Modules

```typescript
import { authApi } from '@/lib/api';

// Login
const loginResponse = await authApi.login({ login: 'user@example.com', password: 'secret' });

import { mailApi } from '@/lib/api';

// Get mailboxes
const mailboxes = await mailApi.listMailboxes();

// Get messages
const messages = await mailApi.listMessages(mailboxId);

import { calendarApi } from '@/lib/api';

// Get calendars
const calendars = await calendarApi.listCalendars();

// Get events
const events = await calendarApi.listEvents(calendarId, { start: '2024-01-01', end: '2024-01-31' });

import { contactApi } from '@/lib/api';

// Get contacts
const contacts = await contactApi.listAllContacts();
```

### Error Handling

```typescript
import { apiClient, type ApiError } from '@/lib/api';

try {
  const data = await apiClient.get('/api/user/v1/mail/messages/123');
  // Handle success
} catch (error) {
  if (error instanceof Error) {
    const apiError = error as ApiError;
    console.log('Error:', apiError.message);
    console.log('Code:', apiError.code);
    console.log('Status:', apiError.status);
    
    // Handle specific error codes
    if (apiError.code === 'ERROR_AUTH_REQUIRED') {
      // Redirect to login
    }
  }
}
```

### Interceptors

```typescript
import { apiClient } from '@/lib/api';

// Add request interceptor
apiClient.addInterceptor({
  request: (options) => {
    // Add custom headers, etc.
    options.headers = {
      ...options.headers,
      'X-Custom-Header': 'value',
    };
    return options;
  },
});

// Add response interceptor
apiClient.addInterceptor({
  response: (response) => {
    // Modify response before returning
    return response;
  },
});

// Add error interceptor
apiClient.addInterceptor({
  error: (error) => {
    // Process error before throwing
    if (error.code === 'ERROR_TOKEN_EXPIRED') {
      // Refresh token automatically
    }
    return error;
  },
});
```

## Configuration

### Environment Variables

Create a `.env.local` file in the UI directory:

```env
# API Server URL (default: /api/v1 - uses proxy)
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1

# Enable fake API for development (default: true in development)
NEXT_PUBLIC_ENABLE_FAKE_API=true
```

### Manual Configuration

```typescript
import { setConfig } from '@/lib/api';

// Set configuration at runtime
setConfig({
  baseUrl: 'https://api.example.com/api/v1',
  timeout: 60000, // 60 seconds
  enableFakeApi: false,
  debug: true,
});
```

## Real API vs Fake API

The API client can switch between using the real backend and fake API:

### Production Mode
- Always uses the real backend
- `NEXT_PUBLIC_ENABLE_FAKE_API` is ignored
- Suitable for production deployments

### Development Mode
- Uses fake API by default (`NEXT_PUBLIC_ENABLE_FAKE_API=true`)
- Can be forced to use real backend by setting `NEXT_PUBLIC_ENABLE_FAKE_API=false`
- Suitable for frontend development without running the backend

### Runtime Switching

```typescript
import { forceRealApi, forceFakeApi, toggleApi, isUsingFakeApi } from '@/lib/api/router';

// Force real API
forceRealApi();

// Force fake API
forceFakeApi();

// Toggle between them
toggleApi();

// Check which is being used
const usingFake = isUsingFakeApi();
```

## Fake API

The fake API is a mock implementation for development:
- Located at `src/app/fakeApi/`
- Provides realistic mock data
- No backend server required
- Perfect for UI development and testing

## Type Safe Responses

All responses are properly typed:

```typescript
import { mailApi } from '@/lib/api';

// Compile-time type checking
const mailboxes: import('@/lib/api').Mailbox[] = await mailApi.listMailboxes();

// The return type is automatically inferred
const messages = await mailApi.listMessages('inbox');
// messages: { messages: MailMessageSummary[]; pagination: { page: number; per_page: number; total: number; total_pages: number } }
```

## Authentication

JWT tokens are automatically handled:

```typescript
import { apiClient } from '@/lib/api';

// Set token globally
apiClient.request('/api/user/v1/mail/mailboxes');
// Authorization header is automatically added if jwtToken is in state

// Or set in request options
apiClient.get('/api/user/v1/mail/messages', {
  headers: {
    Authorization: `Bearer ${jwtToken}`,
  },
});
```

## Best Practices

1. **Use specific API modules** for better organization and autocompletion
2. **Always handle errors** with try/catch
3. **Use TypeScript types** for compile-time safety
4. **Enable debug mode** in development for better error messages
5. **Test both real and fake API** to ensure compatibility

## Examples

### Fetching user data with loading state

```typescript
import { userApi } from '@/lib/api';
import { useState, useEffect } from 'react';

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

