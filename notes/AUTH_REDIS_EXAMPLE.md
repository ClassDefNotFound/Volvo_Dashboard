# Production OAuth Implementation with Redis

> **Reference Only**: This document shows a production-ready OAuth implementation using Redis for session storage. No code changes have been made to your project.

## Overview

This example uses:
- ✅ **Redis session store** (production-ready)
- ✅ **Session persistence** across server restarts
- ✅ **HTTP-only cookies** for session IDs
- ✅ **Server-side token storage**
- ✅ **Automatic token refresh**
- ✅ **Scalable** to multiple server instances
- ✅ **Automatic TTL** (Time To Live) cleanup

💡 **Note**: Redis provides persistent, scalable session storage suitable for production deployments.

---

## Prerequisites

### Option 1: Local Redis Installation

**macOS (Homebrew):**
```bash
brew install redis
brew services start redis
```

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install redis-server
sudo systemctl start redis-server
```

**Windows:**
- Download from https://github.com/microsoftarchive/redis/releases
- Or use Docker (recommended)

### Option 2: Docker Redis

```bash
docker run -d --name redis -p 6379:6379 redis:alpine
```

### Option 3: Cloud Redis

- **AWS ElastiCache** - Managed Redis for AWS
- **Redis Cloud** - Free tier available at redis.com
- **Azure Cache for Redis** - Azure managed service
- **Google Cloud Memorystore** - GCP managed Redis

---

## Installation

```bash
cd server
npm install express-session connect-redis redis
npm install -D @types/express-session @types/connect-redis
```

**Package details:**
- `express-session` - Session middleware for Express
- `connect-redis` - Redis store adapter for express-session
- `redis` - Official Node.js Redis client (node-redis)

---

## Redis Setup

### 1. Create Redis Client Configuration

```typescript
// server/redis.ts
import { createClient } from "redis";

// Create Redis client
const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

// Handle connection events
redisClient.on("error", (err) => console.error("Redis Client Error", err));
redisClient.on("connect", () => console.log("Redis Client Connected"));

// Connect to Redis
await redisClient.connect();

export default redisClient;
```

---

## Server Implementation

### 1. Setup Session Middleware with Redis

```typescript
// server/server.ts
import express from "express";
import cors from "cors";
import session from "express-session";
import RedisStore from "connect-redis";
import axios from "axios";
import crypto from "crypto";
import "dotenv/config";
import redisClient from "./redis";

const app = express();
const port = 3000;
const volvo_base_url = "https://api.volvocars.com/connected-vehicle/v2";

// Environment variables
const vcc_api_key = process.env.VCC_API_KEY;
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const session_secret = process.env.SESSION_SECRET || "dev-secret-change-in-production";

// CORS configuration - allow credentials
app.use(cors({
  origin: 'http://localhost:5173', // Your Vite dev server
  credentials: true // Important: allows cookies to be sent
}));

// Parse JSON bodies
app.use(express.json());

// Initialize Redis store
const redisStore = new RedisStore({
  client: redisClient,
  prefix: 'volvo:sess:', // Namespace for session keys
  ttl: 86400 * 7, // 7 days in seconds (auto-cleanup)
  disableTouch: false, // Update expiry on each request
  disableTTL: false, // Enable automatic expiration
});

// Session middleware (Redis store)
app.use(session({
  store: redisStore,
  secret: session_secret,
  resave: false, // Don't save session if unmodified
  saveUninitialized: false, // Don't create session until something is stored
  rolling: true, // Reset expiry on each request
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true, // Prevents JavaScript access
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
  },
  name: 'volvo.sid', // Custom cookie name
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

// Health check endpoint (including Redis)
app.get('/health', async (req, res) => {
  try {
    await redisClient.ping();
    res.json({
      status: 'healthy',
      redis: 'connected',
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      redis: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
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

    // Store tokens in session (server-side, in Redis)
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
    console.log('Session stored in Redis at key:', `volvo:sess:${req.sessionID}`);

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
  const sessionId = req.sessionID;

  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }

    console.log('Session destroyed:', sessionId);
    res.clearCookie('volvo.sid');
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

### Client code is identical to in-memory version

The client implementation is **exactly the same** as the in-memory version because the session storage mechanism is transparent to the client.

See **AUTH_SIMPLE_DEV_EXAMPLE.md** for complete client implementation, or reference **AUTH_COMPARISON.md** for details.

Key points:
- ✅ Same API endpoints
- ✅ Same authentication flow
- ✅ Same cookie handling
- ✅ No client changes needed when switching from in-memory to Redis

---

## Redis Data Structure

### What's Actually Stored in Redis

When a user logs in, Redis stores the session data with the following structure:

**Redis Key:**
```
volvo:sess:f81d4fae-7dec-11d0-a765-00a0c91e6bf6
```

**Redis Value (JSON string):**
```json
{
  "cookie": {
    "originalMaxAge": 604800000,
    "expires": "2026-02-26T12:30:00.000Z",
    "secure": false,
    "httpOnly": true,
    "sameSite": "lax"
  },
  "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh_token_value_here",
  "tokenExpiry": 1771064756000,
  "volvoUserId": "e3f53bdb-bf50-4e0a-be97-db936c10a3b4"
}
```

**TTL (Time To Live):**
```
604800 seconds (7 days)
```

After 7 days of inactivity, Redis automatically deletes the session (no manual cleanup needed).

---

## Redis CLI Commands

### Useful commands for debugging and monitoring:

```bash
# Connect to Redis CLI
redis-cli

# Or with password
redis-cli -a your_password

# List all session keys
KEYS volvo:sess:*

# Get session data
GET volvo:sess:f81d4fae-7dec-11d0-a765-00a0c91e6bf6

# Check TTL (time to live) for a session
TTL volvo:sess:f81d4fae-7dec-11d0-a765-00a0c91e6bf6

# Count total sessions
DBSIZE

# Delete a specific session (logout user)
DEL volvo:sess:f81d4fae-7dec-11d0-a765-00a0c91e6bf6

# Delete all sessions (logout all users)
FLUSHDB

# Monitor real-time Redis commands
MONITOR

# Get Redis info
INFO
INFO stats
INFO memory

# Check Redis memory usage
MEMORY USAGE volvo:sess:f81d4fae-7dec-11d0-a765-00a0c91e6bf6
```

### Example Debugging Session

```bash
$ redis-cli

127.0.0.1:6379> KEYS volvo:sess:*
1) "volvo:sess:f81d4fae-7dec-11d0-a765-00a0c91e6bf6"
2) "volvo:sess:a9c2f1b3-8e4d-4a2b-9f1c-3d5e7f9a1b2c"

127.0.0.1:6379> GET volvo:sess:f81d4fae-7dec-11d0-a765-00a0c91e6bf6
"{\"cookie\":{\"originalMaxAge\":604800000,\"expires\":\"2026-02-26T12:30:00.000Z\",\"secure\":false,\"httpOnly\":true,\"sameSite\":\"lax\"},\"accessToken\":\"eyJhbGci...\",\"volvoUserId\":\"e3f53bdb-bf50-4e0a-be97-db936c10a3b4\"}"

127.0.0.1:6379> TTL volvo:sess:f81d4fae-7dec-11d0-a765-00a0c91e6bf6
(integer) 589234

127.0.0.1:6379> DBSIZE
(integer) 2
```

---

## Environment Variables

Add to `server/.env`:

```bash
PORT=3000
BASE_URL="http://localhost"

# Volvo API Credentials
CLIENT_ID="your_client_id"
CLIENT_SECRET="your_client_secret"
VCC_API_KEY="your_vcc_api_key"

# Session secret (generate with: openssl rand -base64 32)
SESSION_SECRET="generate-a-random-secret-here"

# Redis Configuration
REDIS_URL="redis://localhost:6379"  # Full Redis URL (supports password: redis://:password@host:port)

# Production settings
NODE_ENV="development"  # Set to "production" for HTTPS cookies
```

---

## Docker Compose Setup

For local development with Docker:

```yaml
# docker-compose.yml
version: '3.8'

services:
  redis:
    image: redis:7-alpine
    container_name: volvo-redis
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    command: redis-server --appendonly yes
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

  # Optional: Redis Commander (Web UI)
  redis-commander:
    image: rediscommander/redis-commander:latest
    container_name: volvo-redis-commander
    environment:
      - REDIS_HOSTS=local:redis:6379
    ports:
      - "8081:8081"
    depends_on:
      - redis

volumes:
  redis-data:
```

**Usage:**
```bash
# Start Redis
docker-compose up -d

# View logs
docker-compose logs -f redis

# Access Redis Commander at http://localhost:8081

# Stop Redis
docker-compose down

# Stop and remove data
docker-compose down -v
```

---

## Production Considerations

### 1. Redis Clustering

For high availability and scalability:

```typescript
// server/redis.ts (clustered)
import { createCluster } from "redis";

const redisCluster = createCluster({
  rootNodes: [
    { url: "redis://redis-node-1:6379" },
    { url: "redis://redis-node-2:6379" },
    { url: "redis://redis-node-3:6379" },
  ],
  defaults: {
    password: process.env.REDIS_PASSWORD,
  },
});

await redisCluster.connect();
export default redisCluster;
```

### 2. Redis Persistence

Redis offers two persistence options:

**RDB (Redis Database Backup):**
- Point-in-time snapshots
- Better for disaster recovery
- Faster restarts

**AOF (Append Only File):**
- Logs every write operation
- More durable (can lose max 1 second of data)
- Larger file size

**Recommended for production:**
```bash
# In redis.conf or Docker command
redis-server --appendonly yes --appendfsync everysec
```

### 3. Redis Security

```bash
# Set a strong password
redis-cli CONFIG SET requirepass "strong-password-here"

# Disable dangerous commands
redis-cli CONFIG SET rename-command FLUSHDB ""
redis-cli CONFIG SET rename-command FLUSHALL ""
redis-cli CONFIG SET rename-command KEYS ""
```

In production Redis config:
```conf
# redis.conf
requirepass your-strong-password
rename-command FLUSHDB ""
rename-command FLUSHALL ""
rename-command CONFIG ""
bind 127.0.0.1  # Only allow local connections
protected-mode yes
```

### 4. Monitoring and Alerts

**Key metrics to monitor:**
- Connection count
- Memory usage
- Cache hit rate
- Slow commands
- Evicted keys
- Expired keys

**Tools:**
- Redis built-in `INFO` command
- Redis Commander (Web UI)
- Prometheus + Grafana
- AWS CloudWatch (for ElastiCache)
- Datadog, New Relic

**Example monitoring setup:**
```typescript
// server/monitoring.ts
import { redisClient } from './redis';

setInterval(async () => {
  const info = await redisClient.info('stats');
  const memory = await redisClient.info('memory');

  console.log('Redis Stats:', {
    connected_clients: parseInfo(info, 'connected_clients'),
    used_memory_human: parseInfo(memory, 'used_memory_human'),
    keyspace_hits: parseInfo(info, 'keyspace_hits'),
    keyspace_misses: parseInfo(info, 'keyspace_misses')
  });
}, 60000); // Every minute

function parseInfo(info: string, key: string): string {
  const match = info.match(new RegExp(`${key}:(.*)`));
  return match ? match[1].trim() : 'N/A';
}
```

### 5. Connection Pooling

node-redis uses a single connection by default, which is sufficient for most use cases. You can create a connection pool for high-throughput scenarios:

```typescript
import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 50, 2000),
    connectTimeout: 10000,
  },
});
```

### 6. Backup Strategy

**Automated backups:**
```bash
# Cron job to backup Redis daily
0 2 * * * redis-cli --rdb /backup/redis-$(date +\%Y\%m\%d).rdb
```

**Manual backup:**
```bash
redis-cli BGSAVE
```

---

## Testing

### 1. Start Redis and Server

```bash
# Start Redis (choose one)
redis-server  # Local installation
docker-compose up -d  # Docker

# Start the server
cd server
npm run dev
```

### 2. Verify Redis Connection

```bash
# Check server health endpoint
curl http://localhost:3000/health

# Expected response:
{
  "status": "healthy",
  "redis": "connected",
  "uptime": 123.456
}
```

### 3. Test Login Flow

1. Visit `http://localhost:5173`
2. Click "Login with Volvo ID"
3. Complete Volvo authentication
4. Check Redis for session:

```bash
redis-cli
KEYS volvo:sess:*
GET volvo:sess:<session-id>
```

### 4. Test Session Persistence

**Test server restart:**
```bash
# Make API calls → Works ✓
# Restart server
npm run dev
# Make API calls again → Still works ✓ (session in Redis)
```

**Test Redis restart:**
```bash
# Login and make API calls → Works ✓
# Restart Redis
docker-compose restart redis
# Make API calls → Still works ✓ (data persisted to disk)
```

### 5. Test Token Refresh

```typescript
// Set token expiry to 1 minute for testing
req.session.tokenExpiry = Date.now() + (60 * 1000); // 1 minute

// Wait 55 seconds, then make API call
// Should see "Token expired or expiring soon, refreshing..." in logs
```

### 6. Load Testing

```bash
# Install Apache Bench
sudo apt-get install apache2-utils

# Test concurrent sessions
ab -n 1000 -c 10 http://localhost:3000/auth/status

# Monitor Redis during load test
redis-cli MONITOR
```

---

## Troubleshooting

### Redis Connection Errors

**Error: "Connection refused"**
```bash
# Check if Redis is running
redis-cli ping
# Expected: PONG

# If not running, start Redis
brew services start redis  # macOS
sudo systemctl start redis  # Linux
docker-compose up -d  # Docker
```

**Error: "NOAUTH Authentication required"**
```typescript
// Add password to Redis config
const redisClient = createClient({
  url: `redis://:${process.env.REDIS_PASSWORD}@localhost:6379`,
});
```

**Error: "Maximum number of clients reached"**
```bash
# Increase max clients in redis.conf
maxclients 10000

# Or via CLI
redis-cli CONFIG SET maxclients 10000
```

### Session Issues

**Sessions not persisting:**
```typescript
// Verify RedisStore is configured correctly
console.log('Session store:', app.get('trust proxy') ? 'Redis' : 'Memory');

// Check session save
app.use((req, res, next) => {
  req.session.save((err) => {
    if (err) console.error('Session save error:', err);
    next();
  });
});
```

**Sessions expiring too quickly:**
```typescript
// Check TTL configuration
const redisStore = new RedisStore({
  client: redisClient,
  ttl: 86400 * 7, // 7 days in seconds
  disableTTL: false, // Must be false
  disableTouch: false, // Must be false to update expiry
});
```

### Memory Issues

**Redis running out of memory:**
```bash
# Check memory usage
redis-cli INFO memory

# Set max memory limit
redis-cli CONFIG SET maxmemory 256mb

# Set eviction policy
redis-cli CONFIG SET maxmemory-policy allkeys-lru
```

### Debugging Tips

**Enable verbose logging:**
```typescript
// Redis client logging
redisClient.on('connect', () => console.log('Redis: connect'));
redisClient.on('ready', () => console.log('Redis: ready'));
redisClient.on('error', (err) => console.error('Redis error:', err));
redisClient.on('close', () => console.warn('Redis: close'));
redisClient.on('reconnecting', () => console.log('Redis: reconnecting'));
redisClient.on('end', () => console.log('Redis: end'));

// Session debugging
app.use((req, res, next) => {
  console.log('Session ID:', req.sessionID);
  console.log('Session data:', req.session);
  next();
});
```

---

## Next Steps

1. ✅ Set up Redis (local, Docker, or cloud)
2. ✅ Install Redis packages
3. ✅ Configure Redis client with error handling
4. ✅ Test OAuth flow with Redis storage
5. ✅ Verify session persistence across restarts
6. ✅ Set up monitoring and alerts
7. ✅ Configure backups for production
8. ✅ Load test with concurrent sessions

---

## Migration from In-Memory to Redis

If you're currently using in-memory sessions (from AUTH_SIMPLE_DEV_EXAMPLE.md), see **AUTH_COMPARISON.md** for a detailed migration guide.

**Quick summary:**
1. Install Redis and npm packages
2. Create `redis.ts` file
3. Replace in-memory store with RedisStore (10 lines of code)
4. Update environment variables
5. No client changes needed!

---

Ready for production-grade session management! 🚀
