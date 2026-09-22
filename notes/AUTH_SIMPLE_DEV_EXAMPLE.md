# Simple OAuth Implementation (Development - No Redis)

> **Reference Only**: This document shows a simplified OAuth implementation using in-memory sessions for development. No code changes have been made to your project.

## Overview

This example uses:
- ✅ **In-memory sessions** (no Redis needed)
- ✅ **HTTP-only cookies** for session IDs
- ✅ **Server-side token storage**
- ✅ **Automatic token refresh**
- ✅ **Simple to set up**

⚠️ **Note**: In-memory sessions are lost when server restarts. Use Redis for production.

---

## Installation

```bash
cd server
npm install express-session
npm install -D @types/express-session
```

---

## Server Implementation

### 1. Setup Session Middleware

```typescript
// server/server.ts
import express from "express";
import cors from "cors";
import session from "express-session";
import axios from "axios";
import crypto from "crypto";
import "dotenv/config";

const app = express();
const port = 3000;
const volvo_base_url = "https://api.volvocars.com/connected-vehicle/v2";

// Environment variables
const vcc_api_key = process.env.VCC_API_KEY;
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET; // Add to .env
const session_secret = process.env.SESSION_SECRET || "dev-secret-change-in-production";

// CORS configuration - allow credentials
app.use(cors({
  origin: 'http://localhost:5173', // Your Vite dev server
  credentials: true // Important: allows cookies to be sent
}));

// Parse JSON bodies
app.use(express.json());

// Session middleware (in-memory store)
app.use(session({
  secret: session_secret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true, // Prevents JavaScript access
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
  }
}));

// Extend session type to include our custom properties
declare module 'express-session' {
  interface SessionData {
    accessToken?: string;
    refreshToken?: string;
    tokenExpiry?: number;
    oauthState?: string;
    volvoUserId?: string;
  }
}
```

---

### 2. OAuth Flow Routes

```typescript
// Route: Initiate OAuth login
app.get('/auth/login', (req, res) => {
  const state = crypto.randomBytes(16).toString('hex');
  req.session.oauthState = state;

  const authUrl = 'https://volvoid.eu.volvocars.com/as/authorization.oauth2';
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: client_id!,
    redirect_uri: `http://localhost:${port}/auth/callback`,
    scope: [
      'openid',
      'conve:vehicle_relation',
      'conve:brake_status',
      'conve:fuel_status',
      'conve:doors_status',
      'conve:engine_status',
      'conve:diagnostics_workshop',
      'conve:diagnostics_engine_status',
      'conve:windows_status',
      'conve:tyres_status',
      'conve:odometer_status',
      'conve:warnings',
      'conve:trip_statistics',
      'conve:environment',
      'conve:lock_status',
      'conve:connectivity_status'
    ].join(' '),
    state: state
  });

  console.log('Redirecting to Volvo OAuth...');
  res.redirect(`${authUrl}?${params.toString()}`);
});

// Route: OAuth callback
app.get('/auth/callback', async (req, res) => {
  const { code, state } = req.query;

  // Validate state (CSRF protection)
  if (state !== req.session.oauthState) {
    console.error('Invalid state parameter');
    return res.redirect('http://localhost:5173/login?error=invalid_state');
  }

  if (!code) {
    console.error('No authorization code received');
    return res.redirect('http://localhost:5173/login?error=no_code');
  }

  try {
    console.log('Exchanging authorization code for tokens...');

    // Exchange authorization code for access token
    const tokenResponse = await axios.post(
      'https://volvoid.eu.volvocars.com/as/token.oauth2',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: code as string,
        redirect_uri: `http://localhost:${port}/auth/callback`,
        client_id: client_id!,
        client_secret: client_secret!
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'vcc-api-key': vcc_api_key!
        }
      }
    );

    // Store tokens in session (server-side, in-memory)
    req.session.accessToken = tokenResponse.data.access_token;
    req.session.refreshToken = tokenResponse.data.refresh_token;
    req.session.tokenExpiry = Date.now() + (tokenResponse.data.expires_in * 1000);

    // Optional: store user info
    if (tokenResponse.data.id_token) {
      // Decode JWT to get user ID (simplified - should verify signature)
      const payload = JSON.parse(
        Buffer.from(tokenResponse.data.id_token.split('.')[1], 'base64').toString()
      );
      req.session.volvoUserId = payload.sub;
    }

    console.log('Authentication successful!');
    console.log('Session created with ID:', req.sessionID);

    // Redirect to frontend app
    res.redirect('http://localhost:5173/');

  } catch (error: any) {
    console.error('OAuth error:', error.response?.data || error.message);
    res.redirect('http://localhost:5173/login?error=auth_failed');
  }
});

// Route: Check authentication status
app.get('/auth/status', (req, res) => {
  if (req.session.accessToken) {
    res.json({
      authenticated: true,
      userId: req.session.volvoUserId,
      expiresAt: req.session.tokenExpiry
    });
  } else {
    res.json({ authenticated: false });
  }
});

// Route: Logout
app.post('/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out successfully' });
  });
});
```

---

### 3. Token Refresh Middleware

```typescript
// Middleware: Ensure valid token (refresh if needed)
async function ensureAuthenticated(req: any, res: any, next: any) {
  // Check if user has a session with access token
  if (!req.session.accessToken) {
    return res.status(401).json({
      error: 'Not authenticated',
      message: 'Please log in first'
    });
  }

  // Check if token is expired or expiring soon (within 5 minutes)
  const fiveMinutes = 5 * 60 * 1000;
  if (req.session.tokenExpiry && req.session.tokenExpiry < Date.now() + fiveMinutes) {
    console.log('Token expired or expiring soon, refreshing...');

    try {
      // Refresh the token
      const refreshResponse = await axios.post(
        'https://volvoid.eu.volvocars.com/as/token.oauth2',
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: req.session.refreshToken!,
          client_id: client_id!,
          client_secret: client_secret!
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'vcc-api-key': vcc_api_key!
          }
        }
      );

      // Update session with new tokens
      req.session.accessToken = refreshResponse.data.access_token;
      req.session.refreshToken = refreshResponse.data.refresh_token;
      req.session.tokenExpiry = Date.now() + (refreshResponse.data.expires_in * 1000);

      console.log('Token refreshed successfully');

    } catch (error: any) {
      console.error('Token refresh failed:', error.response?.data || error.message);

      // Refresh token is invalid - user needs to re-authenticate
      req.session.destroy((err: any) => {
        return res.status(401).json({
          error: 'Session expired',
          message: 'Please log in again'
        });
      });
      return;
    }
  }

  // Token is valid, continue to route handler
  next();
}
```

---

### 4. Protected API Routes

```typescript
// Apply authentication middleware to protected routes
app.use('/vehicles', ensureAuthenticated);
app.use('/windows', ensureAuthenticated);
// Add other protected routes...

// Example protected route
app.get('/vehicles', async (req, res) => {
  try {
    const vehicles = await axios.get(
      `${volvo_base_url}/vehicles`,
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${req.session.accessToken}`,
          'vcc-api-key': vcc_api_key!
        }
      }
    );

    res.json(vehicles.data);
  } catch (error: any) {
    console.error('Volvo API error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch vehicles'
    });
  }
});

app.get('/vehicles/:vin', ensureAuthenticated, async (req, res) => {
  const { vin } = req.params;

  try {
    const details = await axios.get(
      `${volvo_base_url}/vehicles/${vin}`,
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${req.session.accessToken}`,
          'vcc-api-key': vcc_api_key!
        }
      }
    );

    res.json(details.data);
  } catch (error: any) {
    console.error('Volvo API error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch vehicle details'
    });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  console.log(`Login URL: http://localhost:${port}/auth/login`);
});
```

---

## Client Implementation

### 1. API Functions

```typescript
// src/api/auth.ts
import axios from 'axios';

const API_BASE = 'http://localhost:3000';

// Configure axios to send cookies with requests
axios.defaults.withCredentials = true;

export interface AuthStatus {
  authenticated: boolean;
  userId?: string;
  expiresAt?: number;
}

/**
 * Redirect user to Volvo OAuth login
 */
export function loginWithVolvo() {
  window.location.href = `${API_BASE}/auth/login`;
}

/**
 * Check if user is authenticated
 */
export async function checkAuthStatus(): Promise<AuthStatus> {
  try {
    const response = await axios.get<AuthStatus>(`${API_BASE}/auth/status`);
    return response.data;
  } catch (error) {
    return { authenticated: false };
  }
}

/**
 * Log out the current user
 */
export async function logout(): Promise<void> {
  try {
    await axios.post(`${API_BASE}/auth/logout`);
  } catch (error) {
    console.error('Logout failed:', error);
  }
}
```

---

### 2. Updated Volvo API Client

```typescript
// src/api/volvo_api.ts
import axios from "axios";
import type { VehiclesResponse, VehicleDetailsResponse } from "@shared/types";

const base_url = "http://localhost:3000";

// Important: Enable sending cookies with requests
axios.defaults.withCredentials = true;

export async function getVehicles(): Promise<VehiclesResponse> {
  const vehicles = await axios.get<VehiclesResponse>(`${base_url}/vehicles`);
  return vehicles.data;
}

export async function getVehicleDetails(vin: string): Promise<VehicleDetailsResponse> {
  const vehicleDetails = await axios.get<VehicleDetailsResponse>(
    `${base_url}/vehicles/${vin}`
  );
  return vehicleDetails.data;
}
```

---

### 3. App Component with Authentication

```typescript
// src/App.tsx
import { useEffect, useState } from "react";
import { getVehicles, getVehicleDetails } from "./api/volvo_api";
import { loginWithVolvo, logout, checkAuthStatus, type AuthStatus } from "./api/auth";
import type { VehiclesResponse, VehicleDetailsResponse } from "@shared/types";

function App() {
  const [authStatus, setAuthStatus] = useState<AuthStatus>({ authenticated: false });
  const [loading, setLoading] = useState(true);
  const [vins, setVins] = useState<string[]>([]);
  const [vehicleDetails, setVehicleDetails] = useState<VehicleDetailsResponse | null>(null);

  // Check authentication on mount
  useEffect(() => {
    checkAuthStatus().then((status) => {
      setAuthStatus(status);
      setLoading(false);
    });
  }, []);

  // Fetch vehicles when authenticated
  useEffect(() => {
    if (authStatus.authenticated) {
      getVehicles()
        .then((data) => {
          console.log('Vehicles:', data);
          setVins(data.data);
        })
        .catch((error) => {
          console.error('Failed to fetch vehicles:', error);
          // If unauthorized, auth status might be stale
          if (error.response?.status === 401) {
            setAuthStatus({ authenticated: false });
          }
        });
    }
  }, [authStatus.authenticated]);

  // Handle logout
  const handleLogout = async () => {
    await logout();
    setAuthStatus({ authenticated: false });
    setVins([]);
    setVehicleDetails(null);
  };

  // Fetch details for first vehicle
  const handleGetDetails = async () => {
    if (vins.length === 0) return;

    try {
      const details = await getVehicleDetails(vins[0]);
      console.log('Vehicle details:', details);
      setVehicleDetails(details);
    } catch (error) {
      console.error('Failed to fetch vehicle details:', error);
    }
  };

  // Loading state
  if (loading) {
    return <div>Loading...</div>;
  }

  // Not authenticated - show login
  if (!authStatus.authenticated) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>Volvo Dashboard</h1>
        <p>Please log in with your Volvo ID to continue</p>
        <button onClick={loginWithVolvo}>
          Login with Volvo ID
        </button>
      </div>
    );
  }

  // Authenticated - show dashboard
  return (
    <div style={{ padding: '20px' }}>
      <h1>Volvo Dashboard</h1>

      <div style={{ marginBottom: '20px' }}>
        <p>User ID: {authStatus.userId}</p>
        <p>Session expires: {authStatus.expiresAt ? new Date(authStatus.expiresAt).toLocaleString() : 'N/A'}</p>
        <button onClick={handleLogout}>Logout</button>
      </div>

      <div>
        <h2>Your Vehicles</h2>
        {vins.length === 0 ? (
          <p>No vehicles found</p>
        ) : (
          <ul>
            {vins.map((vin) => (
              <li key={vin}>{vin}</li>
            ))}
          </ul>
        )}
      </div>

      {vins.length > 0 && (
        <div>
          <button onClick={handleGetDetails}>
            Get Details for First Vehicle
          </button>

          {vehicleDetails && (
            <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
              <h3>Vehicle Details</h3>
              <p><strong>VIN:</strong> {vehicleDetails.vin}</p>
              <p><strong>Model:</strong> {vehicleDetails.descriptions.model}</p>
              <p><strong>Year:</strong> {vehicleDetails.modelYear}</p>
              <p><strong>Fuel Type:</strong> {vehicleDetails.fuelType}</p>
              <p><strong>Color:</strong> {vehicleDetails.externalColour}</p>
              {vehicleDetails.images?.exteriorImageUrl && (
                <img
                  src={vehicleDetails.images.exteriorImageUrl}
                  alt="Vehicle exterior"
                  style={{ maxWidth: '400px' }}
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
```

---

## Environment Variables

Add to `server/.env`:

```bash
PORT=3000
BASE_URL="http://localhost"

# Volvo API Credentials
CLIENT_ID="your_client_id"
CLIENT_SECRET="your_client_secret"  # ⚠️ Add this!
VCC_API_KEY="your_vcc_api_key"

# Session secret (generate with: openssl rand -base64 32)
SESSION_SECRET="dev-secret-change-in-production"
```

---

## How It Works

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. User clicks "Login with Volvo ID"                            │
│    → Browser redirects to /auth/login                           │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│ 2. Server generates state, stores in session                    │
│    → Redirects to Volvo OAuth authorization page                │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│ 3. User logs in with Volvo ID credentials                       │
│    → Volvo redirects back to /auth/callback?code=XXX&state=YYY  │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│ 4. Server validates state (CSRF protection)                     │
│    → Exchanges authorization code for access_token              │
│    → Stores tokens in session (in-memory)                       │
│    → Session ID sent to browser as HTTP-only cookie             │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│ 5. Browser redirected to http://localhost:5173/                 │
│    → Has session cookie (contains only session ID)              │
│    → Token stored server-side only (secure!)                    │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│ 6. User makes API request to /vehicles                          │
│    → Browser sends session cookie automatically                 │
│    → Server looks up session, finds access_token                │
│    → Server uses token to call Volvo API                        │
│    → Returns data to client                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Session Data Structure

What's actually stored in memory:

```javascript
// In-memory session store (simplified)
sessions = {
  'sess:f81d4fae-7dec-11d0-a765-00a0c91e6bf6': {
    cookie: {
      maxAge: 604800000,
      httpOnly: true,
      // ... other cookie settings
    },
    accessToken: 'eyJhbGciOiJSUzI1NiIs...',
    refreshToken: 'refresh_token_here',
    tokenExpiry: 1771064756000,
    volvoUserId: 'e3f53bdb-bf50-4e0a-be97-db936c10a3b4'
  }
}
```

What's sent to browser:

```
Cookie: connect.sid=s%3Af81d4fae-7dec-11d0-a765-00a0c91e6bf6.signature
        ^^^^^^^^^^^^ Only the session ID, not the tokens!
```

---

## Testing the Flow

### 1. Start the server
```bash
cd server
npm run dev  # or tsx server.ts
```

### 2. Start the client
```bash
npm run dev
```

### 3. Test login flow

1. Visit `http://localhost:5173`
2. Click "Login with Volvo ID"
3. You'll be redirected to Volvo's login page
4. After login, redirected back to your app
5. You should see your vehicles

### 4. Test session persistence

- Make API calls → Should work ✓
- Refresh page → Still logged in ✓
- Restart server → Logged out (sessions lost) ⚠️

---

## Security Features

✅ **Tokens never sent to client** - Stored in server-side session only
✅ **HTTP-only cookies** - JavaScript cannot access session cookie
✅ **CSRF protection** - State parameter validates OAuth callback
✅ **Automatic token refresh** - Transparent to the user
✅ **Secure flag** - Can enable for HTTPS in production
✅ **SameSite cookie** - Protection against CSRF attacks

---

## Limitations (In-Memory Sessions)

⚠️ **Development Only**:
- Sessions lost on server restart
- Can't scale to multiple server instances
- Limited by server RAM
- Not suitable for production

For production, upgrade to Redis or database storage (see AUTH_IMPLEMENTATION_GUIDE.md).

---

## Debug Tips

### Check if session is created:
```typescript
app.get('/debug/session', (req, res) => {
  res.json({
    sessionID: req.sessionID,
    session: req.session,
    cookies: req.headers.cookie
  });
});
```

### Enable session debugging:
```typescript
app.use(session({
  // ... other options
  name: 'volvo.sid', // Custom cookie name
  cookie: {
    // ... cookie options
  },
  // Log session events
  store: {
    get: (sid, cb) => {
      console.log('Session retrieved:', sid);
      // ... default behavior
    }
  }
}));
```

### Common issues:

**"Not authenticated" error:**
- Check `axios.defaults.withCredentials = true` in client
- Check CORS `credentials: true` on server
- Verify cookie is being sent (DevTools → Network → Headers)

**OAuth callback fails:**
- Check CLIENT_SECRET is in .env
- Verify redirect_uri matches exactly in Volvo dashboard
- Check state parameter validation

**Session not persisting:**
- Ensure `saveUninitialized: false` and `resave: false`
- Check cookie settings (secure flag should be false for localhost)

---

## Next Steps

1. ✅ Try this simple version first
2. ✅ Test the OAuth flow
3. ✅ Once working, consider adding Redis for production
4. ✅ Add error handling and user feedback
5. ✅ Implement proper loading states
6. ✅ Add token expiry warnings to user

---

Ready to implement when you are! This gives you full OAuth authentication without the complexity of Redis for development. 🚀
