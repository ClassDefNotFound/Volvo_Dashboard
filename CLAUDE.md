# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Volvo Dashboard is a React + TypeScript frontend application that interfaces with the Volvo Connected Vehicle API. The app fetches vehicle data (VINs, engine status, etc.) from a local backend server.

## Development Commands

```bash
npm run dev      # Start development server (Vite with HMR)
npm run build    # Type-check with tsc and build for production
npm run lint     # Run ESLint on all files
npm run preview  # Preview production build locally
```

## Architecture

### API Layer
- All Volvo API interactions are centralized in `src/api/volvo_api.ts`
- Uses axios for HTTP requests to a local backend at `http://localhost:3000`
- API functions return Promises with typed data
- The backend server (not part of this repo) must be running separately on port 3000

### Component Structure
- Currently minimal: single `App.tsx` component in `src/`
- No component library or routing setup yet
- Direct function calls to API layer from components

### Environment Configuration
- Environment variables are stored in `src/.env.local` (non-standard location)
- Contains backend configuration (PORT, BASE_URL) and Volvo API credentials (CLIENT_ID, VCC_API_KEY, ACCESS_TOKEN)
- Note: Standard practice would be to place .env files in the project root and prefix with VITE_ for Vite access

## Technology Stack

- **Build Tool**: rolldown-vite (Vite with rolldown bundler, aliased via npm overrides)
- **React**: Version 19.2.0
- **TypeScript**: Strict mode enabled with comprehensive linting rules
- **ESLint**: Configured with TypeScript, React Hooks, and React Refresh plugins
- **Styling**: CSS files (App.css, index.css) - no styling framework currently

## TypeScript Configuration

- Target: ES2022
- Strict mode enabled with additional linting flags (noUnusedLocals, noUnusedParameters)
- Module resolution: bundler
- JSX: react-jsx (React 17+ JSX transform)

## Notes

- The project uses rolldown-vite instead of standard vite for improved build performance
- No test framework is currently configured
- No state management library (Redux, Zustand, etc.) is in place yet
- The Volvo API access token in .env.local will expire and need periodic renewal