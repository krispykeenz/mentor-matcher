# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Essential Commands

```bash
npm run dev                    # Start development server (http://localhost:3000)
npm run build && npm run start # Production build and server
npm run lint                   # ESLint with Next.js config
npm run typecheck             # TypeScript strict checking
npm run format                # Prettier formatting
```

### Testing

```bash
npm run test                  # Vitest unit tests
npm run test:watch           # Vitest in watch mode
npm run e2e                  # Playwright e2e tests (requires dev server)
npx playwright install       # Install Playwright browsers (run once)
```

### Database & Seeding

```bash
npm run seed                 # Seed Firebase with demo data (requires admin credentials)
# Example with inline credentials:
FIREBASE_PROJECT_ID=your-project FIREBASE_CLIENT_EMAIL=your-email FIREBASE_PRIVATE_KEY="-----BEGIN..." npm run seed
```

## Architecture Overview

MentorMatch SA is a **mobile-first mentorship platform** built on Next.js 14 App Router with Firebase backend. Key architectural patterns:

### Core Stack

- **Next.js 14 App Router** with React Server Components and TypeScript
- **Firebase** (Auth, Firestore, Storage, FCM) with Firebase Admin SDK server-side
- **Tailwind CSS + shadcn/ui-style** components for consistent mobile UI
- **PWA** with Workbox service worker for offline functionality

### Data Architecture

The app uses a **dual-collection pattern** for user data:

- `users` collection: Full private profiles (own data only)
- `profiles_public` collection: Discoverable data (readable by all authenticated users)

This enables efficient discovery queries while maintaining privacy. Key collections:

- `users` / `profiles_public`: User profiles and preferences
- `requests`: Mentorship requests with status tracking
- `matches`: Active mentorships with messaging
- `matches/{matchId}/messages`: Real-time messaging subcollection

### Repository Pattern

Data access is abstracted through repositories in `lib/server/repositories/`:

- **`profiles.ts`**: Discovery queries with scoring algorithm
- All repositories use Firebase Admin SDK for server-side operations
- Scoring is handled by pure function `scoreCandidate()` in `lib/utils/matching.ts`

### Authentication Flow

- **Passwordless authentication** via Firebase Auth email links
- Optional Google OAuth (toggle via `NEXT_PUBLIC_ENABLE_GOOGLE_OAUTH`)
- Server-side token verification with admin role detection
- Auth state managed through React Context (`lib/auth/auth-context.tsx`)

### Mobile-First Architecture

- **Swipe-style discovery** with react-swipeable
- **Real-time messaging** using polling + SWR (WebSocket-style UI)
- **PWA capabilities** with offline shell caching
- **Responsive design** with mobile gestures and touch interactions

## Key Patterns & Conventions

### File Structure

```
app/                    # Next.js App Router pages
├── (auth)/            # Route groups for auth pages
├── api/               # Server-side API routes
├── admin/             # Admin dashboard
└── [feature]/         # Feature-based page organization

lib/
├── server/            # Server-side code (repositories, actions)
├── firebase/          # Firebase client/server configuration
├── auth/              # Authentication context and helpers
└── utils/             # Shared utilities (matching, schemas, etc.)

components/
├── dashboard/         # Feature-specific components
├── discovery/         # Swipe discovery components
├── forms/             # Form components
└── ui/                # Reusable UI primitives
```

### Environment Variables

The app requires Firebase credentials in `.env.local` (see `.env.example`). Critical patterns:

- `FIREBASE_PRIVATE_KEY` must retain newline escapes (`\\n`)
- Admin credentials (server-side): `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`
- Client credentials: `NEXT_PUBLIC_FIREBASE_*` variables

### Database Queries & Indexes

The app requires specific Firestore composite indexes for efficient discovery:

```
profiles_public: discoverable ASC, province ASC, occupation ASC
profiles_public: discoverable ASC, languages ARRAY
requests: receiverUserId ASC, status ASC
matches: participants ARRAY
```

### Matching Algorithm

The matching system (`lib/utils/matching.ts`) uses weighted scoring:

- **Occupation match**: 3 points (highest priority)
- **Specialties overlap**: 3 points per shared specialty
- **Province/City match**: 2 points + 1 bonus for same city
- **Language overlap**: 2 points per shared language
- **Mentor capacity**: 1.5 points based on availability
- **New user bonus**: 1 point for users < 14 days old

### Testing Strategy

- **Unit tests**: Focus on pure functions (matching algorithm)
- **Component tests**: Use React Testing Library for UI components
- **E2E tests**: Playwright for cross-browser smoke tests
- Test files in `tests/__tests__/` for units, `tests/e2e/` for end-to-end

### PWA & Offline Behavior

- Service worker (`public/sw.js`) provides offline shell for key pages
- Workbox caches build assets and uses StaleWhileRevalidate for dynamic content
- PWA manifest enables mobile app installation

## Development Guidelines

### Firebase Development

- Use Firebase Admin SDK for server-side operations in API routes
- Client-side Firebase only for authentication and real-time listeners
- All database writes go through API routes for validation and security
- Test Firebase rules in local emulator when making security changes

### Component Development

- Follow mobile-first responsive design patterns
- Use shadcn/ui-style components in `components/ui/`
- Implement loading states and error boundaries for async operations
- Consider offline scenarios for PWA functionality

### State Management

- **SWR + React Query** for server state caching
- **React Context** for authentication state
- **URL state** for filters and navigation state
- Minimize client-side state, prefer server state when possible

### Security Considerations

- All API routes verify Firebase ID tokens
- Admin operations require `role: 'admin'` custom claim
- Firestore rules enforce document-level access control
- File uploads restricted to authenticated users with size limits
