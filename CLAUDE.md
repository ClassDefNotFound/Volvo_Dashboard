# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Volvo Dashboard is a full-stack React + Express + TypeScript application that interfaces with the Volvo Connected Vehicle API. It consists of a Vite-powered frontend and an Express backend that proxies requests to Volvo's API.

## Development Commands

```bash
# Frontend only
npm run dev          # Start Vite dev server (HMR)
npm run build        # Type-check with tsc and build for production
npm run lint         # Run ESLint on all files

# Backend only
npm run dev:server   # Start Express server with tsx watch

# Full stack (Redis + server + client)
npm run dev:all      # Starts Docker Redis, then server + client concurrently

# Docker (Redis)
npm run docker:up    # Start Redis container
npm run docker:down  # Stop Redis container
npm run docker:logs  # Tail Redis logs
```

## Architecture

### Backend (`server/`)
- **Entry point**: `server/server.ts` — Express app with CORS, session middleware, route mounting
- **Config**: `server/config.ts` — centralized env var loading with local/OAuth mode detection
- **Routes**: `server/routes/auth.ts` (OAuth login/callback/status/logout), `server/routes/api.ts` (Volvo API proxy)
- **Redis**: `server/redis-store.ts` — Redis client + session store setup (file renamed from `redis.ts` to avoid shadowing the `redis` npm package when `baseUrl: "."` is set in tsconfig)
- **Auth modes**:
  - **Local mode**: `ACCESS_TOKEN` set without `CLIENT_ID`/`CLIENT_SECRET` — uses static token, skips OAuth
  - **OAuth mode**: Full Authorization Code flow with PKCE, Redis-backed sessions, automatic token refresh
- **Runtime**: Uses `tsx watch` (not ts-node/nodemon) for Node.js v24 ESM compatibility
- Server runs on port 3000 by default

### Frontend (`src/`)
- **API layer**: `src/api/volvo_api.ts` — axios calls to backend, typed with shared types
- **Components**: `src/App.tsx` conditionally renders `LoginPage` or `DashboardPage` based on auth status
  - `src/components/login/LoginPage.tsx` — login form
  - `src/components/dashboard/DashboardPage.tsx` — main dashboard (WIP)
- **Base URL**: Configured via `VITE_BASE_URL` env var (points to backend)
- **UI Library**: MUI (Material UI) v7
- **CSS Reset**: Uses `the-new-css-reset` — imported in `App.tsx`

### Shared Types (`shared/types/`)
- `shared/types/api.ts` — TypeScript types for all Volvo API responses and commands
- `shared/types/index.ts` — barrel export
- Path alias `@shared/*` maps to `shared/*` in both frontend and server tsconfigs

### Environment Configuration
- **Frontend**: `.env.local` with `VITE_`-prefixed vars for Vite access
- **Server**: `server/.env` with `VCC_API_KEY`, `ACCESS_TOKEN`, `CLIENT_ID`, `CLIENT_SECRET`, `BASE_URL`, `REDIS_URL`
- Server config validates required env vars at startup based on detected mode

## Technology Stack

- **Build Tool**: rolldown-vite (Vite with rolldown bundler, aliased via npm overrides)
- **Frontend**: React 19, MUI v7, axios
- **Backend**: Express 5, express-session, connect-redis, redis v5
- **TypeScript**: Strict mode, `module: "nodenext"` (server), `moduleResolution: "bundler"` (frontend)
- **Infrastructure**: Docker Compose for Redis, concurrently for parallel dev servers
- **ESLint**: Configured with TypeScript, React Hooks, and React Refresh plugins

## Notes

- No test framework is currently configured
- No state management library is in place yet
- No routing library yet — auth/dashboard views are conditionally rendered
- The Volvo developer portal test token expires every 15 minutes; full OAuth with refresh tokens requires deploying with CLIENT_ID/CLIENT_SECRET
- The `redis` npm package requires `createRequire` workaround or file rename to avoid tsconfig `baseUrl` shadowing issues on Node.js v24
