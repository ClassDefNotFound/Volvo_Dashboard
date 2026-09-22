# OAuth Implementation Guide for Volvo Dashboard

## Recommended Architecture: Session-Based Authentication

### Why This Approach?
- ✅ Access tokens never exposed to client
- ✅ Protected against XSS attacks
- ✅ HTTP-only cookies prevent JavaScript access
- ✅ Server handles token refresh automatically
- ✅ Easy to invalidate sessions

## Implementation Overview

### 1. Server-Side Session Storage

**Install dependencies:**
```bash
npm install express-session connect-redis redis
npm install -D @types/express-session @types/connect-redis
```

Or use in-memory storage for development (not for production):
```bash
npm install express-session
```

### 2. OAuth Flow Implementation

#### A. Initiate OAuth Flow (server/server.ts)

```typescript
import session from 'express-session';
import RedisStore from 'connect-redis';
import { createClient } from 'redis';

// Configure session middleware
const redisClient = createClient(); // For production
redisClient.connect();

app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET!, // Add to .env
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
    httpOnly: true, // Prevents JavaScript access
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
  }
}));

// Extend session type
declare module 'express-session' {
  interface SessionData {
    accessToken?: string;
    refreshToken?: string;
    tokenExpiry?: number;
  }
}

// Route: Start OAuth flow
app.get('/auth/volvo/login', (req, res) => {
  const volvoAuthUrl = 'https://volvoid.eu.volvocars.com/as/authorization.oauth2';
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.CLIENT_ID!,
    redirect_uri: `${process.env.BASE_URL}:${port}/auth/volvo/callback`,
    scope: 'openid conve:brake_status conve:fuel_status conve:doors_status ' +
           'conve:diagnostics_workshop conve:engine_status conve:vehicle_relation ' +
           'conve:windows_status conve:tyres_status conve:warnings',
    state: crypto.randomBytes(16).toString('hex') // CSRF protection
  });

  // Store state in session for CSRF validation
  req.session.oauthState = params.get('state');

  res.redirect(`${volvoAuthUrl}?${params.toString()}`);
});
```

#### B. Handle OAuth Callback

```typescript
// Route: OAuth callback
app.get('/auth/volvo/callback', async (req, res) => {
  const { code, state } = req.query;

  // Validate CSRF state
  if (state !== req.session.oauthState) {
    return res.status(403).send('Invalid state parameter');
  }

  try {
    // Exchange authorization code for tokens
    const tokenResponse = await axios.post(
      'https://volvoid.eu.volvocars.com/as/token.oauth2',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: code as string,
        redirect_uri: `${process.env.BASE_URL}:${port}/auth/volvo/callback`,
        client_id: process.env.CLIENT_ID!,
        client_secret: process.env.CLIENT_SECRET! // Add to .env
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'vcc-api-key': process.env.VCC_API_KEY!
        }
      }
    );

    // Store tokens in session (server-side only)
    req.session.accessToken = tokenResponse.data.access_token;
    req.session.refreshToken = tokenResponse.data.refresh_token;
    req.session.tokenExpiry = Date.now() + (tokenResponse.data.expires_in * 1000);

    // Redirect to frontend
    res.redirect('/'); // or wherever your app is

  } catch (error) {
    console.error('OAuth error:', error);
    res.status(500).send('Authentication failed');
  }
});
```

#### C. Token Refresh Middleware

```typescript
// Middleware: Check and refresh token if needed
async function ensureValidToken(req: Request, res: Response, next: NextFunction) {
  if (!req.session.accessToken) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  // Check if token is expired or about to expire (within 5 minutes)
  if (req.session.tokenExpiry && req.session.tokenExpiry < Date.now() + 300000) {
    try {
      // Refresh the token
      const tokenResponse = await axios.post(
        'https://volvoid.eu.volvocars.com/as/token.oauth2',
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: req.session.refreshToken!,
          client_id: process.env.CLIENT_ID!,
          client_secret: process.env.CLIENT_SECRET!
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'vcc-api-key': process.env.VCC_API_KEY!
          }
        }
      );

      // Update session with new tokens
      req.session.accessToken = tokenResponse.data.access_token;
      req.session.refreshToken = tokenResponse.data.refresh_token;
      req.session.tokenExpiry = Date.now() + (tokenResponse.data.expires_in * 1000);

    } catch (error) {
      // Refresh failed - user needs to re-authenticate
      req.session.destroy((err) => {
        return res.status(401).json({ error: 'Session expired, please login again' });
      });
      return;
    }
  }

  next();
}
```

#### D. Protected API Routes

```typescript
// Apply middleware to all protected routes
app.use('/vehicles', ensureValidToken);
app.use('/windows', ensureValidToken);
// ... other protected routes

app.get('/vehicles', async (req, res) => {
  try {
    const vehicles = await axios.get<VehiclesResponse>(
      `${volvo_base_url}/vehicles`,
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${req.session.accessToken}`, // From session
          'vcc-api-key': process.env.VCC_API_KEY!
        }
      }
    );
    res.json(vehicles.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
});
```

#### E. Logout

```typescript
app.post('/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.clearCookie('connect.sid'); // Default session cookie name
    res.json({ message: 'Logged out successfully' });
  });
});
```

### 3. Client-Side Implementation

```typescript
// src/api/auth.ts
export async function loginWithVolvo() {
  // Redirect to server's OAuth initiation endpoint
  window.location.href = 'http://localhost:3000/auth/volvo/login';
}

export async function logout() {
  await axios.post('http://localhost:3000/auth/logout');
  window.location.href = '/login';
}

export async function checkAuthStatus() {
  try {
    // Try making an authenticated request
    await axios.get('http://localhost:3000/vehicles');
    return true;
  } catch (error) {
    return false;
  }
}
```

```typescript
// src/App.tsx
import { useState, useEffect } from 'react';
import { loginWithVolvo, logout, checkAuthStatus } from './api/auth';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus().then(setIsAuthenticated);
  }, []);

  if (!isAuthenticated) {
    return (
      <div>
        <h1>Volvo Dashboard</h1>
        <button onClick={loginWithVolvo}>Login with Volvo ID</button>
      </div>
    );
  }

  return (
    <div>
      <h1>Volvo Dashboard</h1>
      <button onClick={logout}>Logout</button>
      {/* Your app content */}
    </div>
  );
}
```

### 4. Environment Variables

Add to `server/.env`:
```bash
SESSION_SECRET="generate-a-random-string-here" # openssl rand -base64 32
CLIENT_SECRET="your_volvo_client_secret"
```

### 5. Security Checklist

- ✅ Tokens stored server-side only (session/database)
- ✅ HTTP-only cookies (no JavaScript access)
- ✅ Secure flag enabled in production (HTTPS)
- ✅ SameSite cookie attribute (CSRF protection)
- ✅ State parameter for OAuth (CSRF protection)
- ✅ Automatic token refresh
- ✅ Session expiry handling
- ✅ Proper error handling and user feedback

## Alternative: Database Storage (More Scalable)

For production, consider storing tokens in a database instead of sessions:

```typescript
// Database schema (example with Prisma)
model User {
  id           String   @id @default(uuid())
  volvoUserId  String   @unique
  accessToken  String   // Encrypt this!
  refreshToken String   // Encrypt this!
  tokenExpiry  DateTime
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

Use encryption for tokens in database:
```bash
npm install @node-rs/argon2 # or another encryption library
```

## Development vs Production

**Development:**
- Use in-memory session store (simple)
- HTTP cookies OK (localhost)
- Shorter token expiry for testing

**Production:**
- Redis/database for session store (scalable)
- HTTPS required for secure cookies
- Implement rate limiting
- Add logging and monitoring
- Consider token encryption at rest

## Common Pitfalls to Avoid

❌ **Don't do this:**
- Storing tokens in localStorage/sessionStorage
- Sending tokens to client in API responses
- Using regular (non-HTTP-only) cookies
- Skipping CSRF protection
- Not implementing token refresh

✅ **Do this:**
- Keep tokens server-side only
- Use HTTP-only, secure cookies for sessions
- Implement automatic token refresh
- Add proper error handling
- Log authentication events
